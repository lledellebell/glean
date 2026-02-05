/**
 * Glean Plugin Detector
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PLUGIN_PATHS = [
  join(homedir(), '.claude', 'plugins'),
  join(homedir(), '.claude-code', 'plugins'),
  join(process.cwd(), '.claude', 'plugins'),
  join(process.cwd(), 'node_modules')
];

export const KNOWN_PLUGINS = {
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
 * @returns {object[]}
 */
export function detectAllPlugins() {
  const results = [];

  for (const [type, config] of Object.entries(KNOWN_PLUGINS)) {
    const detection = detectPlugin(type, config);
    results.push(detection);
  }

  return results;
}

function detectPlugin(type, config) {
  const result = {
    type,
    name: type,
    detected: false,
    path: null,
    version: null,
    capabilities: config.capabilities || []
  };

  for (const basePath of PLUGIN_PATHS) {
    if (!existsSync(basePath)) continue;

    for (const name of config.names) {
      const pluginPath = join(basePath, name);
      if (existsSync(pluginPath)) {
        result.detected = true;
        result.path = pluginPath;
        result.version = getPluginVersion(pluginPath);
        return result;
      }
    }

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
      // 디렉토리 읽기 오류 무시
    }
  }

  return result;
}

function hasMarkerFiles(pluginPath, markers) {
  if (!markers || markers.length === 0) return false;
  return markers.some(marker => existsSync(join(pluginPath, marker)));
}

function getPluginVersion(pluginPath) {
  const configPaths = [
    join(pluginPath, 'package.json'),
    join(pluginPath, 'plugin.json'),
    join(pluginPath, '.claude-plugin', 'plugin.json')
  ];

  for (const configPath of configPaths) {
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
 * @param {string} pluginPath
 * @returns {object|null}
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

        if (config.components?.commands) {
          info.commands = config.components.commands;
        }
        break;
      } catch {
        continue;
      }
    }
  }

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
 * @returns {object[]}
 */
export function getConnectablePlugins() {
  return detectAllPlugins().filter(p => p.detected);
}

/**
 * @param {string} type
 * @returns {'connected' | 'disconnected' | 'not_installed' | 'error'}
 */
export function checkPluginStatus(type) {
  const detection = detectAllPlugins().find(p => p.type === type);

  if (!detection || !detection.detected) return 'not_installed';

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
