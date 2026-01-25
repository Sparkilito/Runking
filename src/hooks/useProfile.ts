import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile, RankingWithStats } from '@/types/database';

// Fetch user profile by username or ID
export function useProfile(identifier: string | undefined, byUsername = false) {
  return useQuery({
    queryKey: ['profile', identifier, byUsername],
    queryFn: async () => {
      if (!identifier) throw new Error('Identifier required');

      const column = byUsername ? 'username' : 'id';
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(column, identifier)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!identifier,
  });
}

// Fetch user stats
export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase.rpc('get_user_stats', {
        user_uuid: userId,
      });

      if (error) throw error;
      return data[0] as {
        rankings_count: number;
        followers_count: number;
        following_count: number;
        likes_received: number;
      };
    },
    enabled: !!userId,
  });
}

// Fetch saved rankings
export function useSavedRankings(userId: string | undefined) {
  return useQuery({
    queryKey: ['saved-rankings', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('saved_rankings')
        .select(`
          ranking_id,
          rankings_with_stats!inner (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((d) => d.rankings_with_stats) as unknown as RankingWithStats[];
    },
    enabled: !!userId,
  });
}

// Fetch liked rankings
export function useLikedRankings(userId: string | undefined) {
  return useQuery({
    queryKey: ['liked-rankings', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('likes')
        .select(`
          ranking_id,
          rankings_with_stats!inner (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((d) => d.rankings_with_stats) as unknown as RankingWithStats[];
    },
    enabled: !!userId,
  });
}

// Check if following a user
export function useIsFollowing(targetUserId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['following', user?.id, targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId || user.id === targetUserId) return false;

      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

// Toggle follow mutation
export function useToggleFollow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      targetUserId,
      isFollowing,
    }: {
      targetUserId: string;
      isFollowing: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');
      if (user.id === targetUserId) throw new Error('Cannot follow yourself');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetUserId });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['following', user?.id, variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-stats', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-stats', user?.id] });
    },
  });
}

// Fetch followers
export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: ['followers', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('follows')
        .select(`
          follower:profiles!follows_follower_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('following_id', userId);

      if (error) throw error;
      return data.map((d) => d.follower);
    },
    enabled: !!userId,
  });
}

// Fetch following
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: ['following-list', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('follows')
        .select(`
          following:profiles!follows_following_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId);

      if (error) throw error;
      return data.map((d) => d.following);
    },
    enabled: !!userId,
  });
}
