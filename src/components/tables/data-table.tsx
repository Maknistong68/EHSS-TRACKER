'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKeys?: string[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
  exportFileName?: string;
  exportKeys?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = false,
  searchKeys = [],
  emptyMessage = 'No data available',
  onRowClick,
  pageSize = 20,
  exportFileName,
  exportKeys,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchable || !search) return data;
    return data.filter((row) =>
      searchKeys.some((key) =>
        String(row[key] || '').toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchable, searchKeys]);

  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const cmp = aVal < bVal ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = sortedData.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Reset to page 1 when data/search changes
  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const handleExport = () => {
    const keys = exportKeys || columns.filter((c) => c.key !== 'actions').map((c) => c.key);
    const headers = columns.filter((c) => keys.includes(c.key)).map((c) => c.header);
    const rows = sortedData.map((row) => keys.map((key) => {
      const val = row[key];
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Escape CSV values with commas or quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName || 'export'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        {searchable && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
              aria-label="Search table"
            />
          </div>
        )}
        {exportFileName && (
          <button
            onClick={handleExport}
            className="btn-secondary flex-shrink-0"
            aria-label="Export to CSV"
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Export
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn('table-header', col.className, col.sortable && 'cursor-pointer select-none')}
                  onClick={() => col.sortable && handleSort(col.key)}
                  aria-sort={sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('table-cell', col.className)}>
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination + Record count */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing {sortedData.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, sortedData.length)} of {sortedData.length} records
          {searchable && search && ` (filtered from ${data.length})`}
        </span>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
              .map((page, idx, arr) => (
                <span key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-gray-300">…</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'rounded px-2 py-1 text-xs',
                      page === safeCurrentPage ? 'bg-primary-100 text-primary-700 font-medium' : 'hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="rounded p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
