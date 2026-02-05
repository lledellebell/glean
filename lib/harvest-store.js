/**
 * Glean Harvest Store
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const GLEAN_DIR = join(homedir(), '.glean');
const HARVESTS_DIR = join(GLEAN_DIR, 'harvests');
const INDEX_FILE = join(HARVESTS_DIR, 'index.json');

export function initializeStore() {
  if (!existsSync(GLEAN_DIR)) {
    mkdirSync(GLEAN_DIR, { recursive: true });
  }
  if (!existsSync(HARVESTS_DIR)) {
    mkdirSync(HARVESTS_DIR, { recursive: true });
  }
  if (!existsSync(INDEX_FILE)) {
    writeFileSync(INDEX_FILE, JSON.stringify({
      totalHarvests: 0,
      lastHarvest: null,
      projects: {}
    }, null, 2));
  }
}

export function generateHarvestId() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `harvest-${date}-${time}-${random}`;
}

/**
 * @param {object} harvest
 * @returns {object} 저장된 수확 데이터 (id, path 포함)
 */
export function saveHarvest(harvest) {
  initializeStore();

  const id = harvest.id || generateHarvestId();
  const filename = `${id}.json`;
  const filepath = join(HARVESTS_DIR, filename);

  const harvestData = {
    ...harvest,
    id,
    version: '1.0',
    meta: {
      ...harvest.meta,
      savedAt: new Date().toISOString()
    }
  };

  writeFileSync(filepath, JSON.stringify(harvestData, null, 2));
  updateIndex(harvestData);

  return { ...harvestData, path: filepath };
}

function updateIndex(harvest) {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));

  index.totalHarvests += 1;
  index.lastHarvest = harvest.id;

  const project = harvest.session?.project || 'unknown';
  if (!index.projects[project]) {
    index.projects[project] = {
      harvestCount: 0,
      lastHarvest: null,
      totalDuration: 0
    };
  }

  index.projects[project].harvestCount += 1;
  index.projects[project].lastHarvest = harvest.id;
  index.projects[project].totalDuration += harvest.session?.duration || 0;

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

/**
 * @param {string} id
 * @returns {object|null}
 */
export function getHarvest(id) {
  const filepath = join(HARVESTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) {
    return null;
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

/**
 * @param {number} limit
 * @param {string} project - 프로젝트 필터 (선택)
 * @returns {object[]}
 */
export function getRecentHarvests(limit = 10, project = null) {
  initializeStore();

  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort()
    .reverse();

  const harvests = [];

  for (const file of files) {
    if (harvests.length >= limit) break;

    const filepath = join(HARVESTS_DIR, file);
    const harvest = JSON.parse(readFileSync(filepath, 'utf-8'));

    if (project && harvest.session?.project !== project) {
      continue;
    }

    harvests.push({
      id: harvest.id,
      timestamp: harvest.timestamp,
      project: harvest.session?.project,
      duration: harvest.session?.duration,
      summary: harvest.summary?.description,
      filesChanged: harvest.changes?.files?.length || 0,
      insightsCount: harvest.insights?.length || 0
    });
  }

  return harvests;
}

/**
 * @param {string} project
 * @returns {object|null}
 */
export function getProjectStats(project) {
  initializeStore();
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  return index.projects[project] || null;
}

export function getOverallStats() {
  initializeStore();
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  return {
    totalHarvests: index.totalHarvests,
    lastHarvest: index.lastHarvest,
    projectCount: Object.keys(index.projects).length,
    totalDuration: Object.values(index.projects)
      .reduce((sum, p) => sum + p.totalDuration, 0)
  };
}

export default {
  initializeStore,
  generateHarvestId,
  saveHarvest,
  getHarvest,
  getRecentHarvests,
  getProjectStats,
  getOverallStats
};
