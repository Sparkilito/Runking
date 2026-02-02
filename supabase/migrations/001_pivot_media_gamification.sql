-- =====================================================
-- RUNKING 2.0 PIVOT MIGRATION
-- Media Specialization + Gamification System
-- Execute this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PHASE 1: MEDIA ITEMS TABLE
-- For storing movie, series, and book metadata from external APIs
-- =====================================================

CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_type TEXT NOT NULL CHECK (media_type IN ('book', 'series', 'movie')),
  external_id TEXT, -- ID from external API (TMDB, Google Books)
  external_source TEXT CHECK (external_source IN ('tmdb', 'google_books', 'open_library', 'manual')),
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  cover_image_url TEXT,
  release_year INTEGER,
  -- For books
  author TEXT,
  isbn TEXT,
  page_count INTEGER,
  publisher TEXT,
  -- For movies/series
  director TEXT,
  duration_minutes INTEGER,
  seasons_count INTEGER, -- only for series
  episodes_count INTEGER, -- only for series
  -- Common
  genres TEXT[], -- array of genres
  external_rating DECIMAL(3,2), -- rating from external source (IMDB, etc)
  language TEXT,
  country TEXT,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique external items per source
  UNIQUE(media_type, external_source, external_id)
);

-- Indexes for media_items
CREATE INDEX IF NOT EXISTS idx_media_items_type ON public.media_items(media_type);
CREATE INDEX IF NOT EXISTS idx_media_items_title ON public.media_items USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_media_items_external ON public.media_items(external_source, external_id);

-- =====================================================
-- PHASE 2: UPDATE RANKING_ITEMS TABLE
-- Add scoring and media relationship
-- =====================================================

-- Add new columns to ranking_items
ALTER TABLE public.ranking_items
  ADD COLUMN IF NOT EXISTS media_item_id UUID REFERENCES public.media_items(id),
  ADD COLUMN IF NOT EXISTS score DECIMAL(3,1) CHECK (score IS NULL OR (score >= 1 AND score <= 10)),
  ADD COLUMN IF NOT EXISTS review TEXT,
  ADD COLUMN IF NOT EXISTS is_manual_position BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS scored_at TIMESTAMPTZ;

-- Index for media relationship
CREATE INDEX IF NOT EXISTS idx_ranking_items_media ON public.ranking_items(media_item_id);

-- =====================================================
-- PHASE 3: UPDATE RANKINGS TABLE
-- Add media type for specialized rankings
-- =====================================================

ALTER TABLE public.rankings
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IS NULL OR media_type IN ('book', 'series', 'movie')),
  ADD COLUMN IF NOT EXISTS sort_mode TEXT DEFAULT 'score' CHECK (sort_mode IN ('score', 'manual', 'date'));

