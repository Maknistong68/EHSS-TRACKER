'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from './use-supabase';
import type { UserRole } from '@/lib/constants/roles';

interface UserRoleInfo {
    role: UserRole;
    loading: boolean;
}

/**
 * Fetches the current user's global role from the profiles table.
 */
export function useUserRole(): UserRoleInfo {
    const supabase = useSupabase();
    const [role, setRole] = useState<UserRole>('viewer');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (data) setRole(data.role as UserRole);
            }
            setLoading(false);
        }
        fetchRole();
    }, [supabase]);

    return { role, loading };
}
