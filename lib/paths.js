/**
 * Glean 경로 상수 및 디렉토리 초기화 유틸
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const GLEAN_DIR = join(homedir(), '.glean');
export const HARVESTS_DIR = join(GLEAN_DIR, 'harvests');
export const INSIGHTS_DIR = join(GLEAN_DIR, 'insights');
export const LEARN_DIR = join(GLEAN_DIR, 'learn');
export const DAILY_DIR = join(GLEAN_DIR, 'daily');

/**
 * 디렉토리가 없으면 생성하고, 인덱스 파일이 없으면 초기값으로 생성해요
 * @param {string} dir - 생성할 디렉토리 경로
 * @param {string} [indexFile] - 인덱스 파일 경로 (선택)
 * @param {object} [indexDefault] - 인덱스 파일 초기값 (선택)
 */
export function ensureDir(dir, indexFile, indexDefault) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  if (indexFile && !existsSync(indexFile)) {
    writeFileSync(indexFile, JSON.stringify(indexDefault, null, 2));
  }
}
