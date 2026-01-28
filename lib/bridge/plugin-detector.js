/**
 * Glean Plugin Detector
 * 설치된 Claude Code 플러그인을 감지하고 연동 가능 여부 확인
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// 플러그인 검색 경로
const PLUGIN_PATHS = [
  join(homedir(), '.claude', 'plugins'),
  join(homedir(), '.claude-code', 'plugins'),
  join(process.cwd(), '.claude', 'plugins'),
  join(process.cwd(), 'node_modules')
];

// 알려진 플러그인 시그니처
const KNOWN_PLUGINS = {
  'claude-code': {
    names: ['@anthropic/claude-code', 'claude-code'],
    markers: ['commands/commit.md', 'commands/pr.md'],
    capabilities: [
      { name: 'commits', dataType: 'commit', direction: 'import' },
      { name: 'prs', dataType: 'pr', direction: 'import' }
    ]
  },
  'task-master': {
    names: ['claude-task-master', 'taskmaster-ai'],
    markers: ['commands/task.md', 'commands/plan.md'],
    capabilities: [
      { name: 'tasks', dataType: 'task', direction: 'bidirectional' }
    ]
  },
  'obsidian': {
    names: ['obsidian-skills', '@kepano/obsidian-skills'],
    markers: ['commands/note.md', 'commands/obsidian.md'],
    capabilities: [
      { name: 'notes', dataType: 'note', direction: 'export' }
    ]
  }
};

/**
 * 모든 플러그인 감지
 * @returns {object[]} 감지된 플러그인 목록
 */
export function detectAllPlugins() {
  const results = [];

  for (const [type, config] of Object.entries(KNOWN_PLUGINS)) {
    const detection = detectPlugin(type, config);
    results.push(detection);
  }

  return results;
}

/**
 * 특정 플러그인 감지
 * @param {string} type - 플러그인 타입
 * @param {object} config - 플러그인 설정
 * @returns {object} 감지 결과
 */
function detectPlugin(type, config) {
  const result = {
    type,
    detected: false,
    path: null,
    version: null,
    capabilities: config.capabilities || []
  };

  // 각 검색 경로에서 플러그인 찾기
  for (const basePath of PLUGIN_PATHS) {
    if (!existsSync(basePath)) continue;

    // 이름으로 검색
    for (const name of config.names) {
      const pluginPath = join(basePath, name);
      if (existsSync(pluginPath)) {
        result.detected = true;
        result.path = pluginPath;
        result.version = getPluginVersion(pluginPath);
        return result;
      }
    }

    // 마커 파일로 검색 (하위 디렉토리)
    try {
      const dirs = readdirSync(basePath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const dir of dirs) {
        const dirPath = join(basePath, dir);
        if (hasMarkerFiles(dirPath, config.markers)) {
          result.detected = true;
          result.path = dirPath;
          result.version = getPluginVersion(dirPath);
          return result;
        }
      }
    } catch {
      // 디렉토리 읽기 실패 무시
    }
  }

  return result;
}

/**
 * 마커 파일 존재 여부 확인
 */
function hasMarkerFiles(pluginPath, markers) {
  if (!markers || markers.length === 0) return false;

  return markers.some(marker => {
    const markerPath = join(pluginPath, marker);
    return existsSync(markerPath);
  });
}

/**
 * 플러그인 버전 가져오기
 */
function getPluginVersion(pluginPath) {
  const packagePath = join(pluginPath, 'package.json');
  const pluginJsonPath = join(pluginPath, 'plugin.json');
  const claudePluginPath = join(pluginPath, '.claude-plugin', 'plugin.json');

  for (const configPath of [packagePath, pluginJsonPath, claudePluginPath]) {
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        return config.version || null;
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * 플러그인 상세 정보 가져오기
 * @param {string} pluginPath - 플러그인 경로
 * @returns {object|null} 플러그인 정보
 */
export function getPluginInfo(pluginPath) {
  if (!existsSync(pluginPath)) return null;

  const info = {
    path: pluginPath,
    name: null,
    version: null,
    description: null,
    commands: [],
    capabilities: []
  };

  // package.json 또는 plugin.json에서 정보 읽기
  const configFiles = [
    join(pluginPath, 'package.json'),
    join(pluginPath, 'plugin.json'),
    join(pluginPath, '.claude-plugin', 'plugin.json')
  ];

  for (const configPath of configFiles) {
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        info.name = config.name || info.name;
        info.version = config.version || info.version;
        info.description = config.description || info.description;

        // 명령어 목록
        if (config.components?.commands) {
          info.commands = config.components.commands;
        }
        break;
      } catch {
        continue;
      }
    }
  }

  // commands 디렉토리에서 명령어 스캔
  const commandsDir = join(pluginPath, 'commands');
  if (existsSync(commandsDir)) {
    try {
      const commands = readdirSync(commandsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
      info.commands = [...new Set([...info.commands, ...commands])];
    } catch {
      // 무시
    }
  }

  return info;
}

/**
 * 연동 가능한 플러그인 목록
 * @returns {object[]} 연동 가능한 플러그인
 */
export function getConnectablePlugins() {
  const detected = detectAllPlugins();
  return detected.filter(p => p.detected);
}

/**
 * 플러그인 연동 상태 확인
 * @param {string} type - 플러그인 타입
 * @returns {string} 상태 (connected, disconnected, not_installed, error)
 */
export function checkPluginStatus(type) {
  const detection = detectAllPlugins().find(p => p.type === type);

  if (!detection) return 'not_installed';
  if (!detection.detected) return 'not_installed';

  // TODO: 실제 연결 상태 확인 로직 추가
  return 'disconnected';
}

export default {
  detectAllPlugins,
  getPluginInfo,
  getConnectablePlugins,
  checkPluginStatus,
  KNOWN_PLUGINS
};
