import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment, CommentInsert } from '@/types/database';

// Check if user has liked a ranking
export function useHasLiked(rankingId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['likes', rankingId, user?.id],
    queryFn: async () => {
      if (!user || !rankingId) return false;

      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('ranking_id', rankingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!rankingId,
  });
}

// Toggle like mutation
export function useToggleLike() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      rankingId,
      isLiked,
    }: {
      rankingId: string;
      isLiked: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('ranking_id', rankingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({ ranking_id: rankingId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['likes', variables.rankingId] });
      queryClient.invalidateQueries({ queryKey: ['ranking', variables.rankingId] });
      queryClient.invalidateQueries({ queryKey: ['rankings'] });
    },
  });
}

// Check if user has saved a ranking
export function useHasSaved(rankingId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['saved', rankingId, user?.id],
    queryFn: async () => {
      if (!user || !rankingId) return false;

      const { data, error } = await supabase
        .from('saved_rankings')
        .select('id')
        .eq('ranking_id', rankingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!rankingId,
  });
}

// Toggle save mutation
export function useToggleSave() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      rankingId,
      isSaved,
    }: {
      rankingId: string;
      isSaved: boolean;
    }) => {
      if (!user) throw new Error('Must be logged in');

      if (isSaved) {
        // Remove save
        const { error } = await supabase
          .from('saved_rankings')
          .delete()
          .eq('ranking_id', rankingId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add save
        const { error } = await supabase
          .from('saved_rankings')
          .insert({ ranking_id: rankingId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved', variables.rankingId] });
    },
  });
}

// Fetch comments for a ranking
export function useComments(rankingId: string | undefined) {
  return useQuery({
    queryKey: ['comments', rankingId],
    queryFn: async () => {
      if (!rankingId) throw new Error('Ranking ID required');

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('ranking_id', rankingId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!rankingId,
  });
}

// Add comment mutation
export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      rankingId,
      content,
      parentId,
    }: {
      rankingId: string;
      content: string;
      parentId?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');

      const commentData: CommentInsert = {
        ranking_id: rankingId,
        user_id: user.id,
        content,
        parent_id: parentId || null,
      };

      const { data, error } = await supabase
        .from('comments')
        .insert(commentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.rankingId] });
      queryClient.invalidateQueries({ queryKey: ['ranking', variables.rankingId] });
    },
  });
}

// Delete comment mutation
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      rankingId,
    }: {
      commentId: string;
      rankingId: string;
    }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.rankingId] });
      queryClient.invalidateQueries({ queryKey: ['ranking', variables.rankingId] });
    },
  });
}
