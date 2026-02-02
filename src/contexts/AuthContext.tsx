import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to clear all auth-related storage
const clearAuthStorage = () => {
  // Clear Supabase auth tokens from localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Also check sessionStorage
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      sessionKeysToRemove.push(key);
    }
  }
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Refs to prevent duplicate processing
  const isProcessingRef = useRef(false);
  const lastEventRef = useRef<string>('');
  const lastUserIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If we can't fetch profile due to auth error, clear session
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('token')) {
          console.warn('Auth error detected, clearing session');
          clearAuthStorage();
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        return null;
      }

      return data;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Process auth event with debouncing
  const processAuthEvent = useCallback(async (
    event: AuthChangeEvent,
    newSession: Session | null,
    mounted: { current: boolean }
  ) => {
    // Skip if already processing
    if (isProcessingRef.current) {
      console.log('Skipping auth event - already processing:', event);
      return;
    }

    // Skip duplicate events for the same user (except SIGNED_OUT)
    const newUserId = newSession?.user?.id || null;
    if (event !== 'SIGNED_OUT' && event === lastEventRef.current && newUserId === lastUserIdRef.current) {
      console.log('Skipping duplicate auth event:', event);
      return;
    }

    // Special handling for TOKEN_REFRESHED - only update session, don't refetch profile
    if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed - updating session only');
      if (mounted.current && newSession) {
        setSession(newSession);
        // Don't refetch profile, just update user if needed
        if (newSession.user) {
          setUser(newSession.user);
        }
      }
      return;
    }

    // Mark as processing
    isProcessingRef.current = true;
    lastEventRef.current = event;
    lastUserIdRef.current = newUserId;

    console.log('Processing auth event:', event, 'userId:', newUserId);

    try {
      if (event === 'SIGNED_OUT' || !newSession) {
        clearAuthStorage();
        if (mounted.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
        return;
      }

      if (mounted.current) {
        setSession(newSession);
        setUser(newSession.user ?? null);

        if (newSession.user) {
          const profileData = await fetchProfile(newSession.user.id);
          if (mounted.current) {
            setProfile(profileData);
          }
        }

        setIsLoading(false);
      }
    } finally {
      // Release processing lock after a short delay to prevent rapid re-processing
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 150);
    }
  }, [fetchProfile]);

  useEffect(() => {
    const mounted = { current: true };

    // Prevent double initialization in strict mode
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          clearAuthStorage();
          if (mounted.current) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setIsLoading(false);
          }
          return;
        }

        if (mounted.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          lastUserIdRef.current = initialSession?.user?.id || null;

          if (initialSession?.user) {
            const profileData = await fetchProfile(initialSession.user.id);
            if (mounted.current) {
              setProfile(profileData);
            }
          }

          setIsLoading(false);
        }
      } catch (err) {
        console.error('Exception during auth init:', err);
        clearAuthStorage();
        if (mounted.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes with debouncing
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change received:', event);

      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce the processing to avoid rapid-fire events
      debounceTimerRef.current = setTimeout(() => {
        processAuthEvent(event, newSession, mounted);
      }, 100);
    });

    return () => {
      mounted.current = false;
      initializedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      subscription.unsubscribe();
    };
  }, [fetchProfile, processAuthEvent]);

  const signUp = async (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName || username,
        },
      },
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Reset processing state before sign in
    isProcessingRef.current = false;
    lastEventRef.current = '';
    lastUserIdRef.current = null;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    // Reset state immediately
    isProcessingRef.current = false;
    lastEventRef.current = '';
    lastUserIdRef.current = null;

    clearAuthStorage();
    setUser(null);
    setProfile(null);
    setSession(null);

    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore errors on signout
      console.warn('Error during signout:', e);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error: error ? new Error(error.message) : null };
  };

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin: profile?.is_admin ?? false,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
