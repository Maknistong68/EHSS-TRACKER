import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rxtlitpbhszojhmmlkaj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dGxpdHBiaHN6b2pobW1sa2FqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NTQ0MjcsImV4cCI6MjA4OTMzMDQyN30.EL5YUf7vwIaH1k8Bhik_I9a63dWty0ah-5jj7aP-oQQ';

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
