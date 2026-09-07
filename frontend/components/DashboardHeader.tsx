import React from 'react';

/**
 * @file DashboardHeader.tsx
 * Presentational header component for the analytics dashboard.
 */

export interface DashboardHeaderProps {
  matchedCount?: number;
  loading?: boolean;
}

export default function DashboardHeader({ matchedCount = 0, loading = false }: DashboardHeaderProps): React.JSX.Element {
  return (
    <header className="pb-6 border-b border-[var(--color-border)] mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-page-title">Global Insights & Risk Intelligence</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
            Phase 5: Full Suite Active
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Interactive intelligence telemetry across sectors, regions, and strategic pestle metrics.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto">
        <div className="px-3.5 py-1.5 rounded-md bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xs flex items-center gap-2 text-xs font-medium">
          <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-[var(--color-text-secondary)]">Database Telemetry:</span>
          <span className="font-semibold text-[var(--color-text-primary)]">
            {loading ? 'Querying...' : `${matchedCount.toLocaleString()} records`}
          </span>
        </div>
      </div>
    </header>
  );
}
