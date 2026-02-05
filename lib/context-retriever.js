/**
 * Glean Context Retriever
 * 프로젝트 기반 관련 인사이트 검색 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { tokenize, calculateSimilarity } from './pattern-matcher.js';

const GLEAN_DIR = join(homedir(), '.glean');
const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');
const LEARN_DIR = join(GLEAN_DIR, 'learn');
const DAILY_DIR = join(GLEAN_DIR, 'daily');

/**
 * 프로젝트와 파일 기반으로 관련 학습 항목을 검색해요
 * @param {string} project - 프로젝트 이름
 * @param {string[]} files - 현재 작업 중인 파일 목록
 * @param {object} options
 * @param {number} options.limit - 최대 결과 수 (기본: 5)
 * @param {boolean} options.includeInsights - 인사이트 포함 여부 (기본: true)
 * @param {boolean} options.includeLearnings - 학습 항목 포함 여부 (기본: true)
 * @param {boolean} options.includeDaily - 일일 배움 포함 여부 (기본: true)
 * @returns {object[]}
 */
export function getRelevantLearnings(project, files = [], options = {}) {
  const {
    limit = 5,
    includeInsights = true,
    includeLearnings = true,
    includeDaily = true
  } = options;

  const results = [];

  // 파일명에서 키워드 추출
  const fileKeywords = extractFileKeywords(files);

  if (includeInsights) {
    const insights = searchInsightsByContext(project, fileKeywords);
    results.push(...insights.map(i => ({ ...i, source: 'insight' })));
  }

  if (includeLearnings) {
    const learnings = searchLearnItemsByContext(project, fileKeywords);
    results.push(...learnings.map(l => ({ ...l, source: 'learning' })));
  }

  if (includeDaily) {
    const daily = searchDailyByContext(project, fileKeywords);
    results.push(...daily.map(d => ({ ...d, source: 'daily' })));
  }

  // relevance 점수로 정렬
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

/**
 * 파일 경로에서 키워드를 추출해요
 * @param {string[]} files
 * @returns {string[]}
 */
function extractFileKeywords(files) {
  const keywords = [];

  for (const file of files) {
    const name = basename(file);
    // 확장자 제거 후 토큰화
    const nameWithoutExt = name.replace(/\.[^.]+$/, '');
    const tokens = tokenize(nameWithoutExt);
    keywords.push(...tokens);

    // 경로에서 의미있는 디렉토리명 추출
    const parts = file.split('/').filter(p => p && !p.startsWith('.'));
    for (const part of parts) {
      if (!['src', 'lib', 'test', 'tests', 'node_modules'].includes(part)) {
        keywords.push(...tokenize(part));
      }
    }
  }

  return [...new Set(keywords)];
}

/**
 * 인사이트에서 컨텍스트 기반 검색해요
 */
function searchInsightsByContext(project, keywords) {
  if (!existsSync(INSIGHTS_DIR)) return [];

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];

  for (const file of files) {
    try {
      const filepath = join(INSIGHTS_DIR, file);
      const insight = JSON.parse(readFileSync(filepath, 'utf-8'));

      let relevance = 0;

      // 프로젝트 일치 시 높은 점수
      if (insight.context?.project === project) {
        relevance += 0.5;
      }

      // 키워드 매칭
      const content = [
        insight.title,
        insight.content,
        ...(insight.meta?.tags || [])
      ].filter(Boolean).join(' ');

      const keywordStr = keywords.join(' ');
      relevance += calculateSimilarity(content, keywordStr) * 0.5;

      if (relevance > 0.1) {
        results.push({
          id: insight.id,
          type: insight.type,
          title: insight.title,
          content: insight.content,
          project: insight.context?.project,
          relevance
        });
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return results;
}

/**
 * 학습 항목에서 컨텍스트 기반 검색해요
 */
function searchLearnItemsByContext(project, keywords) {
  if (!existsSync(LEARN_DIR)) return [];

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  const results = [];

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));

      let relevance = 0;

      // 프로젝트 일치
      if (item.source?.project === project) {
        relevance += 0.5;
      }

      // 키워드 매칭
      const content = [
        item.content?.title,
        item.content?.description,
        item.classification?.topic,
        ...(item.classification?.tags || [])
      ].filter(Boolean).join(' ');

      const keywordStr = keywords.join(' ');
      relevance += calculateSimilarity(content, keywordStr) * 0.5;

      if (relevance > 0.1) {
        results.push({
          id: item.id,
          type: 'learning',
          title: item.content?.title,
          content: item.content?.description,
          project: item.source?.project,
          relevance
        });
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return results;
}

/**
 * 일일 배움에서 컨텍스트 기반 검색해요
 */
function searchDailyByContext(project, keywords) {
  if (!existsSync(DAILY_DIR)) return [];

  const files = readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.json'));

  const results = [];

  // 최근 30일만 검색
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const file of files) {
    const dateStr = file.replace('.json', '');
    const fileDate = new Date(dateStr);

    if (fileDate < thirtyDaysAgo) continue;

    try {
      const filepath = join(DAILY_DIR, file);
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));

      for (const learning of data.learnings || []) {
        let relevance = 0;

        // 프로젝트 일치
        if (learning.project === project) {
          relevance += 0.5;
        }

        // 키워드 매칭
        const keywordStr = keywords.join(' ');
        relevance += calculateSimilarity(learning.content, keywordStr) * 0.5;

        if (relevance > 0.1) {
          results.push({
            id: learning.id,
            type: 'daily',
            title: learning.content.substring(0, 50) + (learning.content.length > 50 ? '...' : ''),
            content: learning.content,
            project: learning.project,
            date: dateStr,
            relevance
          });
        }
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return results;
}

/**
 * 컨텍스트 리뷰를 보기 좋게 포맷해요
 * @param {object[]} learnings
 * @returns {string}
 */
export function formatContextReview(learnings) {
  if (learnings.length === 0) {
    return '';
  }

  const lines = ['📖 **관련 학습 내용이 있어요!**\n'];

  for (const item of learnings) {
    const sourceIcon = {
      insight: '💡',
      learning: '📚',
      daily: '📝'
    }[item.source] || '•';

    lines.push(`${sourceIcon} **${item.title}**`);

    if (item.content && item.content !== item.title) {
      const preview = item.content.substring(0, 100);
      lines.push(`> ${preview}${item.content.length > 100 ? '...' : ''}`);
    }

    const meta = [];
    if (item.project) meta.push(`프로젝트: ${item.project}`);
    if (item.date) meta.push(`날짜: ${item.date}`);

    if (meta.length > 0) {
      lines.push(`_${meta.join(' | ')}_`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

export default {
  getRelevantLearnings,
  formatContextReview
};
