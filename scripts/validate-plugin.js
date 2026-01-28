#!/usr/bin/env node
/**
 * Glean Plugin Validator
 * Validates plugin structure and referenced files
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Required fields for main plugin.json
const REQUIRED_FIELDS = ['name', 'version', 'description'];

// Validation results
let errors = [];
let warnings = [];

/**
 * Validate JSON file
 */
function validateJson(filepath) {
  try {
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  } catch (e) {
    errors.push(`Invalid JSON: ${filepath} - ${e.message}`);
    return null;
  }
}

/**
 * Validate main plugin.json
 */
function validateMainPlugin() {
  const pluginPath = join(ROOT, '.claude-plugin', 'plugin.json');

  if (!existsSync(pluginPath)) {
    errors.push('Missing: .claude-plugin/plugin.json');
    return;
  }

  const plugin = validateJson(pluginPath);
  if (!plugin) return;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!plugin[field]) {
      errors.push(`Missing field in plugin.json: ${field}`);
    }
  }

  // Validate commands exist
  if (plugin.commands) {
    for (const cmd of plugin.commands) {
      const cmdPath = join(ROOT, cmd);
      if (!existsSync(cmdPath)) {
        errors.push(`Missing command: ${cmd}`);
      }
    }
  }

  // Validate agents exist
  if (plugin.agents) {
    for (const agent of plugin.agents) {
      const agentPath = join(ROOT, agent);
      if (!existsSync(agentPath)) {
        errors.push(`Missing agent: ${agent}`);
      }
    }
  }

  // Validate hooks directory
  if (plugin.hooks) {
    const hooksPath = join(ROOT, plugin.hooks);
    if (!existsSync(hooksPath)) {
      errors.push(`Missing hooks directory: ${plugin.hooks}`);
    }
  }

  console.log(`  Main plugin: ${plugin.name}@${plugin.version}`);
}

/**
 * Validate sub-plugins in plugins/ directory
 */
function validateSubPlugins() {
  const pluginsDir = join(ROOT, 'plugins');

  if (!existsSync(pluginsDir)) {
    warnings.push('No plugins/ directory found');
    return;
  }

  const plugins = readdirSync(pluginsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const pluginName of plugins) {
    const pluginJsonPath = join(pluginsDir, pluginName, 'plugin.json');

    if (!existsSync(pluginJsonPath)) {
      warnings.push(`Missing plugin.json in plugins/${pluginName}/`);
      continue;
    }

    const plugin = validateJson(pluginJsonPath);
    if (!plugin) continue;

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!plugin[field]) {
        errors.push(`Missing field in plugins/${pluginName}/plugin.json: ${field}`);
      }
    }

    // Validate component commands exist
    const commands = plugin.components?.commands || [];
    for (const cmd of commands) {
      const cmdPath = join(pluginsDir, pluginName, cmd);
      if (!existsSync(cmdPath)) {
        errors.push(`Missing command in ${pluginName}: ${cmd}`);
      }
    }

    console.log(`  Sub-plugin: ${plugin.name}@${plugin.version}`);
  }
}

/**
 * Validate lib exports
 */
function validateLib() {
  const indexPath = join(ROOT, 'lib', 'index.js');

  if (!existsSync(indexPath)) {
    warnings.push('Missing lib/index.js entry point');
    return;
  }

  // Check TypeScript definitions
  const dtsPath = join(ROOT, 'lib', 'index.d.ts');
  if (!existsSync(dtsPath)) {
    warnings.push('Missing lib/index.d.ts type definitions');
  }

  console.log('  Library: lib/index.js');
}

/**
 * Main
 */
function main() {
  console.log('\nGlean Plugin Validator\n');
  console.log('Validating...\n');

  validateMainPlugin();
  validateSubPlugins();
  validateLib();

  console.log('');

  // Report results
  if (warnings.length > 0) {
    console.log('Warnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('');
    console.log(`Validation failed with ${errors.length} error(s)\n`);
    process.exit(1);
  }

  console.log('Validation passed!\n');
}

main();
