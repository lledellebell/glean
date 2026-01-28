/**
 * Glean Spaced Repetition
 * @license MIT
 */

const BASE_INTERVALS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };
const MAX_INTERVAL = 180;
const MIN_EF = 1.3;
const DEFAULT_EF = 2.5;

export function calculateNextReview(confidence, lastReview, reviewCount = 0, ef = DEFAULT_EF) {
  if (!lastReview || confidence < 3) {
    const interval = BASE_INTERVALS[confidence];
    return {
      nextReview: addDays(new Date(), interval),
      interval,
      newEaseFactor: adjustEF(ef, confidence)
    };
  }

  let interval;
  if (reviewCount === 0) {
    interval = 1;
  } else if (reviewCount === 1) {
    interval = 6;
  } else {
    const days = getDaysBetween(new Date(lastReview), new Date());
    interval = Math.round(days * ef);
  }

  if (confidence === 5) interval = Math.round(interval * 1.3);
  else if (confidence === 4) interval = Math.round(interval * 1.1);

  interval = Math.min(interval, MAX_INTERVAL);

  return {
    nextReview: addDays(new Date(), interval),
    interval,
    newEaseFactor: adjustEF(ef, confidence)
  };
}

function adjustEF(current, q) {
  const adj = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  return Math.max(MIN_EF, current + adj);
}

function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r.toISOString().split('T')[0];
}

function getDaysBetween(d1, d2) {
  return Math.round(Math.abs((d2 - d1) / (24 * 60 * 60 * 1000)));
}

export function isDueToday(nextReview) {
  return nextReview <= new Date().toISOString().split('T')[0];
}

export function getReviewPriority(nextReview, confidence) {
  const today = new Date();
  const due = new Date(nextReview);
  const overdue = getDaysBetween(due, today);

  if (due < today) {
    return (overdue > 7 || confidence < 3) ? 'urgent' : 'normal';
  }
  return 'low';
}

export function generateReviewSchedule(items, limit = 10) {
  const today = new Date().toISOString().split('T')[0];

  return items
    .map(item => {
      const due = new Date(item.spaceRep.nextReview);
      const todayDate = new Date(today);
      const overdue = due <= todayDate
        ? getDaysBetween(due, todayDate)
        : -getDaysBetween(todayDate, due);

      return {
        itemId: item.id,
        title: item.content.title,
        topic: item.classification.topic,
        dueDate: item.spaceRep.nextReview,
        daysOverdue: overdue,
        confidence: item.spaceRep.confidence,
        priority: getReviewPriority(item.spaceRep.nextReview, item.spaceRep.confidence)
      };
    })
    .filter(i => i.daysOverdue >= 0)
    .sort((a, b) => {
      const p = { urgent: 0, normal: 1, low: 2 };
      return p[a.priority] !== p[b.priority]
        ? p[a.priority] - p[b.priority]
        : b.daysOverdue - a.daysOverdue;
    })
    .slice(0, limit);
}

export function updateAfterReview(item, newConfidence) {
  const { nextReview, interval, newEaseFactor } = calculateNextReview(
    newConfidence,
    item.spaceRep.lastReview,
    item.spaceRep.reviewCount,
    item.spaceRep.easeFactor
  );

  const record = {
    date: new Date().toISOString(),
    confidenceBefore: item.spaceRep.confidence,
    confidenceAfter: newConfidence,
    timeSpent: 0,
    correct: newConfidence >= 3
  };

  const streak = newConfidence >= 3 ? item.spaceRep.streak + 1 : 0;
  const status = (newConfidence === 5 && streak >= 3) ? 'mastered' : item.meta.status;

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
    meta: { ...item.meta, status, updatedAt: new Date().toISOString() },
    history: [...item.history, record]
  };
}

export default {
  BASE_INTERVALS,
  MAX_INTERVAL,
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  generateReviewSchedule,
  updateAfterReview
};
