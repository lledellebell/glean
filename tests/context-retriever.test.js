/**
 * Context Retriever 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getRelevantLearnings,
  formatContextReview
} from '../lib/context-retriever.js';

describe('getRelevantLearnings', () => {
  it('배열을 반환해요', () => {
    const result = getRelevantLearnings('test-project');
    assert.ok(Array.isArray(result));
  });

  it('limit 옵션이 적용되어요', () => {
    const result = getRelevantLearnings('test-project', [], { limit: 3 });
    assert.ok(result.length <= 3);
  });

  it('파일 키워드로 검색해요', () => {
    const result = getRelevantLearnings('test-project', ['src/auth/login.js']);
    assert.ok(Array.isArray(result));
  });

  it('includeInsights 옵션이 작동해요', () => {
    const result = getRelevantLearnings('test', [], {
      includeInsights: true,
      includeLearnings: false,
      includeDaily: false
    });
    assert.ok(Array.isArray(result));
  });

  it('includeLearnings 옵션이 작동해요', () => {
    const result = getRelevantLearnings('test', [], {
      includeInsights: false,
      includeLearnings: true,
      includeDaily: false
    });
    assert.ok(Array.isArray(result));
  });

  it('includeDaily 옵션이 작동해요', () => {
    const result = getRelevantLearnings('test', [], {
      includeInsights: false,
      includeLearnings: false,
      includeDaily: true
    });
    assert.ok(Array.isArray(result));
  });

  it('결과에 source 필드가 있어요', () => {
    const result = getRelevantLearnings('test-project', ['test.js']);

    for (const item of result) {
      assert.ok(['insight', 'learning', 'daily'].includes(item.source));
    }
  });

  it('relevance 점수로 정렬되어요', () => {
    const result = getRelevantLearnings('test-project');

    for (let i = 1; i < result.length; i++) {
      assert.ok(result[i - 1].relevance >= result[i].relevance);
    }
  });
});

describe('formatContextReview', () => {
  it('빈 배열은 빈 문자열 반환해요', () => {
    const result = formatContextReview([]);
    assert.strictEqual(result, '');
  });

  it('학습 내용을 포맷해요', () => {
    const learnings = [{
      source: 'insight',
      title: '테스트 인사이트',
      content: '인사이트 내용',
      project: 'test-project'
    }];
    const result = formatContextReview(learnings);

    assert.ok(result.includes('테스트 인사이트'));
    assert.ok(result.includes('test-project'));
  });

  it('소스별 아이콘을 표시해요', () => {
    const learnings = [
      { source: 'insight', title: '인사이트' },
      { source: 'learning', title: '학습' },
      { source: 'daily', title: '일일' }
    ];
    const result = formatContextReview(learnings);

    assert.ok(result.includes('💡'));
    assert.ok(result.includes('📚'));
    assert.ok(result.includes('📝'));
  });

  it('날짜 정보를 표시해요', () => {
    const learnings = [{
      source: 'daily',
      title: '테스트',
      date: '2024-01-15'
    }];
    const result = formatContextReview(learnings);

    assert.ok(result.includes('2024-01-15'));
  });

  it('긴 내용은 미리보기로 자르기해요', () => {
    const longContent = 'a'.repeat(200);
    const learnings = [{
      source: 'insight',
      title: '테스트',
      content: longContent
    }];
    const result = formatContextReview(learnings);

    assert.ok(result.includes('...'));
    assert.ok(!result.includes('a'.repeat(200)));
  });
});
