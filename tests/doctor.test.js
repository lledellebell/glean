import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runDiagnosis, formatDiagnosis } from '../lib/doctor.js';

describe('runDiagnosis', () => {
  it('returns diagnosis object', () => {
    const r = runDiagnosis();
    assert.ok(Array.isArray(r.checks));
    assert.ok(r.summary);
    assert.ok(typeof r.healthy === 'boolean');
  });

  it('summary has required fields', () => {
    const { summary } = runDiagnosis();
    assert.ok(typeof summary.total === 'number');
    assert.ok(typeof summary.passed === 'number');
    assert.ok(typeof summary.warnings === 'number');
    assert.ok(typeof summary.errors === 'number');
  });

  it('each check has name, status, message', () => {
    for (const c of runDiagnosis().checks) {
      assert.ok(c.name);
      assert.ok(['ok', 'warn', 'error'].includes(c.status));
      assert.ok(typeof c.message === 'string');
    }
  });

  it('total equals checks length', () => {
    const r = runDiagnosis();
    assert.strictEqual(r.summary.total, r.checks.length);
  });

  it('passed + warnings + errors = total', () => {
    const { passed, warnings, errors, total } = runDiagnosis().summary;
    assert.strictEqual(passed + warnings + errors, total);
  });
});

describe('formatDiagnosis', () => {
  it('formats diagnosis', () => {
    assert.ok(formatDiagnosis(runDiagnosis()).includes('Glean Doctor'));
  });

  it('shows all clear when healthy', () => {
    const d = { checks: [{ status: 'ok', message: 'OK' }], summary: { total: 1, passed: 1, warnings: 0, errors: 0 }, healthy: true };
    assert.ok(formatDiagnosis(d).includes('All clear'));
  });

  it('shows issues when unhealthy', () => {
    const d = { checks: [{ status: 'error', message: 'FAIL' }], summary: { total: 1, passed: 0, warnings: 0, errors: 1 }, healthy: false };
    assert.ok(formatDiagnosis(d).includes('Issues found'));
  });
});
