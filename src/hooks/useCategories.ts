import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types/database';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    staleTime: 1000 * 60 * 60, // Categories don't change often
  });
}
