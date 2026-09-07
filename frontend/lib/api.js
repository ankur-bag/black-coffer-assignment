/**
 * API client library for Blackcoffer Insights dashboard
 */

/**
 * Fetches available filter distinct values.
 * @returns {Promise<Record<string, string[]>>}
 */
export async function getFilters() {
  const url = '/api/insights/filters';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API Error] Failed to fetch filters from ${url}. Status: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch filters from ${url} (status: ${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[API Error] Network or parse failure for ${url}:`, error);
    throw error;
  }
}

/**
 * Fetches aggregated metrics and statistics based on selected filters.
 * Serializes array values into repeated query params (e.g. sector=Energy&sector=Government).
 * @param {Record<string, string[]>} filters
 * @returns {Promise<any>}
 */
export async function getStats(filters = {}) {
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
  const url = queryString ? `/api/insights/stats?${queryString}` : '/api/insights/stats';

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[API Error] Failed to fetch stats from ${url}. Status: ${res.status} ${res.statusText}`);
      throw new Error(`Failed to fetch stats from ${url} (status: ${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error(`[API Error] Network or parse failure for ${url}:`, error);
    throw error;
  }
}
