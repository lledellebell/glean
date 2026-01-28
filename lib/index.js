/**
 * Glean - Knowledge harvesting from AI coding sessions
 * Main entry point
 */

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

// Version
export const VERSION = '0.1.0';
