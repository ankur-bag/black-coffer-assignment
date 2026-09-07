/**
 * @file StatsPreview.jsx
 * Presentational component displaying aggregated metrics and raw JSON verification for Phase 3.
 */

/**
 * @typedef {Object} StatsData
 * @property {number} matchedCount
 * @property {number} avgIntensity
 * @property {number} avgLikelihood
 * @property {number} avgRelevance
 * @property {Array<{sector: string, avgIntensity: number, count: number}>} intensityBySector
 * @property {Array<{region: string, count: number}>} countByRegion
 * @property {Array<{year: string, avgLikelihood: number, avgRelevance: number, count: number}>} metricsByYear
 * @property {Array<{topic: string, count: number}>} topTopics
 * @property {Array<{intensity: number, likelihood: number, relevance: number, sector: string}>} bubblePoints
 */

/**
 * @param {Object} props
 * @param {StatsData | null} props.stats
 * @param {boolean} props.loading
 * @param {string | null} [props.error]
 */
export default function StatsPreview({ stats, loading = false, error = null }) {
  const kpis = [
    { label: 'Matched Records', value: stats?.matchedCount ?? 0 },
    { label: 'Avg Intensity', value: stats?.avgIntensity ?? 0 },
    { label: 'Avg Likelihood', value: stats?.avgLikelihood ?? 0 },
    { label: 'Avg Relevance', value: stats?.avgRelevance ?? 0 },
  ];

  return (
    <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
          <div>
            <span className="text-section-label">Aggregated Stats Pipeline</span>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Live response from GET /api/insights/stats
            </p>
          </div>
          <div className="text-metadata">
            {loading ? (
              <span className="text-[var(--color-accent)] font-medium animate-pulse">Computing aggregations...</span>
            ) : (
              <span>Synced</span>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Quick KPI summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="p-3 bg-[var(--color-bg-canvas)] border border-[var(--color-border)] rounded-md"
            >
              <div className="text-metadata font-medium">{kpi.label}</div>
              <div className="text-data-kpi mt-1 text-[var(--color-accent)]">
                {loading ? '—' : kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            Raw Aggregation Output:
          </span>
          <span className="text-metadata">
            {stats ? `${stats.intensityBySector?.length || 0} sectors, ${stats.countByRegion?.length || 0} regions` : 'No data'}
          </span>
        </div>
        <pre
          id="raw-stats"
          className="p-3 bg-[var(--color-bg-canvas)] border border-[var(--color-border)] rounded-md text-xs overflow-x-auto max-h-[500px] text-[var(--color-text-secondary)] font-mono"
        >
          {stats ? JSON.stringify(stats, null, 2) : 'Awaiting aggregation payload...'}
        </pre>
      </div>
    </section>
  );
}
