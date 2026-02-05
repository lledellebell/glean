/**
 * Pattern Matcher 테스트
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  tokenize,
  calculateSimilarity,
  findSimilarPatterns,
  formatSimilarPatterns
} from '../lib/pattern-matcher.js';

describe('tokenize', () => {
  it('문자열을 공백으로 분리해요', () => {
    const result = tokenize('hello world test');
    assert.deepStrictEqual(result, ['hello', 'world', 'test']);
  });

  it('특수문자를 제거해요', () => {
    const result = tokenize('error: cannot find module');
    assert.deepStrictEqual(result, ['error', 'cannot', 'find', 'module']);
  });

  it('대문자를 소문자로 변환해요', () => {
    const result = tokenize('Error Message');
    assert.deepStrictEqual(result, ['error', 'message']);
  });

  it('한글을 처리해요', () => {
    const result = tokenize('에러 메시지 테스트');
    assert.deepStrictEqual(result, ['에러', '메시지', '테스트']);
  });

  it('1글자 토큰은 제거해요', () => {
    const result = tokenize('a big test');
    assert.deepStrictEqual(result, ['big', 'test']);
  });

  it('빈 문자열은 빈 배열 반환해요', () => {
    const result = tokenize('');
    assert.deepStrictEqual(result, []);
  });

  it('null/undefined는 빈 배열 반환해요', () => {
    assert.deepStrictEqual(tokenize(null), []);
    assert.deepStrictEqual(tokenize(undefined), []);
  });
});

describe('calculateSimilarity', () => {
  it('동일한 문자열은 1.0 반환해요', () => {
    const result = calculateSimilarity('hello world', 'hello world');
    assert.strictEqual(result, 1);
  });

  it('완전히 다른 문자열은 0 반환해요', () => {
    const result = calculateSimilarity('apple banana', 'cat dog');
    assert.strictEqual(result, 0);
  });

  it('부분적으로 일치하면 0~1 사이 값 반환해요', () => {
    const result = calculateSimilarity('hello world', 'hello test');
    assert.ok(result > 0 && result < 1);
  });

  it('순서가 달라도 유사도 계산해요', () => {
    const result = calculateSimilarity('world hello', 'hello world');
    assert.strictEqual(result, 1);
  });

  it('빈 문자열은 0 반환해요', () => {
    assert.strictEqual(calculateSimilarity('', 'hello'), 0);
    assert.strictEqual(calculateSimilarity('hello', ''), 0);
  });

  it('유사한 에러 메시지를 감지해요', () => {
    const error1 = 'Cannot find module express';
    const error2 = 'Cannot find module lodash';
    const result = calculateSimilarity(error1, error2);
    assert.ok(result > 0.5);
  });
});

describe('findSimilarPatterns', () => {
  it('인사이트 디렉토리가 없으면 빈 배열 반환해요', () => {
    const result = findSimilarPatterns('test error');
    assert.ok(Array.isArray(result));
  });

  it('옵션 기본값이 적용되어요', () => {
    const result = findSimilarPatterns('test', {});
    assert.ok(result.length <= 5);
  });

  it('threshold 옵션이 작동해요', () => {
    const result = findSimilarPatterns('test', { threshold: 0.9 });
    for (const match of result) {
      assert.ok(match.similarity >= 0.9);
    }
  });

  it('limit 옵션이 작동해요', () => {
    const result = findSimilarPatterns('test', { limit: 2 });
    assert.ok(result.length <= 2);
  });
});

describe('formatSimilarPatterns', () => {
  it('빈 배열은 빈 문자열 반환해요', () => {
    const result = formatSimilarPatterns([]);
    assert.strictEqual(result, '');
  });

  it('매치 결과를 포맷해요', () => {
    const matches = [{
      title: '테스트 에러',
      content: '에러 설명',
      similarity: 0.8,
      solution: '해결 방법'
    }];
    const result = formatSimilarPatterns(matches);

    assert.ok(result.includes('테스트 에러'));
    assert.ok(result.includes('80%'));
    assert.ok(result.includes('해결 방법'));
  });

  it('프로젝트 정보를 표시해요', () => {
    const matches = [{
      title: '테스트',
      similarity: 0.5,
      project: 'my-project'
    }];
    const result = formatSimilarPatterns(matches);

    assert.ok(result.includes('my-project'));
  });
});
