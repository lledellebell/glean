import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findRelatedSessions, formatSessionLinks } from '../lib/session-linker.js';

describe('findRelatedSessions', () => {
  it('returns array', () => {
    assert.ok(Array.isArray(findRelatedSessions({ project: 'test' })));
  });

  it('respects limit', () => {
    assert.ok(findRelatedSessions({ project: 'test' }, { limit: 3 }).length <= 3);
  });

  it('results have required fields', () => {
    for (const r of findRelatedSessions({ project: 'test', files: ['a.js'], topics: ['react'] })) {
      assert.ok(r.source);
      assert.ok(typeof r.relevance === 'number');
      assert.ok(r.title);
    }
  });

  it('sorted by relevance', () => {
    const results = findRelatedSessions({ project: 'test' });
    for (let i = 1; i < results.length; i++) {
      assert.ok(results[i - 1].relevance >= results[i].relevance);
    }
  });

  it('daysBack option works', () => {
    assert.ok(Array.isArray(findRelatedSessions({ project: 'test' }, { daysBack: 1 })));
  });
});

describe('formatSessionLinks', () => {
  it('returns empty string for no links', () => {
    assert.strictEqual(formatSessionLinks([]), '');
  });

  it('formats links', () => {
    const text = formatSessionLinks([
      { source: 'harvest', title: 'API session', project: 'app', date: '2024-01-15T10:00:00Z', sharedFiles: 3, relevance: 0.8 },
      { source: 'insight', title: 'Error pattern', project: 'app', date: '2024-01-14T10:00:00Z', relevance: 0.6 }
    ]);
    assert.ok(text.includes('previous sessions'));
    assert.ok(text.includes('API session'));
    assert.ok(text.includes('🌾'));
    assert.ok(text.includes('💡'));
  });
});
