/**
 * Glean Auto-Harvest Hook
 *
 * Hook that automatically runs harvest on session end
 *
 * Configuration (.glean.json):
 * {
 *   "harvest": {
 *     "autoHarvest": true,
 *     "mode": "quick",
 *     "minDuration": 600
 *   }
 * }
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load configuration
function loadConfig() {
  const configPath = join(process.cwd(), '.glean.json');
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

// Track session start time (global)
let sessionStartTime = Date.now();

export default {
  // Record time on session start
  onSessionStart: () => {
    sessionStartTime = Date.now();
  },

  // Stop event (on session end)
  event: 'Stop',

  hooks: [
    {
      // Match all session ends
      matcher: {},

      // Run auto harvest
      async handler(context) {
        const config = loadConfig();
        const harvestConfig = config.harvest || {};

        // Skip if autoHarvest is disabled
        if (harvestConfig.autoHarvest === false) {
          return { action: 'continue' };
        }

        // Check minimum session duration (default 10 min = 600 sec)
        const minDuration = harvestConfig.minDuration || 600;
        const sessionDuration = (Date.now() - sessionStartTime) / 1000;

        if (sessionDuration < minDuration) {
          console.log(`[Glean] Session too short (${Math.floor(sessionDuration)}s), skipping auto-harvest (min ${minDuration}s)`);
          return { action: 'continue' };
        }

        // Harvest mode (default: quick)
        const mode = harvestConfig.mode || 'quick';

        console.log(`[Glean] Starting auto-harvest (mode: ${mode})`);

        return {
          action: 'suggest',
          message: `Session lasted ${Math.floor(sessionDuration / 60)} minutes. Recommend running /harvest --mode ${mode}.`
        };
      }
    }
  ]
};

/**
 * Hook Description:
 *
 * This hook runs when a session ends.
 *
 * Behaviour:
 * 1. Load settings from .glean.json
 * 2. If autoHarvest is true and session was long enough
 * 3. Recommend running /harvest command
 *
 * Note:
 * - Requires Claude Code Stop event support
 * - Currently uses suggest action for user recommendation
 * - Can be changed to execute action when auto-execution is supported
 */
