/**
 * Knowledge Search 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { searchAll, formatSearchResults } from '../lib/knowledge-search.js';

describe('searchAll', () => {
  it('배열을 반환해요', () => {
    const results = searchAll('test query');
    assert.ok(Array.isArray(results));
  });

  it('limit 옵션이 적용되어요', () => {
    const results = searchAll('test', { limit: 3 });
    assert.ok(results.length <= 3);
  });

  it('sources 옵션으로 소스를 필터링해요', () => {
    const results = searchAll('test', { sources: ['insights'] });
    for (const r of results) {
      assert.strictEqual(r.source, 'insight');
    }
  });

  it('결과에 필수 필드가 있어요', () => {
    const results = searchAll('test');
    for (const r of results) {
      assert.ok(r.source);
      assert.ok(typeof r.relevance === 'number');
    }
  });

  it('relevance 순으로 정렬되어요', () => {
    const results = searchAll('test');
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].relevance >= results[i].relevance);
    }
  });

  it('빈 쿼리도 에러 없이 처리해요', () => {
    const results = searchAll('');
    assert.ok(Array.isArray(results));
  });
});

describe('formatSearchResults', () => {
  it('빈 결과는 메시지를 반환해요', () => {
    const text = formatSearchResults([]);
    assert.ok(text.includes('검색 결과가 없어요'));
  });

  it('결과를 포맷해요', () => {
    const results = [{
      source: 'insight',
      title: 'Test Insight',
      content: 'Test content',
      relevance: 0.8,
      project: 'test-project',
      date: '2024-01-15T10:00:00Z',
      tags: ['test']
    }];

    const text = formatSearchResults(results);
    assert.ok(text.includes('Test Insight'));
    assert.ok(text.includes('80%'));
  });

  it('소스별 아이콘을 표시해요', () => {
    const results = [
      { source: 'insight', title: 'A', relevance: 0.5, tags: [] },
      { source: 'learn', title: 'B', relevance: 0.4, tags: [] },
      { source: 'daily', title: 'C', relevance: 0.3, tags: [] },
      { source: 'harvest', title: 'D', relevance: 0.2, tags: [] }
    ];

    const text = formatSearchResults(results);
    assert.ok(text.includes('💡'));
    assert.ok(text.includes('📚'));
    assert.ok(text.includes('📝'));
    assert.ok(text.includes('🌾'));
  });
});
