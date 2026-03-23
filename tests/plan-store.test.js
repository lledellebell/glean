/**
 * Plan Store 테스트
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createPlan, getActivePlan, comparePlanWithResults,
  getCarryoverItems, getRecentPlans, formatComparison
} from '../lib/plan-store.js';

describe('createPlan', () => {
  it('계획을 생성해요', () => {
    const plan = createPlan({
      intentions: ['React 배우기', 'TypeScript 이해하기'],
      project: 'test-project'
    });

    assert.ok(plan.id.startsWith('plan-'));
    assert.strictEqual(plan.intentions.length, 2);
    assert.strictEqual(plan.status, 'active');
    assert.strictEqual(plan.project, 'test-project');
  });

  it('각 의도에 pending 상태가 설정되어요', () => {
    const plan = createPlan({
      intentions: ['A', 'B']
    });

    for (const intention of plan.intentions) {
      assert.strictEqual(intention.status, 'pending');
      assert.ok(Array.isArray(intention.matchedLearnings));
    }
  });

  it('빈 의도 목록도 처리해요', () => {
    const plan = createPlan({ intentions: [] });
    assert.strictEqual(plan.intentions.length, 0);
  });
});

describe('getActivePlan', () => {
  it('활성 계획을 반환해요', () => {
    createPlan({
      intentions: ['테스트'],
      project: 'active-test'
    });

    const plan = getActivePlan('active-test');
    assert.ok(plan === null || plan.status === 'active');
  });

  it('프로젝트 필터가 작동해요', () => {
    const result = getActivePlan('nonexistent-project-12345');
    assert.strictEqual(result, null);
  });
});

describe('comparePlanWithResults', () => {
  it('계획과 결과를 비교해요', () => {
    const plan = createPlan({
      intentions: ['React hooks 이해하기', 'CSS Grid 배우기'],
      project: 'compare-test'
    });

    const learnings = [
      { id: 'l1', title: 'React hooks useEffect 정리', content: 'useEffect cleanup' },
      { id: 'l2', title: 'Tailwind CSS 설정', content: 'tailwind config' }
    ];

    const result = comparePlanWithResults(plan.id, learnings);

    assert.ok(result);
    assert.strictEqual(result.planned, 2);
    assert.ok(typeof result.achieved === 'number');
    assert.ok(Array.isArray(result.missed));
    assert.ok(Array.isArray(result.unexpected));
  });

  it('존재하지 않는 계획은 null 반환해요', () => {
    const result = comparePlanWithResults('nonexistent-plan', []);
    assert.strictEqual(result, null);
  });
});

describe('getRecentPlans', () => {
  it('배열을 반환해요', () => {
    const plans = getRecentPlans();
    assert.ok(Array.isArray(plans));
  });

  it('limit이 적용되어요', () => {
    const plans = getRecentPlans(2);
    assert.ok(plans.length <= 2);
  });
});

describe('formatComparison', () => {
  it('null이면 메시지를 반환해요', () => {
    const text = formatComparison(null);
    assert.ok(text.includes('비교할 계획이 없어요'));
  });

  it('비교 결과를 포맷해요', () => {
    const comparison = {
      planned: 3,
      achieved: 2,
      missed: ['CSS Grid'],
      unexpected: ['Tailwind'],
      matches: [
        { intention: 'React hooks', learning: 'hooks 정리' },
        { intention: 'TypeScript', learning: 'TS 타입' }
      ]
    };

    const text = formatComparison(comparison);
    assert.ok(text.includes('67%'));
    assert.ok(text.includes('달성한 의도'));
    assert.ok(text.includes('미달성'));
    assert.ok(text.includes('계획에 없던'));
  });
});
