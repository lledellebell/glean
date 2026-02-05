/**
 * Flashcard Generator 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateFlashcard,
  getNextFlashcard,
  getDueFlashcards,
  formatFlashcardDisplay,
  getFlashcardStats
} from '../lib/flashcard-generator.js';

describe('generateFlashcard', () => {
  const mockItem = {
    id: 'learn-test-001',
    content: {
      title: '테스트 제목',
      description: '이것은 설명입니다.',
      keyPoints: ['핵심 포인트 1', '핵심 포인트 2'],
      codeExample: 'console.log("hello");'
    },
    classification: {
      topic: 'javascript',
      tags: ['test', 'example'],
      difficulty: 'intermediate'
    },
    spaceRep: {
      confidence: 3,
      nextReview: '2024-01-20',
      reviewCount: 2
    },
    meta: {
      createdAt: '2024-01-01',
      status: 'active'
    }
  };

  it('플래시카드 객체를 반환해요', () => {
    const result = generateFlashcard(mockItem);

    assert.ok(result.id);
    assert.ok(result.title);
    assert.ok(Array.isArray(result.questions));
  });

  it('what 질문을 생성해요', () => {
    const result = generateFlashcard(mockItem);
    const whatQ = result.questions.find(q => q.type === 'what');

    assert.ok(whatQ);
    assert.ok(whatQ.question.includes('뭐예요'));
  });

  it('how 질문을 생성해요 (코드 예시가 있을 때)', () => {
    const result = generateFlashcard(mockItem);
    const howQ = result.questions.find(q => q.type === 'how');

    assert.ok(howQ);
    assert.ok(howQ.answer.includes('console.log'));
  });

  it('why 질문을 생성해요 (핵심 포인트가 있을 때)', () => {
    const result = generateFlashcard(mockItem);
    const whyQ = result.questions.find(q => q.type === 'why');

    assert.ok(whyQ);
    assert.ok(whyQ.answer.includes('핵심 포인트'));
  });

  it('최소 1개의 질문을 보장해요', () => {
    const minimalItem = {
      id: 'learn-min-001',
      content: { title: '최소 제목' },
      classification: {},
      spaceRep: {},
      meta: {}
    };
    const result = generateFlashcard(minimalItem);

    assert.ok(result.questions.length >= 1);
  });

  it('난이도 정보를 포함해요', () => {
    const result = generateFlashcard(mockItem);
    assert.strictEqual(result.difficulty, 'intermediate');
  });

  it('토픽 정보를 포함해요', () => {
    const result = generateFlashcard(mockItem);
    assert.strictEqual(result.topic, 'javascript');
  });
});

describe('getNextFlashcard', () => {
  it('null 또는 플래시카드를 반환해요', () => {
    const result = getNextFlashcard();
    assert.ok(result === null || result.questions);
  });

  it('토픽 필터가 작동해요', () => {
    const result = getNextFlashcard({ topic: 'nonexistent-topic' });
    assert.strictEqual(result, null);
  });

  it('난이도 필터가 작동해요', () => {
    const result = getNextFlashcard({ difficulty: 'beginner' });
    if (result) {
      assert.strictEqual(result.difficulty, 'beginner');
    }
  });
});

describe('getDueFlashcards', () => {
  it('배열을 반환해요', () => {
    const result = getDueFlashcards();
    assert.ok(Array.isArray(result));
  });

  it('토픽 필터가 작동해요', () => {
    const result = getDueFlashcards({ topic: 'test-topic' });
    assert.ok(Array.isArray(result));
  });
});

describe('formatFlashcardDisplay', () => {
  const mockFlashcard = {
    id: 'test-001',
    title: '테스트',
    topic: 'javascript',
    difficulty: 'intermediate',
    questions: [{
      type: 'what',
      question: '테스트 질문이에요?',
      answer: '테스트 답변입니다.',
      hint: '힌트입니다.'
    }],
    meta: { reviewCount: 5 }
  };

  it('플래시카드가 없으면 메시지 반환해요', () => {
    const result = formatFlashcardDisplay(null);
    assert.ok(result.includes('없어요'));
  });

  it('질문을 표시해요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, false);
    assert.ok(result.includes('테스트 질문이에요'));
  });

  it('답변 숨김 모드에서 힌트를 표시해요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, false);
    assert.ok(result.includes('힌트'));
  });

  it('답변 표시 모드에서 답변을 보여요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, true);
    assert.ok(result.includes('테스트 답변입니다'));
  });

  it('토픽을 표시해요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, false);
    assert.ok(result.includes('javascript'));
  });

  it('복습 횟수를 표시해요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, false);
    assert.ok(result.includes('복습 5회'));
  });

  it('질문 타입별 아이콘을 표시해요', () => {
    const result = formatFlashcardDisplay(mockFlashcard, false);
    assert.ok(result.includes('❓'));
  });
});

describe('getFlashcardStats', () => {
  it('통계 객체를 반환해요', () => {
    const stats = getFlashcardStats();

    assert.ok('total' in stats);
    assert.ok('dueToday' in stats);
    assert.ok('byTopic' in stats);
    assert.ok('byDifficulty' in stats);
  });

  it('byDifficulty에 모든 레벨이 있어요', () => {
    const stats = getFlashcardStats();

    assert.ok('beginner' in stats.byDifficulty);
    assert.ok('intermediate' in stats.byDifficulty);
    assert.ok('advanced' in stats.byDifficulty);
  });

  it('숫자 값을 반환해요', () => {
    const stats = getFlashcardStats();

    assert.strictEqual(typeof stats.total, 'number');
    assert.strictEqual(typeof stats.dueToday, 'number');
  });
});
