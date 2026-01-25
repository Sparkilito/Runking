import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { RankingWithStats, RankingInsert, RankingItemInsert } from '@/types/database';

// Fetch feed rankings (for you + trending)
export function useFeedRankings(type: 'for_you' | 'trending' = 'for_you') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['rankings', 'feed', type, user?.id],
    queryFn: async () => {
      if (type === 'trending') {
        const { data, error } = await supabase.rpc('get_trending_rankings', {
          limit_count: 20,
        });

        if (error) throw error;
        return data as RankingWithStats[];
      }

      // For you: mix of followed users' rankings + popular
      const { data, error } = await supabase
        .from('rankings_with_stats')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as RankingWithStats[];
    },
  });
}

// Fetch single ranking with items
export function useRanking(rankingId: string | undefined) {
  return useQuery({
    queryKey: ['ranking', rankingId],
    queryFn: async () => {
      if (!rankingId) throw new Error('Ranking ID required');

      // Increment view count
      await supabase.rpc('increment_views', { ranking_uuid: rankingId });

      // Get ranking with stats
      const { data: ranking, error: rankingError } = await supabase
        .from('rankings_with_stats')
        .select('*')
        .eq('id', rankingId)
        .single();

      if (rankingError) throw rankingError;

      // Get ranking items
      const { data: items, error: itemsError } = await supabase
        .from('ranking_items')
        .select('*')
        .eq('ranking_id', rankingId)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      return { ...ranking, items };
    },
    enabled: !!rankingId,
  });
}

// Fetch user's rankings
export function useUserRankings(userId: string | undefined) {
  return useQuery({
    queryKey: ['rankings', 'user', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      const { data, error } = await supabase
        .from('rankings_with_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RankingWithStats[];
    },
    enabled: !!userId,
  });
}

// Search rankings
export function useSearchRankings(query: string, categorySlug?: string) {
  return useQuery({
    queryKey: ['rankings', 'search', query, categorySlug],
    queryFn: async () => {
      let queryBuilder = supabase
        .from('rankings_with_stats')
        .select('*')
        .eq('is_published', true);

      if (query) {
        queryBuilder = queryBuilder.ilike('title', `%${query}%`);
      }

      if (categorySlug) {
        queryBuilder = queryBuilder.eq('category_slug', categorySlug);
      }

      const { data, error } = await queryBuilder
        .order('likes_count', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as RankingWithStats[];
    },
    enabled: query.length > 0 || !!categorySlug,
  });
}

// Create ranking mutation
export function useCreateRanking() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      ranking,
      items,
    }: {
      ranking: Omit<RankingInsert, 'user_id'>;
      items: Omit<RankingItemInsert, 'ranking_id'>[];
    }) => {
      if (!user) throw new Error('Must be logged in');

      // Create ranking
      const { data: newRanking, error: rankingError } = await supabase
        .from('rankings')
        .insert({ ...ranking, user_id: user.id })
        .select()
        .single();

      if (rankingError) throw rankingError;

      // Create ranking items
      const itemsWithRankingId = items.map((item, index) => ({
        ...item,
        ranking_id: newRanking.id,
        position: index + 1,
      }));

      const { error: itemsError } = await supabase
        .from('ranking_items')
        .insert(itemsWithRankingId);

      if (itemsError) throw itemsError;

      return newRanking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });
}

// Delete ranking mutation
export function useDeleteRanking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rankingId: string) => {
      const { error } = await supabase
        .from('rankings')
        .delete()
        .eq('id', rankingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });
}
