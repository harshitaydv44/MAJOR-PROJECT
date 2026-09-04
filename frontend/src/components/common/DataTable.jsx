import React from 'react';
import Button from './Button';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry = null,
  emptyMessage = 'No records found matching criteria.',
  pagination = null,
  onPageChange = null,
  onSort = null,
  sortBy = null,
  sortOrder = 'desc'
}) => {
  if (loading) {
    return <LoadingState message="Loading data from state registry..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Table Records"
        message={typeof error === 'string' ? error : 'An error occurred while fetching registry data.'}
        onRetry={onRetry}
        retryLabel="Retry Loading"
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="No Records Found"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="w-full space-y-3 font-serif">
      <div className="overflow-x-auto border border-gov-border rounded-xs">
        <table className="w-full text-left text-xs divide-y divide-gov-border">
          <thead>
            <tr className="bg-gov-sand-100 text-gov-navy font-bold uppercase tracking-wider text-[11px]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 whitespace-nowrap ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer hover:bg-gov-sand-200 select-none' : ''
                  }`}
                  onClick={() => col.sortable && onSort && onSort(col.accessor)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="text-gov-text-muted">
                        {sortBy === col.accessor ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-gov-maroon" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-gov-maroon" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gov-border bg-white">
            {data.map((row, rowIdx) => (
              <tr
                key={row._id || rowIdx}
                className="hover:bg-gov-sand-50 transition-colors duration-150"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-4 py-3 ${col.cellClassName || ''}`}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : row[col.accessor] !== undefined
                      ? row[col.accessor]
                      : '--'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2 text-xs text-gov-text-secondary">
          <div className="text-[11px]">
            Showing <strong className="text-gov-navy">{data.length}</strong> of{' '}
            <strong className="text-gov-navy">{pagination.total}</strong> records &bull; Page{' '}
            <strong className="text-gov-navy">{pagination.page}</strong> of{' '}
            <strong className="text-gov-navy">{pagination.totalPages}</strong>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="subtle"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              icon={ChevronLeft}
            >
              Previous
            </Button>

            <span className="px-2 font-bold text-gov-maroon text-xs">
              {pagination.page}
            </span>

            <Button
              variant="subtle"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
