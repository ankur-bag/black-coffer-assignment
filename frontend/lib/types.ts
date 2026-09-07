/**
 * @file types.ts
 * Shared domain models, filter interfaces, and API payload contracts for Blackcoffer Insights.
 */

export interface Insight {
  _id?: string;
  end_year: string;
  start_year: string;
  added: string;
  published: string;
  intensity: number;
  likelihood: number;
  relevance: number;
  sector: string;
  topic: string;
  insight: string;
  url: string;
  region: string;
  impact: string;
  country: string;
  pestle: string;
  source: string;
  title: string;
  city: string;
  swot: string;
}

export interface FilterState {
  end_year: string[];
  topic: string[];
  sector: string[];
  region: string[];
  pestle: string[];
  source: string[];
  country: string[];
  city: string[];
  swot: string[];
}

export interface FilterOptions {
  end_year: string[];
  topic: string[];
  sector: string[];
  region: string[];
  pestle: string[];
  source: string[];
  country: string[];
  city: string[];
  swot: string[];
}

export interface SectorStat {
  sector: string;
  avgIntensity: number;
  count: number;
}

export interface RegionStat {
  region: string;
  count: number;
}

export interface YearStat {
  year: string;
  avgLikelihood: number;
  avgRelevance: number;
  count: number;
}

export interface TopicStat {
  topic: string;
  count: number;
}

export interface BubblePoint {
  intensity: number;
  likelihood: number;
  relevance: number;
  sector: string;
}

export interface StatsResponse {
  matchedCount: number;
  avgIntensity: number;
  avgLikelihood: number;
  avgRelevance: number;
  intensityBySector: SectorStat[];
  countByRegion: RegionStat[];
  metricsByYear: YearStat[];
  topTopics: TopicStat[];
  bubblePoints: BubblePoint[];
}
