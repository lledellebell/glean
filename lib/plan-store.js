/**
 * Glean Plan Store
 * 세션 학습 의도 관리 모듈
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { GLEAN_DIR, ensureDir } from './paths.js';

const PLANS_DIR = join(GLEAN_DIR, 'plans');

/**
 * 저장소 초기화
 */
function initializeStore() {
  ensureDir(PLANS_DIR);
}

/**
 * 학습 계획을 생성해요
 * @param {object} data
 * @param {string[]} data.intentions - 학습 의도 목록
 * @param {string} data.project - 프로젝트 이름
 * @param {string} data.sessionId - 세션 ID
 * @returns {object} 생성된 계획
 */
export function createPlan(data) {
  initializeStore();

  const id = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const plan = {
    id,
    project: data.project || 'unknown',
    sessionId: data.sessionId,
    intentions: (data.intentions || []).map((text, i) => ({
      id: `intent-${i}`,
      text,
      status: 'pending',
      matchedLearnings: []
    })),
    status: 'active',
    createdAt: now,
    completedAt: null,
    summary: null
  };

  const filepath = join(PLANS_DIR, `${id}.json`);
  writeFileSync(filepath, JSON.stringify(plan, null, 2));

  return plan;
}

/**
 * 활성 계획을 가져와요
 * @param {string} project - 프로젝트 필터 (선택)
 * @returns {object|null}
 */
export function getActivePlan(project) {
  initializeStore();

  const files = readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort()
    .reverse();

  for (const file of files) {
    try {
      const plan = JSON.parse(readFileSync(join(PLANS_DIR, file), 'utf-8'));

      if (plan.status !== 'active') continue;
      if (project && plan.project !== project) continue;

      return plan;
    } catch { /* skip */ }
  }

  return null;
}

/**
 * 계획에 학습 결과를 매칭해요
 * @param {string} planId - 계획 ID
 * @param {object[]} learnings - 실제 학습 결과
 * @returns {object} 비교 결과
 */
export function comparePlanWithResults(planId, learnings) {
  const filepath = join(PLANS_DIR, `${planId}.json`);
  if (!existsSync(filepath)) return null;

  const plan = JSON.parse(readFileSync(filepath, 'utf-8'));
  const comparison = {
    planned: plan.intentions.length,
    achieved: 0,
    missed: [],
    unexpected: [],
    matches: []
  };

  for (const intention of plan.intentions) {
    const intentWords = new Set(
      intention.text.toLowerCase().split(/\s+/).filter(w => w.length > 1)
    );

    let bestMatch = null;
    let bestScore = 0;

    for (const learning of learnings) {
      const learningText = (learning.title || learning.content || '').toLowerCase();
      const learningWords = new Set(
        learningText.split(/\s+/).filter(w => w.length > 1)
      );

      let overlap = 0;
      for (const word of intentWords) {
        if (learningWords.has(word)) overlap++;
      }

      const score = intentWords.size > 0 ? overlap / intentWords.size : 0;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = learning;
      }
    }

    if (bestScore >= 0.3) {
      intention.status = 'achieved';
      intention.matchedLearnings.push(bestMatch?.id || bestMatch?.title);
      comparison.achieved++;
      comparison.matches.push({
        intention: intention.text,
        learning: bestMatch?.title || bestMatch?.content
      });
    } else {
      intention.status = 'missed';
      comparison.missed.push(intention.text);
    }
  }

  // 계획에 없던 학습
  const matchedIds = new Set(
    plan.intentions.flatMap(i => i.matchedLearnings)
  );
  for (const learning of learnings) {
    const id = learning.id || learning.title;
    if (!matchedIds.has(id)) {
      comparison.unexpected.push(learning.title || learning.content);
    }
  }

  // 계획 업데이트
  plan.status = 'completed';
  plan.completedAt = new Date().toISOString();
  plan.summary = comparison;
  writeFileSync(filepath, JSON.stringify(plan, null, 2));

  return comparison;
}

/**
 * 미완료 의도를 다음 세션 TODO로 반환해요
 * @param {string} project
 * @returns {string[]}
 */
export function getCarryoverItems(project) {
  initializeStore();

  const files = readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort()
    .reverse();

  for (const file of files) {
    try {
      const plan = JSON.parse(readFileSync(join(PLANS_DIR, file), 'utf-8'));

      if (plan.status !== 'completed') continue;
      if (project && plan.project !== project) continue;

      return plan.intentions
        .filter(i => i.status === 'missed')
        .map(i => i.text);
    } catch { /* skip */ }
  }

  return [];
}

/**
 * 최근 계획 목록을 가져와요
 * @param {number} limit
 * @returns {object[]}
 */
export function getRecentPlans(limit = 5) {
  initializeStore();

  const files = readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, limit);

  return files.map(file => {
    try {
      return JSON.parse(readFileSync(join(PLANS_DIR, file), 'utf-8'));
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * 계획 비교 결과를 포맷해요
 * @param {object} comparison
 * @returns {string}
 */
export function formatComparison(comparison) {
  if (!comparison) return '비교할 계획이 없어요.';

  const lines = ['📋 **학습 계획 결과**\n'];

  const rate = comparison.planned > 0
    ? Math.round((comparison.achieved / comparison.planned) * 100)
    : 0;
  lines.push(`달성률: **${rate}%** (${comparison.achieved}/${comparison.planned})\n`);

  if (comparison.matches.length > 0) {
    lines.push('### ✅ 달성한 의도');
    for (const m of comparison.matches) {
      lines.push(`- ${m.intention} → _${m.learning}_`);
    }
    lines.push('');
  }

  if (comparison.missed.length > 0) {
    lines.push('### ❌ 미달성 (다음 세션으로 이월)');
    for (const m of comparison.missed) {
      lines.push(`- ${m}`);
    }
    lines.push('');
  }

  if (comparison.unexpected.length > 0) {
    lines.push('### 🎁 계획에 없던 배움');
    for (const u of comparison.unexpected) {
      lines.push(`- ${u}`);
    }
  }

  return lines.join('\n');
}

export default {
  createPlan,
  getActivePlan,
  comparePlanWithResults,
  getCarryoverItems,
  getRecentPlans,
  formatComparison
};
