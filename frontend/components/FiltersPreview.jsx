/**
 * @file FiltersPreview.jsx
 * Presentational and interactive component for filter controls and pipeline validation.
 */

/**
 * @param {Object} props
 * @param {Record<string, string[]> | null} props.options - Available filter options per field
 * @param {Record<string, string[]>} props.filters - Current selected filter state
 * @param {(field: string, values: string[] | string) => void} props.setFilter - Updater for single field
 * @param {() => void} props.resetFilters - Function to reset all filters
 * @param {boolean} props.loading - Indicates options fetching state
 */
export default function FiltersPreview({
  options,
  filters,
  setFilter,
  resetFilters,
  loading = false,
}) {
  const isEnergySelected = filters.sector?.includes('Energy');
  const activeFilterCount = Object.values(filters).reduce((acc, curr) => acc + (curr?.length || 0), 0);

  const handleToggleEnergy = () => {
    if (isEnergySelected) {
      setFilter('sector', []);
    } else {
      setFilter('sector', ['Energy']);
    }
  };

  return (
    <section className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
        <div>
          <span className="text-section-label">Filter Pipeline & Controls</span>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {activeFilterCount > 0 ? `${activeFilterCount} filter condition(s) active` : 'No active filters (showing full dataset)'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-toggle-energy"
            type="button"
            onClick={handleToggleEnergy}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-colors duration-150 cursor-pointer ${
              isEnergySelected
                ? 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
            }`}
          >
            {isEnergySelected ? '✓ Sector: Energy Active' : '+ Test Filter: Sector = Energy'}
          </button>

          {activeFilterCount > 0 && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block">
            Current Filter State (Uniform Array Structure):
          </span>
          <pre
            id="raw-filters"
            className="p-3 bg-[var(--color-bg-canvas)] border border-[var(--color-border)] rounded-md text-xs overflow-x-auto text-[var(--color-text-secondary)]"
          >
            {JSON.stringify(filters, null, 2)}
          </pre>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Available Options per Field:
            </span>
            <span className="text-metadata">
              {loading ? 'Fetching...' : `${Object.keys(options || {}).length} fields loaded`}
            </span>
          </div>
          <pre
            id="raw-filter-options"
            className="p-3 bg-[var(--color-bg-canvas)] border border-[var(--color-border)] rounded-md text-xs overflow-x-auto max-h-[380px] text-[var(--color-text-secondary)]"
          >
            {options ? JSON.stringify(options, null, 2) : 'Loading available filter options...'}
          </pre>
        </div>
      </div>
    </section>
  );
}
