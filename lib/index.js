/**
 * Glean - Knowledge harvesting from AI coding sessions
 * Main entry point
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

// Spaced Repetition
export {
  calculateNextReview,
  isDueToday,
  getReviewPriority,
  updateAfterReview,
  BASE_INTERVALS
} from './spaced-repetition.js';

// Stores
export { default as HarvestStore } from './harvest-store.js';
export { default as InsightStore } from './insight-store.js';
export { default as LearnStore } from './learn-store.js';

// Bridge integrations
export { default as ClaudeCodeBridge } from './bridge/claude-code.js';
export { default as ObsidianBridge } from './bridge/obsidian.js';
export {
  harvestToMarkdown,
  insightToObsidianNote,
  learnToObsidianNote,
  commitToHarvestChange,
  prToInsight
} from './bridge/data-transformer.js';
export { detectAllPlugins, KNOWN_PLUGINS } from './bridge/plugin-detector.js';

// Paths
export {
  GLEAN_DIR,
  HARVESTS_DIR,
  INSIGHTS_DIR,
  LEARN_DIR,
  DAILY_DIR,
  ensureDir
} from './paths.js';

// Pattern Matcher
export {
  tokenize,
  calculateSimilarity,
  findSimilarPatterns,
  formatSimilarPatterns
} from './pattern-matcher.js';

// Daily Learning
export {
  saveDailyLearning,
  getTodayLearnings,
  getRecentLearnings,
  getLearningsByProject,
  getDailyStats,
  formatTodayLearnings
} from './daily-learning.js';

// Context Retriever
export {
  getRelevantLearnings,
  formatContextReview
} from './context-retriever.js';

// Flashcard Generator
export {
  generateFlashcard,
  getNextFlashcard,
  getDueFlashcards,
  formatFlashcardDisplay,
  getFlashcardStats
} from './flashcard-generator.js';

// Growth Visualizer
export {
  generateProgressBar,
  getGrowthData,
  formatGrowthDisplay,
  generateWeeklyChart,
  getQuickStats
} from './growth-visualizer.js';

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
