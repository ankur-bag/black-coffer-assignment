'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  TooltipItem,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { RegionStat } from '../lib/types';
import { getRegionColors } from '../lib/chartColors';
import { useTheme } from '../hooks/useTheme';

ChartJS.register(ArcElement, Tooltip, Legend);

export interface RegionDonutChartProps {
  data?: RegionStat[];
  onSegmentClick?: (region: string) => void;
}

export default function RegionDonutChart({
  data = [],
  onSegmentClick,
}: RegionDonutChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#c7c2b8' : '#475569';

  const top10 = data.slice(0, 10);
  const remainder = data.slice(10);
  const otherCount = remainder.reduce((acc, curr) => acc + curr.count, 0);

  const slices: RegionStat[] = [...top10];
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

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (!onSegmentClick || elements.length === 0) return;
      const index = elements[0].index;
      const clickedRegion = slices[index]?.region;
      if (clickedRegion && clickedRegion !== 'Other') {
        onSegmentClick(clickedRegion);
      }
    },
    onHover: (event: ChartEvent, chartElement: ActiveElement[]) => {
      const nativeEvent = event.native;
      if (nativeEvent && nativeEvent.target) {
        (nativeEvent.target as HTMLElement).style.cursor =
          chartElement.length > 0 && onSegmentClick ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
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
          label: (context: TooltipItem<'doughnut'>) => {
            const count = context.parsed;
            const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${count} (${pct}%)`;
          },
          afterLabel: (context: TooltipItem<'doughnut'>) => {
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
