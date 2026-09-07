'use client';

/**
 * @file SectorBarChart.jsx
 * Horizontal bar chart displaying Top 15 Sectors by Average Intensity.
 * Renders the "Unspecified" bucket with an explicit muted neutral styling and descriptive tooltip.
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getSectorBarColor } from '../lib/chartColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

/**
 * @param {Object} props
 * @param {Array<{sector: string, avgIntensity: number, count: number}>} [props.data=[]]
 */
export default function SectorBarChart({ data = [] }) {
  const topSectors = data.slice(0, 15);

  const labels = topSectors.map((d) => d.sector);
  const values = topSectors.map((d) => d.avgIntensity);
  const backgroundColors = topSectors.map((d) => getSectorBarColor(d.sector).background);
  const borderColors = topSectors.map((d) => getSectorBarColor(d.sector).border);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg Intensity',
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          label: (context) => `Avg Intensity: ${context.parsed.x}`,
          afterLabel: (context) => {
            const item = topSectors[context.dataIndex];
            if (!item) return '';
            if (item.sector === 'Unspecified') {
              return [
                `Records: ${item.count}`,
                'Note: Unclassified records in source dataset',
              ];
            }
            return `Records: ${item.count}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Average Intensity Score',
          color: '#64748b',
          font: { size: 11, weight: '500' },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#334155',
          font: { size: 11, weight: '500' },
        },
      },
    },
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-section-label">Intensity by Sector</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Top 15 sectors sorted by average impact severity
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-metadata">
            <span className="w-2.5 h-2.5 rounded-xs bg-[var(--color-accent)]" /> Sector
          </span>
          <span className="inline-flex items-center gap-1.5 text-metadata">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" /> Unspecified
          </span>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
