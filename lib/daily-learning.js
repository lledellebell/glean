/**
 * Glean Daily Learning
 * 오늘의 배움 저장/조회 모듈
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { DAILY_DIR, ensureDir } from './paths.js';

/**
 * 저장소 초기화
 */
export function initializeStore() {
  ensureDir(DAILY_DIR);
}

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환해요
 * @returns {string}
 */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * 특정 날짜의 파일 경로를 반환해요
 * @param {string} date - YYYY-MM-DD
 * @returns {string}
 */
function getDailyFilePath(date) {
  return join(DAILY_DIR, `${date}.json`);
}

/**
 * 특정 날짜의 배움 데이터를 로드해요
 * @param {string} date - YYYY-MM-DD
 * @returns {object}
 */
function loadDailyData(date) {
  const filepath = getDailyFilePath(date);
  if (!existsSync(filepath)) {
    return {
      date,
      learnings: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

/**
 * 오늘의 배움을 저장해요
 * @param {string} content - 배움 내용
 * @param {object} options
 * @param {string} options.project - 프로젝트 이름
 * @param {string[]} options.tags - 태그 배열
 * @param {string} options.sessionId - 세션 ID
 * @returns {object} 저장된 배움 항목
 */
export function saveDailyLearning(content, options = {}) {
  initializeStore();

  const today = getTodayDate();
  const data = loadDailyData(today);
  const now = new Date().toISOString();

  const learning = {
    id: `daily-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    content,
    project: options.project || process.cwd().split('/').pop(),
    tags: options.tags || [],
    sessionId: options.sessionId,
    createdAt: now
  };

  data.learnings.push(learning);
  data.updatedAt = now;

  writeFileSync(getDailyFilePath(today), JSON.stringify(data, null, 2));

  return learning;
}

/**
 * 오늘의 배움 목록을 조회해요
 * @returns {object[]}
 */
export function getTodayLearnings() {
  initializeStore();
  const today = getTodayDate();
  const data = loadDailyData(today);
  return data.learnings;
}

/**
 * 최근 N일간의 배움을 조회해요
 * @param {number} days - 조회할 일수 (기본: 7)
 * @returns {object[]}
 */
export function getRecentLearnings(days = 7) {
  initializeStore();

  const learnings = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const data = loadDailyData(dateStr);
    for (const learning of data.learnings) {
      learnings.push({
        ...learning,
        date: dateStr
      });
    }
  }

  return learnings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * 특정 프로젝트의 배움만 필터링해요
 * @param {string} project
 * @param {number} days
 * @returns {object[]}
 */
export function getLearningsByProject(project, days = 30) {
  const learnings = getRecentLearnings(days);
  return learnings.filter(l => l.project === project);
}

/**
 * 배움 통계를 반환해요
 * @param {number} days
 * @returns {object}
 */
export function getDailyStats(days = 30) {
  initializeStore();

  const learnings = getRecentLearnings(days);
  const byProject = {};
  const byTag = {};
  const byDate = {};

  for (const learning of learnings) {
    // 프로젝트별
    const proj = learning.project || 'unknown';
    byProject[proj] = (byProject[proj] || 0) + 1;

    // 태그별
    for (const tag of learning.tags || []) {
      byTag[tag] = (byTag[tag] || 0) + 1;
    }

    // 날짜별
    byDate[learning.date] = (byDate[learning.date] || 0) + 1;
  }

  return {
    total: learnings.length,
    byProject,
    byTag,
    byDate,
    averagePerDay: days > 0 ? (learnings.length / days).toFixed(1) : 0
  };
}

/**
 * 오늘의 배움을 보기 좋게 포맷해요
 * @returns {string}
 */
export function formatTodayLearnings() {
  const learnings = getTodayLearnings();

  if (learnings.length === 0) {
    return '오늘 저장된 배움이 없어요.';
  }

  const lines = [`📚 **오늘의 배움** (${learnings.length}개)\n`];

  for (let i = 0; i < learnings.length; i++) {
    const learning = learnings[i];
    lines.push(`${i + 1}. ${learning.content}`);
    if (learning.project) {
      lines.push(`   _프로젝트: ${learning.project}_`);
    }
  }

  return lines.join('\n');
}

export default {
  initializeStore,
  getTodayDate,
  saveDailyLearning,
  getTodayLearnings,
  getRecentLearnings,
  getLearningsByProject,
  getDailyStats,
  formatTodayLearnings
};
