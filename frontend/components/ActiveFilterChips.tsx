'use client';

import React from 'react';
import { FilterState } from '../lib/types';

/**
 * @file ActiveFilterChips.tsx
 * Modular presentation component displaying active filter chips with individual remove buttons.
 */

export interface ActiveFilterChip {
  field: keyof FilterState;
  value: string;
}

export interface ActiveFilterChipsProps {
  chips: ActiveFilterChip[];
  onRemove: (field: keyof FilterState, value: string) => void;
  onClearAll?: () => void;
}

export default function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps): React.JSX.Element | null {
  if (!chips || chips.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-[var(--color-border)] mt-3">
      <span className="text-metadata font-medium text-[var(--color-text-secondary)] mr-1">
        Active Filters ({chips.length}):
      </span>

      {chips.map((chip) => (
        <span
          key={`${String(chip.field)}-${chip.value}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/30 text-[var(--color-accent)] transition-all shadow-2xs"
        >
          <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] opacity-80">
            {chip.field}:
          </span>
          <span>{chip.value}</span>
          <button
            type="button"
            onClick={() => onRemove(chip.field, chip.value)}
            className="hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-600 rounded-full w-4 h-4 inline-flex items-center justify-center cursor-pointer transition-colors ml-0.5"
            aria-label={`Remove filter ${chip.value}`}
          >
            ×
          </button>
        </span>
      ))}

      {onClearAll && chips.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[var(--color-text-secondary)] hover:text-rose-600 underline underline-offset-2 ml-2 cursor-pointer transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
