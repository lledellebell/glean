/**
 * Glean Insight Data Schema
 * Format for storing insights extracted from sessions
 */

// Insight type
export type InsightType = 'pattern' | 'mistake' | 'optimization' | 'learning';

// Insight status
export type InsightStatus = 'new' | 'reviewed' | 'applied' | 'dismissed';

// Single insight
export interface Insight {
  id: string;
  version: '1.0';

  // Basic information
  type: InsightType;
  title: string;
  content: string;
  confidence: number; // 0-1

  // Context
  context: {
    project: string;
    sessionId?: string;
    harvestId?: string;
    files?: string[];
    codeSnippet?: string;
  };

  // Metadata
  meta: {
    createdAt: string;
    updatedAt: string;
    status: InsightStatus;
    tags: string[];
    relatedInsights?: string[]; // Related insight IDs
  };

  // Usage information
  usage: {
    viewCount: number;
    appliedCount: number; // Times actually applied
    convertedToLearn: boolean; // Converted to /learn
    learnItemId?: string;
  };
}

// Type-specific insight data
export interface PatternInsight extends Insight {
  type: 'pattern';
  pattern: {
    description: string;
    example: string;
    antiPattern?: string; // What to avoid
    applicability: string[]; // Applicable situations
  };
}

export interface MistakeInsight extends Insight {
  type: 'mistake';
  mistake: {
    what: string; // What went wrong
    why: string; // Why it was wrong
    how: string; // How it was fixed
    prevention: string; // How to prevent it
  };
}

export interface OptimizationInsight extends Insight {
  type: 'optimization';
  optimization: {
    before: string;
    after: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  };
}

export interface LearningInsight extends Insight {
  type: 'learning';
  learning: {
    topic: string;
    keyPoints: string[];
    resources?: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// Insight store index
export interface InsightIndex {
  totalInsights: number;
  lastUpdated: string;

  // Count by type
  byType: {
    pattern: number;
    mistake: number;
    optimization: number;
    learning: number;
  };

  // Count by project
  byProject: {
    [project: string]: number;
  };

  // Count by tag
  byTag: {
    [tag: string]: number;
  };
}

// Insight search filter
export interface InsightFilter {
  type?: InsightType | InsightType[];
  status?: InsightStatus | InsightStatus[];
  project?: string;
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  minConfidence?: number;
}

// Insight summary (for list display)
export interface InsightSummary {
  id: string;
  type: InsightType;
  title: string;
  confidence: number;
  project: string;
  createdAt: string;
  status: InsightStatus;
  tags: string[];
}
