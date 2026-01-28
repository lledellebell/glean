/**
 * Spaced Repetition Algorithm 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import spacedRep, {
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  updateAfterReview
} from '../lib/spaced-repetition.js';

// default export에서 상수 가져오기
const { BASE_INTERVALS, MAX_INTERVAL } = spacedRep;

describe('calculateNextReview', () => {
  it('confidence 1일 때 1일 후 복습', () => {
    const result = calculateNextReview(1, null, 0);
    assert.strictEqual(result.interval, 1);
  });

  it('confidence 2일 때 3일 후 복습', () => {
    const result = calculateNextReview(2, null, 0);
    assert.strictEqual(result.interval, 3);
  });

  it('confidence 3일 때 7일 후 복습', () => {
    const result = calculateNextReview(3, null, 0);
    assert.strictEqual(result.interval, 7);
  });

  it('confidence 4일 때 14일 후 복습', () => {
    const result = calculateNextReview(4, null, 0);
    assert.strictEqual(result.interval, 14);
  });

  it('confidence 5일 때 30일 후 복습', () => {
    const result = calculateNextReview(5, null, 0);
    assert.strictEqual(result.interval, 30);
  });

  it('nextReview가 유효한 날짜 문자열이어야 함', () => {
    const result = calculateNextReview(3, null, 0);
    assert.match(result.nextReview, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('ease factor가 조정되어야 함', () => {
    const result1 = calculateNextReview(5, null, 0, 2.5);
    const result2 = calculateNextReview(1, null, 0, 2.5);

    // confidence 5면 ease factor 증가
    assert.ok(result1.newEaseFactor >= 2.5);
    // confidence 1이면 ease factor 감소
    assert.ok(result2.newEaseFactor <= 2.5);
  });

  it('최소 ease factor 보장', () => {
    const result = calculateNextReview(1, null, 0, 1.3);
    // 최소값 1.3 아래로 내려가면 안 됨
    assert.ok(result.newEaseFactor >= 1.3);
  });

  it('최대 간격 초과 방지', () => {
    // 매우 높은 ease factor로 테스트
    const result = calculateNextReview(5, '2024-01-01', 10, 10.0);
    assert.ok(result.interval <= MAX_INTERVAL);
  });
});

describe('isDueToday', () => {
  it('오늘 날짜면 true 반환', () => {
    const today = new Date().toISOString().split('T')[0];
    assert.strictEqual(isDueToday(today), true);
  });

  it('과거 날짜면 true 반환', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    assert.strictEqual(isDueToday(yesterdayStr), true);
  });

  it('미래 날짜면 false 반환', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    assert.strictEqual(isDueToday(tomorrowStr), false);
  });
});

describe('getReviewPriority', () => {
  it('7일 이상 초과하면 urgent', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 10);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 3), 'urgent');
  });

  it('confidence가 낮고 기한 지나면 urgent', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 1);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 2), 'urgent');
  });

  it('기한 지났지만 심하지 않으면 normal', () => {
    const overdue = new Date();
    overdue.setDate(overdue.getDate() - 3);
    const overdueStr = overdue.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(overdueStr, 4), 'normal');
  });

  it('아직 기한 전이면 low', () => {
    const future = new Date();
    future.setDate(future.getDate() + 3);
    const futureStr = future.toISOString().split('T')[0];
    assert.strictEqual(getReviewPriority(futureStr, 3), 'low');
  });
});

describe('updateAfterReview', () => {
  const mockItem = {
    id: 'learn_123',
    content: { title: '테스트' },
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

  it('confidence가 업데이트되어야 함', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.confidence, 4);
  });

  it('reviewCount가 증가해야 함', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.reviewCount, 3);
  });

  it('성공(confidence >= 3)하면 streak 증가', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.spaceRep.streak, 2);
  });

  it('실패(confidence < 3)하면 streak 리셋', () => {
    const updated = updateAfterReview(mockItem, 2);
    assert.strictEqual(updated.spaceRep.streak, 0);
  });

  it('confidence 5가 3연속이면 mastered', () => {
    const itemWithStreak = {
      ...mockItem,
      spaceRep: { ...mockItem.spaceRep, streak: 2 }
    };
    const updated = updateAfterReview(itemWithStreak, 5);
    assert.strictEqual(updated.meta.status, 'mastered');
  });

  it('history에 복습 기록 추가', () => {
    const updated = updateAfterReview(mockItem, 4);
    assert.strictEqual(updated.history.length, 1);
    assert.strictEqual(updated.history[0].confidenceAfter, 4);
    assert.strictEqual(updated.history[0].correct, true);
  });

  it('lastReview가 오늘로 업데이트', () => {
    const updated = updateAfterReview(mockItem, 4);
    const today = new Date().toISOString().split('T')[0];
    assert.strictEqual(updated.spaceRep.lastReview, today);
  });
});

describe('BASE_INTERVALS', () => {
  it('모든 confidence 레벨에 대한 간격이 정의되어야 함', () => {
    for (let i = 1; i <= 5; i++) {
      assert.ok(BASE_INTERVALS[i] !== undefined, `confidence ${i}에 대한 간격이 없음`);
      assert.ok(typeof BASE_INTERVALS[i] === 'number', `confidence ${i}의 간격이 숫자가 아님`);
    }
  });

  it('간격이 confidence에 따라 증가해야 함', () => {
    let prevInterval = 0;
    for (let i = 1; i <= 5; i++) {
      assert.ok(BASE_INTERVALS[i] > prevInterval, `confidence ${i}의 간격이 이전보다 크지 않음`);
      prevInterval = BASE_INTERVALS[i];
    }
  });
});
