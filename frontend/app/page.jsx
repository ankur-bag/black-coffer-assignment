'use client';

import { useState, useEffect } from 'react';
import { getFilters, getStats } from '../lib/api';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import DashboardHeader from '../components/DashboardHeader';
import FiltersPreview from '../components/FiltersPreview';
import KpiCards from '../components/KpiCards';
import SectorBarChart from '../components/SectorBarChart';
import RegionDonutChart from '../components/RegionDonutChart';
import YearLineChart from '../components/YearLineChart';
import TopTopicsChart from '../components/TopTopicsChart';
import BubbleChart from '../components/BubbleChart';
import ChartSkeleton from '../components/ChartSkeleton';

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

  // TODO [Phase 5 / Cleanup]: Strip window debug hooks before final production submission
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
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

  const isEmpty = stats && stats.matchedCount === 0;

  return (
    <main className="w-full max-w-[var(--max-width-container)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Page Header */}
      <DashboardHeader
        matchedCount={stats?.matchedCount ?? 0}
        loading={loadingStats}
      />

      {/* 2. Interactive Filter Bar */}
      <FiltersPreview
        options={filterOptions}
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        loading={loadingFilters}
      />

      {/* Error alert if API fails */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <strong>Pipeline Error:</strong> {error}
        </div>
      )}

      {/* 3. Executive KPI Indicators */}
      <KpiCards
        matchedCount={stats?.matchedCount ?? 0}
        avgIntensity={stats?.avgIntensity ?? 0}
        avgLikelihood={stats?.avgLikelihood ?? 0}
        avgRelevance={stats?.avgRelevance ?? 0}
        loading={loadingStats}
      />

      {/* 4. Visualizations Grid or Empty State */}
      {isEmpty ? (
        <section className="p-12 text-center bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg shadow-xs my-8">
          <div className="w-12 h-12 rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] mx-auto flex items-center justify-center mb-3 text-lg">
            🔍
          </div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            No records match these filters
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm mx-auto">
            No telemetry records satisfied the active combination of dimensions. Try resetting or loosening your selection.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] cursor-pointer transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </section>
      ) : (
        <section aria-label="Visualizations" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {loadingStats && !stats ? (
            <>
              <ChartSkeleton title="Sector Intensity" />
              <ChartSkeleton title="Geographic Distribution" />
              <ChartSkeleton title="Temporal Trends" />
              <ChartSkeleton title="Top Topics" />
              <div className="lg:col-span-2">
                <ChartSkeleton title="Strategic Multi-Metric Landscape (D3.js)" />
              </div>
            </>
          ) : (
            <>
              <SectorBarChart data={stats?.intensityBySector || []} />
              <RegionDonutChart data={stats?.countByRegion || []} />
              <YearLineChart data={stats?.metricsByYear || []} />
              <TopTopicsChart data={stats?.topTopics || []} />
              <div className="lg:col-span-2">
                <BubbleChart data={stats?.bubblePoints || []} />
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
}
