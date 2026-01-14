#!/usr/bin/env node

/**
 * Glean CLI - Setup wizard and utilities
 */

import { createInterface } from 'readline';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const GLEAN_DIR = join(homedir(), '.glean');
const CONFIG_FILE = join(GLEAN_DIR, 'config.json');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function print(message = '') {
  console.log(message);
}

function printHeader() {
  print();
  print('  ╔═══════════════════════════════════════╗');
  print('  ║           Glean Setup Wizard          ║');
  print('  ║   Knowledge Harvesting for AI Coders  ║');
  print('  ╚═══════════════════════════════════════╝');
  print();
}

function printSection(title) {
  print();
  print(`  [ ${title} ]`);
  print('  ' + '─'.repeat(40));
}

async function confirm(prompt, defaultValue = true) {
  const suffix = defaultValue ? ' [Y/n]: ' : ' [y/N]: ';
  const answer = await question('  ' + prompt + suffix);
  if (answer.trim() === '') return defaultValue;
  return answer.toLowerCase().startsWith('y');
}

async function select(prompt, options) {
  print('  ' + prompt);
  options.forEach((opt, i) => {
    print(`    ${i + 1}. ${opt}`);
  });
  const answer = await question('  Select (1-' + options.length + '): ');
  const index = parseInt(answer, 10) - 1;
  if (index >= 0 && index < options.length) {
    return options[index];
  }
  return options[0];
}

async function input(prompt, defaultValue = '') {
  const suffix = defaultValue ? ` [${defaultValue}]: ` : ': ';
  const answer = await question('  ' + prompt + suffix);
  return answer.trim() || defaultValue;
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
}

function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
    } catch {
      return null;
    }
  }
  return null;
}

function saveConfig(config) {
  ensureDir(GLEAN_DIR);
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

async function setupWizard() {
  printHeader();

  const existingConfig = loadConfig();
  if (existingConfig) {
    print('  Existing configuration found at ~/.glean/config.json');
    const reconfigure = await confirm('Reconfigure?', false);
    if (!reconfigure) {
      print('  Setup cancelled.');
      rl.close();
      return;
    }
  }

  const config = {
    version: '0.1.0',
    harvest: {},
    learn: {},
    integrations: {}
  };

  // Harvest Settings
  printSection('Harvest Settings');

  config.harvest.autoHarvest = await confirm('Enable auto-harvest on session end?', true);

  const harvestMode = await select('Default harvest mode:', ['quick', 'full', 'custom']);
  config.harvest.mode = harvestMode;

  const minDuration = await input('Minimum session duration (seconds)', '600');
  config.harvest.minDuration = parseInt(minDuration, 10) || 600;

  // Learn Settings
  printSection('Learning Settings');

  config.learn.reviewReminder = await confirm('Enable daily review reminders?', true);

  const defaultConfidence = await input('Default confidence level (1-5)', '3');
  config.learn.defaultConfidence = Math.min(5, Math.max(1, parseInt(defaultConfidence, 10) || 3));

  config.learn.dailyGoal = parseInt(await input('Daily review goal', '5'), 10) || 5;

  // Integrations
  printSection('Integrations');

  // Obsidian
  const useObsidian = await confirm('Enable Obsidian integration?', false);
  if (useObsidian) {
    const vaultPath = await input('Obsidian vault path', '~/Documents/Obsidian/Vault');
    const folder = await input('Glean folder in vault', 'Glean');
    config.integrations.obsidian = {
      enabled: true,
      vaultPath: vaultPath,
      folder: folder
    };
  }

  // GitHub
  const useGitHub = await confirm('Enable GitHub integration?', false);
  if (useGitHub) {
    config.integrations.github = {
      enabled: true,
      createIssues: await confirm('Auto-create issues from tasks?', false),
      syncPRs: await confirm('Sync PR data to insights?', true)
    };
  }

  // Notion
  const useNotion = await confirm('Enable Notion integration?', false);
  if (useNotion) {
    const notionToken = await input('Notion API token (or leave empty to set later)', '');
    config.integrations.notion = {
      enabled: true,
      token: notionToken || 'SET_YOUR_TOKEN_HERE',
      databaseId: await input('Learning database ID (optional)', '')
    };
  }

  // Create directories
  printSection('Creating Directories');

  const dirs = ['harvests', 'insights', 'learn', 'contexts', 'history'];
  dirs.forEach(dir => {
    const path = join(GLEAN_DIR, dir);
    const created = ensureDir(path);
    print(`  ${created ? '[Created]' : '[Exists]'} ~/.glean/${dir}/`);
  });

  // Save config
  printSection('Saving Configuration');
  saveConfig(config);
  print('  Configuration saved to ~/.glean/config.json');

  // Summary
  printSection('Setup Complete');
  print();
  print('  Glean is ready to use!');
  print();
  print('  Quick Start:');
  print('    1. Start a Claude Code session');
  print('    2. Run /glean at session end');
  print('    3. Run /learn review to study');
  print();
  print('  Configuration: ~/.glean/config.json');
  print('  Data: ~/.glean/');
  print();

  rl.close();
}

async function showStatus() {
  printHeader();

  const config = loadConfig();

  printSection('Configuration');
  if (config) {
    print('  Status: Configured');
    print(`  Version: ${config.version || 'unknown'}`);
    print(`  Auto-harvest: ${config.harvest?.autoHarvest ? 'Enabled' : 'Disabled'}`);
    print(`  Review reminders: ${config.learn?.reviewReminder ? 'Enabled' : 'Disabled'}`);
  } else {
    print('  Status: Not configured');
    print('  Run "glean init" to set up');
  }

  printSection('Data Directories');
  const dirs = ['harvests', 'insights', 'learn', 'contexts', 'history'];
  dirs.forEach(dir => {
    const path = join(GLEAN_DIR, dir);
    const exists = existsSync(path);
    print(`  ${exists ? '[OK]' : '[Missing]'} ~/.glean/${dir}/`);
  });

  printSection('Integrations');
  if (config?.integrations) {
    const integrations = config.integrations;
    print(`  Obsidian: ${integrations.obsidian?.enabled ? 'Enabled' : 'Disabled'}`);
    print(`  GitHub: ${integrations.github?.enabled ? 'Enabled' : 'Disabled'}`);
    print(`  Notion: ${integrations.notion?.enabled ? 'Enabled' : 'Disabled'}`);
  } else {
    print('  No integrations configured');
  }

  print();
  rl.close();
}

function showHelp() {
  printHeader();

  print('  Usage: glean <command>');
  print();
  print('  Commands:');
  print('    init      Run setup wizard');
  print('    status    Show current configuration');
  print('    help      Show this help message');
  print();
  print('  Examples:');
  print('    glean init     # Configure Glean');
  print('    glean status   # Check configuration');
  print();

  rl.close();
}

// Main
const command = process.argv[2] || 'help';

switch (command) {
  case 'init':
  case 'setup':
    setupWizard().catch(console.error);
    break;
  case 'status':
    showStatus().catch(console.error);
    break;
  case 'help':
  case '--help':
  case '-h':
  default:
    showHelp();
    break;
}
