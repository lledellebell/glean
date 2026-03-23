/**
 * Glean - Knowledge harvesting from AI coding sessions
 * Main entry point
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

// Paths
export {
  GLEAN_DIR,
  HARVESTS_DIR,
  INSIGHTS_DIR,
  LEARN_DIR,
  ensureDir
} from './paths.js';

// Spaced Repetition
export {
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  updateAfterReview,
  BASE_INTERVALS
} from './spaced-repetition.js';

// Stores
export { HarvestStore } from './harvest-store.js';
export { InsightStore } from './insight-store.js';
export { LearnStore } from './learn-store.js';

// Bridge integrations
export { ClaudeCodeBridge } from './bridge/claude-code.js';
export { ObsidianBridge } from './bridge/obsidian.js';
export {
  harvestToMarkdown,
  insightToObsidianNote,
  learnToObsidianNote,
  commitToHarvestChange,
  prToInsight
} from './bridge/data-transformer.js';
export { detectAllPlugins, KNOWN_PLUGINS } from './bridge/plugin-detector.js';

// Knowledge Search
export { searchAll, formatSearchResults } from './knowledge-search.js';

// Plan Store
export {
  createPlan, getActivePlan, comparePlanWithResults,
  getCarryoverItems, getRecentPlans, formatComparison
} from './plan-store.js';

// Session Linker
export { findRelatedSessions, formatSessionLinks } from './session-linker.js';

// Doctor
export { runDiagnosis, formatDiagnosis } from './doctor.js';

// Version
export const VERSION = pkg.version;
