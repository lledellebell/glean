/**
 * Glean Learn Store
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { calculateNextReview, isDueToday, generateReviewSchedule, updateAfterReview } from './spaced-repetition.js';

const GLEAN_DIR = join(homedir(), '.glean');
const LEARN_DIR = join(GLEAN_DIR, 'learn');
const INDEX_FILE = join(LEARN_DIR, 'index.json');
const STATS_FILE = join(LEARN_DIR, 'stats.json');

export function initializeStore() {
  if (!existsSync(GLEAN_DIR)) {
    mkdirSync(GLEAN_DIR, { recursive: true });
  }
  if (!existsSync(LEARN_DIR)) {
    mkdirSync(LEARN_DIR, { recursive: true });
  }
  if (!existsSync(INDEX_FILE)) {
    writeFileSync(INDEX_FILE, JSON.stringify({
      totalItems: 0,
      lastUpdated: null,
      dueToday: [],
      byTopic: {},
      byDifficulty: { beginner: 0, intermediate: 0, advanced: 0 },
      byStatus: { active: 0, mastered: 0, archived: 0 }
    }, null, 2));
  }
  if (!existsSync(STATS_FILE)) {
    writeFileSync(STATS_FILE, JSON.stringify({
      totalItems: 0,
      activeItems: 0,
      masteredItems: 0,
      todayReview: { due: 0, completed: 0 },
      byTopic: {},
      currentStreak: 0,
      longestStreak: 0,
      lastReviewDate: null
    }, null, 2));
  }
}

export function generateLearnId(topic) {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  const topicPrefix = topic ? topic.substring(0, 3).toLowerCase() : 'gen';
  return `learn-${topicPrefix}-${date}-${random}`;
}

/**
 * @param {object} data
 * @returns {object} 생성된 학습 항목 (id 포함)
 */
export function createLearnItem(data) {
  initializeStore();

  const id = generateLearnId(data.topic);
  const now = new Date().toISOString();
  const { nextReview } = calculateNextReview(3, null, 0);

  const item = {
    id,
    version: '1.0',
    content: {
      title: data.title,
      description: data.description || '',
      keyPoints: data.keyPoints || [],
      codeExample: data.codeExample,
      resources: data.resources || []
    },
    classification: {
      topic: data.topic || 'general',
      subtopic: data.subtopic,
      tags: data.tags || [],
      difficulty: data.difficulty || 'intermediate'
    },
    source: {
      type: data.source || 'manual',
      sessionId: data.sessionId,
      harvestId: data.harvestId,
      insightId: data.insightId,
      project: data.project
    },
    spaceRep: {
      confidence: 3,
      nextReview,
      lastReview: null,
      reviewCount: 0,
      streak: 0,
      easeFactor: 2.5
    },
    meta: {
      createdAt: now,
      updatedAt: now,
      status: 'active'
    },
    history: []
  };

  const filepath = join(LEARN_DIR, `${id}.json`);
  writeFileSync(filepath, JSON.stringify(item, null, 2));
  updateIndex(item, 'add');

  return item;
}

/**
 * @param {object} insight
 * @returns {object} 생성된 학습 항목
 */
export function createFromInsight(insight) {
  return createLearnItem({
    title: insight.title,
    description: insight.content,
    keyPoints: insight.learning?.keyPoints || [insight.content],
    topic: insight.meta?.tags?.[0] || 'general',
    tags: insight.meta?.tags || [],
    difficulty: insight.learning?.difficulty || 'intermediate',
    source: 'insight',
    insightId: insight.id,
    project: insight.context?.project
  });
}

