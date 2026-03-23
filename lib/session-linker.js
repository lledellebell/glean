/**
 * Glean Session Linker
 * Cross-session knowledge linking
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { HARVESTS_DIR, INSIGHTS_DIR } from './paths.js';

function tokenize(str) {
  if (!str || typeof str !== 'string') return [];
  return str.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
}

function similarity(str1, str2) {
  const t1 = tokenize(str1);
  const t2 = tokenize(str2);
  if (t1.length === 0 || t2.length === 0) return 0;
  const set1 = new Set(t1);
  const set2 = new Set(t2);
  let intersection = 0;
  for (const t of set1) { if (set2.has(t)) intersection++; }
  const union = new Set([...t1, ...t2]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Find related sessions based on project/files/topics
 * @param {object} context
 * @param {object} options
 * @returns {object[]}
 */
export function findRelatedSessions(context, options = {}) {
  const { limit = 5, daysBack = 30 } = options;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);

  const results = [
    ...findRelatedHarvests(context, cutoff),
    ...findRelatedInsights(context, cutoff)
  ];

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}

function buildContextString(ctx) {
  return [ctx.project, ...(ctx.files || []), ...(ctx.topics || [])].filter(Boolean).join(' ');
}

function findRelatedHarvests(context, cutoff) {
  if (!existsSync(HARVESTS_DIR)) return [];

  const files = readdirSync(HARVESTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const contextStr = buildContextString(context);
  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(HARVESTS_DIR, file), 'utf-8'));
      if (new Date(data.meta?.savedAt || data.timestamp) < cutoff) continue;

      let relevance = 0;
      if (data.session?.project === context.project) relevance += 0.4;

      const harvestFiles = (data.changes?.files || []).map(f => f.path || f);
      const ctxFiles = (context.files || []).map(f => f.split('/').pop());
      const hFiles = harvestFiles.map(f => String(f).split('/').pop());
      let fileOverlap = 0;
      const hSet = new Set(hFiles);
      for (const f of ctxFiles) { if (hSet.has(f)) fileOverlap++; }
      relevance += Math.min(fileOverlap * 0.15, 0.3);

      const content = [data.summary?.description, ...(data.insights || []).map(i => i.title)].filter(Boolean).join(' ');
      relevance += similarity(contextStr, content) * 0.3;

      if (relevance > 0.2) {
        results.push({
          source: 'harvest', id: data.id,
          title: data.summary?.description || data.id,
          project: data.session?.project,
          date: data.meta?.savedAt || data.timestamp,
          sharedFiles: fileOverlap, relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

function findRelatedInsights(context, cutoff) {
  if (!existsSync(INSIGHTS_DIR)) return [];

  const files = readdirSync(INSIGHTS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const contextStr = buildContextString(context);
  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(INSIGHTS_DIR, file), 'utf-8'));
      if (new Date(data.meta?.createdAt) < cutoff) continue;

      let relevance = 0;
      if (data.context?.project === context.project) relevance += 0.4;

      const content = [data.title, data.content, ...(data.meta?.tags || [])].filter(Boolean).join(' ');
      relevance += similarity(contextStr, content) * 0.6;

      if (relevance > 0.2) {
        results.push({
          source: 'insight', id: data.id, title: data.title,
          type: data.type, project: data.context?.project,
          date: data.meta?.createdAt, relevance
        });
      }
    } catch { /* skip */ }
  }

  return results;
}

/**
 * Format session links for display
 * @param {object[]} links
 * @returns {string}
 */
export function formatSessionLinks(links) {
  if (links.length === 0) return '';

  const icons = { harvest: '🌾', insight: '💡' };
  const lines = ['🔗 **Related from previous sessions**\n'];

  for (const link of links) {
    const icon = icons[link.source] || '•';
    lines.push(`${icon} **${link.title}**`);
    const meta = [];
    if (link.date) meta.push(link.date.split('T')[0]);
    if (link.project) meta.push(link.project);
    if (link.sharedFiles) meta.push(`${link.sharedFiles} shared files`);
    if (meta.length > 0) lines.push(`  _${meta.join(' | ')}_`);
  }

  return lines.join('\n');
}

export default { findRelatedSessions, formatSessionLinks };
