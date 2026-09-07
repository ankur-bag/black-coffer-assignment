'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { TopicStat } from '../lib/types';
import { getSectorBarColor } from '../lib/chartColors';
import { useTheme } from '../hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export interface TopTopicsChartProps {
  data?: TopicStat[];
}

export default function TopTopicsChart({ data = [] }: TopTopicsChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#c7c2b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';

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

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
          label: (context: TooltipItem<'bar'>) => `Frequency: ${context.parsed.x} insights`,
          afterLabel: (context: TooltipItem<'bar'>) => {
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
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Frequency Count',
          color: textColor,
          font: { size: 11, weight: 500 },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
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
