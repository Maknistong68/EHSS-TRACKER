'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import { Plus, Settings, Trash2, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import ConfirmDialog from '@/components/shared/confirm-dialog';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

interface Project {
  id: string;
  name: string;
  contract_no: string;
  location: string;
  region: string;
  start_year: number;
  status: string;
  created_at: string;
}

const EMPTY_FORM = { name: '', contract_no: '', location: '', region: 'NEOM', start_year: 2024, status: 'active' };

export default function ProjectsPage() {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) { toast('error', 'Failed to load projects: ' + error.message); }
    else { setProjects(data || []); }
    setLoading(false);
  }, [supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Project name is required';
    if (!form.start_year || form.start_year < 2020 || form.start_year > 2035) errors.start_year = 'Enter valid year (2020-2035)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    if (editingId) {
      const { error } = await supabase.from('projects').update(form).eq('id', editingId);
      if (error) { toast('error', 'Failed to update: ' + error.message); }
      else { toast('success', 'Project updated'); }
    } else {
      const { error } = await supabase.from('projects').insert(form);
      if (error) { toast('error', 'Failed to create: ' + error.message); }
      else { toast('success', 'Project created'); }
    }
    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    loadData();
  };

  const startEdit = (project: Project) => {
    setForm({ name: project.name, contract_no: project.contract_no, location: project.location, region: project.region, start_year: project.start_year, status: project.status });
    setEditingId(project.id);
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('projects').delete().eq('id', deleteTarget);
    if (error) { toast('error', 'Failed to delete: ' + error.message); }
    else { toast('success', 'Project deleted'); }
    setDeleteTarget(null);
    loadData();
  };

  const handleInitChecklist = async (projectId: string) => {
    const { error } = await supabase.rpc('seed_project_checklists', { p_project_id: projectId });
    if (error) { toast('error', 'Error initializing checklists: ' + error.message); }
    else { toast('success', 'Checklists initialized successfully!'); }
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    suspended: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">Manage your EHSS tracking projects</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setFormErrors({}); setShowForm(true); }} className="btn-primary">
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          New Project
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Project' : 'Create New Project'}</h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600" aria-label="Close form"><X className="h-5 w-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={cn('input-field', formErrors.name && 'border-red-400')} placeholder="e.g. NEOM Bay Phase 2" />
              {formErrors.name && <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contract No.</label>
              <input type="text" value={form.contract_no} onChange={(e) => setForm({ ...form, contract_no: e.target.value })} className="input-field" placeholder="e.g. NEOM-2024-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g. Oxagon" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="input-field">
                <option>NEOM</option>
                <option>Riyadh</option>
                <option>Jeddah</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Year <span className="text-red-500">*</span></label>
              <input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: Number(e.target.value) })} className={cn('input-field', formErrors.start_year && 'border-red-400')} min={2020} max={2035} />
              {formErrors.start_year && <p className="text-xs text-red-500 mt-1">{formErrors.start_year}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No projects created yet.</p>
          <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} className="btn-primary">
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.contract_no && <p className="text-xs text-gray-400 mt-0.5">{project.contract_no}</p>}
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusBadge[project.status] || '')}>{project.status}</span>
              </div>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                {project.location && <p>Location: {project.location}</p>}
                <p>Region: {project.region}</p>
                <p>Start Year: {project.start_year}</p>
              </div>
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
                <button onClick={() => handleInitChecklist(project.id)} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700" aria-label={`Initialize checklists for ${project.name}`}>
                  <Settings className="h-3.5 w-3.5" aria-hidden="true" /> Init Checklists
                </button>
                <button onClick={() => startEdit(project)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700" aria-label={`Edit ${project.name}`}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit
                </button>
                <button onClick={() => setDeleteTarget(project.id)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto" aria-label={`Delete ${project.name}`}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project"
        message="Are you sure? This will delete the project and ALL associated data (checklists, KPIs, inspections, incidents). This cannot be undone."
        confirmLabel="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
