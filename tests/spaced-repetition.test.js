/**
 * Spaced Repetition Algorithm Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import spacedRep, {
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  updateAfterReview
} from '../lib/spaced-repetition.js';

// Get constants from default export
const { BASE_INTERVALS, MAX_INTERVAL } = spacedRep;

describe('calculateNextReview', () => {
  it('confidence 1 schedules review in 1 day', () => {
    const result = calculateNextReview(1, null, 0);
    assert.strictEqual(result.interval, 1);
  });

  it('confidence 2 schedules review in 3 days', () => {
    const result = calculateNextReview(2, null, 0);
    assert.strictEqual(result.interval, 3);
  });

  it('confidence 3 schedules review in 7 days', () => {
    const result = calculateNextReview(3, null, 0);
    assert.strictEqual(result.interval, 7);
  });

  it('confidence 4 schedules review in 14 days', () => {
    const result = calculateNextReview(4, null, 0);
    assert.strictEqual(result.interval, 14);
  });

  it('confidence 5 schedules review in 30 days', () => {
    const result = calculateNextReview(5, null, 0);
    assert.strictEqual(result.interval, 30);
  });

  it('nextReview should be a valid date string', () => {
    const result = calculateNextReview(3, null, 0);
    assert.match(result.nextReview, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('ease factor should be adjusted', () => {
    const result1 = calculateNextReview(5, null, 0, 2.5);
    const result2 = calculateNextReview(1, null, 0, 2.5);

    // Confidence 5 increases ease factor
    assert.ok(result1.newEaseFactor >= 2.5);
    // Confidence 1 decreases ease factor
    assert.ok(result2.newEaseFactor <= 2.5);
  });

  it('ensures minimum ease factor', () => {
    const result = calculateNextReview(1, null, 0, 1.3);
    // Should not go below minimum 1.3
    assert.ok(result.newEaseFactor >= 1.3);
  });

  it('prevents exceeding maximum interval', () => {
    // Test with very high ease factor
    const result = calculateNextReview(5, '2024-01-01', 10, 10.0);
    assert.ok(result.interval <= MAX_INTERVAL);
  });
});

describe('isDueToday', () => {
  it('returns true for today\'s date', () => {
    const today = new Date().toISOString().split('T')[0];
    assert.strictEqual(isDueToday(today), true);
  });

  it('returns true for past dates', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    assert.strictEqual(isDueToday(yesterdayStr), true);
  });

  it('returns false for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    assert.strictEqual(isDueToday(tomorrowStr), false);
  });
});

describe('getReviewPriority', () => {
  it('returns urgent when overdue by 7+ days', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 10);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 3), 'urgent');
  });

  it('returns urgent when confidence is low and overdue', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 1);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 2), 'urgent');
  });

  it('returns normal when overdue but not severely', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 3);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 4), 'normal');
  });

  it('returns low when not yet due', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const futureStr = future.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(futureStr, 3), 'low');
  });
});

describe('updateAfterReview', () => {
  const mockItem = {
    id: 'learn_123',
    content: { title: 'Test' },
    classification: { topic: 'test' },
    spaceRep: {
      confidence: 3,
      nextReview: '2024-01-15',
      lastReview: '2024-01-08',
      reviewCount: 2,
      streak: 1,
      easeFactor: 2.5
    },
    meta: {
      status: 'active',
      updatedAt: '2024-01-08'
    },
    history: []
  };

  it('updates confidence', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.confidence, 4);
  });

  it('increments reviewCount', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.reviewCount, 3);
  });

  it('increments streak on success (confidence >= 3)', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.streak, 2);
  });

  it('resets streak on failure (confidence < 3)', () => {
    const updated = updateAfterReview(mockItem, 2);
    assert.strictEqual(updated.spaceRep.streak, 0);
  });

  it('marks as mastered after 3 consecutive confidence 5', () => {
    const itemWithStreak = {
      ...mockItem,
      spaceRep: { ...mockItem.spaceRep, streak: 2 }
    };
    const updated = updateAfterReview(itemWithStreak, 5);
    assert.strictEqual(updated.meta.status, 'mastered');
  });

  it('adds review record to history', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.history.length, 1);
    assert.strictEqual(updated.history[0].confidenceAfter, 4);
    assert.strictEqual(updated.history[0].correct, true);
  });

  it('updates lastReview to today', () => {
    const updated = updateAfterReview(mockItem, 4);
    const today = new Date().toISOString().split('T')[0];
    assert.strictEqual(updated.spaceRep.lastReview, today);
  });
});

describe('BASE_INTERVALS', () => {
  it('intervals defined for all confidence levels', () => {
    for (let i = 1; i <= 5; i++) {
      assert.ok(BASE_INTERVALS[i] !== undefined, `interval missing for confidence ${i}`);
      assert.ok(typeof BASE_INTERVALS[i] === 'number', `interval for confidence ${i} is not a number`);
    }
  });

  it('intervals increase with confidence', () => {
    let prevInterval = 0;
    for (let i = 1; i <= 5; i++) {
      assert.ok(BASE_INTERVALS[i] > prevInterval, `interval for confidence ${i} is not greater than previous`);
      prevInterval = BASE_INTERVALS[i];
    }
  });
});
