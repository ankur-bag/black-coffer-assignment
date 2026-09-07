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
  }, []);

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
  }, [filters]);

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
        <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs">
          <strong>Pipeline Error:</strong> {error}
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
