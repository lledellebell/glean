/**
 * Daily Learning 테스트
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

import {
  initializeStore,
  getTodayDate,
  saveDailyLearning,
  getTodayLearnings,
  getRecentLearnings,
  getLearningsByProject,
  getDailyStats,
  formatTodayLearnings
} from '../lib/daily-learning.js';

const GLEAN_DIR = join(homedir(), '.glean');
const DAILY_DIR = join(GLEAN_DIR, 'daily');
const TEST_BACKUP_DIR = join(GLEAN_DIR, 'daily-backup-test');

describe('getTodayDate', () => {
  it('YYYY-MM-DD 형식을 반환해요', () => {
    const result = getTodayDate();
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('오늘 날짜를 반환해요', () => {
    const result = getTodayDate();
    const expected = new Date().toISOString().split('T')[0];
    assert.strictEqual(result, expected);
  });
});

describe('initializeStore', () => {
  it('daily 디렉토리를 생성해요', () => {
    initializeStore();
    assert.ok(existsSync(DAILY_DIR));
  });
});

describe('saveDailyLearning', () => {
  it('배움을 저장하고 객체를 반환해요', () => {
    const result = saveDailyLearning('테스트 배움입니다');

    assert.ok(result.id);
    assert.strictEqual(result.content, '테스트 배움입니다');
    assert.ok(result.createdAt);
  });

  it('프로젝트 옵션을 저장해요', () => {
    const result = saveDailyLearning('배움', { project: 'test-project' });
    assert.strictEqual(result.project, 'test-project');
  });

  it('태그 옵션을 저장해요', () => {
    const result = saveDailyLearning('배움', { tags: ['tag1', 'tag2'] });
    assert.deepStrictEqual(result.tags, ['tag1', 'tag2']);
  });

  it('파일에 저장되어요', () => {
    saveDailyLearning('파일 테스트');
    const today = getTodayDate();
    const filepath = join(DAILY_DIR, `${today}.json`);

    assert.ok(existsSync(filepath));

    const data = JSON.parse(readFileSync(filepath, 'utf-8'));
    const found = data.learnings.some(l => l.content === '파일 테스트');
    assert.ok(found);
  });
});

describe('getTodayLearnings', () => {
  it('오늘 저장된 배움을 반환해요', () => {
    saveDailyLearning('오늘의 배움 1');
    saveDailyLearning('오늘의 배움 2');

    const learnings = getTodayLearnings();

    assert.ok(learnings.length >= 2);
    const found1 = learnings.some(l => l.content === '오늘의 배움 1');
    const found2 = learnings.some(l => l.content === '오늘의 배움 2');
    assert.ok(found1 && found2);
  });

  it('배열을 반환해요', () => {
    const result = getTodayLearnings();
    assert.ok(Array.isArray(result));
  });
});

describe('getRecentLearnings', () => {
  it('기본 7일간의 배움을 반환해요', () => {
    const result = getRecentLearnings();
    assert.ok(Array.isArray(result));
  });

  it('지정한 일수만큼 조회해요', () => {
    const result = getRecentLearnings(3);
    assert.ok(Array.isArray(result));
  });

  it('최신순으로 정렬되어요', () => {
    saveDailyLearning('최근 배움');
    const result = getRecentLearnings(1);

    if (result.length > 1) {
      const first = new Date(result[0].createdAt);
      const second = new Date(result[1].createdAt);
      assert.ok(first >= second);
    }
  });
});

describe('getLearningsByProject', () => {
  it('특정 프로젝트의 배움만 필터링해요', () => {
    saveDailyLearning('프로젝트 A 배움', { project: 'project-a' });
    saveDailyLearning('프로젝트 B 배움', { project: 'project-b' });

    const result = getLearningsByProject('project-a', 1);

    for (const learning of result) {
      assert.strictEqual(learning.project, 'project-a');
    }
  });
});

describe('getDailyStats', () => {
  it('통계 객체를 반환해요', () => {
    const stats = getDailyStats(7);

    assert.ok('total' in stats);
    assert.ok('byProject' in stats);
    assert.ok('byTag' in stats);
    assert.ok('byDate' in stats);
    assert.ok('averagePerDay' in stats);
  });

  it('total이 숫자여야 해요', () => {
    const stats = getDailyStats(7);
    assert.strictEqual(typeof stats.total, 'number');
  });
});

describe('formatTodayLearnings', () => {
  it('포맷된 문자열을 반환해요', () => {
    saveDailyLearning('포맷 테스트 배움');
    const result = formatTodayLearnings();

    assert.ok(typeof result === 'string');
    assert.ok(result.includes('오늘의 배움') || result.includes('배움'));
  });
});
