/**
 * Glean Backfill Data Schema
 * Types for retroactive session analysis
 */

import { InsightType } from './insight';
import { Difficulty } from './learn';

// Backfill extraction result from a single session
export interface BackfillResult {
  sessionFile: string;
  projectPath: string;
  processedAt: string;
  chunks: number;

  insights: BackfillInsight[];
  learnings: BackfillLearning[];
  summary: BackfillSummary;
}

// Insight extracted from historical session
export interface BackfillInsight {
  type: InsightType;
  title: string;
  content: string;
  confidence: number; // 0.6-0.8 (lower than live extraction)
  tags: string[];
  codeSnippet?: string;
}

// Learning extracted from historical session
export interface BackfillLearning {
  category: 'technical' | 'problem-solution' | 'unexpected' | 'tip';
  title: string;
  description: string;
  code?: string;
  tags: string[];
  reusable: boolean;
  projectSpecific: boolean;
  confidence: number; // 0.6-0.8
  difficulty: Difficulty;
}

// Summary of backfill extraction
export interface BackfillSummary {
  totalInsights: number;
  totalLearnings: number;
  byInsightType: Record<InsightType, number>;
  byLearningCategory: Record<string, number>;
  sessionDate?: string;
  projectContext?: string;
}

// Overall backfill run report
export interface BackfillReport {
  startedAt: string;
  completedAt: string;
  sessionsScanned: number;
  sessionsProcessed: number;
  sessionsSkipped: number;

  totalInsightsExtracted: number;
  totalLearningsExtracted: number;
  duplicatesRemoved: number;

  results: BackfillResult[];
  errors: BackfillError[];
}

// Error during backfill processing
export interface BackfillError {
  sessionFile: string;
  error: string;
  phase: 'parse' | 'analyze' | 'dedup' | 'store';
}

// Backfill command options
export interface BackfillOptions {
  project?: string;
  all?: boolean;
  limit?: number;
  since?: string;
  dryRun?: boolean;
}
