'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/tables/data-table';
import { ROLE_PERMISSIONS, type UserRole } from '@/lib/constants/roles';
import { formatDate } from '@/lib/utils/dates';
import { cn } from '@/lib/utils';
import { UserPlus, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
}

export default function UsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [inviteMsg, setInviteMsg] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    if (data) setUsers(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const handleInvite = async () => {
    setInviteMsg('');
    // In production, this would send an invitation email through Supabase auth
    // For now, just show a message
    setInviteMsg(`Invitation would be sent to ${inviteEmail} with role ${inviteRole}. Configure your SMTP settings in Supabase for email invitations.`);
  };

  const roleBadge: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    pm: 'bg-green-100 text-green-700',
    inspector: 'bg-amber-100 text-amber-700',
    viewer: 'bg-gray-100 text-gray-700',
  };

  const columns: Column<UserProfile>[] = [
    { key: 'full_name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'role', header: 'System Role', render: (row) => (
      <select
        value={row.role}
        onChange={(e) => handleRoleChange(row.id, e.target.value as UserRole)}
        className={cn('rounded-full px-2 py-0.5 text-xs font-medium border-0 cursor-pointer', roleBadge[row.role] || '')}
      >
        <option value="owner">Owner</option>
        <option value="admin">Admin</option>
        <option value="pm">Project Manager</option>
        <option value="inspector">Inspector</option>
        <option value="viewer">Viewer</option>
      </select>
    )},
    { key: 'permissions', header: 'Permissions', render: (row) => (
      <span className="text-xs text-gray-500">{ROLE_PERMISSIONS[row.role]?.description}</span>
    )},
    { key: 'created_at', header: 'Joined', render: (row) => formatDate(row.created_at), sortable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500">Manage user accounts and role assignments</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="btn-primary">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Invite User
        </button>
      </div>

      {/* Role legend */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => (
            <div key={role} className="text-xs">
              <span className={cn('rounded-full px-2 py-0.5 font-medium', roleBadge[role] || '')}>
                {perms.label}
              </span>
              <p className="mt-1 text-gray-500">{perms.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showInvite && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Invite New User</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-field" placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as UserRole)} className="input-field">
                <option value="viewer">Viewer</option>
                <option value="inspector">Inspector</option>
                <option value="pm">Project Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {inviteMsg && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200">{inviteMsg}</div>
          )}
          <div className="flex gap-2">
            <button onClick={handleInvite} className="btn-primary">Send Invitation</button>
            <button onClick={() => { setShowInvite(false); setInviteMsg(''); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading users...</div>
      ) : (
        <DataTable columns={columns} data={users} searchable searchKeys={['full_name', 'email']} emptyMessage="No users registered" />
      )}
    </div>
  );
}
