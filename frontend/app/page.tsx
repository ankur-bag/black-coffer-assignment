'use client';

import React, { useState, useEffect } from 'react';
import { getFilters, getStats } from '../lib/api';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import { FilterOptions, FilterState, StatsResponse } from '../lib/types';
import DashboardHeader from '../components/DashboardHeader';
import FiltersPreview from '../components/FiltersPreview';
import KpiCards from '../components/KpiCards';
import SectorBarChart from '../components/SectorBarChart';
import RegionDonutChart from '../components/RegionDonutChart';
import YearLineChart from '../components/YearLineChart';
import TopTopicsChart from '../components/TopTopicsChart';
import BubbleChart from '../components/BubbleChart';
import ChartSkeleton from '../components/ChartSkeleton';

export default function DashboardPage(): React.JSX.Element {
  const { filters, setFilter, resetFilters } = useDashboardFilters();

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const handleRetry = () => {
    setError(null);
    setRetryTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;
    setLoadingFilters(true);

    getFilters()
      .then((data: FilterOptions) => {
        if (isMounted) {
          setFilterOptions(data);
          setLoadingFilters(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Failed to fetch options';
          console.error('[DashboardPage] Failed to fetch filter options:', err);
          setError(message);
          setLoadingFilters(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  useEffect(() => {
    setLoadingStats(true);
    const debounceTimer = setTimeout(() => {
      getStats(filters)
        .then((data: StatsResponse) => {
          setStats(data);
          setLoadingStats(false);
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
          console.error('[DashboardPage] Failed to fetch stats payload:', err);
          setError(message);
          setLoadingStats(false);
        });
    }, 200);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [filters, retryTrigger]);

  const isEmpty = stats !== null && stats.matchedCount === 0;

  return (
    <main className="w-full max-w-[var(--max-width-container)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardHeader
        matchedCount={stats?.matchedCount ?? 0}
        loading={loadingStats}
      />

      <FiltersPreview
        options={filterOptions}
        filters={filters}
        setFilter={setFilter}
        resetFilters={resetFilters}
        loading={loadingFilters}
      />

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/70 text-red-900 dark:text-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-xs font-bold text-red-950 dark:text-red-100 uppercase tracking-wide">
                API Pipeline Error
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 mt-0.5 leading-relaxed font-normal">
                {error}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-md text-xs font-semibold bg-red-600 hover:bg-red-700 text-white dark:bg-red-800 dark:hover:bg-red-700 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            Retry Connection
          </button>
        </div>
      )}

      <KpiCards
        matchedCount={stats?.matchedCount ?? 0}
        avgIntensity={stats?.avgIntensity ?? 0}
        avgLikelihood={stats?.avgLikelihood ?? 0}
        avgRelevance={stats?.avgRelevance ?? 0}
        loading={loadingStats}
      />

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
              <SectorBarChart
                data={stats?.intensityBySector || []}
                onSegmentClick={(sector: string) => setFilter('sector', [sector])}
              />
              <RegionDonutChart
                data={stats?.countByRegion || []}
                onSegmentClick={(region: string) => setFilter('region', [region])}
              />
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
