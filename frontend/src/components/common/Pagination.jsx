import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', padding: '0.5rem 0' }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
      </span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          style={{ opacity: page === 0 ? 0.5 : 1 }}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          style={{ opacity: page >= totalPages - 1 ? 0.5 : 1 }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
