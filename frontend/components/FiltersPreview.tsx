'use client';

/**
 * @file FiltersPreview.tsx
 * Interactive filter toolbar providing quick dimension toggles and filter state management.
 */

import React, { useMemo } from 'react';
import { FilterOptions, FilterState } from '../lib/types';
import ActiveFilterChips, { ActiveFilterChip } from './ActiveFilterChips';

export interface FiltersPreviewProps {
  options: FilterOptions | null;
  filters: FilterState;
  setFilter: (field: keyof FilterState, values: string[] | string) => void;
  resetFilters: () => void;
  loading?: boolean;
}

interface FilterFieldDef {
  key: keyof FilterState;
  label: string;
}

const FILTER_FIELDS: FilterFieldDef[] = [
  { key: 'end_year', label: 'End Year' },
  { key: 'topic', label: 'Topic' },
  { key: 'sector', label: 'Sector' },
  { key: 'region', label: 'Region' },
  { key: 'pestle', label: 'PESTLE' },
  { key: 'source', label: 'Source' },
  { key: 'country', label: 'Country' },
  { key: 'city', label: 'City' },
  { key: 'swot', label: 'SWOT' },
];

export default function FiltersPreview({
  options,
  filters,
  setFilter,
  resetFilters,
  loading = false,
}: FiltersPreviewProps): React.JSX.Element {
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

  const handleSelect = (field: keyof FilterState, value: string) => {
    if (!value) return;
    const current = filters[field] || [];
    if (!current.includes(value)) {
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
            <span className="text-section-label">Interactive Dimension Filters</span>
            {totalActiveCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                {totalActiveCount} active
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Filter telemetry across nine dimensions or click chart segments to drill down
          </p>
        </div>

        {totalActiveCount > 0 && (
          <button
            id="btn-reset-filters"
            type="button"
            onClick={resetFilters}
            className="self-start sm:self-auto px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 9-dimension filter dropdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4">
        {FILTER_FIELDS.map(({ key, label }) => {
          const fieldOptions = options?.[key] || [];
          const hasOptions = fieldOptions.length > 0;
          const activeCount = filters[key]?.length || 0;

          return (
            <div key={key} className="flex flex-col gap-1">
              <label
                htmlFor={`filter-select-${key}`}
                className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider truncate"
              >
                {label}
                {activeCount > 0 && (
                  <span className="ml-1 text-[var(--color-accent)] font-bold">({activeCount})</span>
                )}
              </label>
              <select
                id={`filter-select-${key}`}
                value=""
                disabled={loading || !hasOptions}
                onChange={(e) => {
                  handleSelect(key, e.target.value);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-md border bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer truncate ${
                  hasOptions
                    ? 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                    : 'border-[var(--color-border)] opacity-60 cursor-not-allowed bg-[var(--color-bg-muted)]'
                }`}
              >
                <option value="">
                  {loading
                    ? 'Loading...'
                    : hasOptions
                    ? `All ${label}s`
                    : `No ${label} data`}
                </option>
                {fieldOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      {/* Active filter chips */}
      <ActiveFilterChips chips={chips} onRemove={handleRemoveChip} onClearAll={resetFilters} />
    </section>
  );
}
