/**
 * Glean Flashcard Generator
 * 학습 항목을 플래시카드로 변환하는 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { isDueToday } from './spaced-repetition.js';

const GLEAN_DIR = join(homedir(), '.glean');
const LEARN_DIR = join(GLEAN_DIR, 'learn');

/**
 * 학습 항목을 what/how/why 질문 형태의 플래시카드로 변환해요
 * @param {object} item - 학습 항목
 * @returns {object} 플래시카드
 */
export function generateFlashcard(item) {
  const questions = [];

  // What 질문: 개념이나 용어 설명
  if (item.content?.title) {
    questions.push({
      type: 'what',
      question: `"${item.content.title}"이(가) 뭐예요?`,
      answer: item.content.description || item.content.title,
      hint: item.classification?.topic
    });
  }

  // How 질문: 사용법이나 구현 방법
  if (item.content?.codeExample) {
    questions.push({
      type: 'how',
      question: `${item.content.title}을(를) 어떻게 사용해요?`,
      answer: item.content.codeExample,
      hint: '코드 예시를 떠올려보세요'
    });
  }

  // Why 질문: 핵심 포인트 기반
  if (item.content?.keyPoints?.length > 0) {
    const keyPoint = item.content.keyPoints[0];
    questions.push({
      type: 'why',
      question: `${item.content.title}에서 가장 중요한 점은?`,
      answer: keyPoint,
      hint: item.content.keyPoints.length > 1
        ? `힌트: ${item.content.keyPoints.length}개의 핵심 포인트가 있어요`
        : undefined
    });
  }

  // 최소 1개의 질문 보장
  if (questions.length === 0 && item.content?.title) {
    questions.push({
      type: 'what',
      question: `${item.content.title}에 대해 설명해보세요.`,
      answer: item.content.description || '설명을 추가해주세요.',
      hint: undefined
    });
  }

  return {
    id: item.id,
    title: item.content?.title,
    questions,
    difficulty: item.classification?.difficulty || 'intermediate',
    topic: item.classification?.topic,
    tags: item.classification?.tags || [],
    spaceRep: item.spaceRep,
    meta: {
      createdAt: item.meta?.createdAt,
      reviewCount: item.spaceRep?.reviewCount || 0
    }
  };
}

/**
 * 복습이 필요한 다음 플래시카드를 가져와요
 * @param {object} options
 * @param {string} options.topic - 특정 토픽만 필터
 * @param {string} options.difficulty - 난이도 필터
 * @returns {object|null}
 */
export function getNextFlashcard(options = {}) {
  if (!existsSync(LEARN_DIR)) return null;

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  const dueItems = [];

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));

      // active 상태만
      if (item.meta?.status !== 'active') continue;

      // 필터 적용
      if (options.topic && item.classification?.topic !== options.topic) continue;
      if (options.difficulty && item.classification?.difficulty !== options.difficulty) continue;

      // 복습 기한 확인
      if (isDueToday(item.spaceRep?.nextReview)) {
        dueItems.push(item);
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  if (dueItems.length === 0) return null;

  // 우선순위: 낮은 confidence, 오래된 것 먼저
  dueItems.sort((a, b) => {
    const confDiff = (a.spaceRep?.confidence || 3) - (b.spaceRep?.confidence || 3);
    if (confDiff !== 0) return confDiff;

    const dateA = new Date(a.spaceRep?.nextReview || 0);
    const dateB = new Date(b.spaceRep?.nextReview || 0);
    return dateA - dateB;
  });

  return generateFlashcard(dueItems[0]);
}

/**
 * 오늘 복습할 모든 플래시카드를 가져와요
 * @param {object} options
 * @returns {object[]}
 */
export function getDueFlashcards(options = {}) {
  if (!existsSync(LEARN_DIR)) return [];

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  const flashcards = [];

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));

      if (item.meta?.status !== 'active') continue;
      if (options.topic && item.classification?.topic !== options.topic) continue;
      if (!isDueToday(item.spaceRep?.nextReview)) continue;

      flashcards.push(generateFlashcard(item));
    } catch {
      // 파싱 에러 무시
    }
  }

  return flashcards;
}

/**
 * 플래시카드를 터미널에 보기 좋게 포맷해요
 * @param {object} flashcard
 * @param {boolean} showAnswer - 답변 표시 여부
 * @param {number} questionIndex - 표시할 질문 인덱스 (기본: 0)
 * @returns {string}
 */
export function formatFlashcardDisplay(flashcard, showAnswer = false, questionIndex = 0) {
  if (!flashcard || !flashcard.questions?.length) {
    return '플래시카드가 없어요.';
  }

  const question = flashcard.questions[questionIndex] || flashcard.questions[0];
  const typeIcon = {
    what: '❓',
    how: '🔧',
    why: '💡'
  }[question.type] || '•';

  const lines = [
    '╭─────────────────────────────────────╮',
    `│ ${typeIcon} ${flashcard.topic || '일반'}`.padEnd(38) + '│',
    '├─────────────────────────────────────┤',
    ''
  ];

  // 질문
  const questionLines = wrapText(question.question, 35);
  for (const line of questionLines) {
    lines.push(`  ${line}`);
  }

  lines.push('');

  if (showAnswer) {
    lines.push('─────────────────────────────────────');
    lines.push('');

    // 답변
    const answerLines = wrapText(question.answer, 35);
    for (const line of answerLines) {
      lines.push(`  ${line}`);
    }

    lines.push('');
  } else if (question.hint) {
    lines.push(`  💬 힌트: ${question.hint}`);
    lines.push('');
  }

  lines.push('╰─────────────────────────────────────╯');

  // 메타 정보
  const meta = [];
  if (flashcard.difficulty) meta.push(flashcard.difficulty);
  if (flashcard.meta?.reviewCount) meta.push(`복습 ${flashcard.meta.reviewCount}회`);

  if (meta.length > 0) {
    lines.push(`  ${meta.join(' | ')}`);
  }

  return lines.join('\n');
}

/**
 * 텍스트를 지정된 너비로 줄바꿈해요
 * @param {string} text
 * @param {number} width
 * @returns {string[]}
 */
function wrapText(text, width) {
  if (!text) return [];

  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= width) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines;
}

/**
 * 플래시카드 통계를 반환해요
 * @returns {object}
 */
export function getFlashcardStats() {
  if (!existsSync(LEARN_DIR)) {
    return { total: 0, dueToday: 0, byTopic: {}, byDifficulty: {} };
  }

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  let total = 0;
  let dueToday = 0;
  const byTopic = {};
  const byDifficulty = { beginner: 0, intermediate: 0, advanced: 0 };

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));

      if (item.meta?.status !== 'active') continue;

      total++;

      if (isDueToday(item.spaceRep?.nextReview)) {
        dueToday++;
      }

      const topic = item.classification?.topic || 'general';
      byTopic[topic] = (byTopic[topic] || 0) + 1;

      const diff = item.classification?.difficulty || 'intermediate';
      byDifficulty[diff] = (byDifficulty[diff] || 0) + 1;
    } catch {
      // 파싱 에러 무시
    }
  }

  return { total, dueToday, byTopic, byDifficulty };
}

export default {
  generateFlashcard,
  getNextFlashcard,
  getDueFlashcards,
  formatFlashcardDisplay,
  getFlashcardStats
};
