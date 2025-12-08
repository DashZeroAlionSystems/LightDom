import { cn } from '@/lib/utils';
import React from 'react';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface KaggleDataGridProps<T = any> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  sortable?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
}

/**
 * KaggleDataGrid - Material Design data table component
 *
 * Extracted from Kaggle's table patterns. Features sortable columns,
 * row hover states, and flexible rendering.
 *
 * @example
 * ```tsx
 * <KaggleDataGrid
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true },
 *     { key: 'score', label: 'Score', sortable: true, align: 'right' },
 *   ]}
 *   data={[
 *     { name: 'Alice', score: 95 },
 *     { name: 'Bob', score: 87 },
 *   ]}
 *   onRowClick={(row) => console.log(row)}
 *   striped
 *   hoverable
 * />
 * ```
 */
export function KaggleDataGrid<T = any>({
  columns,
  data,
  className,
  onRowClick,
  sortable = false,
  striped = true,
  hoverable = true,
  loading = false,
  emptyMessage = 'No data available',
  defaultSortKey,
  defaultSortDirection = 'asc',
}: KaggleDataGridProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(defaultSortKey ? { key: defaultSortKey, direction: defaultSortDirection } : null);

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a: any, b: any) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal < bVal) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    if (!sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  if (loading) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className='flex items-center justify-center py-12'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
          <span className='ml-3 text-gray-600'>Loading...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className='flex items-center justify-center py-12 text-gray-500'>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && handleSort(col.key)}
                className={cn(
                  'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                  {
                    'text-left': !col.align || col.align === 'left',
                    'text-center': col.align === 'center',
                    'text-right': col.align === 'right',
                    'cursor-pointer hover:bg-gray-100 select-none':
                      sortable && col.sortable !== false,
                  }
                )}
                style={{ width: col.width }}
              >
                <div className='flex items-center gap-2'>
                  {col.label}
                  {sortable && col.sortable !== false && sortConfig?.key === col.key && (
                    <span className='text-blue-600'>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn('bg-white divide-y divide-gray-200', { 'divide-y-0': !striped })}>
          {sortedData.map((row: any, idx: number) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row, idx)}
              className={cn(
                'transition-colors',
                { 'bg-gray-50': striped && idx % 2 === 1 },
                { 'hover:bg-blue-50 cursor-pointer': hoverable || onRowClick }
              )}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', {
                    'text-left': !col.align || col.align === 'left',
                    'text-center': col.align === 'center',
                    'text-right': col.align === 'right',
                  })}
                >
                  {col.render ? col.render(row[col.key], row, idx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default KaggleDataGrid;
