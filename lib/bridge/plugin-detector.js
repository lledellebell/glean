/**
 * Glean Plugin Detector
 * Detect installed Claude Code plugins and check integration availability
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Plugin search paths
const PLUGIN_PATHS = [
  join(homedir(), '.claude', 'plugins'),
  join(homedir(), '.claude-code', 'plugins'),
  join(process.cwd(), '.claude', 'plugins'),
  join(process.cwd(), 'node_modules')
];

// Known plugin signatures
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
 * Detect all plugins
 * @returns {object[]} List of detected plugins
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
 * Detect specific plugin
 * @param {string} type - Plugin type
 * @param {object} config - Plugin configuration
 * @returns {object} Detection result
 */
function detectPlugin(type, config) {
  const result = {
    type,
    detected: false,
    path: null,
    version: null,
    capabilities: config.capabilities || []
  };

  // Search for plugin in each path
  for (const basePath of PLUGIN_PATHS) {
    if (!existsSync(basePath)) continue;

    // Search by name
    for (const name of config.names) {
      const pluginPath = join(basePath, name);
      if (existsSync(pluginPath)) {
        result.detected = true;
        result.path = pluginPath;
        result.version = getPluginVersion(pluginPath);
        return result;
      }
    }

    // Search by marker files (subdirectories)
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
      // Ignore directory read errors
    }
  }

  return result;
}

/**
 * Check if marker files exist
 */
function hasMarkerFiles(pluginPath, markers) {
  if (!markers || markers.length === 0) return false;

  return markers.some(marker => {
    const markerPath = join(pluginPath, marker);
    return existsSync(markerPath);
  });
}

/**
 * Get plugin version
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
 * Get plugin detailed information
 * @param {string} pluginPath - Plugin path
 * @returns {object|null} Plugin information
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

  // Read info from package.json or plugin.json
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

        // Command list
        if (config.components?.commands) {
          info.commands = config.components.commands;
        }
        break;
      } catch {
        continue;
      }
    }
  }

  // Scan commands directory
  const commandsDir = join(pluginPath, 'commands');
  if (existsSync(commandsDir)) {
    try {
      const commands = readdirSync(commandsDir)
        .filter(f => f.endsWith('.md'))
        .map(f => f.replace('.md', ''));
      info.commands = [...new Set([...info.commands, ...commands])];
    } catch {
      // Ignore
    }
  }

  return info;
}

/**
 * Get list of connectable plugins
 * @returns {object[]} Connectable plugins
 */
export function getConnectablePlugins() {
  const detected = detectAllPlugins();
  return detected.filter(p => p.detected);
}

/**
 * Check plugin connection status
 * @param {string} type - Plugin type
 * @returns {string} Status (connected, disconnected, not_installed, error)
 */
export function checkPluginStatus(type) {
  const detection = detectAllPlugins().find(p => p.type === type);

  if (!detection) return 'not_installed';
  if (!detection.detected) return 'not_installed';

  // TODO: Add actual connection status check logic
  return 'disconnected';
}

export default {
  detectAllPlugins,
  getPluginInfo,
  getConnectablePlugins,
  checkPluginStatus,
  KNOWN_PLUGINS
};
