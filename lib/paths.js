/**
 * Glean shared path constants and directory utilities
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const GLEAN_DIR = join(homedir(), '.glean');
export const HARVESTS_DIR = join(GLEAN_DIR, 'harvests');
export const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');
export const LEARN_DIR = join(GLEAN_DIR, 'learn');

/**
 * Ensure directory exists, optionally create index file with defaults
 * @param {string} dir - Directory path
 * @param {string} [indexFile] - Index file path (optional)
 * @param {object} [indexDefault] - Index file default value (optional)
 */
export function ensureDir(dir, indexFile, indexDefault) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (indexFile && !existsSync(indexFile)) {
    writeFileSync(indexFile, JSON.stringify(indexDefault, null, 2));
  }
}
