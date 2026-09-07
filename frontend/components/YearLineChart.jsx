'use client';

/**
 * @file YearLineChart.jsx
 * Dual-series line chart tracking Avg Likelihood and Avg Relevance across chronological years.
 * Preserves backend order (ascending years with 'Unspecified' positioned last).
 */

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ACCENT_SECONDARY, ACCENT_TERTIARY } from '../lib/chartColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

/**
 * @param {Object} props
 * @param {Array<{year: string, avgLikelihood: number, avgRelevance: number, count: number}>} [props.data=[]]
 */
export default function YearLineChart({ data = [] }) {
  const labels = data.map((d) => d.year);
  const likelihoodValues = data.map((d) => d.avgLikelihood);
  const relevanceValues = data.map((d) => d.avgRelevance);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Avg Relevance',
        data: relevanceValues,
        borderColor: ACCENT_TERTIARY,
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        label: 'Avg Likelihood',
        data: likelihoodValues,
        borderColor: ACCENT_SECONDARY,
        backgroundColor: 'rgba(2, 132, 199, 0.1)',
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 11 },
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
          afterTitle: (items) => {
            const index = items[0]?.dataIndex;
            const item = data[index];
            return item ? `Sample Size: ${item.count} record(s)` : '';
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
        },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Scale (0 - 5)',
          color: '#64748b',
          font: { size: 11, weight: '500' },
        },
      },
    },
  };

  return (
    <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-section-label">Temporal Trends: Likelihood & Relevance</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Annual trajectory with unanchored timeline under 'Unspecified'
          </p>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
