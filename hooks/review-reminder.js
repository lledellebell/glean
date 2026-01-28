/**
 * Glean Review Reminder Hook
 * @license MIT
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LEARN_DIR = join(homedir(), '.glean', 'learn');
const INDEX_FILE = join(LEARN_DIR, 'index.json');
const STATS_FILE = join(LEARN_DIR, 'stats.json');

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
  event: 'SessionStart',

  hooks: [
    {
      matcher: {},

      async handler() {
        const due = getDueCount();
        const streak = getStreak();

        if (due === 0) {
          return { action: 'continue' };
        }

        let msg = `📚 오늘 복습할 학습 항목이 ${due}개 있어요!`;

        if (streak.current > 0) {
          msg += `\n🔥 현재 ${streak.current}일 연속 복습 중!`;
        }

        if (due >= 10) {
          msg += '\n⚠️ 밀린 항목이 많아요. `/learn review`로 복습하세요.';
        }

        return { action: 'suggest', message: msg };
      }
    }
  ]
};
