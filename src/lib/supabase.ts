import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase config:', {
    url: supabaseUrl ? 'set' : 'missing',
    key: supabaseAnonKey ? 'set' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

// Validate the anon key format (should be a JWT starting with 'eyJ')
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.error('Invalid Supabase anon key format. Expected JWT token starting with "eyJ".');
  console.error('Current key starts with:', supabaseAnonKey.substring(0, 20));
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
