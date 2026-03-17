'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { createClient } from '@/lib/supabase/client';
import DataTable, { Column } from '@/components/tables/data-table';
import TableActions from '@/components/tables/table-actions';
import YearTabs from '@/components/shared/year-tabs';
import RagBadge from '@/components/shared/rag-badge';
import { type RagStatus } from '@/lib/utils/rag';
import { X } from 'lucide-react';

interface Subcontractor {
  id: string;
  name: string;
  trade: string;
  year: number;
  quarter: number;
  workers: number;
  induction_pct: number;
  training_pct: number;
  audit_score_pct: number;
  ptw_compliance_pct: number;
  overall_score: number;
  rag_status: RagStatus;
}

export default function SubcontractorsPage() {
  const { currentProject } = useProject();
  const supabase = createClient();
  const [data, setData] = useState<Subcontractor[]>([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', trade: '', quarter: 1, workers: 0,
    induction_pct: 0, training_pct: 0, audit_score_pct: 0, ptw_compliance_pct: 0,
  });

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from('subcontractors')
      .select('*')
      .eq('project_id', currentProject.id)
      .eq('year', selectedYear)
      .order('name')
      .order('quarter');
    if (rows) setData(rows);
    setLoading(false);
  }, [currentProject, selectedYear, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    if (!currentProject) return;
    const overall = (form.induction_pct + form.training_pct + form.audit_score_pct + form.ptw_compliance_pct) / 4;
    const rag: RagStatus = overall >= 85 ? 'green' : overall >= 70 ? 'amber' : 'red';
    await supabase.from('subcontractors').insert({
      project_id: currentProject.id,
      year: selectedYear,
      ...form,
      overall_score: Math.round(overall * 10) / 10,
      rag_status: rag,
    });
    setShowForm(false);
    setForm({ name: '', trade: '', quarter: 1, workers: 0, induction_pct: 0, training_pct: 0, audit_score_pct: 0, ptw_compliance_pct: 0 });
    loadData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('subcontractors').delete().eq('id', id);
    loadData();
  };

  const columns: Column<Subcontractor>[] = [
    { key: 'name', header: 'Subcontractor', sortable: true },
    { key: 'trade', header: 'Trade' },
    { key: 'quarter', header: 'Q', render: (row) => `Q${row.quarter}`, className: 'text-center' },
    { key: 'workers', header: 'Workers', className: 'text-center' },
    { key: 'induction_pct', header: 'Induction %', className: 'text-center', render: (row) => `${row.induction_pct}%` },
    { key: 'training_pct', header: 'Training %', className: 'text-center', render: (row) => `${row.training_pct}%` },
    { key: 'audit_score_pct', header: 'Audit %', className: 'text-center', render: (row) => `${row.audit_score_pct}%` },
    { key: 'ptw_compliance_pct', header: 'PTW %', className: 'text-center', render: (row) => `${row.ptw_compliance_pct}%` },
    { key: 'overall_score', header: 'Overall', className: 'text-center font-medium', render: (row) => `${row.overall_score}%` },
    { key: 'rag_status', header: 'RAG', render: (row) => <RagBadge status={row.rag_status || 'none'} /> },
    { key: 'actions', header: '', render: (row) => (
      <button onClick={() => handleDelete(row.id)} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subcontractor Performance</h1>
          <p className="text-sm text-gray-500">Quarterly subcontractor tracking and scoring</p>
        </div>
        <div className="flex items-center gap-4">
          <YearTabs startYear={2024} selectedYear={selectedYear} onYearChange={setSelectedYear} />
          <TableActions onAdd={() => setShowForm(true)} addLabel="Add Record" />
        </div>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">New Subcontractor Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subcontractor Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
              <input type="text" value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
              <select value={form.quarter} onChange={(e) => setForm({ ...form, quarter: Number(e.target.value) })} className="input-field">
                <option value={1}>Q1</option>
                <option value={2}>Q2</option>
                <option value={3}>Q3</option>
                <option value={4}>Q4</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Workers</label>
              <input type="number" value={form.workers} onChange={(e) => setForm({ ...form, workers: Number(e.target.value) })} className="input-field" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Induction %</label>
              <input type="number" value={form.induction_pct} onChange={(e) => setForm({ ...form, induction_pct: Number(e.target.value) })} className="input-field" min={0} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Training %</label>
              <input type="number" value={form.training_pct} onChange={(e) => setForm({ ...form, training_pct: Number(e.target.value) })} className="input-field" min={0} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audit Score %</label>
              <input type="number" value={form.audit_score_pct} onChange={(e) => setForm({ ...form, audit_score_pct: Number(e.target.value) })} className="input-field" min={0} max={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PTW Compliance %</label>
              <input type="number" value={form.ptw_compliance_pct} onChange={(e) => setForm({ ...form, ptw_compliance_pct: Number(e.target.value) })} className="input-field" min={0} max={100} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-primary">Save Record</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading subcontractor data...</div>
      ) : (
        <DataTable columns={columns} data={data} searchable searchKeys={['name', 'trade']} emptyMessage="No subcontractor records" />
      )}
    </div>
  );
}
