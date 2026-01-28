/**
 * Glean Bridge - Claude Code 연동
 * anthropics/claude-code 플러그인과 데이터 연동
 */

import { execSync } from 'child_process';
import { commitToHarvestChange, prToInsight } from './data-transformer.js';

/**
 * Git 커밋 히스토리 가져오기
 * @param {object} options - 옵션
 * @returns {object[]} 커밋 목록
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
    console.error('Git 커밋 가져오기 실패:', error.message);
    return [];
  }
}

/**
 * 커밋 상세 정보 가져오기
 * @param {string} hash - 커밋 해시
 * @param {string} project - 프로젝트 경로
 * @returns {object|null} 커밋 상세
 */
export function getCommitDetails(hash, project) {
  const cwd = project || process.cwd();

  try {
    // 커밋 정보
    const info = execSync(
      `git show ${hash} --format='{"hash":"%H","message":"%s","body":"%b","date":"%aI","author":"%an"}' --stat`,
      { cwd, encoding: 'utf-8' }
    );

    // 변경된 파일 목록
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
    console.error('커밋 상세 가져오기 실패:', error.message);
    return null;
  }
}

/**
 * 커밋들을 Harvest changes로 변환
 * @param {object[]} commits - 커밋 목록
 * @returns {object} Harvest changes 형식
 */
export function commitsToHarvestChanges(commits) {
  return {
    commits: commits.map(commitToHarvestChange),
    totalLinesAdded: 0, // 상세 정보 필요 시 별도 계산
    totalLinesRemoved: 0
  };
}

/**
 * GitHub PR 정보 가져오기 (gh CLI 사용)
 * @param {object} options - 옵션
 * @returns {object[]} PR 목록
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
    // gh CLI 미설치 또는 인증 안 됨
    console.error('PR 가져오기 실패:', error.message);
    return [];
  }
}

/**
 * PR 상세 정보 가져오기
 * @param {number} prNumber - PR 번호
 * @param {string} project - 프로젝트 경로
 * @returns {object|null} PR 상세
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
    console.error('PR 상세 가져오기 실패:', error.message);
    return null;
  }
}

/**
 * PR들에서 인사이트 추출
 * @param {object[]} prs - PR 목록
 * @returns {object[]} Insight 목록
 */
export function extractInsightsFromPRs(prs) {
  return prs
    .filter(pr => pr.body || pr.title) // 내용이 있는 PR만
    .map(prToInsight);
}

/**
 * 오늘 작업 요약 (커밋 + PR)
 * @param {string} project - 프로젝트 경로
 * @returns {object} 작업 요약
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

  // 오늘 생성/업데이트된 PR만 필터
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
 * Claude Code 플러그인 연동 초기화
 * @returns {object} 연결 상태
 */
export function initializeConnection() {
  // Git 사용 가능 확인
  let gitAvailable = false;
  try {
    execSync('git --version', { encoding: 'utf-8' });
    gitAvailable = true;
  } catch {
    gitAvailable = false;
  }

  // gh CLI 사용 가능 확인
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
      ? 'Git 연동 준비됨' + (ghAvailable ? ', GitHub CLI 사용 가능' : '')
      : 'Git을 사용할 수 없어요'
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
