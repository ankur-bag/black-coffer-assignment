import { FilterOptions, FilterState, StatsResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getFilters(): Promise<FilterOptions> {
  const url = `${API_URL}/api/insights/filters`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API Error] Failed to fetch filters from ${url}. Status: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch filters from ${url} (status: ${res.status})`);
    }
    const data: FilterOptions = await res.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown network failure';
    console.error(`[API Error] Network or parse failure for ${url}:`, message);
    throw error;
  }
}

/**
 * Fetches aggregated metrics and statistics based on selected filters.
 * Serializes array values into repeated query params (e.g. sector=Energy&sector=Government).
 */
export async function getStats(filters: Partial<FilterState> = {}): Promise<StatsResponse> {
  const params = new URLSearchParams();

  for (const [key, values] of Object.entries(filters)) {
    if (Array.isArray(values)) {
      for (const val of values) {
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          params.append(key, String(val).trim());
        }
      }
    } else if (values !== undefined && values !== null && String(values).trim() !== '') {
      params.append(key, String(values).trim());
    }
  }

  const queryString = params.toString();
  const url = queryString ? `${API_URL}/api/insights/stats?${queryString}` : `${API_URL}/api/insights/stats`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API Error] Failed to fetch stats from ${url}. Status: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch stats from ${url} (status: ${res.status})`);
    }
    const data: StatsResponse = await res.json();
    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown network failure';
    console.error(`[API Error] Network or parse failure for ${url}:`, message);
    throw error;
  }
}
