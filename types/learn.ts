/**
 * Glean Learn Data Schema
 * Spaced repetition based learning system
 */

// Learning item source
export type LearnSource = 'manual' | 'harvest' | 'insight';

// Confidence level (1-5)
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

// Learning item status
export type LearnStatus = 'active' | 'mastered' | 'archived';

// Difficulty level
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Review record
export interface ReviewRecord {
  date: string;
  confidenceBefore: ConfidenceLevel;
  confidenceAfter: ConfidenceLevel;
  timeSpent: number; // seconds
  correct: boolean; // Whether answered correctly in quiz mode
}

// Learning item
export interface LearnItem {
  id: string;
  version: '1.0';

  // Core content
  content: {
    title: string;
    description: string;
    keyPoints: string[];
    codeExample?: string;
    resources?: string[]; // Related links
  };

  // Classification
  classification: {
    topic: string; // react, typescript, git, etc.
    subtopic?: string;
    tags: string[];
    difficulty: Difficulty;
  };

  // Source information
  source: {
    type: LearnSource;
    sessionId?: string;
    harvestId?: string;
    insightId?: string;
    project?: string;
  };

  // Spaced repetition data
  spaceRep: {
    confidence: ConfidenceLevel;
    nextReview: string; // ISO date
    lastReview: string | null;
    reviewCount: number;
    streak: number; // Consecutive correct answers
    easeFactor: number; // SM-2 algorithm difficulty factor
  };

  // Metadata
  meta: {
    createdAt: string;
    updatedAt: string;
    status: LearnStatus;
  };

  // Review history
  history: ReviewRecord[];
}

// Learning session (quiz/review mode)
export interface LearnSession {
  id: string;
  startTime: string;
  endTime?: string;
  items: string[]; // Reviewed item IDs
  results: {
    itemId: string;
    correct: boolean;
    timeSpent: number;
    newConfidence: ConfidenceLevel;
  }[];
}

// Learning statistics
export interface LearnStats {
  totalItems: number;
  activeItems: number;
  masteredItems: number;

  // Today's review
  todayReview: {
    due: number;
    completed: number;
  };

  // Distribution by topic
  byTopic: {
    [topic: string]: {
      total: number;
      mastered: number;
      averageConfidence: number;
    };
  };

  // Review streak
  currentStreak: number; // Consecutive review days
  longestStreak: number;
  lastReviewDate: string | null;
}

// Store index
export interface LearnIndex {
  totalItems: number;
  lastUpdated: string;

  // Item IDs due for review today
  dueToday: string[];

  // By topic
  byTopic: {
    [topic: string]: string[]; // Item ID array
  };

  // By difficulty
  byDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };

  // By status
  byStatus: {
    active: number;
    mastered: number;
    archived: number;
  };
}

// Review schedule calculation result
export interface ReviewSchedule {
  itemId: string;
  title: string;
  topic: string;
  dueDate: string;
  daysOverdue: number; // Negative if not yet due
  confidence: ConfidenceLevel;
  priority: 'urgent' | 'normal' | 'low';
}
