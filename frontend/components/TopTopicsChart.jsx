'use client';

/**
 * @file TopTopicsChart.jsx
 * Horizontal bar chart displaying Top 10 Topics by insight frequency.
 * Renders 'Unspecified' with muted neutral styling for consistent data honesty.
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
 * @param {Array<{topic: string, count: number}>} [props.data=[]]
 */
export default function TopTopicsChart({ data = [] }) {
  const labels = data.map((d) => d.topic);
  const values = data.map((d) => d.count);
  const backgroundColors = data.map((d) => getSectorBarColor(d.topic).background);
  const borderColors = data.map((d) => getSectorBarColor(d.topic).border);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Insight Count',
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
          label: (context) => `Frequency: ${context.parsed.x} insights`,
          afterLabel: (context) => {
            if (context.label === 'Unspecified') {
              return 'Unclassified topic in source dataset';
            }
            return '';
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
          text: 'Frequency Count',
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
          <h2 className="text-section-label">High-Frequency Strategic Topics</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Top 10 themes shaping global market intelligence
          </p>
        </div>
        <div className="text-metadata text-[var(--color-text-secondary)]">
          Ranked by occurrence
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
