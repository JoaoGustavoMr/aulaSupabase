import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eltrhhxkuajgnkjeusyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsdHJoaHhrdWFqZ25ramV1c3l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDc4NTIsImV4cCI6MjA2Mjg4Mzg1Mn0.c2L_oF4W2KN8m19PIVQo7Nkkyf9c1p2AIU7YHyG0Tsc';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('SupaBase URL ou chave não estão definidos');
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);