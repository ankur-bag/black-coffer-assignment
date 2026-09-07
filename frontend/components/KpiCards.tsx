import React from 'react';

/**
 * @file KpiCards.tsx
 * Executive metrics row displaying high-level statistical indicators with transition animations.
 */

export interface KpiCardsProps {
  matchedCount?: number;
  avgIntensity?: number;
  avgLikelihood?: number;
  avgRelevance?: number;
  loading?: boolean;
}

interface KpiItem {
  id: string;
  label: string;
  sublabel: string;
  value: string;
  isPrimary: boolean;
}

export default function KpiCards({
  matchedCount = 0,
  avgIntensity = 0,
  avgLikelihood = 0,
  avgRelevance = 0,
  loading = false,
}: KpiCardsProps): React.JSX.Element {
  const cards: KpiItem[] = [
    {
      id: 'kpi-records',
      label: 'Matched Insights',
      sublabel: 'Total records in scope',
      value: matchedCount.toLocaleString(),
      isPrimary: true,
    },
    {
      id: 'kpi-intensity',
      label: 'Avg Intensity',
      sublabel: 'Impact severity score',
      value: avgIntensity ? Number(avgIntensity).toFixed(1) : '0.0',
      isPrimary: false,
    },
    {
      id: 'kpi-likelihood',
      label: 'Avg Likelihood',
      sublabel: 'Probability metric',
      value: avgLikelihood ? Number(avgLikelihood).toFixed(1) : '0.0',
      isPrimary: false,
    },
    {
      id: 'kpi-relevance',
      label: 'Avg Relevance',
      sublabel: 'Strategic importance',
      value: avgRelevance ? Number(avgRelevance).toFixed(1) : '0.0',
      isPrimary: false,
    },
  ];

  return (
    <section aria-label="Executive KPIs" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-5 shadow-xs flex flex-col justify-between"
        >
          <div>
            <span className="text-section-label block">{card.label}</span>
            <span className="text-metadata text-[var(--color-text-secondary)] block mt-0.5">{card.sublabel}</span>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div
              className={`text-data-kpi transition-opacity duration-200 ${
                loading ? 'opacity-40' : 'opacity-100'
              } ${card.isPrimary ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]'}`}
            >
              {card.value}
            </div>

            {loading && (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-ping" />
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
