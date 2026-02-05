/**
 * Glean Deja-vu Alert Hook
 * 유사 에러 감지 시 과거 해결법 표시
 */

import { findSimilarPatterns, formatSimilarPatterns } from '../lib/pattern-matcher.js';

export default {
  event: 'SessionStart',

  hooks: [
    {
      matcher: {},

      async handler(context) {
        const { error, message, content } = context || {};

        // 에러나 메시지가 없으면 스킵
        const searchText = error || message || content;
        if (!searchText) {
          return { action: 'continue' };
        }

        // 유사 패턴 검색
        const matches = findSimilarPatterns(searchText, {
          threshold: 0.3,
          limit: 3,
          types: ['mistake', 'pattern']
        });

        if (matches.length === 0) {
          return { action: 'continue' };
        }

        // 유사 패턴 발견 시 알림
        const formatted = formatSimilarPatterns(matches);

        return {
          action: 'suggest',
          message: formatted
        };
      }
    }
  ]
};
