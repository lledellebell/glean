import { describe, it } from 'node:test';
import assert from 'node:assert';
import { searchAll, formatSearchResults } from '../lib/knowledge-search.js';

describe('searchAll', () => {
  it('returns an array', () => {
    assert.ok(Array.isArray(searchAll('test query')));
  });

  it('respects limit option', () => {
    assert.ok(searchAll('test', { limit: 3 }).length <= 3);
  });

  it('filters by source', () => {
    for (const r of searchAll('test', { sources: ['insights'] })) {
      assert.strictEqual(r.source, 'insight');
    }
  });

  it('results have required fields', () => {
    for (const r of searchAll('test')) {
      assert.ok(r.source);
      assert.ok(typeof r.relevance === 'number');
    }
  });

  it('sorted by relevance descending', () => {
    const results = searchAll('test');
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].relevance >= results[i].relevance);
    }
  });

  it('handles empty query', () => {
    assert.ok(Array.isArray(searchAll('')));
  });
});

describe('formatSearchResults', () => {
  it('returns message for empty results', () => {
    assert.ok(formatSearchResults([]).includes('No results'));
  });

  it('formats results', () => {
    const text = formatSearchResults([{
      source: 'insight', title: 'Test', content: 'Content',
      relevance: 0.8, project: 'proj', date: '2024-01-15T10:00:00Z', tags: ['t']
    }]);
    assert.ok(text.includes('Test'));
    assert.ok(text.includes('80%'));
  });

  it('shows source icons', () => {
    const text = formatSearchResults([
      { source: 'insight', title: 'A', relevance: 0.5, tags: [] },
      { source: 'learn', title: 'B', relevance: 0.4, tags: [] },
      { source: 'harvest', title: 'C', relevance: 0.3, tags: [] }
    ]);
    assert.ok(text.includes('💡'));
    assert.ok(text.includes('📚'));
    assert.ok(text.includes('🌾'));
  });
});
