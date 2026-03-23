/**
 * Glean Doctor
 * 설정 상태 및 데이터 무결성 진단 모듈
 */

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { GLEAN_DIR, HARVESTS_DIR, INSIGHTS_DIR, LEARN_DIR, DAILY_DIR } from './paths.js';

/**
 * 전체 진단을 실행해요
 * @returns {object} 진단 결과
 */
export function runDiagnosis() {
  const checks = [];

  checks.push(checkGleanDir());
  checks.push(checkSubDirs());
  checks.push(checkIndexFiles());
  checks.push(checkDataIntegrity());
  checks.push(checkConfig());
  checks.push(checkPluginFiles());

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
    return { name: 'glean-dir', status: 'ok', message: `~/.glean/ 디렉토리 존재` };
  }
  return { name: 'glean-dir', status: 'error', message: '~/.glean/ 디렉토리가 없어요. /glean을 한번 실행하면 생성돼요.' };
}

function checkSubDirs() {
  const dirs = [
    { path: HARVESTS_DIR, name: 'harvests' },
    { path: INSIGHTS_DIR, name: 'insights' },
    { path: LEARN_DIR, name: 'learn' },
    { path: DAILY_DIR, name: 'daily' }
  ];

  const missing = dirs.filter(d => !existsSync(d.path));

  if (missing.length === 0) {
    return { name: 'sub-dirs', status: 'ok', message: '모든 데이터 디렉토리 존재' };
  }

  if (missing.length === dirs.length) {
    return { name: 'sub-dirs', status: 'warn', message: '데이터 디렉토리가 아직 없어요 (첫 사용 시 생성됨)' };
  }

  return {
    name: 'sub-dirs',
    status: 'warn',
    message: `일부 디렉토리 없음: ${missing.map(d => d.name).join(', ')}`
  };
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
      try {
        JSON.parse(readFileSync(idx.path, 'utf-8'));
      } catch {
        broken.push(idx.name);
      }
    }
  }

  if (broken.length === 0) {
    return { name: 'index-files', status: 'ok', message: '인덱스 파일 정상' };
  }

  return {
    name: 'index-files',
    status: 'error',
    message: `깨진 인덱스 파일: ${broken.join(', ')}`
  };
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
      try {
        JSON.parse(readFileSync(join(dir.path, file), 'utf-8'));
      } catch {
        broken++;
      }
    }
  }

  if (total === 0) {
    return { name: 'data-integrity', status: 'ok', message: '데이터 파일 없음 (아직 사용 전)' };
  }

  if (broken === 0) {
    return { name: 'data-integrity', status: 'ok', message: `${total}개 데이터 파일 모두 정상` };
  }

  return {
    name: 'data-integrity',
    status: 'error',
    message: `${total}개 중 ${broken}개 파일 깨짐`
  };
}

function checkConfig() {
  const configDir = join(GLEAN_DIR, 'config');
  const globalConfig = join(configDir, 'global.json');

  if (!existsSync(configDir)) {
    return { name: 'config', status: 'ok', message: '설정 디렉토리 없음 (기본값 사용 중)' };
  }

  if (existsSync(globalConfig)) {
    try {
      JSON.parse(readFileSync(globalConfig, 'utf-8'));
      return { name: 'config', status: 'ok', message: '전역 설정 파일 정상' };
    } catch {
      return { name: 'config', status: 'error', message: 'global.json 파싱 실패' };
    }
  }

  return { name: 'config', status: 'ok', message: '전역 설정 없음 (기본값 사용 중)' };
}

function checkPluginFiles() {
  const pluginJson = join(process.cwd(), '.claude-plugin', 'plugin.json');

  if (existsSync(pluginJson)) {
    try {
      JSON.parse(readFileSync(pluginJson, 'utf-8'));
      return { name: 'plugin-files', status: 'ok', message: 'plugin.json 정상' };
    } catch {
      return { name: 'plugin-files', status: 'error', message: 'plugin.json 파싱 실패' };
    }
  }

  return { name: 'plugin-files', status: 'ok', message: '플러그인 디렉토리 확인됨' };
}

/**
 * 진단 결과를 포맷해요
 * @param {object} diagnosis
 * @returns {string}
 */
export function formatDiagnosis(diagnosis) {
  const statusIcon = { ok: '✅', warn: '⚠️', error: '❌' };

  const lines = ['🩺 **Glean Doctor**\n'];

  for (const check of diagnosis.checks) {
    const icon = statusIcon[check.status];
    lines.push(`${icon} ${check.message}`);
  }

  lines.push('');
  lines.push('---');

  const { passed, warnings, errors, total } = diagnosis.summary;
  if (diagnosis.healthy) {
    lines.push(`✅ **전체 정상** (${passed}/${total} 통과)`);
  } else {
    lines.push(`❌ **문제 발견** (통과: ${passed}, 경고: ${warnings}, 오류: ${errors})`);
  }

  return lines.join('\n');
}

export default {
  runDiagnosis,
  formatDiagnosis
};
