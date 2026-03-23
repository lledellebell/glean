/**
 * Session Linker 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findRelatedSessions, formatSessionLinks } from '../lib/session-linker.js';

describe('findRelatedSessions', () => {
  it('배열을 반환해요', () => {
    const results = findRelatedSessions({ project: 'test' });
    assert.ok(Array.isArray(results));
  });

  it('limit 옵션이 적용되어요', () => {
    const results = findRelatedSessions({ project: 'test' }, { limit: 3 });
    assert.ok(results.length <= 3);
  });

  it('결과에 필수 필드가 있어요', () => {
    const results = findRelatedSessions({
      project: 'test',
      files: ['src/index.js'],
      topics: ['react']
    });

    for (const r of results) {
      assert.ok(r.source);
      assert.ok(typeof r.relevance === 'number');
      assert.ok(r.title);
    }
  });

  it('relevance 순으로 정렬되어요', () => {
    const results = findRelatedSessions({ project: 'test' });
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].relevance >= results[i].relevance);
    }
  });

  it('daysBack 옵션이 작동해요', () => {
    const results = findRelatedSessions({ project: 'test' }, { daysBack: 1 });
    assert.ok(Array.isArray(results));
  });
});

describe('formatSessionLinks', () => {
  it('빈 배열은 빈 문자열 반환해요', () => {
    const text = formatSessionLinks([]);
    assert.strictEqual(text, '');
  });

  it('연결 결과를 포맷해요', () => {
    const links = [
      {
        source: 'harvest',
        title: 'API 리팩토링 세션',
        project: 'my-app',
        date: '2024-01-15T10:00:00Z',
        sharedFiles: 3,
        relevance: 0.8
      },
      {
        source: 'insight',
        title: 'Error Handling 패턴',
        project: 'my-app',
        date: '2024-01-14T10:00:00Z',
        relevance: 0.6
      }
    ];

    const text = formatSessionLinks(links);
    assert.ok(text.includes('이전 세션'));
    assert.ok(text.includes('API 리팩토링'));
    assert.ok(text.includes('Error Handling'));
  });

  it('소스별 아이콘을 표시해요', () => {
    const links = [
      { source: 'harvest', title: 'A', relevance: 0.5 },
      { source: 'insight', title: 'B', relevance: 0.4 },
      { source: 'daily', title: 'C', relevance: 0.3 }
    ];

    const text = formatSessionLinks(links);
    assert.ok(text.includes('🌾'));
    assert.ok(text.includes('💡'));
    assert.ok(text.includes('📝'));
  });
});
