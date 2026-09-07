/**
 * @file chartColors.js
 * Centralized design-token color palettes and styling helpers for Chart.js components.
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
export const CATEGORICAL_PALETTE = [
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

/**
 * Returns color for sector bar chart. 'Unspecified' is visually muted.
 * @param {string} sectorName
 * @returns {{ background: string, border: string }}
 */
export function getSectorBarColor(sectorName) {
  if (sectorName === 'Unspecified') {
    return {
      background: 'rgba(148, 163, 184, 0.45)', // Muted Slate
      border: '#94a3b8',
    };
  }
  return {
    background: 'rgba(37, 99, 235, 0.85)',   // Sapphire Blue
    border: '#1d4ed8',
  };
}

/**
 * Maps region labels to coordinated colors, ensuring 'Unspecified' and 'Other'
 * receive distinct neutral treatments.
 * @param {string[]} labels
 * @returns {{ backgrounds: string[], borders: string[] }}
 */
export function getRegionColors(labels) {
  let paletteIndex = 0;
  const backgrounds = [];
  const borders = [];

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
        weight: '600',
      },
      bodyFont: {
        size: 11,
      },
    },
  },
};
