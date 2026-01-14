/**
 * Glean Harvest Store
 * Module for storing and managing harvested session data
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Default storage paths
const GLEAN_DIR = join(homedir(), '.glean');
const HARVESTS_DIR = join(GLEAN_DIR, 'harvests');
const INDEX_FILE = join(HARVESTS_DIR, 'index.json');

/**
 * Initialise directory structure
 */
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

/**
 * Generate unique ID
 */
export function generateHarvestId() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const random = Math.random().toString(36).substring(2, 6);
  return `harvest-${date}-${time}-${random}`;
}

/**
 * Save harvest
 * @param {object} harvest - Harvest data
 * @returns {string} Saved file path
 */
export function saveHarvest(harvest) {
  initializeStore();

  const id = harvest.id || generateHarvestId();
  const filename = `${id}.json`;
  const filepath = join(HARVESTS_DIR, filename);

  // Add ID to harvest data
  const harvestData = {
    ...harvest,
    id,
    version: '1.0',
    meta: {
      ...harvest.meta,
      savedAt: new Date().toISOString()
    }
  };

  // Save file
  writeFileSync(filepath, JSON.stringify(harvestData, null, 2));

  // Update index
  updateIndex(harvestData);

  return filepath;
}

/**
 * Update index
 * @param {object} harvest - Saved harvest data
 */
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
 * Get harvest by ID
 * @param {string} id - Harvest ID
 * @returns {object|null} Harvest data
 */
export function getHarvest(id) {
  const filepath = join(HARVESTS_DIR, `${id}.json`);
  if (!existsSync(filepath)) {
    return null;
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

/**
 * Get recent harvests
 * @param {number} limit - Number of harvests to retrieve
 * @param {string} project - Project filter (optional)
 * @returns {object[]} List of harvests
 */
export function getRecentHarvests(limit = 10, project = null) {
  initializeStore();

  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  const harvests = [];

  // Read all harvest files
  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json')
    .sort()
    .reverse();

  for (const file of files) {
    if (harvests.length >= limit) break;

    const filepath = join(HARVESTS_DIR, file);
    const harvest = JSON.parse(readFileSync(filepath, 'utf-8'));

    // Apply project filter
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
 * Get project statistics
 * @param {string} project - Project path
 * @returns {object} Statistics data
 */
export function getProjectStats(project) {
  initializeStore();

  const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
  return index.projects[project] || null;
}

/**
 * Get overall statistics
 * @returns {object} Overall statistics
 */
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
