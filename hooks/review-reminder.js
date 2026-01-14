/**
 * Glean Review Reminder Hook
 *
 * Notify about items due for review when session starts
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LEARN_DIR = join(homedir(), '.glean', 'learn');
const INDEX_FILE = join(LEARN_DIR, 'index.json');
const STATS_FILE = join(LEARN_DIR, 'stats.json');

/**
 * Check count of items due for review today
 */
function getDueCount() {
  if (!existsSync(INDEX_FILE)) {
    return 0;
  }

  try {
    const index = JSON.parse(readFileSync(INDEX_FILE, 'utf-8'));
    return index.dueToday?.length || 0;
  } catch {
    return 0;
  }
}

/**
 * Check review streak
 */
function getStreak() {
  if (!existsSync(STATS_FILE)) {
    return { current: 0, longest: 0 };
  }

  try {
    const stats = JSON.parse(readFileSync(STATS_FILE, 'utf-8'));
    return {
      current: stats.currentStreak || 0,
      longest: stats.longestStreak || 0
    };
  } catch {
    return { current: 0, longest: 0 };
  }
}

export default {
  // Run on session start
  event: 'SessionStart',

  hooks: [
    {
      matcher: {},

      async handler() {
        const dueCount = getDueCount();
        const streak = getStreak();

        // Skip if no items to review
        if (dueCount === 0) {
          return { action: 'continue' };
        }

        // Compose notification message
        let message = `📚 You have ${dueCount} learning items due for review today!`;

        // Add streak info
        if (streak.current > 0) {
          message += `\n🔥 Currently on a ${streak.current}-day review streak!`;
        }

        // Message based on urgency
        if (dueCount >= 10) {
          message += '\n⚠️ Many items are overdue. Run `/learn review` to catch up.';
        } else if (dueCount >= 5) {
          message += '\n💡 Run `/learn review` to start reviewing.';
        }

        return {
          action: 'suggest',
          message
        };
      }
    }
  ]
};

/**
 * Usage Example:
 *
 * This hook runs automatically when a Claude Code session starts.
 *
 * Output example:
 * 📚 You have 5 learning items due for review today!
 * 🔥 Currently on a 7-day review streak!
 * 💡 Run `/learn review` to start reviewing.
 */
