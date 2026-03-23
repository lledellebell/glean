import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createPlan, getActivePlan, comparePlanWithResults, getRecentPlans, formatComparison } from '../lib/plan-store.js';

describe('createPlan', () => {
  it('creates a plan', () => {
    const plan = createPlan({ intentions: ['Learn React', 'Learn TS'], project: 'test' });
    assert.ok(plan.id.startsWith('plan-'));
    assert.strictEqual(plan.intentions.length, 2);
    assert.strictEqual(plan.status, 'active');
  });

  it('sets pending status on each intention', () => {
    const plan = createPlan({ intentions: ['A', 'B'] });
    for (const i of plan.intentions) {
      assert.strictEqual(i.status, 'pending');
      assert.ok(Array.isArray(i.matchedLearnings));
    }
  });

  it('handles empty intentions', () => {
    assert.strictEqual(createPlan({ intentions: [] }).intentions.length, 0);
  });
});

describe('getActivePlan', () => {
  it('returns active plan or null', () => {
    createPlan({ intentions: ['test'], project: 'active-test' });
    const plan = getActivePlan('active-test');
    assert.ok(plan === null || plan.status === 'active');
  });

  it('project filter works', () => {
    assert.strictEqual(getActivePlan('nonexistent-12345'), null);
  });
});

describe('comparePlanWithResults', () => {
  it('compares plan with results', () => {
    const plan = createPlan({ intentions: ['React hooks', 'CSS Grid'], project: 'cmp' });
    const result = comparePlanWithResults(plan.id, [
      { id: 'l1', title: 'React hooks useEffect', content: 'cleanup' }
    ]);
    assert.ok(result);
    assert.strictEqual(result.planned, 2);
    assert.ok(typeof result.achieved === 'number');
  });

  it('returns null for nonexistent plan', () => {
    assert.strictEqual(comparePlanWithResults('nonexistent', []), null);
  });
});

describe('getRecentPlans', () => {
  it('returns array', () => { assert.ok(Array.isArray(getRecentPlans())); });
  it('respects limit', () => { assert.ok(getRecentPlans(2).length <= 2); });
});

describe('formatComparison', () => {
  it('returns message for null', () => {
    assert.ok(formatComparison(null).includes('No plan'));
  });

  it('formats comparison', () => {
    const text = formatComparison({
      planned: 3, achieved: 2, missed: ['CSS'],
      unexpected: ['Tailwind'],
      matches: [{ intention: 'React', learning: 'hooks' }, { intention: 'TS', learning: 'types' }]
    });
    assert.ok(text.includes('67%'));
    assert.ok(text.includes('Achieved'));
    assert.ok(text.includes('Missed'));
  });
});
