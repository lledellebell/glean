/**
 * Spaced Repetition - SM-2 Algorithm Implementation
 */

export interface SpaceRepData {
  confidence: number;
  easeFactor: number;
  interval: number;
  reviewCount: number;
  nextReview?: string;
  lastReview?: string;
  streak?: number;
  status?: 'active' | 'mastered';
}

export interface LearnItem {
  id: string;
  topic: string;
  content: string;
  spaceRep: SpaceRepData;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResult {
  nextReview: string;
  interval: number;
  easeFactor: number;
}

/**
 * Calculate the next review date based on confidence level
 * @param item - Learning item with spaced repetition data
 * @param confidence - Confidence level (1-5)
 * @returns Review result with next date, interval, and ease factor
 */
export function calculateNextReview(item: LearnItem, confidence: number): ReviewResult;

/**
 * Check if a date string represents today or earlier
 * @param dateString - ISO date string
 * @returns True if the date is today or in the past
 */
export function isDueToday(dateString: string): boolean;

/**
 * Get review priority based on due date and confidence
 * @param item - Learning item
 * @returns Priority level: 'urgent', 'normal', or 'low'
 */
export function getReviewPriority(item: LearnItem): 'urgent' | 'normal' | 'low';

/**
 * Update a learning item after review
 * @param item - Learning item to update
 * @param confidence - Confidence level from review (1-5)
 * @returns Updated learning item
 */
export function updateAfterReview(item: LearnItem, confidence: number): LearnItem;

/**
 * Base intervals for each confidence level (in days)
 */
export const BASE_INTERVALS: Record<number, number>;
