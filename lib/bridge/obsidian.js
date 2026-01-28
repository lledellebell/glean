/**
 * Glean Bridge - Obsidian Integration
 * Export data to Obsidian vault
 */

import { existsSync, writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { insightToObsidianNote, learnToObsidianNote, harvestToMarkdown } from './data-transformer.js';

// Default vault path candidates
const DEFAULT_VAULT_PATHS = [
  join(homedir(), 'Documents', 'Obsidian'),
  join(homedir(), 'Obsidian'),
  join(homedir(), 'Documents', 'Notes'),
  join(homedir(), 'notes')
];

/**
 * Find Obsidian vault
 * @param {string} customPath - Custom path specified by user
 * @returns {string|null} Vault path
 */
export function findVault(customPath) {
  // Check custom path
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // Check default paths
  for (const path of DEFAULT_VAULT_PATHS) {
    if (existsSync(path)) {
      // Check for .obsidian folder (vault identifier)
      const obsidianDir = join(path, '.obsidian');
      if (existsSync(obsidianDir)) {
        return path;
      }

      // Search subdirectories for vault
      try {
        const subdirs = readdirSync(path, { withFileTypes: true })
          .filter(d => d.isDirectory())
          .map(d => d.name);

        for (const subdir of subdirs) {
          const subPath = join(path, subdir);
          const subObsidian = join(subPath, '.obsidian');
          if (existsSync(subObsidian)) {
            return subPath;
          }
        }
      } catch {
        continue;
      }
    }
  }

  return null;
}

/**
 * Ensure Glean folder exists
 * @param {string} vaultPath - Vault path
 * @returns {string} Glean folder path
 */
export function ensureGleanFolder(vaultPath) {
  const gleanFolder = join(vaultPath, 'Glean');

  if (!existsSync(gleanFolder)) {
    mkdirSync(gleanFolder, { recursive: true });
  }

  // Create subfolders
  const subfolders = ['Insights', 'Learn', 'Harvests'];
  for (const folder of subfolders) {
    const folderPath = join(gleanFolder, folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }
  }

  return gleanFolder;
}

/**
 * Format frontmatter string
 * @param {object} frontmatter - Frontmatter object
 * @returns {string} YAML frontmatter
 */
function formatFrontmatter(frontmatter) {
  let yaml = '---\n';
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      for (const item of value) {
        yaml += `  - ${item}\n`;
      }
    } else if (value !== null && value !== undefined) {
      yaml += `${key}: ${value}\n`;
    }
  }
  yaml += '---\n\n';
  return yaml;
}

/**
 * Export Insight to Obsidian note
 * @param {object} insight - Glean Insight
 * @param {string} vaultPath - Vault path
 * @returns {string} Saved file path
 */
export function exportInsight(insight, vaultPath) {
  const gleanFolder = ensureGleanFolder(vaultPath);
  const { frontmatter, content, filename } = insightToObsidianNote(insight);

  const fullContent = formatFrontmatter(frontmatter) + content;
  const filepath = join(gleanFolder, 'Insights', filename);

  writeFileSync(filepath, fullContent, 'utf-8');
  return filepath;
}

/**
 * Export Learn Item to Obsidian note
 * @param {object} learnItem - Glean Learn Item
 * @param {string} vaultPath - Vault path
 * @returns {string} Saved file path
 */
export function exportLearnItem(learnItem, vaultPath) {
  const gleanFolder = ensureGleanFolder(vaultPath);
  const { frontmatter, content, filename } = learnToObsidianNote(learnItem);

  const fullContent = formatFrontmatter(frontmatter) + content;
  const filepath = join(gleanFolder, 'Learn', filename);

  writeFileSync(filepath, fullContent, 'utf-8');
  return filepath;
}

/**
 * Export Harvest to Obsidian note
 * @param {object} harvest - Glean Harvest
 * @param {string} vaultPath - Vault path
 * @returns {string} Saved file path
 */
