/**
 * Glean Bridge - Obsidian 연동
 * Obsidian 볼트로 데이터 내보내기
 */

import { existsSync, writeFileSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';
import { insightToObsidianNote, learnToObsidianNote, harvestToMarkdown } from './data-transformer.js';

// 기본 볼트 경로 후보
const DEFAULT_VAULT_PATHS = [
  join(homedir(), 'Documents', 'Obsidian'),
  join(homedir(), 'Obsidian'),
  join(homedir(), 'Documents', 'Notes'),
  join(homedir(), 'notes')
];

/**
 * Obsidian 볼트 찾기
 * @param {string} customPath - 사용자 지정 경로
 * @returns {string|null} 볼트 경로
 */
export function findVault(customPath) {
  // 사용자 지정 경로 확인
  if (customPath && existsSync(customPath)) {
    return customPath;
  }

  // 기본 경로들 확인
  for (const path of DEFAULT_VAULT_PATHS) {
    if (existsSync(path)) {
      // .obsidian 폴더가 있는지 확인 (볼트 식별)
      const obsidianDir = join(path, '.obsidian');
      if (existsSync(obsidianDir)) {
        return path;
      }

      // 하위 디렉토리에서 볼트 찾기
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
 * Glean 전용 폴더 확인/생성
 * @param {string} vaultPath - 볼트 경로
 * @returns {string} Glean 폴더 경로
 */
export function ensureGleanFolder(vaultPath) {
  const gleanFolder = join(vaultPath, 'Glean');

  if (!existsSync(gleanFolder)) {
    mkdirSync(gleanFolder, { recursive: true });
  }

  // 하위 폴더 생성
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
 * Frontmatter 문자열 생성
 * @param {object} frontmatter - Frontmatter 객체
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
 * Insight를 Obsidian 노트로 내보내기
 * @param {object} insight - Glean Insight
 * @param {string} vaultPath - 볼트 경로
 * @returns {string} 저장된 파일 경로
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
 * Learn Item을 Obsidian 노트로 내보내기
 * @param {object} learnItem - Glean Learn Item
 * @param {string} vaultPath - 볼트 경로
 * @returns {string} 저장된 파일 경로
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
 * Harvest를 Obsidian 노트로 내보내기
 * @param {object} harvest - Glean Harvest
 * @param {string} vaultPath - 볼트 경로
 * @returns {string} 저장된 파일 경로
 */
export function exportHarvest(harvest, vaultPath) {
  const gleanFolder = ensureGleanFolder(vaultPath);
  const markdown = harvestToMarkdown(harvest);

  const date = harvest.session?.startTime?.split('T')[0] || new Date().toISOString().split('T')[0];
  const filename = `harvest-${date}-${harvest.id}.md`;
  const filepath = join(gleanFolder, 'Harvests', filename);

  const frontmatter = {
    title: `세션 수확: ${date}`,
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
 * 여러 항목 일괄 내보내기
 * @param {object} data - 내보낼 데이터
 * @param {string} vaultPath - 볼트 경로
 * @returns {object} 내보내기 결과
 */
export function exportBatch(data, vaultPath) {
  const results = {
    insights: { success: 0, failed: 0, files: [] },
    learn: { success: 0, failed: 0, files: [] },
    harvests: { success: 0, failed: 0, files: [] }
  };

  // Insights 내보내기
  if (data.insights?.length > 0) {
    for (const insight of data.insights) {
      try {
        const filepath = exportInsight(insight, vaultPath);
        results.insights.success += 1;
        results.insights.files.push(filepath);
      } catch (error) {
        results.insights.failed += 1;
        console.error(`Insight 내보내기 실패: ${insight.id}`, error.message);
      }
    }
  }

  // Learn Items 내보내기
  if (data.learn?.length > 0) {
    for (const item of data.learn) {
      try {
        const filepath = exportLearnItem(item, vaultPath);
        results.learn.success += 1;
        results.learn.files.push(filepath);
      } catch (error) {
        results.learn.failed += 1;
        console.error(`Learn 내보내기 실패: ${item.id}`, error.message);
      }
    }
  }

  // Harvests 내보내기
  if (data.harvests?.length > 0) {
    for (const harvest of data.harvests) {
      try {
        const filepath = exportHarvest(harvest, vaultPath);
        results.harvests.success += 1;
        results.harvests.files.push(filepath);
      } catch (error) {
        results.harvests.failed += 1;
        console.error(`Harvest 내보내기 실패: ${harvest.id}`, error.message);
      }
    }
  }

  return results;
}

/**
 * Obsidian 연동 초기화
 * @param {string} customVaultPath - 사용자 지정 볼트 경로
 * @returns {object} 연결 상태
 */
export function initializeConnection(customVaultPath) {
  const vaultPath = findVault(customVaultPath);

  if (!vaultPath) {
    return {
      connected: false,
      vaultPath: null,
      message: 'Obsidian 볼트를 찾을 수 없어요. 경로를 직접 지정해주세요.'
    };
  }

  // Glean 폴더 생성
  const gleanFolder = ensureGleanFolder(vaultPath);

  return {
    connected: true,
    vaultPath,
    gleanFolder,
    message: `Obsidian 볼트 연결됨: ${vaultPath}`
  };
}

/**
 * 기존 Glean 노트 목록 가져오기
 * @param {string} vaultPath - 볼트 경로
 * @returns {object} 노트 목록
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
        // 무시
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
