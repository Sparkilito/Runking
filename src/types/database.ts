export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MediaType = 'movie' | 'series' | 'book';
export type League = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BadgeCategory = 'rankings' | 'social' | 'streak' | 'special' | 'media';
export type SortMode = 'score' | 'manual' | 'date';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          is_admin: boolean;
          is_verified: boolean;
          is_suspended: boolean;
          referral_code: string | null;
          referred_by: string | null;
          referral_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          is_verified?: boolean;
          is_suspended?: boolean;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          is_verified?: boolean;
          is_suspended?: boolean;
          referral_code?: string | null;
          referred_by?: string | null;
          referral_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      media_items: {
        Row: {
          id: string;
          media_type: MediaType;
          external_id: string | null;
          external_source: 'tmdb' | 'google_books' | 'open_library' | 'manual' | null;
          title: string;
          original_title: string | null;
          description: string | null;
          cover_image_url: string | null;
          release_year: number | null;
          author: string | null;
          isbn: string | null;
          page_count: number | null;
          publisher: string | null;
          director: string | null;
          duration_minutes: number | null;
          seasons_count: number | null;
          episodes_count: number | null;
          genres: string[] | null;
          external_rating: number | null;
          language: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          media_type: MediaType;
          external_id?: string | null;
          external_source?: 'tmdb' | 'google_books' | 'open_library' | 'manual' | null;
          title: string;
          original_title?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          release_year?: number | null;
          author?: string | null;
          isbn?: string | null;
          page_count?: number | null;
          publisher?: string | null;
          director?: string | null;
          duration_minutes?: number | null;
          seasons_count?: number | null;
          episodes_count?: number | null;
          genres?: string[] | null;
          external_rating?: number | null;
          language?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          media_type?: MediaType;
          external_id?: string | null;
          external_source?: 'tmdb' | 'google_books' | 'open_library' | 'manual' | null;
          title?: string;
          original_title?: string | null;
          description?: string | null;
          cover_image_url?: string | null;
          release_year?: number | null;
          author?: string | null;
          isbn?: string | null;
          page_count?: number | null;
          publisher?: string | null;
          director?: string | null;
          duration_minutes?: number | null;
          seasons_count?: number | null;
          episodes_count?: number | null;
          genres?: string[] | null;
          external_rating?: number | null;
          language?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rankings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category_id: string;
          cover_image: string | null;
          is_published: boolean;
          is_featured: boolean;
          is_reported: boolean;
          views_count: number;
          media_type: MediaType | null;
          sort_mode: SortMode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category_id: string;
          cover_image?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          is_reported?: boolean;
          views_count?: number;
          media_type?: MediaType | null;
          sort_mode?: SortMode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category_id?: string;
          cover_image?: string | null;
          is_published?: boolean;
          is_featured?: boolean;
          is_reported?: boolean;
          views_count?: number;
          media_type?: MediaType | null;
          sort_mode?: SortMode;
          created_at?: string;
          updated_at?: string;
        };
      };
      ranking_items: {
        Row: {
          id: string;
          ranking_id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          link_url: string | null;
          position: number;
          media_item_id: string | null;
          score: number | null;
          review: string | null;
          is_manual_position: boolean;
          scored_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ranking_id: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          position: number;
          media_item_id?: string | null;
          score?: number | null;
          review?: string | null;
          is_manual_position?: boolean;
          scored_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ranking_id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          position?: number;
          media_item_id?: string | null;
          score?: number | null;
          review?: string | null;
          is_manual_position?: boolean;
          scored_at?: string | null;
          created_at?: string;
        };
      };
      user_gamification: {
        Row: {
          user_id: string;
          xp_total: number;
          xp_weekly: number;
          level: number;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          streak_shield_active: boolean;
          streak_shield_used_at: string | null;
          league: League;
          league_rank: number | null;
          total_rankings_created: number;
          total_reviews_written: number;
          total_likes_received: number;
          total_shares: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          xp_total?: number;
          xp_weekly?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_shield_active?: boolean;
          streak_shield_used_at?: string | null;
          league?: League;
          league_rank?: number | null;
          total_rankings_created?: number;
          total_reviews_written?: number;
          total_likes_received?: number;
          total_shares?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          xp_total?: number;
          xp_weekly?: number;
          level?: number;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          streak_shield_active?: boolean;
          streak_shield_used_at?: string | null;
          league?: League;
          league_rank?: number | null;
          total_rankings_created?: number;
          total_reviews_written?: number;
          total_likes_received?: number;
          total_shares?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          category: BadgeCategory;
          xp_reward: number;
          requirement_type: string;
          requirement_value: number;
          is_secret: boolean;
          tier: BadgeTier;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          category: BadgeCategory;
          xp_reward?: number;
          requirement_type: string;
          requirement_value: number;
          is_secret?: boolean;
          tier?: BadgeTier;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          icon?: string;
          category?: BadgeCategory;
          xp_reward?: number;
          requirement_type?: string;
          requirement_value?: number;
          is_secret?: boolean;
          tier?: BadgeTier;
          created_at?: string;
        };
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          reason: string;
          reference_type: string | null;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          reason: string;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          reason?: string;
          reference_type?: string | null;
          reference_id?: string | null;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          ranking_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ranking_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ranking_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          ranking_id: string;
          content: string;
          parent_id: string | null;
          is_reported: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ranking_id: string;
          content: string;
          parent_id?: string | null;
          is_reported?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ranking_id?: string;
          content?: string;
          parent_id?: string | null;
          is_reported?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      saved_rankings: {
        Row: {
          id: string;
          user_id: string;
          ranking_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ranking_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ranking_id?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'badge' | 'level_up';
          title: string;
          message: string;
          reference_id: string | null;
          reference_type: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'badge' | 'level_up';
          title: string;
          message: string;
          reference_id?: string | null;
          reference_type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'badge' | 'level_up';
          title?: string;
          message?: string;
          reference_id?: string | null;
          reference_type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          content_type: 'ranking' | 'comment' | 'user';
          content_id: string;
          reason: string;
          description: string | null;
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          content_type: 'ranking' | 'comment' | 'user';
          content_id: string;
          reason: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          content_type?: 'ranking' | 'comment' | 'user';
          content_id?: string;
          reason?: string;
          description?: string | null;
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      rankings_with_stats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category_id: string;
          cover_image: string | null;
          is_published: boolean;
          is_featured: boolean;
          views_count: number;
          media_type: MediaType | null;
          sort_mode: SortMode;
          created_at: string;
          updated_at: string;
          likes_count: number;
          comments_count: number;
          author_username: string;
          author_display_name: string | null;
          author_avatar_url: string | null;
          category_name: string;
          category_slug: string;
        };
      };
    };
    Functions: {
      get_trending_rankings: {
        Args: { limit_count?: number };
        Returns: Database['public']['Views']['rankings_with_stats']['Row'][];
      };
      get_user_stats: {
        Args: { user_uuid: string };
        Returns: {
          rankings_count: number;
          followers_count: number;
          following_count: number;
          likes_received: number;
        };
      };
      award_xp: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_reason: string;
          p_reference_type?: string;
          p_reference_id?: string;
        };
        Returns: number;
      };
      update_user_streak: {
        Args: { p_user_id: string };
        Returns: number;
      };
      check_badges: {
        Args: { p_user_id: string };
        Returns: { badge_slug: string; badge_name: string; xp_reward: number }[];
      };
      get_leaderboard: {
        Args: { p_league?: string; p_limit?: number };
        Returns: {
          rank: number;
          user_id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          xp_weekly: number;
          level: number;
          current_streak: number;
          league: League;
        }[];
      };
    };
    Enums: {
      notification_type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'badge' | 'level_up';
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      content_type: 'ranking' | 'comment' | 'user';
      media_type: MediaType;
      league: League;
      badge_tier: BadgeTier;
      badge_category: BadgeCategory;
      sort_mode: SortMode;
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type MediaItem = Database['public']['Tables']['media_items']['Row'];
export type Ranking = Database['public']['Tables']['rankings']['Row'];
export type RankingItem = Database['public']['Tables']['ranking_items']['Row'];
export type UserGamification = Database['public']['Tables']['user_gamification']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type XPTransaction = Database['public']['Tables']['xp_transactions']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type SavedRanking = Database['public']['Tables']['saved_rankings']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];

