/**
 * Glean Auto-Harvest Hook
 * @license MIT
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

let sessionStartTime = Date.now();

export default {
  onSessionStart: () => {
    sessionStartTime = Date.now();
  },

  event: 'Stop',

  hooks: [
    {
      matcher: {},

      async handler(context) {
        const config = loadConfig();
        const h = config.harvest || {};

        if (h.autoHarvest === false) {
          return { action: 'continue' };
        }

        const min = h.minDuration || 600;
        const dur = (Date.now() - sessionStartTime) / 1000;

        if (dur < min) {
          return { action: 'continue' };
        }

        return {
          action: 'suggest',
          message: `세션이 ${Math.floor(dur / 60)}분 진행됐어요. /harvest 실행을 권장해요.`
        };
      }
    }
  ]
};
