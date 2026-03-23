/**
 * Glean Session Linker
 * 크로스세션 지식 연결 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { HARVESTS_DIR, INSIGHTS_DIR, DAILY_DIR } from './paths.js';
import { tokenize, calculateSimilarity } from './pattern-matcher.js';

/**
 * 현재 프로젝트/파일 기반으로 이전 세션의 관련 지식을 찾아요
 * @param {object} context
 * @param {string} context.project - 현재 프로젝트
 * @param {string[]} context.files - 현재 작업 파일 목록
 * @param {string[]} context.topics - 현재 작업 주제
 * @param {object} options
 * @param {number} options.limit - 최대 결과 수 (기본: 5)
 * @param {number} options.daysBack - 검색 범위 일수 (기본: 30)
 * @returns {object[]}
 */
export function findRelatedSessions(context, options = {}) {
  const { limit = 5, daysBack = 30 } = options;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const results = [];

  // 수확 데이터에서 관련 세션 검색
  const harvests = findRelatedHarvests(context, cutoff);
  results.push(...harvests);

  // 인사이트에서 관련 항목 검색
  const insights = findRelatedInsights(context, cutoff);
  results.push(...insights);

  // 일일 배움에서 관련 항목 검색
  const daily = findRelatedDaily(context, cutoff);
  results.push(...daily);

  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

function findRelatedHarvests(context, cutoff) {
  if (!existsSync(HARVESTS_DIR)) return [];

  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];
  const contextStr = buildContextString(context);

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(HARVESTS_DIR, file), 'utf-8'));
      const savedAt = new Date(data.meta?.savedAt || data.timestamp);

      if (savedAt < cutoff) continue;

      let relevance = 0;

      // 같은 프로젝트면 기본 점수
      if (data.session?.project === context.project) {
        relevance += 0.4;
      }

      // 파일 겹침 확인
      const harvestFiles = (data.changes?.files || []).map(f => f.path || f);
      const fileOverlap = countOverlap(context.files || [], harvestFiles);
      relevance += Math.min(fileOverlap * 0.15, 0.3);

      // 내용 유사도
      const content = [
        data.summary?.description,
        ...(data.insights || []).map(i => i.title)
      ].filter(Boolean).join(' ');
      relevance += calculateSimilarity(contextStr, content) * 0.3;

      if (relevance > 0.2) {
        results.push({
          source: 'harvest',
          id: data.id,
          title: data.summary?.description || data.id,
          project: data.session?.project,
          date: data.meta?.savedAt || data.timestamp,
          sharedFiles: fileOverlap,
          relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

function findRelatedInsights(context, cutoff) {
  if (!existsSync(INSIGHTS_DIR)) return [];

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];
  const contextStr = buildContextString(context);

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(INSIGHTS_DIR, file), 'utf-8'));
      const createdAt = new Date(data.meta?.createdAt);

      if (createdAt < cutoff) continue;

      let relevance = 0;

      if (data.context?.project === context.project) {
        relevance += 0.4;
      }

      const content = [data.title, data.content, ...(data.meta?.tags || [])]
        .filter(Boolean).join(' ');
      relevance += calculateSimilarity(contextStr, content) * 0.6;

      if (relevance > 0.2) {
        results.push({
          source: 'insight',
          id: data.id,
          title: data.title,
          type: data.type,
          project: data.context?.project,
          date: data.meta?.createdAt,
          relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

function findRelatedDaily(context, cutoff) {
  if (!existsSync(DAILY_DIR)) return [];

  const files = readdirSync(DAILY_DIR).filter(f => f.endsWith('.json'));
  const results = [];
  const contextStr = buildContextString(context);

  for (const file of files) {
    const dateStr = file.replace('.json', '');
    if (new Date(dateStr) < cutoff) continue;

    try {
      const data = JSON.parse(readFileSync(join(DAILY_DIR, file), 'utf-8'));

      for (const learning of data.learnings || []) {
        let relevance = 0;

        if (learning.project === context.project) {
          relevance += 0.4;
        }

        relevance += calculateSimilarity(contextStr, learning.content) * 0.6;

        if (relevance > 0.2) {
          results.push({
            source: 'daily',
            id: learning.id,
            title: learning.content?.substring(0, 80),
            project: learning.project,
            date: dateStr,
            relevance
          });
        }
      }
    } catch { /* skip */ }
  }

  return results;
}

function buildContextString(context) {
  const parts = [context.project];
  if (context.files) parts.push(...context.files);
  if (context.topics) parts.push(...context.topics);
  return parts.filter(Boolean).join(' ');
}

function countOverlap(arr1, arr2) {
  const set2 = new Set(arr2.map(f => f.split('/').pop()));
  let count = 0;
  for (const item of arr1) {
    if (set2.has(item.split('/').pop())) count++;
  }
  return count;
}

/**
 * 크로스세션 연결 결과를 포맷해요
 * @param {object[]} links
 * @returns {string}
 */
export function formatSessionLinks(links) {
  if (links.length === 0) {
    return '';
  }

  const sourceIcon = {
    harvest: '🌾',
    insight: '💡',
    daily: '📝'
  };

  const lines = ['🔗 **이전 세션에서 관련 내용이 있어요!**\n'];

  for (const link of links) {
    const icon = sourceIcon[link.source] || '•';
    const date = link.date?.split('T')[0] || '';
    lines.push(`${icon} **${link.title}**`);

    const meta = [];
    if (date) meta.push(date);
    if (link.project) meta.push(link.project);
    if (link.sharedFiles) meta.push(`파일 ${link.sharedFiles}개 겹침`);

    if (meta.length > 0) {
      lines.push(`  _${meta.join(' | ')}_`);
    }
  }

  return lines.join('\n');
}

export default {
  findRelatedSessions,
  formatSessionLinks
};
