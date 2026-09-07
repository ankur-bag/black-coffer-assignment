'use client';

import { useState, useEffect } from 'react';
import { getFilters, getStats } from '../lib/api';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import DashboardHeader from '../components/DashboardHeader';
import FiltersPreview from '../components/FiltersPreview';
import StatsPreview from '../components/StatsPreview';

/**
 * Main dashboard container component (Data & Orchestration Layer).
 * Coordinates filter state, initial filter options, and debounced stats querying.
 */
export default function DashboardPage() {
  const { filters, setFilter, resetFilters, setAllFilters } = useDashboardFilters();

  const [filterOptions, setFilterOptions] = useState(null);
  const [stats, setStats] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Expose filter setters to window for rapid browser console testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setFilter = setFilter;
      window.setFilters = setAllFilters;
      window.resetFilters = resetFilters;
      window.getFiltersState = () => filters;
    }
  }, [filters, setFilter, setAllFilters, resetFilters]);

  // 1. Fetch available filter options on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingFilters(true);

    getFilters()
      .then((data) => {
        if (isMounted) {
          setFilterOptions(data);
          setLoadingFilters(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('[DashboardPage] Failed to fetch filter options:', err);
          setError(err.message);
          setLoadingFilters(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Debounced stats fetch (200ms) whenever filters change
  useEffect(() => {
    setLoadingStats(true);
    const debounceTimer = setTimeout(() => {
      getStats(filters)
        .then((data) => {
          setStats(data);
          setLoadingStats(false);
        })
        .catch((err) => {
          console.error('[DashboardPage] Failed to fetch stats payload:', err);
          setError(err.message);
          setLoadingStats(false);
        });
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [filters]);

  return (
    <main className="w-full max-w-[var(--max-width-container)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        matchedCount={stats?.matchedCount ?? 0}
        loading={loadingStats}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <FiltersPreview
          options={filterOptions}
          filters={filters}
          setFilter={setFilter}
          resetFilters={resetFilters}
          loading={loadingFilters}
        />

        <StatsPreview
          stats={stats}
          loading={loadingStats}
          error={error}
        />
      </div>
    </main>
  );
}
