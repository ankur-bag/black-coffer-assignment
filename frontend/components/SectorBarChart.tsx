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
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { SectorStat } from '../lib/types';
import { getSectorBarColor } from '../lib/chartColors';
import { useTheme } from '../hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

export interface SectorBarChartProps {
  data?: SectorStat[];
  onSegmentClick?: (sector: string) => void;
}

export default function SectorBarChart({
  data = [],
  onSegmentClick,
}: SectorBarChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#c7c2b8' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)';

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

  const chartOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (!onSegmentClick || elements.length === 0) return;
      const index = elements[0].index;
      const clickedSector = topSectors[index]?.sector;
      if (clickedSector) {
        onSegmentClick(clickedSector);
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
          label: (context: TooltipItem<'bar'>) => `Avg Intensity: ${context.parsed.x}`,
          afterLabel: (context: TooltipItem<'bar'>) => {
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
          color: gridColor,
        },
        ticks: {
          color: textColor,
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Average Intensity Score',
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
