import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { UserGamification, Badge, UserBadge, League, LeaderboardEntry } from "@/types/database";

// =====================================================
// Fetch user gamification data
// =====================================================

export function useUserGamification(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["gamification", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("user_gamification")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error;
      }

      return data as UserGamification | null;
    },
    enabled: !!targetUserId,
  });
}

// =====================================================
// Fetch user badges
// =====================================================

export function useUserBadges(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["user-badges", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          badge:badges(*)
        `)
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (error) throw error;

      return data as (UserBadge & { badge: Badge })[];
    },
    enabled: !!targetUserId,
  });
}

// =====================================================
// Fetch all badges (for showcase)
// =====================================================

export function useAllBadges() {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_secret", false)
        .order("requirement_value", { ascending: true });

      if (error) throw error;

      return data as Badge[];
    },
  });
}

// =====================================================
// Fetch leaderboard
// =====================================================

export function useLeaderboard(league?: League, limit = 100) {
  return useQuery({
    queryKey: ["leaderboard", league, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", {
        p_league: league || null,
        p_limit: limit,
      });

      if (error) throw error;

      return data as LeaderboardEntry[];
    },
  });
}

// =====================================================
// Update streak (call on user activity)
// =====================================================

export function useUpdateStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("update_user_streak", {
        p_user_id: user.id,
      });

      if (error) throw error;

      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification", user?.id] });
    },
  });
}

// =====================================================
// Check and award badges
// =====================================================

export function useCheckBadges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc("check_badges", {
        p_user_id: user.id,
      });

      if (error) throw error;

      return data as { badge_slug: string; badge_name: string; xp_reward: number }[];
    },
    onSuccess: (newBadges) => {
      if (newBadges && newBadges.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["user-badges", user?.id] });
        queryClient.invalidateQueries({ queryKey: ["gamification", user?.id] });
      }
    },
  });
}

// =====================================================
// Get XP transactions history
// =====================================================

export function useXPHistory(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["xp-history", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    },
    enabled: !!user,
  });
}

// =====================================================
// Combined hook for profile gamification
// =====================================================

export function useProfileGamification(userId?: string) {
  const gamification = useUserGamification(userId);
  const badges = useUserBadges(userId);
  const allBadges = useAllBadges();

  // Merge user badges with all badges
  const badgesWithStatus = allBadges.data?.map((badge) => {
    const earned = badges.data?.find((ub) => ub.badge_id === badge.id);
    return {
      ...badge,
      earned: !!earned,
      earnedAt: earned?.earned_at,
    };
  });

  return {
    gamification: gamification.data,
    badges: badgesWithStatus,
    earnedBadges: badges.data,
    isLoading: gamification.isLoading || badges.isLoading || allBadges.isLoading,
    error: gamification.error || badges.error || allBadges.error,
  };
}

// =====================================================
// Referral code helpers
// =====================================================

export function useReferralCode() {
  const { user, profile } = useAuth();

  const referralLink = profile?.referral_code
    ? `${window.location.origin}/join/${profile.referral_code}`
    : null;

  const copyReferralLink = async () => {
    if (referralLink) {
      await navigator.clipboard.writeText(referralLink);
      return true;
    }
    return false;
  };

  const shareReferralLink = async () => {
    if (referralLink && navigator.share) {
      try {
        await navigator.share({
          title: "Únete a RunKing",
          text: "¡Rankea tus películas, series y libros favoritos!",
          url: referralLink,
        });
        return true;
      } catch {
        return false;
      }
    }
    return copyReferralLink();
  };

  return {
    referralCode: profile?.referral_code,
    referralLink,
    referralCount: profile?.referral_count || 0,
    copyReferralLink,
    shareReferralLink,
  };
}

// =====================================================
// Process referral on registration
// =====================================================

export function useProcessReferral() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referralCode: string) => {
      // Find the referrer
      const { data: referrer, error: findError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single();

      if (findError || !referrer) {
        throw new Error("Invalid referral code");
      }

      return referrer.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
    },
  });
}
