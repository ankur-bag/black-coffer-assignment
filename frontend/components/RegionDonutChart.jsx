'use client';

/**
 * @file RegionDonutChart.jsx
 * Doughnut chart displaying Top 10 Regions by record count with an aggregated "Other" slice.
 * Unspecified region (453 records) is naturally ranked in top 10 with muted neutral styling.
 */

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getRegionColors } from '../lib/chartColors';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * @param {Object} props
 * @param {Array<{region: string, count: number}>} [props.data=[]]
 */
export default function RegionDonutChart({ data = [] }) {
  const top10 = data.slice(0, 10);
  const remainder = data.slice(10);
  const otherCount = remainder.reduce((acc, curr) => acc + curr.count, 0);

  const slices = [...top10];
  if (otherCount > 0) {
    slices.push({ region: 'Other', count: otherCount });
  }

  const totalCount = slices.reduce((acc, curr) => acc + curr.count, 0);
  const labels = slices.map((s) => s.region);
  const values = slices.map((s) => s.count);

  const { backgrounds, borders } = getRegionColors(labels);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgrounds,
        borderColor: borders,
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
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
        callbacks: {
          label: (context) => {
            const count = context.parsed;
            const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : 0;
            return ` ${context.label}: ${count} (${pct}%)`;
          },
          afterLabel: (context) => {
            if (context.label === 'Unspecified') {
              return 'Unclassified region in source data';
            }
            return '';
          },
        },
      },
    },
    cutout: '68%',
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-section-label">Geographic Distribution</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Top regions by record share (plus consolidated tail)
          </p>
        </div>
        <div className="text-metadata text-[var(--color-text-secondary)]">
          {totalCount} total records
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
