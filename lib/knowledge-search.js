/**
 * Glean Knowledge Search
 * 전체 지식 저장소를 통합 검색하는 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { HARVESTS_DIR, INSIGHTS_DIR, LEARN_DIR, DAILY_DIR } from './paths.js';
import { tokenize, calculateSimilarity } from './pattern-matcher.js';

/**
 * 모든 지식 저장소에서 자연어 검색해요
 * @param {string} query - 검색 쿼리
 * @param {object} options
 * @param {number} options.limit - 최대 결과 수 (기본: 10)
 * @param {string[]} options.sources - 검색 소스 필터 (기본: 전체)
 * @param {number} options.threshold - 최소 유사도 (기본: 0.15)
 * @param {string} options.project - 프로젝트 필터
 * @returns {object[]}
 */
export function searchAll(query, options = {}) {
  const {
    limit = 10,
    sources = ['insights', 'learn', 'daily', 'harvests'],
    threshold = 0.15,
    project
  } = options;

  const results = [];

  if (sources.includes('insights')) {
    results.push(...searchInsights(query, threshold, project));
  }
  if (sources.includes('learn')) {
    results.push(...searchLearnItems(query, threshold, project));
  }
  if (sources.includes('daily')) {
    results.push(...searchDailyLearnings(query, threshold, project));
  }
  if (sources.includes('harvests')) {
    results.push(...searchHarvests(query, threshold, project));
  }

  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

function searchInsights(query, threshold, project) {
  if (!existsSync(INSIGHTS_DIR)) return [];

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(INSIGHTS_DIR, file), 'utf-8'));

      if (project && data.context?.project !== project) continue;

      const content = [
        data.title,
        data.content,
        data.solution,
        ...(data.meta?.tags || [])
      ].filter(Boolean).join(' ');

      const relevance = calculateSimilarity(query, content);
      if (relevance >= threshold) {
        results.push({
          source: 'insight',
          id: data.id,
          title: data.title,
          content: data.content?.substring(0, 200),
          type: data.type,
          project: data.context?.project,
          date: data.meta?.createdAt,
          tags: data.meta?.tags || [],
          relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

function searchLearnItems(query, threshold, project) {
  if (!existsSync(LEARN_DIR)) return [];

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(LEARN_DIR, file), 'utf-8'));

      if (project && data.source?.project !== project) continue;

      const content = [
        data.content?.title,
        data.content?.description,
        data.classification?.topic,
        ...(data.classification?.tags || []),
        ...(data.content?.keyPoints || [])
      ].filter(Boolean).join(' ');

      const relevance = calculateSimilarity(query, content);
      if (relevance >= threshold) {
        results.push({
          source: 'learn',
          id: data.id,
          title: data.content?.title,
          content: data.content?.description?.substring(0, 200),
          type: data.classification?.difficulty,
          project: data.source?.project,
          date: data.meta?.createdAt,
          tags: data.classification?.tags || [],
          relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

function searchDailyLearnings(query, threshold, project) {
  if (!existsSync(DAILY_DIR)) return [];

  const files = readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.json'));

  const results = [];

  for (const file of files) {
    try {
      const dateStr = file.replace('.json', '');
      const data = JSON.parse(readFileSync(join(DAILY_DIR, file), 'utf-8'));

      for (const learning of data.learnings || []) {
        if (project && learning.project !== project) continue;

        const content = [
          learning.content,
          ...(learning.tags || [])
        ].filter(Boolean).join(' ');

        const relevance = calculateSimilarity(query, content);
        if (relevance >= threshold) {
          results.push({
            source: 'daily',
            id: learning.id,
            title: learning.content?.substring(0, 80),
            content: learning.content,
            project: learning.project,
            date: dateStr,
            tags: learning.tags || [],
            relevance
          });
        }
      }
    } catch { /* skip */ }
  }

  return results;
}

function searchHarvests(query, threshold, project) {
  if (!existsSync(HARVESTS_DIR)) return [];

  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(HARVESTS_DIR, file), 'utf-8'));

      if (project && data.session?.project !== project) continue;

      const content = [
        data.summary?.description,
        ...(data.insights || []).map(i => i.title || i.content)
      ].filter(Boolean).join(' ');

      const relevance = calculateSimilarity(query, content);
      if (relevance >= threshold) {
        results.push({
          source: 'harvest',
          id: data.id,
          title: data.summary?.description?.substring(0, 80) || data.id,
          content: data.summary?.description,
          project: data.session?.project,
          date: data.meta?.savedAt || data.timestamp,
          tags: [],
          relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

/**
 * 검색 결과를 보기 좋게 포맷해요
 * @param {object[]} results
 * @returns {string}
 */
export function formatSearchResults(results) {
  if (results.length === 0) {
    return '검색 결과가 없어요.';
  }

  const sourceIcon = {
    insight: '💡',
    learn: '📚',
    daily: '📝',
    harvest: '🌾'
  };

  const lines = [`🔍 **검색 결과** (${results.length}건)\n`];

  for (const item of results) {
    const icon = sourceIcon[item.source] || '•';
    const percent = Math.round(item.relevance * 100);

    lines.push(`${icon} **${item.title}** (${percent}% 관련)`);

    if (item.content && item.content !== item.title) {
      const preview = item.content.substring(0, 120);
      lines.push(`> ${preview}${item.content.length > 120 ? '...' : ''}`);
    }

    const meta = [];
    if (item.project) meta.push(`프로젝트: ${item.project}`);
    if (item.date) meta.push(`날짜: ${item.date.split('T')[0]}`);
    if (item.tags?.length > 0) meta.push(`태그: ${item.tags.join(', ')}`);

    if (meta.length > 0) {
      lines.push(`_${meta.join(' | ')}_`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

export default {
  searchAll,
  formatSearchResults
};
