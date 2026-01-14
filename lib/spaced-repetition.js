/**
 * Glean Spaced Repetition Algorithm
 * Simplified spaced repetition implementation based on SM-2 algorithm
 *
 * Reference: https://en.wikipedia.org/wiki/SuperMemo#SM-2_algorithm
 */

/**
 * Base review intervals (days)
 * Default intervals based on confidence level
 */
const BASE_INTERVALS = {
  1: 1,   // 1 day
  2: 3,   // 3 days
  3: 7,   // 7 days
  4: 14,  // 14 days
  5: 30   // 30 days
};

/**
 * Maximum review interval (days)
 * Even well-known items won't exceed this interval
 */
const MAX_INTERVAL = 180; // 6 months

/**
 * Minimum ease factor
 */
const MIN_EASE_FACTOR = 1.3;

/**
 * Default ease factor
 */
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * Calculate next review date
 * @param {number} confidence - Confidence level (1-5)
 * @param {string|null} lastReview - Last review date (ISO string)
 * @param {number} reviewCount - Number of reviews
 * @param {number} easeFactor - Difficulty factor
 * @returns {object} { nextReview, interval, newEaseFactor }
 */
export function calculateNextReview(confidence, lastReview, reviewCount = 0, easeFactor = DEFAULT_EASE_FACTOR) {
  // Use base interval for first review or low confidence
  if (!lastReview || confidence < 3) {
    const interval = BASE_INTERVALS[confidence];
    return {
      nextReview: addDays(new Date(), interval),
      interval,
      newEaseFactor: adjustEaseFactor(easeFactor, confidence)
    };
  }

  // Calculate interval based on SM-2 algorithm
  let interval;

  if (reviewCount === 0) {
    interval = 1;
  } else if (reviewCount === 1) {
    interval = 6;
  } else {
    // Previous interval * easeFactor
    const daysSinceLastReview = getDaysBetween(new Date(lastReview), new Date());
    interval = Math.round(daysSinceLastReview * easeFactor);
  }

  // Adjust based on confidence
  if (confidence === 5) {
    interval = Math.round(interval * 1.3); // Extend for high confidence
  } else if (confidence === 4) {
    interval = Math.round(interval * 1.1);
  } else if (confidence === 3) {
    // Keep as is
  }

  // Apply maximum interval limit
  interval = Math.min(interval, MAX_INTERVAL);

  return {
    nextReview: addDays(new Date(), interval),
    interval,
    newEaseFactor: adjustEaseFactor(easeFactor, confidence)
  };
}

/**
 * Adjust ease factor
 * Decrease for low confidence, increase for high confidence
 */
function adjustEaseFactor(currentFactor, confidence) {
  // SM-2 formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  // q = confidence (1-5)
  const q = confidence;
  const adjustment = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  const newFactor = currentFactor + adjustment;

  return Math.max(MIN_EASE_FACTOR, newFactor);
}

/**
 * Date helper - add days
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

/**
 * Get days between two dates
 */
function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

/**
 * Check if review is due today
 * @param {string} nextReview - Next review date (ISO string)
 * @returns {boolean}
 */
export function isDueToday(nextReview) {
  const today = new Date().toISOString().split('T')[0];
  return nextReview <= today;
}

/**
 * Calculate review priority
 * @param {string} nextReview - Next review date
 * @param {number} confidence - Current confidence level
 * @returns {'urgent' | 'normal' | 'low'}
 */
export function getReviewPriority(nextReview, confidence) {
  const today = new Date();
  const dueDate = new Date(nextReview);
  const daysOverdue = getDaysBetween(dueDate, today);

  // If overdue
  if (dueDate < today) {
    if (daysOverdue > 7 || confidence < 3) {
      return 'urgent';
    }
    return 'normal';
  }

  return 'low';
}

/**
 * Generate review schedule
 * @param {object[]} items - Array of learn items
 * @param {number} limit - Maximum count
 * @returns {object[]} Review schedule array
 */
export function generateReviewSchedule(items, limit = 10) {
  const today = new Date().toISOString().split('T')[0];

  const schedule = items
    .map(item => {
      const dueDate = new Date(item.spaceRep.nextReview);
      const todayDate = new Date(today);
      const daysOverdue = dueDate <= todayDate
        ? getDaysBetween(dueDate, todayDate)
        : -getDaysBetween(todayDate, dueDate);

      return {
        itemId: item.id,
        title: item.content.title,
        topic: item.classification.topic,
        dueDate: item.spaceRep.nextReview,
        daysOverdue,
        confidence: item.spaceRep.confidence,
        priority: getReviewPriority(item.spaceRep.nextReview, item.spaceRep.confidence)
      };
    })
    .filter(item => item.daysOverdue >= 0) // Only due items
    .sort((a, b) => {
      // Sort by priority, then by days overdue
      const priorityOrder = { urgent: 0, normal: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.daysOverdue - a.daysOverdue;
    })
    .slice(0, limit);

  return schedule;
}

/**
 * Update item after review
 * @param {object} item - Learn item
 * @param {number} newConfidence - New confidence level
 * @returns {object} Updated item
 */
export function updateAfterReview(item, newConfidence) {
  const { nextReview, interval, newEaseFactor } = calculateNextReview(
    newConfidence,
    item.spaceRep.lastReview,
    item.spaceRep.reviewCount,
    item.spaceRep.easeFactor
  );

  // Add review record
  const reviewRecord = {
    date: new Date().toISOString(),
    confidenceBefore: item.spaceRep.confidence,
    confidenceAfter: newConfidence,
    timeSpent: 0, // Can be measured later
    correct: newConfidence >= 3
  };

  // Update streak
  const streak = newConfidence >= 3
    ? item.spaceRep.streak + 1
    : 0;

  // Check mastered status (3 consecutive confidence 5)
  const status = (newConfidence === 5 && streak >= 3)
    ? 'mastered'
    : item.meta.status;

  return {
    ...item,
    spaceRep: {
      ...item.spaceRep,
      confidence: newConfidence,
      nextReview,
      lastReview: new Date().toISOString().split('T')[0],
      reviewCount: item.spaceRep.reviewCount + 1,
      streak,
      easeFactor: newEaseFactor
    },
    meta: {
      ...item.meta,
      status,
      updatedAt: new Date().toISOString()
    },
    history: [...item.history, reviewRecord]
  };
}

export default {
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  generateReviewSchedule,
  updateAfterReview,
  BASE_INTERVALS,
  MAX_INTERVAL
};
