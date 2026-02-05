/**
 * Glean Context Review Hook
 * 프로젝트 관련 과거 배움 표시
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getRelevantLearnings, formatContextReview } from '../lib/context-retriever.js';

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
  event: 'SessionStart',

  hooks: [
    {
      matcher: {},

      async handler(context) {
        const config = loadConfig();
        const reviewConfig = config.contextReview || {};

        // 기능 비활성화 체크
        if (reviewConfig.enabled === false) {
          return { action: 'continue' };
        }

        // 현재 프로젝트와 파일 정보 추출
        const project = process.cwd().split('/').pop();
        const { files = [], recentFiles = [] } = context || {};

        // 작업 중인 파일 목록
        const workingFiles = [...files, ...recentFiles].slice(0, 10);

        // 관련 학습 검색
        const learnings = getRelevantLearnings(project, workingFiles, {
          limit: reviewConfig.limit || 5,
          includeInsights: reviewConfig.includeInsights !== false,
          includeLearnings: reviewConfig.includeLearnings !== false,
          includeDaily: reviewConfig.includeDaily !== false
        });

        if (learnings.length === 0) {
          return { action: 'continue' };
        }

        // 포맷팅 후 표시
        const formatted = formatContextReview(learnings);

        return {
          action: 'suggest',
          message: formatted
        };
      }
    }
  ]
};
