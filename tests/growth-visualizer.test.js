/**
 * Growth Visualizer 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateProgressBar,
  getGrowthData,
  formatGrowthDisplay,
  generateWeeklyChart,
  getQuickStats
} from '../lib/growth-visualizer.js';

describe('generateProgressBar', () => {
  it('0%일 때 모두 빈 문자로 채워요', () => {
    const result = generateProgressBar(0, 10);
    assert.strictEqual(result, '░░░░░░░░░░');
  });

  it('100%일 때 모두 채운 문자로 채워요', () => {
    const result = generateProgressBar(100, 10);
    assert.strictEqual(result, '██████████');
  });

  it('50%일 때 절반만 채워요', () => {
    const result = generateProgressBar(50, 10);
    assert.strictEqual(result, '█████░░░░░');
  });

  it('기본 너비가 20이에요', () => {
    const result = generateProgressBar(50);
    assert.strictEqual(result.length, 20);
  });

  it('커스텀 문자를 사용할 수 있어요', () => {
    const result = generateProgressBar(50, 4, { filled: '#', empty: '-' });
    assert.strictEqual(result, '##--');
  });

  it('100%를 초과해도 100%로 처리해요', () => {
    const result = generateProgressBar(150, 10);
    assert.strictEqual(result, '██████████');
  });

  it('음수도 0%로 처리해요', () => {
    const result = generateProgressBar(-10, 10);
    assert.strictEqual(result, '░░░░░░░░░░');
  });
});

describe('getGrowthData', () => {
  it('객체를 반환해요', () => {
    const result = getGrowthData();
    assert.strictEqual(typeof result, 'object');
  });

  it('period 필드가 있어요', () => {
    const result = getGrowthData('week');
    assert.strictEqual(result.period, 'week');
  });

  it('startDate와 endDate가 있어요', () => {
    const result = getGrowthData();
    assert.match(result.startDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(result.endDate, /^\d{4}-\d{2}-\d{2}$/);
  });

  it('learnings 데이터가 있어요', () => {
    const result = getGrowthData();
    assert.ok('total' in result.learnings);
    assert.ok('new' in result.learnings);
    assert.ok('reviewed' in result.learnings);
    assert.ok('mastered' in result.learnings);
  });

  it('insights 데이터가 있어요', () => {
    const result = getGrowthData();
    assert.ok('total' in result.insights);
    assert.ok('new' in result.insights);
  });

  it('daily 데이터가 있어요', () => {
    const result = getGrowthData();
    assert.ok('total' in result.daily);
    assert.ok('days' in result.daily);
  });

  it('streaks 데이터가 있어요', () => {
    const result = getGrowthData();
    assert.ok('current' in result.streaks);
    assert.ok('longest' in result.streaks);
  });

  it('summary가 계산되어요', () => {
    const result = getGrowthData();
    assert.ok('totalKnowledge' in result.summary);
    assert.ok('masteryRate' in result.summary);
  });

  it('week 기간이 작동해요', () => {
    const result = getGrowthData('week');
    const start = new Date(result.startDate);
    const end = new Date(result.endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    assert.ok(diffDays >= 6 && diffDays <= 8);
  });

  it('month 기간이 작동해요', () => {
    const result = getGrowthData('month');
    const start = new Date(result.startDate);
    const end = new Date(result.endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    assert.ok(diffDays >= 28 && diffDays <= 32);
  });

  it('quarter 기간이 작동해요', () => {
    const result = getGrowthData('quarter');
    assert.strictEqual(result.period, 'quarter');
  });

  it('year 기간이 작동해요', () => {
    const result = getGrowthData('year');
    assert.strictEqual(result.period, 'year');
  });
});

describe('formatGrowthDisplay', () => {
  it('문자열을 반환해요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.strictEqual(typeof result, 'string');
  });

  it('헤더를 포함해요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('성장 현황'));
  });

  it('요약 섹션이 있어요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('요약'));
  });

  it('학습 항목 섹션이 있어요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('학습 항목'));
  });

  it('인사이트 섹션이 있어요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('인사이트'));
  });

  it('연속 기록 섹션이 있어요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('연속 기록'));
  });

  it('프로그레스 바가 포함되어요', () => {
    const data = getGrowthData();
    const result = formatGrowthDisplay(data);
    assert.ok(result.includes('█') || result.includes('░'));
  });
});

describe('generateWeeklyChart', () => {
  it('7개의 바로 구성된 문자열을 반환해요', () => {
    const values = [1, 2, 3, 4, 5, 6, 7];
    const result = generateWeeklyChart(values);
    assert.strictEqual(result.length, 7);
  });

  it('모두 0이면 가장 낮은 바를 반환해요', () => {
    const values = [0, 0, 0, 0, 0, 0, 0];
    const result = generateWeeklyChart(values);
    assert.ok(result.includes('▁'));
  });

  it('최댓값에 가장 높은 바를 사용해요', () => {
    const values = [1, 1, 1, 10, 1, 1, 1];
    const result = generateWeeklyChart(values);
    assert.ok(result.includes('█'));
  });
});

describe('getQuickStats', () => {
  it('간단한 통계를 반환해요', () => {
    const result = getQuickStats();

    assert.ok('totalKnowledge' in result);
    assert.ok('weeklyNew' in result);
    assert.ok('masteryRate' in result);
    assert.ok('streak' in result);
  });

  it('모든 값이 숫자여요', () => {
    const result = getQuickStats();

    assert.strictEqual(typeof result.totalKnowledge, 'number');
    assert.strictEqual(typeof result.weeklyNew, 'number');
    assert.strictEqual(typeof result.masteryRate, 'number');
    assert.strictEqual(typeof result.streak, 'number');
  });
});