function updateIndex(item, action) {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));

  // 필드 없으면 초기화
  if (!index.byTopic) index.byTopic = {};
  if (!index.byDifficulty) index.byDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };
  if (!index.byStatus) index.byStatus = { active: 0, mastered: 0, archived: 0 };
  if (!index.dueToday) index.dueToday = [];

  if (action === 'add') {
    index.totalItems += 1;
    index.lastUpdated = new Date().toISOString();

    const topic = item.classification.topic;
    if (!index.byTopic[topic]) {
      index.byTopic[topic] = [];
    }
    index.byTopic[topic].push(item.id);

    index.byDifficulty[item.classification.difficulty] += 1;
    index.byStatus[item.meta.status] += 1;

    if (isDueToday(item.spaceRep.nextReview)) {
      index.dueToday.push(item.id);
    }
  }

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

/**
 * @param {string} id
 * @returns {object|null}
 */
export function getLearnItem(id) {
  const filepath = join(LEARN_DIR, `${id}.json`);
  if (!existsSync(filepath)) {
    return null;
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

/**
 * @param {object} filter - { topic, status, difficulty }
 * @returns {object[]}
 */
export function getAllItems(filter = {}) {
  initializeStore();

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  const items = [];

  for (const file of files) {
    const filepath = join(LEARN_DIR, file);
    const item = JSON.parse(readFileSync(filepath, 'utf-8'));

    if (filter.topic && item.classification.topic !== filter.topic) continue;
    if (filter.status && item.meta.status !== filter.status) continue;
    if (filter.difficulty && item.classification.difficulty !== filter.difficulty) continue;

    items.push(item);
  }

  return items;
}

/**
 * @param {number} limit
 * @returns {object[]}
 */
export function getDueItems(limit = 10) {
  const items = getAllItems({ status: 'active' });
  return generateReviewSchedule(items, limit);
}

/**
 * @param {string} id
 * @param {number} newConfidence - 1~5
 * @returns {object|null}
 */
export function completeReview(id, newConfidence) {
  const item = getLearnItem(id);
  if (!item) return null;

  const updated = updateAfterReview(item, newConfidence);

  const filepath = join(LEARN_DIR, `${id}.json`);
  writeFileSync(filepath, JSON.stringify(updated, null, 2));

  updateStatsAfterReview(updated);
  refreshDueToday();

  return updated;
}

function updateStatsAfterReview(item) {
  const stats = JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
  const today = new Date().toISOString().split('T')[0];

  stats.todayReview.completed += 1;

  if (stats.lastReviewDate === today) {
    // 오늘 이미 복습함
  } else if (stats.lastReviewDate === addDays(today, -1)) {
    stats.currentStreak += 1;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 1;
  }
  stats.lastReviewDate = today;

  const topic = item.classification.topic;
  if (!stats.byTopic[topic]) {
    stats.byTopic[topic] = { total: 0, mastered: 0, averageConfidence: 0 };
  }

  if (item.meta.status === 'mastered') {
    stats.masteredItems += 1;
    stats.byTopic[topic].mastered += 1;
  }

  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function refreshDueToday() {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  const items = getAllItems({ status: 'active' });

  index.dueToday = items
    .filter(item => isDueToday(item.spaceRep.nextReview))
    .map(item => item.id);

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));

  const stats = JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
  if (!stats.todayReview) stats.todayReview = { due: 0, completed: 0 };
  stats.todayReview.due = index.dueToday.length;
  writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

function addDays(dateStr, days) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getStats() {
  initializeStore();
  refreshDueToday();
  const stats = JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));

  return {
    total: index.totalItems || 0,
    mastered: stats.masteredItems || 0,
    active: stats.activeItems || 0,
    dueToday: index.dueToday?.length || 0,
    currentStreak: stats.currentStreak || 0,
    longestStreak: stats.longestStreak || 0
  };
}

/**
 * @param {string} topic
 * @returns {object[]}
 */
export function getItemsByTopic(topic) {
  return getAllItems({ topic });
}

export default {
  initializeStore,
  generateLearnId,
  createLearnItem,
  createFromInsight,
  getLearnItem,
  getAllItems,
  getDueItems,
  completeReview,
  getStats,
  getItemsByTopic
};
