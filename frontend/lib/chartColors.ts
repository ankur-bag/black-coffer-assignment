/**
 * @file chartColors.ts
 * Centralized design-token color palettes and styling helpers for chart components.
 * Adheres strictly to the Sapphire Blue (#2563eb) and Slate canvas design system.
 */

// Brand & Series Accents
export const ACCENT_PRIMARY = '#2563eb';      // Sapphire Blue
export const ACCENT_PRIMARY_HOVER = '#1d4ed8';
export const ACCENT_SECONDARY = '#0284c7';    // Cerulean (Avg Likelihood)
export const ACCENT_TERTIARY = '#0d9488';     // Emerald/Teal (Avg Relevance)

// Muted neutral tokens for unclassified/unspecified categories
export const COLOR_UNSPECIFIED = '#94a3b8';   // Slate-400
export const COLOR_UNSPECIFIED_BORDER = '#64748b';
export const COLOR_OTHER = '#cbd5e1';         // Slate-300

// Harmonious categorical palette for multi-slice charts (e.g. Region Donut)
export const CATEGORICAL_PALETTE: readonly string[] = [
  '#2563eb', // Sapphire Blue
  '#0284c7', // Cerulean
  '#0d9488', // Deep Teal
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f59e0b', // Warm Amber
  '#ea580c', // Tangerine
  '#06b6d4', // Cyan
  '#475569', // Slate-600
];

// Deterministic color mapping per sector shared across SectorBarChart & D3 BubbleChart
export const SECTOR_COLOR_MAP: Record<string, string> = {
  Energy: '#2563eb',
  Manufacturing: '#10b981',
  'Financial services': '#8b5cf6',
  Retail: '#f59e0b',
  'Aerospace & defence': '#0284c7',
  Government: '#6366f1',
  'Support services': '#06b6d4',
  'Information Technology': '#3b82f6',
  Environment: '#0d9488',
  Construction: '#d97706',
  'Food & agriculture': '#84cc16',
  Transport: '#4f46e5',
  Automotive: '#f97316',
  Water: '#0ea5e9',
  Healthcare: '#ec4899',
  Security: '#e11d48',
  'Tourism & hospitality': '#14b8a6',
  'Media & entertainment': '#a855f7',
  Unspecified: '#94a3b8',
};

/**
 * Returns color hex for a sector.
 */
export function getSectorColor(sectorName: string): string {
  if (sectorName === 'Unspecified' || !sectorName) {
    return COLOR_UNSPECIFIED;
  }
  return SECTOR_COLOR_MAP[sectorName] || CATEGORICAL_PALETTE[0];
}

/**
 * Returns color for sector bar chart. 'Unspecified' is visually muted.
 */
export function getSectorBarColor(sectorName: string): { background: string; border: string } {
  if (sectorName === 'Unspecified' || !sectorName) {
    return {
      background: 'rgba(148, 163, 184, 0.45)', // Muted Slate
      border: '#94a3b8',
    };
  }
  const color = getSectorColor(sectorName);
  return {
    background: color,
    border: color,
  };
}

/**
 * Maps region labels to coordinated colors, ensuring 'Unspecified' and 'Other'
 * receive distinct neutral treatments.
 */
export function getRegionColors(labels: string[]): { backgrounds: string[]; borders: string[] } {
  let paletteIndex = 0;
  const backgrounds: string[] = [];
  const borders: string[] = [];

  for (const label of labels) {
    if (label === 'Unspecified') {
      backgrounds.push('#94a3b8'); // Muted neutral for unclassified records
      borders.push('#64748b');
    } else if (label === 'Other') {
      backgrounds.push('#cbd5e1'); // Neutral soft for aggregated tail
      borders.push('#94a3b8');
    } else {
      const color = CATEGORICAL_PALETTE[paletteIndex % CATEGORICAL_PALETTE.length];
      backgrounds.push(color);
      borders.push(color);
      paletteIndex++;
    }
  }

  return { backgrounds, borders };
}

/**
 * Common chart options for typography, tooltips, and gridlines
 */
export const commonChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        font: {
          family: 'inherit',
          size: 12,
        },
        color: '#475569',
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: '#334155',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
      titleFont: {
        size: 12,
        weight: '600' as const,
      },
      bodyFont: {
        size: 11,
      },
    },
  },
};
