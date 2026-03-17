import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Returns a stable Supabase client reference.
 * Prevents infinite re-renders when used as a useEffect dependency.
 */
export function useSupabase() {
    return useMemo(() => createClient(), []);
}
