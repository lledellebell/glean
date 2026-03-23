/**
 * Claude Code Bridge 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  commitsToHarvestChanges,
  extractInsightsFromPRs,
  initializeConnection
} from '../lib/bridge/claude-code.js';

describe('commitsToHarvestChanges', () => {
  it('커밋 배열을 harvest changes 형식으로 변환해요', () => {
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

  it('빈 배열도 처리해요', () => {
    const result = commitsToHarvestChanges([]);

    assert.ok(result.commits);
    assert.strictEqual(result.commits.length, 0);
  });
});

describe('extractInsightsFromPRs', () => {
  it('PR 목록에서 인사이트를 추출해요', () => {
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

  it('body와 title 모두 없는 PR은 제외해요', () => {
    const prs = [
      { number: 1 },
      { number: 2, title: 'has title', body: '', labels: [], files: [], createdAt: '', author: {} }
    ];

    const result = extractInsightsFromPRs(prs);

    assert.ok(result.length <= 1);
  });

  it('빈 배열을 처리해요', () => {
    const result = extractInsightsFromPRs([]);
    assert.strictEqual(result.length, 0);
  });
});

describe('initializeConnection', () => {
  it('연결 상태 객체를 반환해요', () => {
    const result = initializeConnection();

    assert.ok(typeof result.connected === 'boolean');
    assert.ok(result.capabilities);
    assert.ok(typeof result.capabilities.commits === 'boolean');
    assert.ok(typeof result.capabilities.prs === 'boolean');
    assert.ok(typeof result.capabilities.branches === 'boolean');
    assert.ok(typeof result.message === 'string');
  });

  it('git이 있으면 commits capability가 true여요', () => {
    const result = initializeConnection();

    // git은 테스트 환경에서 대부분 설치되어 있어요
    if (result.connected) {
      assert.strictEqual(result.capabilities.commits, true);
    }
  });
});
