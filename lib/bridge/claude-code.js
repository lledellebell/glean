/**
 * Glean Bridge - Claude Code Integration
 * Data integration with anthropics/claude-code plugin
 */

import { execSync } from 'child_process';
import { commitToHarvestChange, prToInsight } from './data-transformer.js';

/**
 * Get git commit history
 * @param {object} options - Options
 * @returns {object[]} List of commits
 */
export function getRecentCommits(options = {}) {
  const { limit = 10, since, project } = options;
  const cwd = project || process.cwd();

  try {
    let cmd = `git log --format='{"hash":"%H","message":"%s","date":"%aI","author":"%an"}' -n ${limit}`;
    if (since) {
      cmd += ` --since="${since}"`;
    }

    const output = execSync(cmd, { cwd, encoding: 'utf-8' });
    const lines = output.trim().split('\n').filter(Boolean);

    return lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
  } catch (error) {
    console.error('Failed to fetch git commits:', error.message);
    return [];
  }
}

/**
 * Get commit details
 * @param {string} hash - Commit hash
 * @param {string} project - Project path
 * @returns {object|null} Commit details
 */
export function getCommitDetails(hash, project) {
  const cwd = project || process.cwd();

  try {
    // Commit info
    const info = execSync(
      `git show ${hash} --format='{"hash":"%H","message":"%s","body":"%b","date":"%aI","author":"%an"}' --stat`,
      { cwd, encoding: 'utf-8' }
    );

    // Changed files list
    const files = execSync(
      `git diff-tree --no-commit-id --name-status -r ${hash}`,
      { cwd, encoding: 'utf-8' }
    );

    const fileChanges = files.trim().split('\n').map(line => {
      const [status, path] = line.split('\t');
      return {
        path,
        action: status === 'A' ? 'created' : status === 'D' ? 'deleted' : 'modified'
      };
    });

    return {
      ...JSON.parse(info.split('\n')[0]),
      files: fileChanges
    };
  } catch (error) {
    console.error('Failed to fetch commit details:', error.message);
    return null;
  }
}

/**
 * Convert commits to Harvest changes format
 * @param {object[]} commits - List of commits
 * @returns {object} Harvest changes format
 */
export function commitsToHarvestChanges(commits) {
  return {
    commits: commits.map(commitToHarvestChange),
    totalLinesAdded: 0, // Calculate separately if detailed info needed
    totalLinesRemoved: 0
  };
}

/**
 * Get GitHub PR information (using gh CLI)
 * @param {object} options - Options
 * @returns {object[]} List of PRs
 */
export function getRecentPRs(options = {}) {
  const { limit = 5, state = 'all', project } = options;
  const cwd = project || process.cwd();

  try {
    const output = execSync(
      `gh pr list --limit ${limit} --state ${state} --json number,title,body,labels,files,createdAt,author`,
      { cwd, encoding: 'utf-8' }
    );

    return JSON.parse(output);
  } catch (error) {
    // gh CLI not installed or not authenticated
    console.error('Failed to fetch PRs:', error.message);
    return [];
  }
}

/**
 * Get PR details
 * @param {number} prNumber - PR number
 * @param {string} project - Project path
 * @returns {object|null} PR details
 */
export function getPRDetails(prNumber, project) {
  const cwd = project || process.cwd();

  try {
    const output = execSync(
      `gh pr view ${prNumber} --json number,title,body,labels,files,commits,reviews,comments,createdAt,author`,
      { cwd, encoding: 'utf-8' }
    );

    return JSON.parse(output);
  } catch (error) {
    console.error('Failed to fetch PR details:', error.message);
    return null;
  }
}

/**
 * Extract insights from PRs
 * @param {object[]} prs - List of PRs
 * @returns {object[]} List of insights
 */
export function extractInsightsFromPRs(prs) {
  return prs
    .filter(pr => pr.body || pr.title) // Only PRs with content
    .map(prToInsight);
}

/**
 * Get today's work summary (commits + PRs)
 * @param {string} project - Project path
 * @returns {object} Work summary
 */
export function getTodaySummary(project) {
  const today = new Date().toISOString().split('T')[0];

  const commits = getRecentCommits({
    limit: 50,
    since: today,
    project
  });

  const prs = getRecentPRs({
    limit: 10,
    state: 'all',
    project
  });

  // Filter only today's created/updated PRs
  const todayPRs = prs.filter(pr => {
    const prDate = pr.createdAt?.split('T')[0];
    return prDate === today;
  });

  return {
    date: today,
    commits: {
      count: commits.length,
      items: commits
    },
    prs: {
      count: todayPRs.length,
      items: todayPRs
    },
    summary: {
      totalCommits: commits.length,
      totalPRs: todayPRs.length,
      mainMessages: commits.slice(0, 5).map(c => c.message)
    }
  };
}

/**
 * Initialise Claude Code plugin connection
 * @returns {object} Connection status
 */
export function initializeConnection() {
  // Check git availability
  let gitAvailable = false;
  try {
    execSync('git --version', { encoding: 'utf-8' });
    gitAvailable = true;
  } catch {
    gitAvailable = false;
  }

  // Check gh CLI availability
  let ghAvailable = false;
  try {
    execSync('gh --version', { encoding: 'utf-8' });
    ghAvailable = true;
  } catch {
    ghAvailable = false;
  }

  return {
    connected: gitAvailable,
    capabilities: {
      commits: gitAvailable,
      prs: ghAvailable,
      branches: gitAvailable
    },
    message: gitAvailable
      ? 'Git integration ready' + (ghAvailable ? ', GitHub CLI available' : '')
      : 'Git is not available'
  };
}

export default {
  getRecentCommits,
  getCommitDetails,
  commitsToHarvestChanges,
  getRecentPRs,
  getPRDetails,
  extractInsightsFromPRs,
  getTodaySummary,
  initializeConnection
};
