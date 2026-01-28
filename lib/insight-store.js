/**
 * Glean Insight Store
 * @license MIT
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const GLEAN_DIR = join(homedir(), '.glean');
const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');
const INDEX_FILE = join(INSIGHTS_DIR, 'index.json');

export function initializeStore() {
  if (!existsSync(GLEAN_DIR)) mkdirSync(GLEAN_DIR, { recursive: true });
  if (!existsSync(INSIGHTS_DIR)) mkdirSync(INSIGHTS_DIR, { recursive: true });
  if (!existsSync(INDEX_FILE)) {
    writeFileSync(INDEX_FILE, JSON.stringify({
      totalInsights: 0, lastUpdated: null,
      byType: { pattern: 0, mistake: 0, optimization: 0, learning: 0 },
      byProject: {}, byTag: {}
    }, null, 2));
  }
}

export function generateInsightId(type) {
  const d = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const r = Math.random().toString(36).substring(2, 6);
  return `${type}-${d}-${r}`;
}

export function saveInsight(insight) {
  initializeStore();
  const id = insight.id || generateInsightId(insight.type);
  const now = new Date().toISOString();

  const data = {
    ...insight, id, version: '1.0',
    meta: {
      ...insight.meta,
      createdAt: insight.meta?.createdAt || now,
      updatedAt: now,
      status: insight.meta?.status || 'new',
      tags: insight.meta?.tags || []
    },
    usage: { viewCount: 0, appliedCount: 0, convertedToLearn: false, ...insight.usage }
  };

  writeFileSync(join(INSIGHTS_DIR, `${id}.json`), JSON.stringify(data, null, 2));
  updateIndex(data, 'add');
  return id;
}

export function saveInsights(insights) {
  return insights.map(i => saveInsight(i));
}

function updateIndex(insight, action) {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  if (action === 'add') {
    index.totalInsights += 1;
    index.lastUpdated = new Date().toISOString();
    if (index.byType[insight.type] !== undefined) index.byType[insight.type] += 1;
    const project = insight.context?.project || 'unknown';
    index.byProject[project] = (index.byProject[project] || 0) + 1;
    for (const tag of insight.meta?.tags || []) {
      index.byTag[tag] = (index.byTag[tag] || 0) + 1;
    }
  }
  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export function getInsight(id) {
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) return null;
  const insight = JSON.parse(readFileSync(filepath, 'utf-8'));
  insight.usage.viewCount += 1;
  writeFileSync(filepath, JSON.stringify(insight, null, 2));
  return insight;
}

export function searchInsights(filter = {}) {
  initializeStore();
  const files = readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const results = [];

  for (const file of files) {
    const insight = JSON.parse(readFileSync(join(INSIGHTS_DIR, file), 'utf-8'));
    if (filter.type && !matchFilter(insight.type, filter.type)) continue;
    if (filter.status && !matchFilter(insight.meta?.status, filter.status)) continue;
    if (filter.project && insight.context?.project !== filter.project) continue;
    if (filter.minConfidence && insight.confidence < filter.minConfidence) continue;
    if (filter.tags && !filter.tags.some(t => insight.meta?.tags?.includes(t))) continue;

    results.push({
      id: insight.id, type: insight.type, title: insight.title,
      confidence: insight.confidence, project: insight.context?.project,
      createdAt: insight.meta?.createdAt, status: insight.meta?.status, tags: insight.meta?.tags
    });
  }
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function matchFilter(value, filter) {
  return Array.isArray(filter) ? filter.includes(value) : value === filter;
}

export function updateInsightStatus(id, status) {
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) return false;
  const insight = JSON.parse(readFileSync(filepath, 'utf-8'));
  insight.meta.status = status;
  insight.meta.updatedAt = new Date().toISOString();
  writeFileSync(filepath, JSON.stringify(insight, null, 2));
  return true;
}

export function markAsConvertedToLearn(id, learnItemId) {
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) return false;
  const insight = JSON.parse(readFileSync(filepath, 'utf-8'));
  insight.usage.convertedToLearn = true;
  insight.usage.learnItemId = learnItemId;
  insight.meta.updatedAt = new Date().toISOString();
  writeFileSync(filepath, JSON.stringify(insight, null, 2));
  return true;
}

export function checkDuplicate(title, content) {
  const insights = searchInsights({});
  for (const s of insights) {
    const insight = getInsight(s.id);
    if (insight?.title.toLowerCase() === title.toLowerCase()) return insight;
  }
  return null;
}

export function getStats() {
  initializeStore();
  return JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
}

export default {
  initializeStore, generateInsightId, saveInsight, saveInsights,
  getInsight, searchInsights, updateInsightStatus, markAsConvertedToLearn, checkDuplicate, getStats
};
