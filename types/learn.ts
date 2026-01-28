/**
 * Glean Learn Types
 * @license MIT
 */

export type LearnSource = 'manual' | 'harvest' | 'insight';
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;
export type LearnStatus = 'active' | 'mastered' | 'archived';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ReviewRecord {
  date: string;
  confidenceBefore: ConfidenceLevel;
  confidenceAfter: ConfidenceLevel;
  timeSpent: number;
  correct: boolean;
}

export interface LearnItem {
  id: string;
  version: '1.0';

  content: {
    title: string;
    description: string;
    keyPoints: string[];
    codeExample?: string;
    resources?: string[];
  };

  classification: {
    topic: string;
    subtopic?: string;
    tags: string[];
    difficulty: Difficulty;
  };

  source: {
    type: LearnSource;
    sessionId?: string;
    harvestId?: string;
    insightId?: string;
    project?: string;
  };

  spaceRep: {
    confidence: ConfidenceLevel;
    nextReview: string;
    lastReview: string | null;
    reviewCount: number;
    streak: number;
    easeFactor: number;
  };

  meta: {
    createdAt: string;
    updatedAt: string;
    status: LearnStatus;
  };

  history: ReviewRecord[];
}

export interface LearnSession {
  id: string;
  startTime: string;
  endTime?: string;
  items: string[];
  results: {
    itemId: string;
    correct: boolean;
    timeSpent: number;
    newConfidence: ConfidenceLevel;
  }[];
}

export interface LearnStats {
  totalItems: number;
  activeItems: number;
  masteredItems: number;
  todayReview: { due: number; completed: number };
  byTopic: {
    [topic: string]: { total: number; mastered: number; averageConfidence: number };
  };
  currentStreak: number;
  longestStreak: number;
  lastReviewDate: string | null;
}

export interface LearnIndex {
  totalItems: number;
  lastUpdated: string;
  dueToday: string[];
  byTopic: { [topic: string]: string[] };
  byDifficulty: { beginner: number; intermediate: number; advanced: number };
  byStatus: { active: number; mastered: number; archived: number };
}

export interface ReviewSchedule {
  itemId: string;
  title: string;
  topic: string;
  dueDate: string;
  daysOverdue: number;
  confidence: ConfidenceLevel;
  priority: 'urgent' | 'normal' | 'low';
}
