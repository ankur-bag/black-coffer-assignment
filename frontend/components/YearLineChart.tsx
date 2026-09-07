'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { YearStat } from '../lib/types';
import { ACCENT_SECONDARY, ACCENT_TERTIARY } from '../lib/chartColors';
import { useTheme } from '../hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export interface YearLineChartProps {
  data?: YearStat[];
}

export default function YearLineChart({ data = [] }: YearLineChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#c7c2b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';

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

  const chartOptions: ChartOptions<'line'> = {
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
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2126' : '#0f172a',
        titleColor: isDark ? '#f5f1e8' : '#f8fafc',
        bodyColor: isDark ? '#c7c2b8' : '#e2e8f0',
        borderColor: isDark ? '#2e3138' : '#334155',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          afterTitle: (items: TooltipItem<'line'>[]) => {
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
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Scale (0 - 5)',
          color: textColor,
          font: { size: 11, weight: 500 },
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
