export const ACCENT_PRIMARY = '#2563eb';
export const ACCENT_PRIMARY_HOVER = '#1d4ed8';
export const ACCENT_SECONDARY = '#0284c7';
export const ACCENT_TERTIARY = '#0d9488';

export const COLOR_UNSPECIFIED = '#94a3b8';
export const COLOR_UNSPECIFIED_BORDER = '#64748b';
export const COLOR_OTHER = '#cbd5e1';

export const CATEGORICAL_PALETTE: readonly string[] = [
  '#2563eb',
  '#0284c7',
  '#0d9488',
  '#10b981',
  '#6366f1',
  '#8b5cf6',
  '#f59e0b',
  '#ea580c',
  '#06b6d4',
  '#64748b',
];

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

export function getSectorColor(sectorName: string): string {
  if (sectorName === 'Unspecified' || !sectorName) {
    return COLOR_UNSPECIFIED;
  }
  return SECTOR_COLOR_MAP[sectorName] || CATEGORICAL_PALETTE[0];
}

export function getSectorBarColor(sectorName: string): { background: string; border: string } {
  if (sectorName === 'Unspecified' || !sectorName) {
    return {
      background: 'rgba(148, 163, 184, 0.45)',
      border: '#94a3b8',
    };
  }
  const color = getSectorColor(sectorName);
  return {
    background: color,
    border: color,
  };
}

export function getRegionColors(labels: string[]): { backgrounds: string[]; borders: string[] } {
  let paletteIndex = 0;
  const backgrounds: string[] = [];
  const borders: string[] = [];

  for (const label of labels) {
    if (label === 'Unspecified') {
      backgrounds.push('#94a3b8');
      borders.push('#64748b');
    } else if (label === 'Other') {
      backgrounds.push('#cbd5e1');
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