export type RankingWithStats = Database['public']['Views']['rankings_with_stats']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type MediaItemInsert = Database['public']['Tables']['media_items']['Insert'];
export type RankingInsert = Database['public']['Tables']['rankings']['Insert'];
export type RankingItemInsert = Database['public']['Tables']['ranking_items']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];

// Gamification related types
export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  xp_weekly: number;
  level: number;
  current_streak: number;
  league: League;
}

export interface UserWithGamification extends Profile {
  gamification?: UserGamification;
  badges?: (UserBadge & { badge: Badge })[];
}

// Level info helper
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Novato',
  2: 'Novato',
  3: 'Novato',
  4: 'Novato',
  5: 'Novato',
  6: 'Crítico Amateur',
  7: 'Crítico Amateur',
  8: 'Crítico Amateur',
  9: 'Crítico Amateur',
  10: 'Crítico Amateur',
  11: 'Experto',
  12: 'Experto',
  13: 'Experto',
  14: 'Experto',
  15: 'Experto',
  16: 'Maestro',
  17: 'Maestro',
  18: 'Maestro',
  19: 'Maestro',
  20: 'Leyenda',
};

export const XP_FOR_LEVEL: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 1000,
  6: 1750,
  7: 2750,
  8: 4000,
  9: 5500,
  10: 7500,
  11: 10000,
  12: 13000,
  13: 17000,
  14: 22000,
  15: 28000,
  16: 35000,
  17: 45000,
  18: 57000,
  19: 72000,
  20: 90000,
};

export const LEAGUE_NAMES: Record<League, string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
  diamond: 'Diamante',
  master: 'Maestro',
};

export const LEAGUE_COLORS: Record<League, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF',
  master: '#9B59B6',
};
