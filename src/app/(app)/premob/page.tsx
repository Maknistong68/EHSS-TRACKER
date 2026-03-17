'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProject } from '@/components/shared/project-selector';
import { useSupabase } from '@/lib/hooks/use-supabase';
import { useToast } from '@/components/shared/toast';
import ChecklistSection from '@/components/checklists/checklist-section';
import ProgressBar from '@/components/shared/progress-bar';
import { PREMOB_SECTIONS } from '@/lib/constants/checklists';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

interface ChecklistItem {
  id: string;
  section: string;
  item_number: number;
  description: string;
  completed: boolean;
  notes: string | null;
}

export default function PremobPage() {
  const { currentProject } = useProject();
  const supabase = useSupabase();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('premob_checklist')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('item_number', { ascending: true });

    if (error) {
      toast('error', 'Failed to load checklist: ' + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [currentProject, supabase, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (id: string, completed: boolean) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed } : i));
    const { error } = await supabase
      .from('premob_checklist')
      .update({ completed, completed_at: completed ? new Date().toISOString() : null })
      .eq('id', id);
    if (error) {
      toast('error', 'Failed to update item');
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, completed: !completed } : i));
    }
  };

  const handleNotes = async (id: string, notes: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, notes } : i));
    const { error } = await supabase.from('premob_checklist').update({ notes }).eq('id', id);
    if (error) { toast('error', 'Failed to save note'); }
  };

  const totalCompleted = items.filter((i) => i.completed).length;
  const totalPct = items.length > 0 ? (totalCompleted / items.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Mobilization Checklist</h1>
          <p className="text-sm text-gray-500">64 items across 8 sections</p>
        </div>
        <div className="w-48">
          <ProgressBar value={totalPct} label="Overall" size="md" />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={3} />
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-2">No checklist items found.</p>
          <p className="text-sm text-gray-400">Go to Projects → Init Checklists to populate items.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {PREMOB_SECTIONS.map((section) => {
            const sectionItems = items.filter((i) => i.section === section);
            if (sectionItems.length === 0) return null;
            return (
              <ChecklistSection
                key={section}
                title={section}
                items={sectionItems}
                onToggle={handleToggle}
                onNotesChange={handleNotes}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
