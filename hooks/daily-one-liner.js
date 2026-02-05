/**
 * Glean Daily One-liner Hook
 * 세션 종료 시 오늘의 배움 저장 제안
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getTodayLearnings, saveDailyLearning } from '../lib/daily-learning.js';

let sessionStartTime = Date.now();

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
        const dailyConfig = config.daily || {};

        // 기능 비활성화 체크
        if (dailyConfig.autoPrompt === false) {
          return { action: 'continue' };
        }

        // 최소 세션 시간 체크 (기본 5분)
        const minDuration = dailyConfig.minDuration || 300;
        const duration = (Date.now() - sessionStartTime) / 1000;

        if (duration < minDuration) {
          return { action: 'continue' };
        }

        // 오늘 이미 배움을 저장했는지 체크
        const todayLearnings = getTodayLearnings();
        const maxDaily = dailyConfig.maxDaily || 3;

        if (todayLearnings.length >= maxDaily) {
          return { action: 'continue' };
        }

        // 세션 컨텍스트에서 배움 후보 추출
        const { summary, insights, learnings } = context || {};
        let suggestion = '';

        if (insights?.length > 0) {
          suggestion = `\n💡 이 세션의 인사이트: "${insights[0].title}"`;
        } else if (learnings?.length > 0) {
          suggestion = `\n📚 새로 배운 것: "${learnings[0].title}"`;
        }

        const durationMin = Math.floor(duration / 60);

        return {
          action: 'suggest',
          message: `🌟 **오늘의 한 줄**

세션이 ${durationMin}분 진행됐어요.
이번 세션에서 배운 가장 중요한 것을 한 줄로 적어보세요!${suggestion}

\`/daily-learning "오늘 배운 내용"\` 으로 저장할 수 있어요.`
        };
      }
    }
  ],

  // 직접 호출용 헬퍼
  saveLearning: (content, options = {}) => {
    const project = options.project || process.cwd().split('/').pop();
    return saveDailyLearning(content, { ...options, project });
  }
};
