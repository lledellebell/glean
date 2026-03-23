/**
 * Doctor 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runDiagnosis, formatDiagnosis } from '../lib/doctor.js';

describe('runDiagnosis', () => {
  it('진단 결과 객체를 반환해요', () => {
    const result = runDiagnosis();

    assert.ok(result.checks);
    assert.ok(Array.isArray(result.checks));
    assert.ok(result.summary);
    assert.ok(typeof result.healthy === 'boolean');
  });

  it('summary에 필수 필드가 있어요', () => {
    const result = runDiagnosis();

    assert.ok(typeof result.summary.total === 'number');
    assert.ok(typeof result.summary.passed === 'number');
    assert.ok(typeof result.summary.warnings === 'number');
    assert.ok(typeof result.summary.errors === 'number');
  });

  it('각 체크에 name, status, message가 있어요', () => {
    const result = runDiagnosis();

    for (const check of result.checks) {
      assert.ok(check.name);
      assert.ok(['ok', 'warn', 'error'].includes(check.status));
      assert.ok(typeof check.message === 'string');
    }
  });

  it('total이 checks 길이와 일치해요', () => {
    const result = runDiagnosis();
    assert.strictEqual(result.summary.total, result.checks.length);
  });

  it('passed + warnings + errors = total이에요', () => {
    const { passed, warnings, errors, total } = runDiagnosis().summary;
    assert.strictEqual(passed + warnings + errors, total);
  });
});

describe('formatDiagnosis', () => {
  it('진단 결과를 포맷해요', () => {
    const diagnosis = runDiagnosis();
    const text = formatDiagnosis(diagnosis);

    assert.ok(text.includes('Glean Doctor'));
    assert.ok(typeof text === 'string');
  });

  it('정상일 때 전체 정상 메시지가 있어요', () => {
    const diagnosis = {
      checks: [{ name: 'test', status: 'ok', message: 'OK' }],
      summary: { total: 1, passed: 1, warnings: 0, errors: 0 },
      healthy: true
    };

    const text = formatDiagnosis(diagnosis);
    assert.ok(text.includes('전체 정상'));
  });

  it('오류 시 문제 발견 메시지가 있어요', () => {
    const diagnosis = {
      checks: [{ name: 'test', status: 'error', message: 'FAIL' }],
      summary: { total: 1, passed: 0, warnings: 0, errors: 1 },
      healthy: false
    };

    const text = formatDiagnosis(diagnosis);
    assert.ok(text.includes('문제 발견'));
  });
});