-- =====================================================
-- PHASE 4: GAMIFICATION - USER GAMIFICATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_gamification (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp_total INTEGER DEFAULT 0,
  xp_weekly INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_shield_active BOOLEAN DEFAULT FALSE,
  streak_shield_used_at DATE,
  league TEXT DEFAULT 'bronze' CHECK (league IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master')),
  league_rank INTEGER,
  total_rankings_created INTEGER DEFAULT 0,
  total_reviews_written INTEGER DEFAULT 0,
  total_likes_received INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboards
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON public.user_gamification(xp_weekly DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_league ON public.user_gamification(league, xp_weekly DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_level ON public.user_gamification(level DESC);

-- =====================================================
-- PHASE 5: BADGES SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or URL
  category TEXT NOT NULL CHECK (category IN ('rankings', 'social', 'streak', 'special', 'media')),
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  is_secret BOOLEAN DEFAULT FALSE,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);

-- =====================================================
-- PHASE 6: XP TRANSACTIONS LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_type TEXT, -- 'ranking', 'badge', 'streak', 'referral', etc.
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_user ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_date ON public.xp_transactions(created_at DESC);

-- =====================================================
-- PHASE 7: REFERRAL SYSTEM
-- =====================================================

-- Add referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Generate unique referral code for existing users
UPDATE public.profiles
SET referral_code = UPPER(SUBSTRING(username, 1, 4)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4))
WHERE referral_code IS NULL;

-- =====================================================
-- PHASE 8: RLS POLICIES FOR NEW TABLES
-- =====================================================

-- Media items - public read, authenticated write
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Media items are viewable by everyone"
  ON public.media_items FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create media items"
  ON public.media_items FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- User gamification - users see their own, public leaderboard
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gamification for leaderboards"
  ON public.user_gamification FOR SELECT
  USING (true);

CREATE POLICY "System can manage gamification"
  ON public.user_gamification FOR ALL
  USING (auth.uid() = user_id);

-- Badges - public read
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- User badges - public read
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

-- XP transactions - users see their own
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own XP transactions"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- PHASE 9: FUNCTIONS FOR GAMIFICATION
-- =====================================================

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert XP transaction
  INSERT INTO public.xp_transactions (user_id, amount, reason, reference_type, reference_id)
  VALUES (p_user_id, p_amount, p_reason, p_reference_type, p_reference_id);

  -- Update user gamification
  INSERT INTO public.user_gamification (user_id, xp_total, xp_weekly, level)
  VALUES (p_user_id, p_amount, p_amount, 1)
  ON CONFLICT (user_id) DO UPDATE SET
    xp_total = user_gamification.xp_total + p_amount,
    xp_weekly = user_gamification.xp_weekly + p_amount,
    updated_at = NOW()
  RETURNING xp_total INTO new_total;

  -- Calculate new level based on XP
  new_level := CASE
    WHEN new_total < 100 THEN 1
    WHEN new_total < 250 THEN 2
    WHEN new_total < 500 THEN 3
    WHEN new_total < 1000 THEN 4
    WHEN new_total < 1750 THEN 5
    WHEN new_total < 2750 THEN 6
    WHEN new_total < 4000 THEN 7
    WHEN new_total < 5500 THEN 8
    WHEN new_total < 7500 THEN 9
    WHEN new_total < 10000 THEN 10
    WHEN new_total < 13000 THEN 11
    WHEN new_total < 17000 THEN 12
    WHEN new_total < 22000 THEN 13
    WHEN new_total < 28000 THEN 14
    WHEN new_total < 35000 THEN 15
    WHEN new_total < 45000 THEN 16
    WHEN new_total < 57000 THEN 17
    WHEN new_total < 72000 THEN 18
    WHEN new_total < 90000 THEN 19
    ELSE 20 + ((new_total - 90000) / 25000)
  END;

  -- Update level if changed
  UPDATE public.user_gamification
  SET level = new_level
  WHERE user_id = p_user_id AND level < new_level;

  RETURN new_total;
END;
$$;

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_date DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
  shield_active BOOLEAN;
  shield_used DATE;
BEGIN
  SELECT
    last_activity_date,
    current_streak,
    longest_streak,
    streak_shield_active,
    streak_shield_used_at
  INTO last_date, current_streak_val, longest_streak_val, shield_active, shield_used
  FROM public.user_gamification
  WHERE user_id = p_user_id;

  -- If no record exists, create one
  IF last_date IS NULL THEN
    INSERT INTO public.user_gamification (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      current_streak = 1,
      longest_streak = GREATEST(user_gamification.longest_streak, 1),
      last_activity_date = CURRENT_DATE;
    RETURN 1;
  END IF;

  -- If already active today, just return current streak
  IF last_date = CURRENT_DATE THEN
    RETURN current_streak_val;
  END IF;

  -- If yesterday, increment streak
  IF last_date = CURRENT_DATE - 1 THEN
    current_streak_val := current_streak_val + 1;
  -- If missed one day but have shield
  ELSIF last_date = CURRENT_DATE - 2 AND shield_active AND (shield_used IS NULL OR shield_used < CURRENT_DATE - 30) THEN
    -- Use shield, keep streak
    UPDATE public.user_gamification
    SET streak_shield_active = FALSE, streak_shield_used_at = CURRENT_DATE
    WHERE user_id = p_user_id;
  ELSE
    -- Reset streak
    current_streak_val := 1;
  END IF;

  -- Update record
  UPDATE public.user_gamification
  SET
    current_streak = current_streak_val,
    longest_streak = GREATEST(longest_streak, current_streak_val),
    last_activity_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN current_streak_val;
END;
$$;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_badges(p_user_id UUID)
RETURNS TABLE(badge_slug TEXT, badge_name TEXT, xp_reward INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge_record RECORD;
  user_value INTEGER;
  gamification RECORD;
BEGIN
  -- Get user gamification stats
  SELECT * INTO gamification FROM public.user_gamification WHERE user_id = p_user_id;

  -- Check each badge
  FOR badge_record IN SELECT * FROM public.badges WHERE NOT EXISTS (
    SELECT 1 FROM public.user_badges WHERE user_id = p_user_id AND badge_id = badges.id
  ) LOOP
    -- Get the value to check based on requirement type
    user_value := CASE badge_record.requirement_type
      WHEN 'rankings_created' THEN gamification.total_rankings_created
      WHEN 'reviews_written' THEN gamification.total_reviews_written
      WHEN 'likes_received' THEN gamification.total_likes_received
      WHEN 'streak' THEN gamification.current_streak
      WHEN 'level' THEN gamification.level
      WHEN 'xp' THEN gamification.xp_total
      WHEN 'shares' THEN gamification.total_shares
      WHEN 'referrals' THEN (SELECT referral_count FROM public.profiles WHERE id = p_user_id)
      WHEN 'followers' THEN (SELECT COUNT(*) FROM public.follows WHERE following_id = p_user_id)
      ELSE 0
    END;

    -- If user meets requirement, award badge
    IF user_value >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, badge_record.id)
      ON CONFLICT DO NOTHING;

      -- Award XP for badge
      IF badge_record.xp_reward > 0 THEN
        PERFORM public.award_xp(p_user_id, badge_record.xp_reward, 'Badge: ' || badge_record.name, 'badge', badge_record.id);
      END IF;

      badge_slug := badge_record.slug;
      badge_name := badge_record.name;
      xp_reward := badge_record.xp_reward;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_league TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
  rank BIGINT,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  xp_weekly INTEGER,
  level INTEGER,
  current_streak INTEGER,
  league TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    ROW_NUMBER() OVER (ORDER BY ug.xp_weekly DESC) as rank,
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    ug.xp_weekly,
    ug.level,
    ug.current_streak,
    ug.league
  FROM public.user_gamification ug
  JOIN public.profiles p ON ug.user_id = p.id
  WHERE p_league IS NULL OR ug.league = p_league
  ORDER BY ug.xp_weekly DESC
  LIMIT p_limit;
$$;

-- =====================================================
-- PHASE 10: TRIGGERS FOR GAMIFICATION
-- =====================================================

-- Trigger to award XP and update stats on ranking creation
CREATE OR REPLACE FUNCTION public.handle_ranking_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update streak
  PERFORM public.update_user_streak(NEW.user_id);

  -- Award XP
  PERFORM public.award_xp(NEW.user_id, 50, 'Ranking created', 'ranking', NEW.id);

  -- Update total rankings count
  UPDATE public.user_gamification
  SET total_rankings_created = total_rankings_created + 1
  WHERE user_id = NEW.user_id;

  -- Check for new badges
  PERFORM public.check_badges(NEW.user_id);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_ranking_created_gamification
  AFTER INSERT ON public.rankings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ranking_created();

-- Trigger to award XP on receiving like
CREATE OR REPLACE FUNCTION public.handle_like_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ranking_owner UUID;
BEGIN
  -- Get ranking owner
  SELECT user_id INTO ranking_owner FROM public.rankings WHERE id = NEW.ranking_id;

  -- Don't award XP for self-likes
  IF ranking_owner != NEW.user_id THEN
    PERFORM public.award_xp(ranking_owner, 5, 'Received like', 'like', NEW.id);

    UPDATE public.user_gamification
    SET total_likes_received = total_likes_received + 1
    WHERE user_id = ranking_owner;

    PERFORM public.check_badges(ranking_owner);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_like_gamification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_like_gamification();

-- =====================================================
-- PHASE 11: SEED BADGES
-- =====================================================

INSERT INTO public.badges (slug, name, description, icon, category, xp_reward, requirement_type, requirement_value, tier) VALUES
  -- Rankings badges
  ('first_ranking', 'Primer Paso', 'Crea tu primer ranking', '🎯', 'rankings', 25, 'rankings_created', 1, 'bronze'),
  ('critic_5', 'Crítico Novato', 'Crea 5 rankings', '📝', 'rankings', 50, 'rankings_created', 5, 'bronze'),
  ('critic_10', 'Crítico Dedicado', 'Crea 10 rankings', '📋', 'rankings', 100, 'rankings_created', 10, 'silver'),
  ('critic_25', 'Crítico Experto', 'Crea 25 rankings', '🏆', 'rankings', 200, 'rankings_created', 25, 'gold'),
  ('critic_50', 'Super Crítico', 'Crea 50 rankings', '👑', 'rankings', 500, 'rankings_created', 50, 'platinum'),

  -- Reviews badges
  ('reviewer_5', 'Opinador', 'Escribe 5 reviews', '💬', 'rankings', 25, 'reviews_written', 5, 'bronze'),
  ('reviewer_25', 'Reseñador', 'Escribe 25 reviews', '📰', 'rankings', 100, 'reviews_written', 25, 'silver'),
  ('reviewer_100', 'Crítico Literario', 'Escribe 100 reviews', '🖊️', 'rankings', 300, 'reviews_written', 100, 'gold'),

  -- Social badges
  ('popular_10', 'Notable', 'Recibe 10 likes', '❤️', 'social', 25, 'likes_received', 10, 'bronze'),
  ('popular_50', 'Popular', 'Recibe 50 likes', '💕', 'social', 75, 'likes_received', 50, 'silver'),
  ('popular_200', 'Estrella', 'Recibe 200 likes', '⭐', 'social', 200, 'likes_received', 200, 'gold'),
  ('popular_1000', 'Leyenda', 'Recibe 1000 likes', '🌟', 'social', 500, 'likes_received', 1000, 'platinum'),

  ('followers_10', 'Influyente', 'Consigue 10 seguidores', '👥', 'social', 50, 'followers', 10, 'bronze'),
  ('followers_50', 'Influencer', 'Consigue 50 seguidores', '📢', 'social', 150, 'followers', 50, 'silver'),
  ('followers_200', 'Celebridad', 'Consigue 200 seguidores', '🎤', 'social', 400, 'followers', 200, 'gold'),

  -- Streak badges
  ('streak_3', 'En Racha', '3 días seguidos activo', '🔥', 'streak', 30, 'streak', 3, 'bronze'),
  ('streak_7', 'Semana Perfecta', '7 días seguidos activo', '🔥', 'streak', 100, 'streak', 7, 'silver'),
  ('streak_30', 'Mes Imparable', '30 días seguidos activo', '🔥', 'streak', 500, 'streak', 30, 'gold'),
  ('streak_100', 'Leyenda Viviente', '100 días seguidos activo', '🔥', 'streak', 2000, 'streak', 100, 'platinum'),

  -- Level badges
  ('level_5', 'Aprendiz', 'Alcanza el nivel 5', '📈', 'special', 0, 'level', 5, 'bronze'),
  ('level_10', 'Veterano', 'Alcanza el nivel 10', '📈', 'special', 0, 'level', 10, 'silver'),
  ('level_20', 'Maestro', 'Alcanza el nivel 20', '📈', 'special', 0, 'level', 20, 'gold'),

  -- Referral badges
  ('referral_1', 'Embajador', 'Invita a tu primer amigo', '🤝', 'social', 50, 'referrals', 1, 'bronze'),
  ('referral_5', 'Reclutador', 'Invita a 5 amigos', '🎉', 'social', 150, 'referrals', 5, 'silver'),
  ('referral_25', 'Evangelista', 'Invita a 25 amigos', '🚀', 'social', 500, 'referrals', 25, 'gold')

ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- PHASE 12: UPDATE CATEGORIES FOR MEDIA FOCUS
-- =====================================================

-- Keep only Libros, Series, and Películas as main categories
-- But don't delete existing categories to preserve data

-- Mark the main 3 categories as featured
UPDATE public.categories SET color = '#8b5cf6' WHERE slug = 'libros';
UPDATE public.categories SET color = '#14b8a6' WHERE slug = 'series';
UPDATE public.categories SET color = '#f97316' WHERE slug = 'cine';

-- Add category for each media type if not exists
INSERT INTO public.categories (name, slug, icon, color) VALUES
  ('Películas', 'peliculas', 'film', '#f97316')
ON CONFLICT (slug) DO UPDATE SET name = 'Películas', icon = 'film';

-- =====================================================
-- PHASE 13: WEEKLY RESET FUNCTION (for cron job)
-- =====================================================

CREATE OR REPLACE FUNCTION public.reset_weekly_xp()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update leagues based on XP before reset
  -- Top performers move up, bottom performers move down

  -- Reset weekly XP
  UPDATE public.user_gamification
  SET
    xp_weekly = 0,
    league_rank = NULL,
    updated_at = NOW();
END;
$$;

-- =====================================================
-- PHASE 14: Initialize gamification for existing users
-- =====================================================

INSERT INTO public.user_gamification (user_id, xp_total, level, last_activity_date)
SELECT
  p.id,
  COALESCE((SELECT COUNT(*) * 50 FROM public.rankings WHERE user_id = p.id), 0),
  1,
  p.created_at::DATE
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_gamification WHERE user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Generate referral codes for existing users
UPDATE public.profiles
SET referral_code = UPPER(SUBSTRING(username, 1, 4)) || '-' || UPPER(SUBSTRING(MD5(id::TEXT || RANDOM()::TEXT), 1, 4))
WHERE referral_code IS NULL;

-- =====================================================
-- DONE!
-- =====================================================
