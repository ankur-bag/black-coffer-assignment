'use client';

/**
 * @file FiltersPreview.tsx
 * Interactive filter toolbar providing quick dimension toggles and filter state management.
 */

import React, { useState, useMemo } from 'react';
import { FilterOptions, FilterState } from '../lib/types';
import ActiveFilterChips, { ActiveFilterChip } from './ActiveFilterChips';

export interface FiltersPreviewProps {
  options: FilterOptions | null;
  filters: FilterState;
  setFilter: (field: keyof FilterState, values: string[] | string) => void;
  resetFilters: () => void;
  loading?: boolean;
}

export default function FiltersPreview({
  options,
  filters,
  setFilter,
  resetFilters,
  loading = false,
}: FiltersPreviewProps): React.JSX.Element {
  const [showOptionsInspector, setShowOptionsInspector] = useState(false);

  const isEnergySelected = filters.sector?.includes('Energy');
  const isNaSelected = filters.region?.includes('Northern America');
  const isUsaSelected = filters.country?.includes('United States of America');

  const chips: ActiveFilterChip[] = useMemo(() => {
    const list: ActiveFilterChip[] = [];
    (Object.entries(filters) as [keyof FilterState, string[]][]).forEach(([field, values]) => {
      if (Array.isArray(values)) {
        values.forEach((val) => {
          if (val) {
            list.push({ field, value: val });
          }
        });
      }
    });
    return list;
  }, [filters]);

  const totalActiveCount = chips.length;

  const handleToggle = (field: keyof FilterState, value: string) => {
    const current = filters[field] || [];
    if (current.includes(value)) {
      setFilter(field, current.filter((v) => v !== value));
    } else {
      setFilter(field, [...current, value]);
    }
  };

  const handleRemoveChip = (field: keyof FilterState, value: string) => {
    const current = filters[field] || [];
    setFilter(
      field,
      current.filter((v) => v !== value)
    );
  };

  return (
    <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-section-label">Interactive Filter Controls</span>
            {totalActiveCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                {totalActiveCount} active
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Test real-time aggregation reactivity by toggling benchmark dimensions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-toggle-energy"
            type="button"
            onClick={() => handleToggle('sector', 'Energy')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
              isEnergySelected
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {isEnergySelected ? '✓ Sector: Energy' : '+ Sector: Energy'}
          </button>

          <button
            id="btn-toggle-na"
            type="button"
            onClick={() => handleToggle('region', 'Northern America')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
              isNaSelected
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {isNaSelected ? '✓ Region: N. America' : '+ Region: N. America'}
          </button>

          <button
            id="btn-toggle-usa"
            type="button"
            onClick={() => handleToggle('country', 'United States of America')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 cursor-pointer ${
              isUsaSelected
                ? 'bg-[var(--color-accent)] text-white shadow-xs'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {isUsaSelected ? '✓ Country: USA' : '+ Country: USA'}
          </button>

          {totalActiveCount > 0 && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowOptionsInspector(!showOptionsInspector)}
            className="px-2.5 py-1.5 rounded-md text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-muted)] transition-colors cursor-pointer"
          >
            {showOptionsInspector ? 'Hide Schema Options' : 'Inspect Filter Schema'}
          </button>
        </div>
      </div>

      {/* Active filters chips component */}
      <ActiveFilterChips chips={chips} onRemove={handleRemoveChip} onClearAll={resetFilters} />

      {/* Collapsible raw options inspector */}
      {showOptionsInspector && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Raw Available Filter Options per Schema Field:
            </span>
            <span className="text-metadata">
              {loading ? 'Querying...' : `${Object.keys(options || {}).length} fields available`}
            </span>
          </div>
          <pre
            id="raw-filter-options"
            className="p-3 bg-[var(--color-bg-canvas)] border border-[var(--color-border)] rounded-md text-xs overflow-x-auto max-h-[220px] text-[var(--color-text-secondary)]"
          >
            {options ? JSON.stringify(options, null, 2) : 'Loading schema options...'}
          </pre>
        </div>
      )}
    </section>
  );
}
