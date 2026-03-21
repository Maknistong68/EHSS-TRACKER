'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function NewProjectPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState({
    name: '',
    contract_no: '',
    location: '',
    region: '',
    start_year: new Date().getFullYear(),
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const { data: project, error: err } = await supabase
      .from('projects')
      .insert({
        ...form,
        created_by: user.id,
      })
      .select()
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Add creator as project member with admin role
    if (project) {
      await supabase.from('project_members').insert({
        project_id: project.id,
        user_id: user.id,
        role: 'admin',
      });

      // Auto-initialize checklists
      await supabase.rpc('seed_project_checklists', { p_project_id: project.id });
    }

    router.push('/projects');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-sm text-gray-500">Set up a new EHSS tracking project</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="e.g. Marina Bay Phase 2 - EHSS Consultancy"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract No.</label>
            <input
              type="text"
              value={form.contract_no}
              onChange={(e) => setForm({ ...form, contract_no: e.target.value })}
              className="input-field"
              placeholder="e.g. PRJ-2024-HSE-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="input-field"
            >
              <option value="">Select Region</option>
              <option>Riyadh</option>
              <option>Jeddah</option>
              <option>Dammam</option>
              <option>Makkah</option>
              <option>Madinah</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input-field"
              placeholder="e.g. Sector 1, Zone A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Year</label>
            <input
              type="number"
              value={form.start_year}
              onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })}
              className="input-field"
              min={2020}
              max={2035}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button type="button" onClick={() => router.push('/projects')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
