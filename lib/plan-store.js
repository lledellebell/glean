/**
 * Glean Plan Store
 * Session learning intention management
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { GLEAN_DIR, ensureDir } from './paths.js';

const PLANS_DIR = join(GLEAN_DIR, 'plans');

function initializeStore() {
  ensureDir(PLANS_DIR);
}

/**
 * Create a learning plan
 * @param {object} data
 * @returns {object}
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

  writeFileSync(join(PLANS_DIR, `${id}.json`), JSON.stringify(plan, null, 2));
  return plan;
}

/**
 * Get the active plan for a project
 * @param {string} project
 * @returns {object|null}
 */
export function getActivePlan(project) {
  initializeStore();

  const files = readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort().reverse();

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
 * Compare plan intentions with actual learnings
 * @param {string} planId
 * @param {object[]} learnings
 * @returns {object|null}
 */
export function comparePlanWithResults(planId, learnings) {
  const filepath = join(PLANS_DIR, `${planId}.json`);
  if (!existsSync(filepath)) return null;

  const plan = JSON.parse(readFileSync(filepath, 'utf-8'));
  const comparison = { planned: plan.intentions.length, achieved: 0, missed: [], unexpected: [], matches: [] };

  for (const intention of plan.intentions) {
    const intentWords = new Set(intention.text.toLowerCase().split(/\s+/).filter(w => w.length > 1));
    let bestMatch = null;
    let bestScore = 0;

    for (const learning of learnings) {
      const text = (learning.title || learning.content || '').toLowerCase();
      const words = new Set(text.split(/\s+/).filter(w => w.length > 1));
      let overlap = 0;
      for (const w of intentWords) { if (words.has(w)) overlap++; }
      const score = intentWords.size > 0 ? overlap / intentWords.size : 0;
      if (score > bestScore) { bestScore = score; bestMatch = learning; }
    }

    if (bestScore >= 0.3) {
      intention.status = 'achieved';
      intention.matchedLearnings.push(bestMatch?.id || bestMatch?.title);
      comparison.achieved++;
      comparison.matches.push({ intention: intention.text, learning: bestMatch?.title || bestMatch?.content });
    } else {
      intention.status = 'missed';
      comparison.missed.push(intention.text);
    }
  }

  const matchedIds = new Set(plan.intentions.flatMap(i => i.matchedLearnings));
  for (const l of learnings) {
    if (!matchedIds.has(l.id || l.title)) {
      comparison.unexpected.push(l.title || l.content);
    }
  }

  plan.status = 'completed';
  plan.completedAt = new Date().toISOString();
  plan.summary = comparison;
  writeFileSync(filepath, JSON.stringify(plan, null, 2));

  return comparison;
}

/**
 * Get carryover items from last completed plan
 * @param {string} project
 * @returns {string[]}
 */
export function getCarryoverItems(project) {
  initializeStore();

  const files = readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort().reverse();

  for (const file of files) {
    try {
      const plan = JSON.parse(readFileSync(join(PLANS_DIR, file), 'utf-8'));
      if (plan.status !== 'completed') continue;
      if (project && plan.project !== project) continue;
      return plan.intentions.filter(i => i.status === 'missed').map(i => i.text);
    } catch { /* skip */ }
  }

  return [];
}

/**
 * Get recent plans
 * @param {number} limit
 * @returns {object[]}
 */
export function getRecentPlans(limit = 5) {
  initializeStore();

  return readdirSync(PLANS_DIR)
    .filter(f => f.startsWith('plan-') && f.endsWith('.json'))
    .sort().reverse().slice(0, limit)
    .map(f => { try { return JSON.parse(readFileSync(join(PLANS_DIR, f), 'utf-8')); } catch { return null; } })
    .filter(Boolean);
}

/**
 * Format plan comparison results
 * @param {object} comparison
 * @returns {string}
 */
export function formatComparison(comparison) {
  if (!comparison) return 'No plan to compare.';

  const rate = comparison.planned > 0 ? Math.round((comparison.achieved / comparison.planned) * 100) : 0;
  const lines = [`📋 **Learning Plan Results**\n`, `Achievement: **${rate}%** (${comparison.achieved}/${comparison.planned})\n`];

  if (comparison.matches.length > 0) {
    lines.push('### ✅ Achieved');
    for (const m of comparison.matches) lines.push(`- ${m.intention} → _${m.learning}_`);
    lines.push('');
  }
  if (comparison.missed.length > 0) {
    lines.push('### ❌ Missed (carry over)');
    for (const m of comparison.missed) lines.push(`- ${m}`);
    lines.push('');
  }
  if (comparison.unexpected.length > 0) {
    lines.push('### 🎁 Unplanned learnings');
    for (const u of comparison.unexpected) lines.push(`- ${u}`);
  }

  return lines.join('\n');
}

export default { createPlan, getActivePlan, comparePlanWithResults, getCarryoverItems, getRecentPlans, formatComparison };
