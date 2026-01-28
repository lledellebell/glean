/**
 * Glean Harvest Store
 * @license MIT
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const GLEAN_DIR = join(homedir(), '.glean');
const HARVESTS_DIR = join(GLEAN_DIR, 'harvests');
const INDEX_FILE = join(HARVESTS_DIR, 'index.json');

export function initializeStore() {
  if (!existsSync(GLEAN_DIR)) mkdirSync(GLEAN_DIR, { recursive: true });
  if (!existsSync(HARVESTS_DIR)) mkdirSync(HARVESTS_DIR, { recursive: true });
  if (!existsSync(INDEX_FILE)) {
    writeFileSync(INDEX_FILE, JSON.stringify({
      totalHarvests: 0, lastHarvest: null, projects: {}
    }, null, 2));
  }
}

export function generateHarvestId() {
  const now = new Date();
  const d = now.toISOString().split('T')[0];
  const t = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const r = Math.random().toString(36).substring(2, 6);
  return `harvest-${d}-${t}-${r}`;
}

export function saveHarvest(harvest) {
  initializeStore();
  const id = harvest.id || generateHarvestId();
  const filepath = join(HARVESTS_DIR, `${id}.json`);

  const data = {
    ...harvest, id, version: '1.0',
    meta: { ...harvest.meta, savedAt: new Date().toISOString() }
  };

  writeFileSync(filepath, JSON.stringify(data, null, 2));
  updateIndex(data);
  return filepath;
}

function updateIndex(harvest) {
  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  index.totalHarvests += 1;
  index.lastHarvest = harvest.id;

  const project = harvest.session?.project || 'unknown';
  if (!index.projects[project]) {
    index.projects[project] = { harvestCount: 0, lastHarvest: null, totalDuration: 0 };
  }
  index.projects[project].harvestCount += 1;
  index.projects[project].lastHarvest = harvest.id;
  index.projects[project].totalDuration += harvest.session?.duration || 0;

  writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export function getHarvest(id) {
  const filepath = join(HARVESTS_DIR, `${id}.json`);
  return existsSync(filepath) ? JSON.parse(readFileSync(filepath, 'utf-8')) : null;
}

export function getRecentHarvests(limit = 10, project = null) {
  initializeStore();
  const harvests = [];
  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort().reverse();

  for (const file of files) {
    if (harvests.length >= limit) break;
    const harvest = JSON.parse(readFileSync(join(HARVESTS_DIR, file), 'utf-8'));
    if (project && harvest.session?.project !== project) continue;

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
    totalDuration: Object.values(index.projects).reduce((s, p) => s + p.totalDuration, 0)
  };
}

export default {
  initializeStore, generateHarvestId, saveHarvest,
  getHarvest, getRecentHarvests, getProjectStats, getOverallStats
};
