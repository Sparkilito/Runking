-- =====================================================
-- RUNKING DATABASE SCHEMA
-- Execute this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rankings table
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  cover_image TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_reported BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ranking items table
CREATE TABLE IF NOT EXISTS public.ranking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ranking_id UUID NOT NULL REFERENCES public.rankings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ranking_id UUID NOT NULL REFERENCES public.rankings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ranking_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ranking_id UUID NOT NULL REFERENCES public.rankings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  is_reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Saved rankings table
CREATE TABLE IF NOT EXISTS public.saved_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ranking_id UUID NOT NULL REFERENCES public.rankings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ranking_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('ranking', 'comment', 'user')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_rankings_user_id ON public.rankings(user_id);
CREATE INDEX IF NOT EXISTS idx_rankings_category_id ON public.rankings(category_id);
CREATE INDEX IF NOT EXISTS idx_rankings_created_at ON public.rankings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rankings_is_published ON public.rankings(is_published);
CREATE INDEX IF NOT EXISTS idx_ranking_items_ranking_id ON public.ranking_items(ranking_id);
CREATE INDEX IF NOT EXISTS idx_ranking_items_position ON public.ranking_items(position);
CREATE INDEX IF NOT EXISTS idx_likes_ranking_id ON public.likes(ranking_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_ranking_id ON public.comments(ranking_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- =====================================================
-- VIEWS
-- =====================================================

-- Rankings with stats view
CREATE OR REPLACE VIEW public.rankings_with_stats AS
SELECT
  r.id,
  r.user_id,
  r.title,
  r.description,
  r.category_id,
  r.cover_image,
  r.is_published,
  r.is_featured,
  r.is_reported,
  r.views_count,
  r.created_at,
  r.updated_at,
  COALESCE(l.likes_count, 0)::INTEGER AS likes_count,
  COALESCE(c.comments_count, 0)::INTEGER AS comments_count,
  p.username AS author_username,
  p.display_name AS author_display_name,
  p.avatar_url AS author_avatar_url,
  cat.name AS category_name,
  cat.slug AS category_slug
FROM public.rankings r
LEFT JOIN public.profiles p ON r.user_id = p.id
LEFT JOIN public.categories cat ON r.category_id = cat.id
LEFT JOIN (
  SELECT ranking_id, COUNT(*)::INTEGER AS likes_count
  FROM public.likes
  GROUP BY ranking_id
) l ON r.id = l.ranking_id
LEFT JOIN (
  SELECT ranking_id, COUNT(*)::INTEGER AS comments_count
  FROM public.comments
  GROUP BY ranking_id
) c ON r.id = c.ranking_id;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get trending rankings (based on recent likes and views)
CREATE OR REPLACE FUNCTION public.get_trending_rankings(limit_count INTEGER DEFAULT 20)
RETURNS SETOF public.rankings_with_stats
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.rankings_with_stats
  WHERE is_published = TRUE
  ORDER BY
    (likes_count * 2 + comments_count + views_count / 10) DESC,
    created_at DESC
  LIMIT limit_count;
$$;

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_uuid UUID)
RETURNS TABLE (
  rankings_count INTEGER,
  followers_count INTEGER,
  following_count INTEGER,
  likes_received INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.rankings WHERE user_id = user_uuid AND is_published = TRUE),
    (SELECT COUNT(*)::INTEGER FROM public.follows WHERE following_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM public.follows WHERE follower_id = user_uuid),
    (SELECT COUNT(*)::INTEGER FROM public.likes l
     JOIN public.rankings r ON l.ranking_id = r.id
     WHERE r.user_id = user_uuid);
$$;

-- Function to increment views
CREATE OR REPLACE FUNCTION public.increment_views(ranking_uuid UUID)
RETURNS VOID
LANGUAGE sql
AS $$
  UPDATE public.rankings
  SET views_count = views_count + 1
  WHERE id = ranking_uuid;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_rankings_updated_at
  BEFORE UPDATE ON public.rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create notification on like
CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_owner_id UUID;
  liker_username TEXT;
  ranking_title TEXT;
BEGIN
  -- Get ranking owner and title
  SELECT user_id, title INTO ranking_owner_id, ranking_title
  FROM public.rankings WHERE id = NEW.ranking_id;

  -- Get liker username
  SELECT username INTO liker_username
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify if user likes their own ranking
  IF ranking_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (
      ranking_owner_id,
      'like',
      'Nuevo like',
      liker_username || ' le dio like a tu ranking "' || ranking_title || '"',
      NEW.ranking_id,
      'ranking'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_like_created
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_like();

-- Create notification on comment
CREATE OR REPLACE FUNCTION public.handle_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_owner_id UUID;
  commenter_username TEXT;
  ranking_title TEXT;
BEGIN
  -- Get ranking owner and title
  SELECT user_id, title INTO ranking_owner_id, ranking_title
  FROM public.rankings WHERE id = NEW.ranking_id;

  -- Get commenter username
  SELECT username INTO commenter_username
  FROM public.profiles WHERE id = NEW.user_id;

  -- Don't notify if user comments on their own ranking
  IF ranking_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
    VALUES (
      ranking_owner_id,
      'comment',
      'Nuevo comentario',
      commenter_username || ' comentó en tu ranking "' || ranking_title || '"',
      NEW.ranking_id,
      'ranking'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_comment();

-- Create notification on follow
CREATE OR REPLACE FUNCTION public.handle_new_follow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  follower_username TEXT;
BEGIN
  -- Get follower username
  SELECT username INTO follower_username
  FROM public.profiles WHERE id = NEW.follower_id;

  INSERT INTO public.notifications (user_id, type, title, message, reference_id, reference_type)
  VALUES (
    NEW.following_id,
    'follow',
    'Nuevo seguidor',
    follower_username || ' empezó a seguirte',
    NEW.follower_id,
    'user'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_follow_created
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_follow();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Rankings policies
CREATE POLICY "Published rankings are viewable by everyone"
  ON public.rankings FOR SELECT
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users can create rankings"
  ON public.rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rankings"
  ON public.rankings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rankings"
  ON public.rankings FOR DELETE
  USING (auth.uid() = user_id);

-- Ranking items policies
CREATE POLICY "Ranking items are viewable with their ranking"
  ON public.ranking_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rankings
      WHERE id = ranking_items.ranking_id
      AND (is_published = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage items of their rankings"
  ON public.ranking_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.rankings
      WHERE id = ranking_items.ranking_id
      AND user_id = auth.uid()
    )
  );

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Saved rankings policies
CREATE POLICY "Users can view their saved rankings"
  ON public.saved_rankings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save rankings"
  ON public.saved_rankings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave rankings"
  ON public.saved_rankings FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Only admins can update reports"
  ON public.reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- =====================================================
-- SEED DATA - Categories
-- =====================================================

INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Gastronomía', 'gastronomia', 'utensils', '#ef4444'),
  ('Cine', 'cine', 'film', '#f97316'),
  ('Música', 'musica', 'music', '#eab308'),
  ('Deportes', 'deportes', 'trophy', '#22c55e'),
  ('Tecnología', 'tecnologia', 'laptop', '#3b82f6'),
  ('Viajes', 'viajes', 'plane', '#8b5cf6'),
  ('Libros', 'libros', 'book-open', '#ec4899'),
  ('Series', 'series', 'tv', '#14b8a6'),
  ('Gaming', 'gaming', 'gamepad-2', '#6366f1'),
  ('Arte', 'arte', 'palette', '#f43f5e')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ADMIN FUNCTIONS (for backoffice)
-- =====================================================

-- Get admin dashboard stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS TABLE (
  total_users INTEGER,
  total_rankings INTEGER,
  total_likes INTEGER,
  total_comments INTEGER,
  pending_reports INTEGER,
  users_today INTEGER,
  rankings_today INTEGER
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.profiles),
    (SELECT COUNT(*)::INTEGER FROM public.rankings WHERE is_published = true),
    (SELECT COUNT(*)::INTEGER FROM public.likes),
    (SELECT COUNT(*)::INTEGER FROM public.comments),
    (SELECT COUNT(*)::INTEGER FROM public.reports WHERE status = 'pending'),
    (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE created_at >= CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM public.rankings WHERE created_at >= CURRENT_DATE);
$$;

-- Get users for admin (with stats)
CREATE OR REPLACE FUNCTION public.get_admin_users(
  search_query TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN,
  is_verified BOOLEAN,
  is_suspended BOOLEAN,
  created_at TIMESTAMPTZ,
  rankings_count BIGINT,
  followers_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.username,
    p.display_name,
    p.avatar_url,
    p.is_admin,
    p.is_verified,
    p.is_suspended,
    p.created_at,
    (SELECT COUNT(*) FROM public.rankings WHERE user_id = p.id),
    (SELECT COUNT(*) FROM public.follows WHERE following_id = p.id)
  FROM public.profiles p
  WHERE
    search_query IS NULL OR
    p.username ILIKE '%' || search_query || '%' OR
    p.display_name ILIKE '%' || search_query || '%'
  ORDER BY p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
$$;

-- Suspend/unsuspend user
CREATE OR REPLACE FUNCTION public.toggle_user_suspension(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_status BOOLEAN;
BEGIN
  UPDATE public.profiles
  SET is_suspended = NOT is_suspended
  WHERE id = user_uuid
  RETURNING is_suspended INTO new_status;

  RETURN new_status;
END;
$$;

-- Verify/unverify user
CREATE OR REPLACE FUNCTION public.toggle_user_verification(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_status BOOLEAN;
BEGIN
  UPDATE public.profiles
  SET is_verified = NOT is_verified
  WHERE id = user_uuid
  RETURNING is_verified INTO new_status;

  RETURN new_status;
END;
$$;

-- Feature/unfeature ranking
CREATE OR REPLACE FUNCTION public.toggle_ranking_featured(ranking_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_status BOOLEAN;
BEGIN
  UPDATE public.rankings
  SET is_featured = NOT is_featured
  WHERE id = ranking_uuid
  RETURNING is_featured INTO new_status;

  RETURN new_status;
END;
$$;

-- Delete ranking (admin)
CREATE OR REPLACE FUNCTION public.admin_delete_ranking(ranking_uuid UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.rankings WHERE id = ranking_uuid;
$$;

-- Resolve report
CREATE OR REPLACE FUNCTION public.resolve_report(
  report_uuid UUID,
  new_status TEXT,
  admin_uuid UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.reports
  SET
    status = new_status,
    reviewed_by = admin_uuid,
    reviewed_at = NOW()
  WHERE id = report_uuid;
$$;
