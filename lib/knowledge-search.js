/**
 * Glean Knowledge Search
 * Search across all knowledge stores
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { HARVESTS_DIR, INSIGHTS_DIR, LEARN_DIR } from './paths.js';

/**
 * Tokenize and calculate Jaccard similarity
 */
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
 * Search all knowledge stores with natural language query
 * @param {string} query
 * @param {object} options
 * @returns {object[]}
 */
export function searchAll(query, options = {}) {
  const {
    limit = 10,
    sources = ['insights', 'learn', 'harvests'],
    threshold = 0.15,
    project
  } = options;

  const results = [];

  if (sources.includes('insights')) {
    results.push(...searchStore(INSIGHTS_DIR, query, threshold, project, 'insight',
      f => f.endsWith('.json') && f !== 'index.json',
      data => ({
        title: data.title,
        content: data.content?.substring(0, 200),
        type: data.type,
        project: data.context?.project,
        date: data.meta?.createdAt,
        tags: data.meta?.tags || [],
        searchText: [data.title, data.content, ...(data.meta?.tags || [])].filter(Boolean).join(' ')
      })
    ));
  }

  if (sources.includes('learn')) {
    results.push(...searchStore(LEARN_DIR, query, threshold, project, 'learn',
      f => f.startsWith('learn-') && f.endsWith('.json'),
      data => ({
        title: data.content?.title,
        content: data.content?.description?.substring(0, 200),
        type: data.classification?.difficulty,
        project: data.source?.project,
        date: data.meta?.createdAt,
        tags: data.classification?.tags || [],
        searchText: [
          data.content?.title, data.content?.description,
          data.classification?.topic, ...(data.classification?.tags || [])
        ].filter(Boolean).join(' ')
      }),
      data => data.source?.project
    ));
  }

  if (sources.includes('harvests')) {
    results.push(...searchStore(HARVESTS_DIR, query, threshold, project, 'harvest',
      f => f.endsWith('.json') && f !== 'index.json',
      data => ({
        title: data.summary?.description?.substring(0, 80) || data.id,
        content: data.summary?.description,
        project: data.session?.project,
        date: data.meta?.savedAt || data.timestamp,
        tags: [],
        searchText: [data.summary?.description, ...(data.insights || []).map(i => i.title)].filter(Boolean).join(' ')
      }),
      data => data.session?.project
    ));
  }

  return results.sort((a, b) => b.relevance - a.relevance).slice(0, limit);
}

function searchStore(dir, query, threshold, project, source, fileFilter, mapper, projectGetter) {
  if (!existsSync(dir)) return [];

  const files = readdirSync(dir).filter(fileFilter);
  const results = [];

  for (const file of files) {
    try {
      const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'));
      const mapped = mapper(data);
      const projValue = projectGetter ? projectGetter(data) : data.context?.project;

      if (project && projValue !== project) continue;

      const relevance = similarity(query, mapped.searchText);
      if (relevance >= threshold) {
        results.push({ source, id: data.id, relevance, ...mapped });
      }
    } catch { /* skip */ }
  }

  return results;
}

/**
 * Format search results for display
 * @param {object[]} results
 * @returns {string}
 */
export function formatSearchResults(results) {
  if (results.length === 0) return 'No results found.';

  const icons = { insight: '💡', learn: '📚', harvest: '🌾' };
  const lines = [`🔍 **Search Results** (${results.length})\n`];

  for (const item of results) {
    const icon = icons[item.source] || '•';
    const pct = Math.round(item.relevance * 100);
    lines.push(`${icon} **${item.title}** (${pct}% match)`);
    if (item.content && item.content !== item.title) {
      lines.push(`> ${item.content.substring(0, 120)}${item.content.length > 120 ? '...' : ''}`);
    }
    const meta = [];
    if (item.project) meta.push(`project: ${item.project}`);
    if (item.date) meta.push(`date: ${item.date.split('T')[0]}`);
    if (item.tags?.length > 0) meta.push(`tags: ${item.tags.join(', ')}`);
    if (meta.length > 0) lines.push(`_${meta.join(' | ')}_`);
    lines.push('');
  }

  return lines.join('\n');
}

export default { searchAll, formatSearchResults };
