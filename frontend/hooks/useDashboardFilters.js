'use client';

import { useState, useCallback } from 'react';

/**
 * @typedef {Object} DashboardFilters
 * @property {string[]} end_year
 * @property {string[]} topic
 * @property {string[]} sector
 * @property {string[]} region
 * @property {string[]} pestle
 * @property {string[]} source
 * @property {string[]} country
 * @property {string[]} city
 * @property {string[]} swot
 */

/**
 * Initial empty filter state matching the backend filterable fields.
 * @type {DashboardFilters}
 */
export const INITIAL_FILTERS = {
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

/**
 * Custom hook for managing pure dashboard filter state.
 * Contains zero network/fetching logic, making it independently testable and reusable.
 *
 * @param {Partial<DashboardFilters>} [initialState]
 * @returns {{
 *   filters: DashboardFilters,
 *   setFilter: (field: keyof DashboardFilters, values: string[] | string) => void,
 *   resetFilters: () => void,
 *   setAllFilters: (newFilters: DashboardFilters | ((prev: DashboardFilters) => DashboardFilters)) => void
 * }}
 */
export function useDashboardFilters(initialState = {}) {
  const [filters, setFilters] = useState(() => ({
    ...INITIAL_FILTERS,
    ...initialState,
  }));

  /**
   * Updates a single filter field. Normalizes values to an array of strings.
   */
  const setFilter = useCallback((field, values) => {
    setFilters((prev) => {
      let normalizedValues = [];
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
