'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChecklistItem from './checklist-item';

interface ChecklistItemData {
  id: string;
  item_number: number;
  description: string;
  completed: boolean;
  notes: string | null;
  priority?: string;
}

interface ChecklistSectionProps {
  title: string;
  items: ChecklistItemData[];
  onToggle: (id: string, completed: boolean) => void;
  onNotesChange: (id: string, notes: string) => void;
  readOnly?: boolean;
}

export default function ChecklistSection({
  title,
  items,
  onToggle,
  onNotesChange,
  readOnly = false,
}: ChecklistSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const completedCount = items.filter((i) => i.completed).length;
  const percentage = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {completedCount}/{items.length}
          </span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {items.map((item) => (
            <ChecklistItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onNotesChange={onNotesChange}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
