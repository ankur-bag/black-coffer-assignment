import React from 'react';

/**
 * @file ChartSkeleton.tsx
 * Accessible loading placeholder for dashboard chart cards.
 */

export interface ChartSkeletonProps {
  title: string;
}

export default function ChartSkeleton({ title }: ChartSkeletonProps): React.JSX.Element {
  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs h-[400px] flex flex-col justify-between animate-pulse">
      <div className="border-b border-[var(--color-border)] pb-3 mb-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-1.5" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
      </div>
      <div className="flex-1 bg-slate-50/70 dark:bg-slate-900/30 rounded-md flex items-center justify-center">
        <span className="text-xs text-[var(--color-text-secondary)] font-medium">
          Loading {title}...
        </span>
      </div>
    </div>
  );
}
