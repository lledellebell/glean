/**
 * Glean Spaced Repetition (SM-2 기반)
 * @see https://en.wikipedia.org/wiki/SuperMemo#SM-2_algorithm
 */

// confidence별 기본 복습 간격 (일)
export const BASE_INTERVALS = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30
};

export const MAX_INTERVAL = 180; // 최대 6개월
const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

/**
 * @param {number} confidence - 1~5
 * @param {string|null} lastReview - ISO 날짜 문자열
 * @param {number} reviewCount
 * @param {number} easeFactor
 * @returns {{ nextReview: string, interval: number, newEaseFactor: number }}
 */
export function calculateNextReview(confidence, lastReview, reviewCount = 0, easeFactor = DEFAULT_EASE_FACTOR) {
  if (!lastReview || confidence < 3) {
    const interval = BASE_INTERVALS[confidence];
    return {
      nextReview: addDays(new Date(), interval),
      interval,
      newEaseFactor: adjustEaseFactor(easeFactor, confidence)
    };
  }

  let interval;

  if (reviewCount === 0) {
    interval = 1;
  } else if (reviewCount === 1) {
    interval = 6;
  } else {
    const daysSinceLastReview = getDaysBetween(new Date(lastReview), new Date());
    interval = Math.round(daysSinceLastReview * easeFactor);
  }

  if (confidence === 5) {
    interval = Math.round(interval * 1.3);
  } else if (confidence === 4) {
    interval = Math.round(interval * 1.1);
  }

  interval = Math.min(interval, MAX_INTERVAL);

  return {
    nextReview: addDays(new Date(), interval),
    interval,
    newEaseFactor: adjustEaseFactor(easeFactor, confidence)
  };
}

// SM-2 공식: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
function adjustEaseFactor(currentFactor, confidence) {
  const q = confidence;
  const adjustment = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  return Math.max(MIN_EASE_FACTOR, currentFactor + adjustment);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

function getDaysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2 - date1) / oneDay));
}

/**
 * @param {string} nextReview
 * @returns {boolean}
 */
export function isDueToday(nextReview) {
  const today = new Date().toISOString().split('T')[0];
  return nextReview <= today;
}

/**
 * @param {string} nextReview
 * @param {number} confidence
 * @returns {'urgent' | 'normal' | 'low'}
 */
export function getReviewPriority(nextReview, confidence) {
  const today = new Date();
  const dueDate = new Date(nextReview);
  const daysOverdue = getDaysBetween(dueDate, today);

  if (dueDate < today) {
    if (daysOverdue > 7 || confidence < 3) {
      return 'urgent';
    }
    return 'normal';
  }

  return 'low';
}

/**
 * @param {object[]} items
 * @param {number} limit
 * @returns {object[]}
 */
export function generateReviewSchedule(items, limit = 10) {
  const today = new Date().toISOString().split('T')[0];

  return items
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
    .filter(item => item.daysOverdue >= 0)
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, normal: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.daysOverdue - a.daysOverdue;
    })
    .slice(0, limit);
}

/**
 * @param {object} item
 * @param {number} newConfidence
 * @returns {object}
 */
export function updateAfterReview(item, newConfidence) {
  const { nextReview, interval, newEaseFactor } = calculateNextReview(
    newConfidence,
    item.spaceRep.lastReview,
    item.spaceRep.reviewCount,
    item.spaceRep.easeFactor
  );

  const reviewRecord = {
    date: new Date().toISOString(),
    confidenceBefore: item.spaceRep.confidence,
    confidenceAfter: newConfidence,
    timeSpent: 0,
    correct: newConfidence >= 3
  };

  const streak = newConfidence >= 3 ? item.spaceRep.streak + 1 : 0;

  // confidence 5가 3회 연속이면 mastered
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
