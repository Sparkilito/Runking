export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
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
          type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
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
          type?: 'like' | 'comment' | 'follow' | 'mention' | 'system';
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
    };
    Enums: {
      notification_type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
      report_status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
      content_type: 'ranking' | 'comment' | 'user';
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Ranking = Database['public']['Tables']['rankings']['Row'];
export type RankingItem = Database['public']['Tables']['ranking_items']['Row'];
export type Like = Database['public']['Tables']['likes']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Follow = Database['public']['Tables']['follows']['Row'];
export type SavedRanking = Database['public']['Tables']['saved_rankings']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Report = Database['public']['Tables']['reports']['Row'];

export type RankingWithStats = Database['public']['Views']['rankings_with_stats']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type RankingInsert = Database['public']['Tables']['rankings']['Insert'];
export type RankingItemInsert = Database['public']['Tables']['ranking_items']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type ReportInsert = Database['public']['Tables']['reports']['Insert'];
