/**
 * Claude Code Bridge tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  commitsToHarvestChanges,
  extractInsightsFromPRs,
  initializeConnection
} from '../lib/bridge/claude-code.js';

describe('commitsToHarvestChanges', () => {
  it('converts commit array to harvest changes format', () => {
    const commits = [
      { hash: 'abc123', message: 'feat: add login', date: '2024-01-15', author: 'dev' },
      { hash: 'def456', message: 'fix: typo', date: '2024-01-15', author: 'dev' }
    ];

    const result = commitsToHarvestChanges(commits);

    assert.ok(result.commits);
    assert.strictEqual(result.commits.length, 2);
    assert.strictEqual(typeof result.totalLinesAdded, 'number');
    assert.strictEqual(typeof result.totalLinesRemoved, 'number');
  });

  it('handles empty array', () => {
    const result = commitsToHarvestChanges([]);

    assert.ok(result.commits);
    assert.strictEqual(result.commits.length, 0);
  });
});

describe('extractInsightsFromPRs', () => {
  it('extracts insights from PR list', () => {
    const prs = [
      {
        number: 1,
        title: 'feat: add auth module',
        body: 'Added JWT authentication',
        labels: [{ name: 'feature' }],
        files: [{ path: 'src/auth.js' }],
        createdAt: '2024-01-15T10:00:00Z',
        author: { login: 'dev' }
      }
    ];

    const result = extractInsightsFromPRs(prs);

    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].type, 'learning');
  });

  it('excludes PRs without body or title', () => {
    const prs = [
      { number: 1 },
      { number: 2, title: 'has title', body: '', labels: [], files: [], createdAt: '', author: {} }
    ];

    const result = extractInsightsFromPRs(prs);

    assert.ok(result.length <= 1);
  });

  it('handles empty array', () => {
    const result = extractInsightsFromPRs([]);
    assert.strictEqual(result.length, 0);
  });
});

describe('initializeConnection', () => {
  it('returns connection status object', () => {
    const result = initializeConnection();

    assert.ok(typeof result.connected === 'boolean');
    assert.ok(result.capabilities);
    assert.ok(typeof result.capabilities.commits === 'boolean');
    assert.ok(typeof result.capabilities.prs === 'boolean');
    assert.ok(typeof result.capabilities.branches === 'boolean');
    assert.ok(typeof result.message === 'string');
  });

  it('commits capability is true when git is available', () => {
    const result = initializeConnection();

    if (result.connected) {
      assert.strictEqual(result.capabilities.commits, true);
    }
  });
});
