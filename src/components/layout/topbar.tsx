'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { LogOut, User, Bell, ChevronDown } from 'lucide-react';
import ProjectSelector from '@/components/shared/project-selector';

interface UserProfile {
  full_name: string;
  email: string;
  role: string;
}

export default function Topbar() {
  const router = useRouter();
  const supabase = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, email, role')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 pl-14 lg:pl-6">
      {/* Left: Project selector */}
      <ProjectSelector />

      {/* Right: Notifications + User menu */}
      <div className="flex items-center gap-4">
        <button
          className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100"
            aria-expanded={showMenu}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <User className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">
                {profile?.full_name || 'Loading...'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {profile?.role || ''}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg" role="menu">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
