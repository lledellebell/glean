/**
 * Glean Doctor
 * Setup and data health diagnostics
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { GLEAN_DIR, HARVESTS_DIR, INSIGHTS_DIR, LEARN_DIR } from './paths.js';

/**
 * Run full diagnosis
 * @returns {object}
 */
export function runDiagnosis() {
  const checks = [
    checkGleanDir(),
    checkSubDirs(),
    checkIndexFiles(),
    checkDataIntegrity(),
    checkConfig(),
    checkPluginFiles()
  ];

  const passed = checks.filter(c => c.status === 'ok').length;
  const warnings = checks.filter(c => c.status === 'warn').length;
  const errors = checks.filter(c => c.status === 'error').length;

  return {
    checks,
    summary: { total: checks.length, passed, warnings, errors },
    healthy: errors === 0
  };
}

function checkGleanDir() {
  if (existsSync(GLEAN_DIR)) {
    return { name: 'glean-dir', status: 'ok', message: '~/.glean/ directory exists' };
  }
  return { name: 'glean-dir', status: 'error', message: '~/.glean/ directory missing. Run /glean once to create it.' };
}

function checkSubDirs() {
  const dirs = [
    { path: HARVESTS_DIR, name: 'harvests' },
    { path: INSIGHTS_DIR, name: 'insights' },
    { path: LEARN_DIR, name: 'learn' }
  ];

  const missing = dirs.filter(d => !existsSync(d.path));

  if (missing.length === 0) return { name: 'sub-dirs', status: 'ok', message: 'All data directories exist' };
  if (missing.length === dirs.length) return { name: 'sub-dirs', status: 'warn', message: 'No data directories yet (created on first use)' };
  return { name: 'sub-dirs', status: 'warn', message: `Missing directories: ${missing.map(d => d.name).join(', ')}` };
}

function checkIndexFiles() {
  const indexes = [
    { path: join(HARVESTS_DIR, 'index.json'), name: 'harvests/index.json' },
    { path: join(INSIGHTS_DIR, 'index.json'), name: 'insights/index.json' },
    { path: join(LEARN_DIR, 'index.json'), name: 'learn/index.json' },
    { path: join(LEARN_DIR, 'stats.json'), name: 'learn/stats.json' }
  ];

  const broken = [];
  for (const idx of indexes) {
    if (existsSync(idx.path)) {
      try { JSON.parse(readFileSync(idx.path, 'utf-8')); }
      catch { broken.push(idx.name); }
    }
  }

  if (broken.length === 0) return { name: 'index-files', status: 'ok', message: 'Index files OK' };
  return { name: 'index-files', status: 'error', message: `Broken index files: ${broken.join(', ')}` };
}

function checkDataIntegrity() {
  let total = 0;
  let broken = 0;

  const dirs = [
    { path: HARVESTS_DIR, prefix: null, exclude: 'index.json' },
    { path: INSIGHTS_DIR, prefix: null, exclude: 'index.json' },
    { path: LEARN_DIR, prefix: 'learn-', exclude: null }
  ];

  for (const dir of dirs) {
    if (!existsSync(dir.path)) continue;
    const files = readdirSync(dir.path)
      .filter(f => f.endsWith('.json'))
      .filter(f => !dir.exclude || f !== dir.exclude)
      .filter(f => !dir.prefix || f.startsWith(dir.prefix));

    for (const file of files) {
      total++;
      try { JSON.parse(readFileSync(join(dir.path, file), 'utf-8')); }
      catch { broken++; }
    }
  }

  if (total === 0) return { name: 'data-integrity', status: 'ok', message: 'No data files yet' };
  if (broken === 0) return { name: 'data-integrity', status: 'ok', message: `${total} data files all valid` };
  return { name: 'data-integrity', status: 'error', message: `${broken}/${total} files corrupted` };
}

function checkConfig() {
  const configDir = join(GLEAN_DIR, 'config');
  const globalConfig = join(configDir, 'global.json');

  if (!existsSync(configDir)) return { name: 'config', status: 'ok', message: 'No config directory (using defaults)' };
  if (existsSync(globalConfig)) {
    try { JSON.parse(readFileSync(globalConfig, 'utf-8')); return { name: 'config', status: 'ok', message: 'Global config OK' }; }
    catch { return { name: 'config', status: 'error', message: 'global.json parse failed' }; }
  }
  return { name: 'config', status: 'ok', message: 'No global config (using defaults)' };
}

function checkPluginFiles() {
  const pluginJson = join(process.cwd(), '.claude-plugin', 'plugin.json');

  if (existsSync(pluginJson)) {
    try { JSON.parse(readFileSync(pluginJson, 'utf-8')); return { name: 'plugin-files', status: 'ok', message: 'plugin.json OK' }; }
    catch { return { name: 'plugin-files', status: 'error', message: 'plugin.json parse failed' }; }
  }
  return { name: 'plugin-files', status: 'ok', message: 'Plugin directory checked' };
}

/**
 * Format diagnosis results
 * @param {object} diagnosis
 * @returns {string}
 */
export function formatDiagnosis(diagnosis) {
  const icons = { ok: '✅', warn: '⚠️', error: '❌' };
  const lines = ['🩺 **Glean Doctor**\n'];

  for (const check of diagnosis.checks) {
    lines.push(`${icons[check.status]} ${check.message}`);
  }

  lines.push('', '---');
  const { passed, warnings, errors, total } = diagnosis.summary;

  if (diagnosis.healthy) {
    lines.push(`✅ **All clear** (${passed}/${total} passed)`);
  } else {
    lines.push(`❌ **Issues found** (passed: ${passed}, warnings: ${warnings}, errors: ${errors})`);
  }

  return lines.join('\n');
}

export default { runDiagnosis, formatDiagnosis };
