/**
 * Glean Pattern Matcher
 * 에러/실수 패턴 유사도 매칭 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const GLEAN_DIR = join(homedir(), '.glean');
const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');

/**
 * 문자열을 토큰으로 분리해요
 * @param {string} str
 * @returns {string[]}
 */
export function tokenize(str) {
  if (!str || typeof str !== 'string') return [];

  return str
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1);
}

/**
 * 두 문자열의 Jaccard 유사도를 계산해요
 * @param {string} str1
 * @param {string} str2
 * @returns {number} 0~1 사이의 유사도
 */
export function calculateSimilarity(str1, str2) {
  const tokens1 = tokenize(str1);
  const tokens2 = tokenize(str2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersectionSize = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersectionSize++;
    }
  }

  const unionSize = new Set([...tokens1, ...tokens2]).size;

  return unionSize > 0 ? intersectionSize / unionSize : 0;
}

/**
 * 저장된 인사이트에서 유사한 패턴을 찾아요
 * @param {string} pattern - 검색할 에러 메시지나 패턴
 * @param {object} options
 * @param {number} options.threshold - 최소 유사도 (기본: 0.3)
 * @param {number} options.limit - 최대 결과 수 (기본: 5)
 * @param {string[]} options.types - 인사이트 타입 필터 (기본: ['mistake', 'pattern'])
 * @returns {object[]} 유사한 인사이트 배열
 */
export function findSimilarPatterns(pattern, options = {}) {
  const {
    threshold = 0.3,
    limit = 5,
    types = ['mistake', 'pattern']
  } = options;

  if (!existsSync(INSIGHTS_DIR)) return [];

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const matches = [];

  for (const file of files) {
    try {
      const filepath = join(INSIGHTS_DIR, file);
      const insight = JSON.parse(readFileSync(filepath, 'utf-8'));

      if (types.length > 0 && !types.includes(insight.type)) continue;

      const contentToMatch = [
        insight.title,
        insight.content,
        insight.context?.error,
        insight.context?.description
      ].filter(Boolean).join(' ');

      const similarity = calculateSimilarity(pattern, contentToMatch);

      if (similarity >= threshold) {
        matches.push({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          content: insight.content,
          solution: insight.solution || insight.learning?.solution,
          similarity,
          project: insight.context?.project,
          createdAt: insight.meta?.createdAt
        });
      }
    } catch {
      // 파싱 에러는 무시
    }
  }

  return matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/**
 * 유사 패턴을 보기 좋게 포맷해요
 * @param {object[]} matches
 * @returns {string}
 */
export function formatSimilarPatterns(matches) {
  if (matches.length === 0) {
    return '';
  }

  const lines = ['🔍 **이전에 비슷한 상황이 있었어요!**\n'];

  for (const match of matches) {
    const percent = Math.round(match.similarity * 100);
    lines.push(`### ${match.title} (${percent}% 유사)`);

    if (match.content) {
      lines.push(`> ${match.content}`);
    }

    if (match.solution) {
      lines.push(`\n**해결 방법:** ${match.solution}`);
    }

    if (match.project) {
      lines.push(`\n_프로젝트: ${match.project}_`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export default {
  tokenize,
  calculateSimilarity,
  findSimilarPatterns,
  formatSimilarPatterns
};
