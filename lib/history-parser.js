/**
 * Glean History Parser
 * Parses Claude Code JSONL session files to extract user/assistant text
 */

import { createReadStream, readdirSync, statSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';
import { homedir } from 'os';

const CLAUDE_PROJECTS_DIR = join(homedir(), '.claude', 'projects');
const DEFAULT_CHUNK_SIZE = 50 * 1024; // 50KB

/**
 * Convert project directory name to actual path
 * e.g. "-Users-b-projects-glean" → "/Users/b/projects/glean"
 * @param {string} dirName - Directory name from ~/.claude/projects/
 * @returns {string} Actual filesystem path
 */
export function projectDirToPath(dirName) {
  // Replace leading dash and all subsequent dashes with path separator
  // But preserve dashes that are part of actual directory names
  // Claude uses the full path with separators replaced by dashes
  return '/' + dirName.slice(1).replace(/-/g, '/');
}

/**
 * Convert actual path to project directory name
 * e.g. "/Users/b/projects/glean" → "-Users-b-projects-glean"
 * @param {string} path - Actual filesystem path
 * @returns {string} Directory name for ~/.claude/projects/
 */
export function pathToProjectDir(path) {
  return path.replace(/\//g, '-');
}

/**
 * Discover session files in ~/.claude/projects/
 * @param {object} options
 * @param {string} [options.project] - Specific project path to filter
 * @param {boolean} [options.all] - Scan all projects
 * @param {number} [options.limit] - Maximum sessions to return
 * @param {string} [options.since] - ISO date string, only sessions after this date
 * @returns {Promise<Array<{filepath: string, project: string, projectPath: string, size: number, modified: Date}>>}
 */
export async function discoverSessions(options = {}) {
  const { project, all = false, limit = 10, since } = options;

  if (!existsSync(CLAUDE_PROJECTS_DIR)) {
    return [];
  }

  const sessions = [];
  let projectDirs;

  if (project) {
    // Find matching project directory
    const targetDir = pathToProjectDir(project);
    const allDirs = readdirSync(CLAUDE_PROJECTS_DIR);
    projectDirs = allDirs.filter(d => d === targetDir);
    if (projectDirs.length === 0) {
      // Try partial match
      projectDirs = allDirs.filter(d => d.includes(targetDir) || targetDir.includes(d));
    }
  } else if (all) {
    projectDirs = readdirSync(CLAUDE_PROJECTS_DIR);
  } else {
    // Default: current working directory
    const cwd = process.cwd();
    const targetDir = pathToProjectDir(cwd);
    const allDirs = readdirSync(CLAUDE_PROJECTS_DIR);
    projectDirs = allDirs.filter(d => d === targetDir);
    if (projectDirs.length === 0) {
      projectDirs = allDirs.filter(d => targetDir.startsWith(d) || d.startsWith(targetDir));
    }
  }

  for (const dir of projectDirs) {
    const dirPath = join(CLAUDE_PROJECTS_DIR, dir);
    try {
      const stat = statSync(dirPath);
      if (!stat.isDirectory()) continue;
    } catch {
      continue;
    }

    const files = readdirSync(dirPath).filter(f => f.endsWith('.jsonl'));
    const projectPath = projectDirToPath(dir);

    for (const file of files) {
      const filepath = join(dirPath, file);
      try {
        const stat = statSync(filepath);

        if (since) {
          const sinceDate = new Date(since);
          if (stat.mtime < sinceDate) continue;
        }

        sessions.push({
          filepath,
          project: dir,
          projectPath,
          size: stat.size,
          modified: stat.mtime
        });
      } catch {
        continue;
      }
    }
  }

  // Sort by most recent first
  sessions.sort((a, b) => b.modified - a.modified);

  return limit ? sessions.slice(0, limit) : sessions;
}

/**
 * Parse a JSONL session file, extracting only user/assistant text content
 * @param {string} filepath - Path to JSONL file
 * @returns {Promise<{messages: Array<{role: string, text: string, timestamp?: string}>, totalLines: number, filteredLines: number}>}
 */
export async function parseSession(filepath) {
  const messages = [];
  let totalLines = 0;
  let filteredLines = 0;

  const stream = createReadStream(filepath, { encoding: 'utf-8' });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    totalLines++;
    if (!line.trim()) continue;

    try {
      const entry = JSON.parse(line);

      // Extract user messages
      if (entry.type === 'human' || entry.role === 'user') {
        const text = extractText(entry);
        if (text) {
          filteredLines++;
          messages.push({ role: 'user', text, timestamp: entry.timestamp });
        }
      }

      // Extract assistant messages
      if (entry.type === 'assistant' || entry.role === 'assistant') {
        const text = extractText(entry);
        if (text) {
          filteredLines++;
          messages.push({ role: 'assistant', text, timestamp: entry.timestamp });
        }
      }
    } catch {
      // Skip malformed lines
      continue;
    }
  }

  return { messages, totalLines, filteredLines };
}

/**
 * Extract text content from a message entry
 * Handles various Claude Code JSONL message formats
 * @param {object} entry - Parsed JSONL line
 * @returns {string|null}
 */
function extractText(entry) {
  // Direct text field
  if (typeof entry.text === 'string' && entry.text.trim()) {
    return entry.text.trim();
  }

  // Content array format (Claude API style)
  if (Array.isArray(entry.content)) {
    const textParts = entry.content
      .filter(block => {
        if (block.type === 'text' && typeof block.text === 'string') return true;
        return false;
      })
      .map(block => block.text.trim())
      .filter(t => t.length > 0);

    if (textParts.length > 0) {
      return textParts.join('\n\n');
    }
  }

  // Message wrapper format
  if (entry.message && typeof entry.message === 'object') {
    return extractText(entry.message);
  }

  return null;
}

/**
 * Chunk parsed session into pieces of maxSize bytes
 * @param {object} parsed - Output from parseSession
 * @param {number} [maxSize] - Maximum chunk size in bytes (default: 50KB)
 * @returns {Array<{messages: Array, chunkIndex: number, totalChunks: number}>}
 */
export function chunkSession(parsed, maxSize = DEFAULT_CHUNK_SIZE) {
  const { messages } = parsed;
  if (messages.length === 0) return [];

  const chunks = [];
  let currentChunk = [];
  let currentSize = 0;

  for (const msg of messages) {
    const msgSize = Buffer.byteLength(JSON.stringify(msg), 'utf-8');

    if (currentSize + msgSize > maxSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = [];
      currentSize = 0;
    }

    currentChunk.push(msg);
    currentSize += msgSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks.map((messages, i) => ({
    messages,
    chunkIndex: i,
    totalChunks: chunks.length
  }));
}

/**
 * Format parsed messages for agent input
 * @param {object} parsed - Output from parseSession (or a chunk)
 * @param {object} [options]
 * @param {string} [options.projectPath] - Project path for context
 * @param {number} [options.chunkIndex] - Current chunk index
 * @param {number} [options.totalChunks] - Total number of chunks
 * @returns {string} Formatted text for agent consumption
 */
export function formatForAgent(parsed, options = {}) {
  const { projectPath, chunkIndex, totalChunks } = options;
  const messages = parsed.messages || parsed;

  const lines = [];

  if (projectPath) {
    lines.push(`## Project: ${projectPath}`);
  }

  if (totalChunks && totalChunks > 1) {
    lines.push(`## Chunk ${chunkIndex + 1} of ${totalChunks}`);
  }

  lines.push('## Session Transcript\n');

  for (const msg of messages) {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    lines.push(`### ${role}`);
    lines.push(msg.text);
    lines.push('');
  }

  return lines.join('\n');
}

export default {
  projectDirToPath,
  pathToProjectDir,
  discoverSessions,
  parseSession,
  chunkSession,
  formatForAgent
};
