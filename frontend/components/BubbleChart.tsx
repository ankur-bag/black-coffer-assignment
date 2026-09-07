'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BubblePoint } from '../lib/types';
import { getSectorColor } from '../lib/chartColors';
import { useTheme } from '../hooks/useTheme';

export interface BubbleChartProps {
  data?: BubblePoint[];
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  point: BubblePoint | null;
}

interface ChartDimensions {
  width: number;
  height: number;
}

export default function BubbleChart({ data = [] }: BubbleChartProps): React.JSX.Element {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>({ width: 0, height: 460 });

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    point: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({
          width,
          height: width < 640 ? 380 : 460,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeSectors: string[] = useMemo(() => {
    const set = new Set<string>();
    for (const d of data) {
      set.add(d.sector || 'Unspecified');
    }
    return Array.from(set).sort((a, b) => {
      if (a === 'Unspecified') return 1;
      if (b === 'Unspecified') return -1;
      return a.localeCompare(b);
    });
  }, [data]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width <= 0) return;

    const { width, height } = dimensions;
    const margin = { top: 24, right: 32, bottom: 50, left: 56 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg: d3.Selection<SVGSVGElement, unknown, null, undefined> = d3.select(svgRef.current);

    // Clear previous SVG contents on resize or re-render
    svg.selectAll('*').remove();

    if (!data || data.length === 0) {
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '13px')
        .text('No points match active filters');
      return;
    }

    const xMin = d3.min(data, (d: BubblePoint) => d.likelihood) ?? 0;
    const xMax = d3.max(data, (d: BubblePoint) => d.likelihood) ?? 5;
    const xPad = (xMax - xMin) * 0.1 || 0.5;

    const yMin = d3.min(data, (d: BubblePoint) => d.intensity) ?? 0;
    const yMax = d3.max(data, (d: BubblePoint) => d.intensity) ?? 50;
    const yPad = (yMax - yMin) * 0.1 || 5;

    const xScale = d3
      .scaleLinear()
      .domain([Math.max(0, xMin - xPad), xMax + xPad])
      .range([margin.left, width - margin.right])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - yPad), yMax + yPad])
      .range([height - margin.bottom, margin.top])
      .nice();

    // Scale bubble radius by square root so perceived area is proportional to relevance
    const rMax = d3.max(data, (d: BubblePoint) => d.relevance) ?? 5;
    const rScale = d3
      .scaleSqrt()
      .domain([0, Math.max(1, rMax)])
      .range([4, 15]);

    const gGrid = svg.append('g').attr('class', 'gridlines');

    // Horizontal gridlines
    gGrid
      .append('g')
      .selectAll('line')
      .data(yScale.ticks(6))
      .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', (d: number) => yScale(d))
      .attr('y2', (d: number) => yScale(d))
      .attr('stroke', isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)')
      .attr('stroke-dasharray', '3 3');

    // Vertical gridlines
    gGrid
      .append('g')
      .selectAll('line')
      .data(xScale.ticks(6))
      .join('line')
      .attr('x1', (d: number) => xScale(d))
      .attr('x2', (d: number) => xScale(d))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(226, 232, 240, 0.8)')
      .attr('stroke-dasharray', '3 3');

    const xAxis = d3.axisBottom(xScale).ticks(width < 500 ? 5 : 8).tickSizeOuter(0);
    const gX = svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    const axisLineColor = isDark ? '#3a3e47' : '#cbd5e1';
    const axisTextColor = isDark ? '#c7c2b8' : '#64748b';

    gX.selectAll('.domain').attr('stroke', axisLineColor);
    gX.selectAll('.tick line').attr('stroke', axisLineColor);
    gX.selectAll('.tick text').attr('fill', axisTextColor).attr('font-size', '11px');

    svg
      .append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', height - 12)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTextColor)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('Likelihood Score →');

    const yAxis = d3.axisLeft(yScale).ticks(6).tickSizeOuter(0);
    const gY = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(yAxis);

    gY.selectAll('.domain').attr('stroke', axisLineColor);
    gY.selectAll('.tick line').attr('stroke', axisLineColor);
    gY.selectAll('.tick text').attr('fill', axisTextColor).attr('font-size', '11px');

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + innerHeight / 2))
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', axisTextColor)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('↑ Intensity Score');

    const gBubbles = svg.append('g').attr('class', 'bubbles');

    gBubbles
      .selectAll<SVGCircleElement, BubblePoint>('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: BubblePoint) => xScale(d.likelihood))
      .attr('cy', (d: BubblePoint) => yScale(d.intensity))
      .attr('r', (d: BubblePoint) => rScale(d.relevance))
      .attr('fill', (d: BubblePoint) => {
        const sector = d.sector || 'Unspecified';
        return sector === 'Unspecified'
          ? 'rgba(148, 163, 184, 0.4)'
          : getSectorColor(sector);
      })
      .attr('fill-opacity', (d: BubblePoint) => ((d.sector || 'Unspecified') === 'Unspecified' ? 0.45 : 0.65))
      .attr('stroke', (d: BubblePoint) => getSectorColor(d.sector || 'Unspecified'))
      .attr('stroke-width', 1.2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (this: SVGCircleElement, event: MouseEvent, d: BubblePoint) {
        // Enlarge and highlight hovered circle
        d3.select(this)
          .raise()
          .transition()
          .duration(120)
          .attr('r', rScale(d.relevance) + 3)
          .attr('fill-opacity', 0.9)
          .attr('stroke-width', 2.5);

        if (!containerRef.current) return;
        const bounds = containerRef.current.getBoundingClientRect();
        setTooltip({
          visible: true,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top - 12,
          point: d,
        });
      })
      .on('mousemove', function (event: MouseEvent) {
        if (!containerRef.current) return;
        const bounds = containerRef.current.getBoundingClientRect();
        setTooltip((prev: TooltipState) => ({
          ...prev,
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top - 12,
        }));
      })
      .on('mouseleave', function (this: SVGCircleElement, _event: MouseEvent, d: BubblePoint) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', rScale(d.relevance))
          .attr('fill-opacity', (d.sector || 'Unspecified') === 'Unspecified' ? 0.45 : 0.65)
          .attr('stroke-width', 1.2);

        setTooltip((prev: TooltipState) => ({ ...prev, visible: false }));
      });
  }, [data, dimensions, isDark]);

  return (
    <div
      ref={containerRef}
      className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-6 shadow-xs relative flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-section-label">Strategic Multi-Metric Landscape (D3.js)</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[var(--color-accent)] border border-blue-200 dark:border-blue-900/50">
              Bespoke D3
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            X = Likelihood · Y = Intensity · Bubble Radius = Relevance · Color = Sector
          </p>
        </div>

        <div className="text-metadata text-[var(--color-text-secondary)] self-start sm:self-auto">
          {data.length} sample points in view
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full relative min-h-[380px] sm:min-h-[460px]">
        <svg
          ref={svgRef}
          width={dimensions.width || '100%'}
          height={dimensions.height}
          className="w-full h-auto overflow-visible"
        />

        {/* Floating Custom Tooltip */}
        {tooltip.visible && tooltip.point && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-slate-900/95 text-white p-3 rounded-md shadow-lg border border-slate-700 text-xs min-w-[170px]"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              transition: 'transform 0.05s ease-out',
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-slate-100 pb-1.5 mb-1.5 border-b border-slate-800">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{
                  backgroundColor: getSectorColor(tooltip.point.sector || 'Unspecified'),
                }}
              />
              <span className="truncate">{tooltip.point.sector || 'Unspecified'}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
              <span className="text-slate-400">Intensity:</span>
              <span className="font-semibold text-right text-slate-200">{tooltip.point.intensity}</span>

              <span className="text-slate-400">Likelihood:</span>
              <span className="font-semibold text-right text-slate-200">{tooltip.point.likelihood}</span>

              <span className="text-slate-400">Relevance:</span>
              <span className="font-semibold text-right text-slate-200">{tooltip.point.relevance}</span>
            </div>

            {(tooltip.point.sector || 'Unspecified') === 'Unspecified' && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 italic">
                Unclassified sector in source data
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Compact Legend (Only sectors present in active data) */}
      {activeSectors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center gap-x-4 gap-y-2 flex-wrap text-xs">
          <span className="text-metadata font-medium text-[var(--color-text-secondary)]">
            Active Sectors ({activeSectors.length}):
          </span>
          {activeSectors.map((sector: string) => {
            const isUnspecified = sector === 'Unspecified';
            return (
              <span key={sector} className="inline-flex items-center gap-1.5 text-metadata">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                  style={{
                    backgroundColor: getSectorColor(sector),
                    opacity: isUnspecified ? 0.6 : 1,
                  }}
                />
                <span className={isUnspecified ? 'text-slate-500 italic' : 'text-[var(--color-text-primary)]'}>
                  {sector}
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
