'use client';

import { useState, useCallback } from 'react';
import { FilterState } from '../lib/types';

/**
 * Initial empty filter state matching the backend filterable fields.
 */
export const INITIAL_FILTERS: FilterState = {
  end_year: [],
  topic: [],
  sector: [],
  region: [],
  pestle: [],
  source: [],
  country: [],
  city: [],
  swot: [],
};

export interface UseDashboardFiltersReturn {
  filters: FilterState;
  setFilter: (field: keyof FilterState, values: string[] | string) => void;
  resetFilters: () => void;
  setAllFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

/**
 * Custom hook for managing pure dashboard filter state.
 * Contains zero network/fetching logic, making it independently testable and reusable.
 */
export function useDashboardFilters(initialState: Partial<FilterState> = {}): UseDashboardFiltersReturn {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...INITIAL_FILTERS,
    ...initialState,
  }));

  /**
   * Updates a single filter field. Normalizes values to an array of strings.
   */
  const setFilter = useCallback((field: keyof FilterState, values: string[] | string) => {
    setFilters((prev) => {
      let normalizedValues: string[] = [];
      if (Array.isArray(values)) {
        normalizedValues = values.filter((v) => v !== undefined && v !== null && String(v).trim() !== '');
      } else if (values !== undefined && values !== null && String(values).trim() !== '') {
        normalizedValues = [String(values).trim()];
      }

      return {
        ...prev,
        [field]: normalizedValues,
      };
    });
  }, []);

  /**
   * Resets all filter fields back to initial empty arrays.
   */
  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    filters,
    setFilter,
    resetFilters,
    setAllFilters: setFilters,
  };
}
