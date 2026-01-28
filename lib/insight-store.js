/**
 * Glean Insight Store
 * Module for storing and managing insight data
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Default storage paths
const GLEAN_DIR = join(homedir(), '.glean');
const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');
const INDEX_FILE = join(INSIGHTS_DIR, 'index.json');

/**
 * Initialise directory structure
 */
export function initializeStore() {
  if (!existsSync(GLEAN_DIR)) {
    mkdirSync(GLEAN_DIR, { recursive: true });
  }
  if (!existsSync(INSIGHTS_DIR)) {
    mkdirSync(INSIGHTS_DIR, { recursive: true });
  }
  if (!existsSync(INDEX_FILE)) {
    writeFileSync(INDEX_FILE, JSON.stringify({
      totalInsights: 0,
      lastUpdated: null,
      byType: { pattern: 0, mistake: 0, optimization: 0, learning: 0 },
      byProject: {},
      byTag: {}
    }, null, 2));
  }
}

/**
 * Generate unique ID
 */
export function generateInsightId(type) {
  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `${type}-${date}-${random}`;
}

/**
 * Save insight
 * @param {object} insight - Insight data
 * @returns {string} Saved insight ID
 */
export function saveInsight(insight) {
  initializeStore();

  const id = insight.id || generateInsightId(insight.type);
  const now = new Date().toISOString();

  const insightData = {
    ...insight,
    id,
    version: '1.0',
    meta: {
      ...insight.meta,
      createdAt: insight.meta?.createdAt || now,
      updatedAt: now,
      status: insight.meta?.status || 'new',
      tags: insight.meta?.tags || []
    },
    usage: {
      viewCount: 0,
      appliedCount: 0,
      convertedToLearn: false,
      ...insight.usage
    }
  };

  // Save file
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  writeFileSync(filepath, JSON.stringify(insightData, null, 2));

  // Update index
  updateIndex(insightData, 'add');

  return id;
}

/**
 * Batch save multiple insights
 * @param {object[]} insights - Array of insights
 * @returns {string[]} Array of saved IDs
 */
export function saveInsights(insights) {
  return insights.map(insight => saveInsight(insight));
}

/**
 * Update index
 */
function updateIndex(insight, action) {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));

  if (action === 'add') {
    index.totalInsights += 1;
    index.lastUpdated = new Date().toISOString();

    // Count by type
    if (index.byType[insight.type] !== undefined) {
      index.byType[insight.type] += 1;
    }

    // Count by project
    const project = insight.context?.project || 'unknown';
    index.byProject[project] = (index.byProject[project] || 0) + 1;

    // Count by tag
    for (const tag of insight.meta?.tags || []) {
      index.byTag[tag] = (index.byTag[tag] || 0) + 1;
    }
  }

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

/**
 * Get insight by ID
 * @param {string} id - Insight ID
 * @returns {object|null}
 */
export function getInsight(id) {
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) {
    return null;
  }

  const insight = JSON.parse(readFileSync(filepath, 'utf-8'));

  // Increment view count
  insight.usage.viewCount += 1;
  writeFileSync(filepath, JSON.stringify(insight, null, 2));

  return insight;
}

/**
 * Search insights
 * @param {object} filter - Search filter
 * @returns {object[]} List of insight summaries
 */
export function searchInsights(filter = {}) {
  initializeStore();

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const results = [];

  for (const file of files) {
    const filepath = join(INSIGHTS_DIR, file);
    const insight = JSON.parse(readFileSync(filepath, 'utf-8'));

    // Apply filters
    if (filter.type && !matchFilter(insight.type, filter.type)) continue;
    if (filter.status && !matchFilter(insight.meta?.status, filter.status)) continue;
    if (filter.project && insight.context?.project !== filter.project) continue;
    if (filter.minConfidence && insight.confidence < filter.minConfidence) continue;
    if (filter.tags && !filter.tags.some(t => insight.meta?.tags?.includes(t))) continue;

    // Generate summary
    results.push({
      id: insight.id,
      type: insight.type,
      title: insight.title,
      confidence: insight.confidence,
      project: insight.context?.project,
      createdAt: insight.meta?.createdAt,
      status: insight.meta?.status,
      tags: insight.meta?.tags
    });
  }

  // Sort by newest first
  return results.sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Filter matching helper
 */
function matchFilter(value, filter) {
  if (Array.isArray(filter)) {
    return filter.includes(value);
  }
  return value === filter;
}

/**
 * Update insight status
 * @param {string} id - Insight ID
 * @param {string} status - New status
 */
export function updateInsightStatus(id, status) {
  const filepath = join(INSIGHTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) return false;

  const insight = JSON.parse(readFileSync(filepath, 'utf-8'));
  insight.meta.status = status;
  insight.meta.updatedAt = new Date().toISOString();
  writeFileSync(filepath, JSON.stringify(insight, null, 2));

  return true;
}

/**
 * Mark as converted to learn item
 * @param {string} id - Insight ID
 * @param {string} learnItemId - Created learn item ID
 */
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

/**
 * Check for duplicates
 * @param {string} title - Insight title
 * @param {string} content - Insight content
 * @returns {object|null} Duplicate insight or null
 */
export function checkDuplicate(title, content) {
  const insights = searchInsights({});

  for (const summary of insights) {
    const insight = getInsight(summary.id);
    if (!insight) continue;

    // Simple title similarity check
    if (insight.title.toLowerCase() === title.toLowerCase()) {
      return insight;
    }
  }

  return null;
}

/**
 * Get statistics
 */
export function getStats() {
  initializeStore();
  return JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
}

export default {
  initializeStore,
  generateInsightId,
  saveInsight,
  saveInsights,
  getInsight,
  searchInsights,
  updateInsightStatus,
  markAsConvertedToLearn,
  checkDuplicate,
  getStats
};
