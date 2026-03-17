'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardCheck,
  Truck,
  BarChart3,
  Search,
  GraduationCap,
  Wrench,
  AlertTriangle,
  Users,
  Clock,
  FileText,
  PackageX,
  CalendarRange,
  FolderKanban,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUserRole } from '@/lib/hooks/use-user-role';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pre-Mobilization', href: '/premob', icon: ClipboardCheck },
  { name: 'Mobilization', href: '/mob', icon: Truck },
  { name: 'KPI Tracker', href: '/kpi', icon: BarChart3 },
  { name: 'Inspections', href: '/inspections', icon: Search },
  { name: 'Training', href: '/training', icon: GraduationCap },
  { name: 'Equipment', href: '/equipment', icon: Wrench },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'Subcontractors', href: '/subcontractors', icon: Users },
  { name: 'Manpower', href: '/manpower', icon: Clock },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Demobilization', href: '/demob', icon: PackageX },
  { name: 'Annual Summary', href: '/annual', icon: CalendarRange },
];

const adminNavigation = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Users', href: '/users', icon: UserCog },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { role } = useUserRole();

  const isAdmin = role === 'owner' || role === 'admin';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-slate-700">
        <Shield className="h-8 w-8 text-primary-400 flex-shrink-0" />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold text-white truncate">EHSS Tracker</h1>
            <p className="text-[10px] text-slate-400 truncate">NEOM HSSE Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2" role="navigation" aria-label="Main navigation">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-sidebar-active text-sidebar-text-active'
                    : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                )}
                title={collapsed ? item.name : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Admin section - only visible to owner/admin */}
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-slate-700">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-active text-sidebar-text-active'
                        : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active'
                    )}
                    title={collapsed ? item.name : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center h-12 border-t border-slate-700 hover:bg-sidebar-hover transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden rounded-lg bg-sidebar-bg p-2 text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar-bg text-sidebar-text">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 rounded-lg p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-sidebar-bg text-sidebar-text transition-all duration-300 h-screen sticky top-0',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