export function exportHarvest(harvest, vaultPath) {
  const gleanFolder = ensureGleanFolder(vaultPath);
  const markdown = harvestToMarkdown(harvest);

  const date = harvest.session?.startTime?.split('T')[0] || new Date().toISOString().split('T')[0];
  const filename = `harvest-${date}-${harvest.id}.md`;
  const filepath = join(gleanFolder, 'Harvests', filename);

  const frontmatter = {
    title: `Session Harvest: ${date}`,
    date: harvest.session?.startTime,
    project: harvest.session?.project,
    duration: harvest.session?.duration,
    tags: ['glean', 'harvest', ...(harvest.summary?.keywords || [])]
  };

  const fullContent = formatFrontmatter(frontmatter) + markdown;
  writeFileSync(filepath, fullContent, 'utf-8');

  return filepath;
}

/**
 * Batch export multiple items
 * @param {object} data - Data to export
 * @param {string} vaultPath - Vault path
 * @returns {object} Export results
 */
export function exportBatch(data, vaultPath) {
  const results = {
    insights: { success: 0, failed: 0, files: [] },
    learn: { success: 0, failed: 0, files: [] },
    harvests: { success: 0, failed: 0, files: [] }
  };

  // Export Insights
  if (data.insights?.length > 0) {
    for (const insight of data.insights) {
      try {
        const filepath = exportInsight(insight, vaultPath);
        results.insights.success += 1;
        results.insights.files.push(filepath);
      } catch (error) {
        results.insights.failed += 1;
        console.error(`Failed to export insight: ${insight.id}`, error.message);
      }
    }
  }

  // Export Learn Items
  if (data.learn?.length > 0) {
    for (const item of data.learn) {
      try {
        const filepath = exportLearnItem(item, vaultPath);
        results.learn.success += 1;
        results.learn.files.push(filepath);
      } catch (error) {
        results.learn.failed += 1;
        console.error(`Failed to export learn item: ${item.id}`, error.message);
      }
    }
  }

  // Export Harvests
  if (data.harvests?.length > 0) {
    for (const harvest of data.harvests) {
      try {
        const filepath = exportHarvest(harvest, vaultPath);
        results.harvests.success += 1;
        results.harvests.files.push(filepath);
      } catch (error) {
        results.harvests.failed += 1;
        console.error(`Failed to export harvest: ${harvest.id}`, error.message);
      }
    }
  }

  return results;
}

/**
 * Initialise Obsidian connection
 * @param {string} customVaultPath - Custom vault path
 * @returns {object} Connection status
 */
export function initializeConnection(customVaultPath) {
  const vaultPath = findVault(customVaultPath);

  if (!vaultPath) {
    return {
      connected: false,
      vaultPath: null,
      message: 'Could not find Obsidian vault. Please specify the path manually.'
    };
  }

  // Create Glean folder
  const gleanFolder = ensureGleanFolder(vaultPath);

  return {
    connected: true,
    vaultPath,
    gleanFolder,
    message: `Connected to Obsidian vault: ${vaultPath}`
  };
}

/**
 * Get existing Glean notes
 * @param {string} vaultPath - Vault path
 * @returns {object} List of notes
 */
export function getExistingNotes(vaultPath) {
  const gleanFolder = join(vaultPath, 'Glean');

  if (!existsSync(gleanFolder)) {
    return { insights: [], learn: [], harvests: [] };
  }

  const result = {
    insights: [],
    learn: [],
    harvests: []
  };

  const folders = ['Insights', 'Learn', 'Harvests'];
  for (const folder of folders) {
    const folderPath = join(gleanFolder, folder);
    if (existsSync(folderPath)) {
      try {
        const files = readdirSync(folderPath)
          .filter(f => f.endsWith('.md'))
          .map(f => ({
            filename: f,
            path: join(folderPath, f)
          }));

        result[folder.toLowerCase()] = files;
      } catch {
        // Ignore errors
      }
    }
  }

  return result;
}

export default {
  findVault,
  ensureGleanFolder,
  exportInsight,
  exportLearnItem,
  exportHarvest,
  exportBatch,
  initializeConnection,
  getExistingNotes
};
