import { createClient } from '@supabase/supabase-js';

// Read credentials strictly from internal environment variables (.env / Vercel secrets)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfig = {
  url: supabaseUrl || null,
  anonKey: supabaseAnonKey || null,
  isConfigured: !!(supabaseUrl && supabaseAnonKey)
};

export const supabase = supabaseConfig.isConfigured 
  ? createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;
