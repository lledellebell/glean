/**
 * Glean Growth Visualizer
 * 성장 데이터 집계 및 시각화 모듈
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { LEARN_DIR, INSIGHTS_DIR, DAILY_DIR, HARVESTS_DIR } from './paths.js';

/**
 * 진행률 바를 생성해요
 * @param {number} percentage - 0~100 사이의 퍼센트
 * @param {number} width - 바 너비 (기본: 20)
 * @param {object} options
 * @param {string} options.filled - 채워진 문자 (기본: █)
 * @param {string} options.empty - 빈 문자 (기본: ░)
 * @returns {string}
 */
export function generateProgressBar(percentage, width = 20, options = {}) {
  const { filled = '█', empty = '░' } = options;

  const clampedPercent = Math.max(0, Math.min(100, percentage));
  const filledCount = Math.round((clampedPercent / 100) * width);
  const emptyCount = width - filledCount;

  return filled.repeat(filledCount) + empty.repeat(emptyCount);
}

/**
 * 성장 데이터를 수집해요
 * @param {string} period - 기간 (week, month, quarter, year)
 * @returns {object}
 */
export function getGrowthData(period = 'month') {
  const now = new Date();
  const startDate = getStartDate(now, period);

  const data = {
    period,
    startDate: startDate.toISOString().split('T')[0],
    endDate: now.toISOString().split('T')[0],
    learnings: collectLearningData(startDate),
    insights: collectInsightData(startDate),
    daily: collectDailyData(startDate),
    harvests: collectHarvestData(startDate),
    streaks: calculateStreaks(),
    mastery: calculateMasteryProgress()
  };

  data.summary = calculateSummary(data);

  return data;
}

/**
 * 기간에 따른 시작 날짜를 계산해요
 */
function getStartDate(now, period) {
  const date = new Date(now);

  switch (period) {
    case 'week':
      date.setDate(date.getDate() - 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() - 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() - 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      date.setMonth(date.getMonth() - 1);
  }

  return date;
}

/**
 * 학습 항목 데이터 수집
 */
function collectLearningData(startDate) {
  if (!existsSync(LEARN_DIR)) {
    return { total: 0, new: 0, reviewed: 0, mastered: 0, byTopic: {} };
  }

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  let total = 0;
  let newCount = 0;
  let reviewed = 0;
  let mastered = 0;
  const byTopic = {};

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));
      const createdAt = new Date(item.meta?.createdAt);

      total++;

      if (createdAt >= startDate) {
        newCount++;
      }

      if (item.spaceRep?.reviewCount > 0) {
        reviewed++;
      }

      if (item.meta?.status === 'mastered') {
        mastered++;
      }

      const topic = item.classification?.topic || 'general';
      byTopic[topic] = (byTopic[topic] || 0) + 1;
    } catch {
      // 파싱 에러 무시
    }
  }

  return { total, new: newCount, reviewed, mastered, byTopic };
}

/**
 * 인사이트 데이터 수집
 */
function collectInsightData(startDate) {
  if (!existsSync(INSIGHTS_DIR)) {
    return { total: 0, new: 0, byType: {} };
  }

  const files = readdirSync(INSIGHTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  let total = 0;
  let newCount = 0;
  const byType = {};

  for (const file of files) {
    try {
      const filepath = join(INSIGHTS_DIR, file);
      const insight = JSON.parse(readFileSync(filepath, 'utf-8'));
      const createdAt = new Date(insight.meta?.createdAt);

      total++;

      if (createdAt >= startDate) {
        newCount++;
      }

      const type = insight.type || 'unknown';
      byType[type] = (byType[type] || 0) + 1;
    } catch {
      // 파싱 에러 무시
    }
  }

  return { total, new: newCount, byType };
}

/**
 * 일일 배움 데이터 수집
 */
function collectDailyData(startDate) {
  if (!existsSync(DAILY_DIR)) {
    return { total: 0, days: 0, averagePerDay: 0 };
  }

  const files = readdirSync(DAILY_DIR)
    .filter(f => f.endsWith('.json'));

  let total = 0;
  let days = 0;

  for (const file of files) {
    const dateStr = file.replace('.json', '');
    const fileDate = new Date(dateStr);

    if (fileDate < startDate) continue;

    try {
      const filepath = join(DAILY_DIR, file);
      const data = JSON.parse(readFileSync(filepath, 'utf-8'));

      if (data.learnings?.length > 0) {
        total += data.learnings.length;
        days++;
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return {
    total,
    days,
    averagePerDay: days > 0 ? (total / days).toFixed(1) : 0
  };
}

/**
 * 수확 데이터 수집
 */
function collectHarvestData(startDate) {
  if (!existsSync(HARVESTS_DIR)) {
    return { total: 0, new: 0 };
  }

  const files = readdirSync(HARVESTS_DIR)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  let total = files.length;
  let newCount = 0;

  for (const file of files) {
    try {
      const filepath = join(HARVESTS_DIR, file);
      const harvest = JSON.parse(readFileSync(filepath, 'utf-8'));
      const createdAt = new Date(harvest.meta?.createdAt);

      if (createdAt >= startDate) {
        newCount++;
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return { total, new: newCount };
}

/**
 * 연속 학습일 계산
 */
function calculateStreaks() {
  if (!existsSync(LEARN_DIR)) {
    return { current: 0, longest: 0 };
  }

  // learn 디렉토리의 stats 파일에서 읽기
  const statsFile = join(LEARN_DIR, 'stats.json');
  if (existsSync(statsFile)) {
    try {
      const stats = JSON.parse(readFileSync(statsFile, 'utf-8'));
      return {
        current: stats.currentStreak || 0,
        longest: stats.longestStreak || 0
      };
    } catch {
      // 파싱 에러 시 기본값 반환
    }
  }

  return { current: 0, longest: 0 };
}

/**
 * 마스터리 진행률 계산
 */
function calculateMasteryProgress() {
  if (!existsSync(LEARN_DIR)) {
    return { total: 0, mastered: 0, percentage: 0 };
  }

  const files = readdirSync(LEARN_DIR)
    .filter(f => f.startsWith('learn-') && f.endsWith('.json'));

  let total = 0;
  let mastered = 0;

  for (const file of files) {
    try {
      const filepath = join(LEARN_DIR, file);
      const item = JSON.parse(readFileSync(filepath, 'utf-8'));

      if (item.meta?.status !== 'archived') {
        total++;
        if (item.meta?.status === 'mastered') {
          mastered++;
        }
      }
    } catch {
      // 파싱 에러 무시
    }
  }

  return {
    total,
    mastered,
    percentage: total > 0 ? Math.round((mastered / total) * 100) : 0
  };
}

/**
 * 요약 데이터 계산
 */
function calculateSummary(data) {
  return {
    totalKnowledge: data.learnings.total + data.insights.total + data.daily.total,
    newThisPeriod: data.learnings.new + data.insights.new + data.daily.total,
    masteryRate: data.mastery.percentage,
    streak: data.streaks.current
  };
}

/**
 * 성장 데이터를 보기 좋게 포맷해요
 * @param {object} data - getGrowthData의 반환값
 * @returns {string}
 */
export function formatGrowthDisplay(data) {
  const lines = [];

  // 헤더
  lines.push('╭───────────────────────────────────────────╮');
  lines.push('│           🌱 성장 현황                     │');
  lines.push(`│           ${data.startDate} ~ ${data.endDate}        │`);
  lines.push('╰───────────────────────────────────────────╯');
  lines.push('');

  // 요약
  lines.push('## 📊 요약');
  lines.push(`총 지식: ${data.summary.totalKnowledge}개`);
  lines.push(`이번 기간 신규: +${data.summary.newThisPeriod}개`);
  lines.push(`마스터리: ${generateProgressBar(data.summary.masteryRate, 15)} ${data.summary.masteryRate}%`);
  lines.push(`연속 학습: 🔥 ${data.summary.streak}일`);
  lines.push('');

  // 학습 항목
  lines.push('## 📚 학습 항목');
  lines.push(`전체: ${data.learnings.total}개`);
  lines.push(`신규: +${data.learnings.new}개`);
  lines.push(`복습 완료: ${data.learnings.reviewed}개`);
  lines.push(`마스터: ${data.learnings.mastered}개`);
  lines.push('');

  // 토픽별 분포
  if (Object.keys(data.learnings.byTopic).length > 0) {
    lines.push('### 토픽별 분포');
    const topics = Object.entries(data.learnings.byTopic)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maxCount = topics[0]?.[1] || 1;
    for (const [topic, count] of topics) {
      const percent = Math.round((count / maxCount) * 100);
      const bar = generateProgressBar(percent, 10);
      lines.push(`${topic.padEnd(12)} ${bar} ${count}`);
    }
    lines.push('');
  }

  // 인사이트
  lines.push('## 💡 인사이트');
  lines.push(`전체: ${data.insights.total}개`);
  lines.push(`신규: +${data.insights.new}개`);

  if (Object.keys(data.insights.byType).length > 0) {
    const types = Object.entries(data.insights.byType);
    const typeLabels = types.map(([type, count]) => `${type}: ${count}`);
    lines.push(`유형: ${typeLabels.join(', ')}`);
  }
  lines.push('');

  // 일일 배움
  lines.push('## 📝 일일 배움');
  lines.push(`총 기록: ${data.daily.total}개`);
  lines.push(`기록한 날: ${data.daily.days}일`);
  lines.push(`일평균: ${data.daily.averagePerDay}개`);
  lines.push('');

  // 스트릭
  lines.push('## 🔥 연속 기록');
  lines.push(`현재 연속: ${data.streaks.current}일`);
  lines.push(`최장 연속: ${data.streaks.longest}일`);

  return lines.join('\n');
}

/**
 * 주간 미니 차트를 생성해요
 * @param {number[]} values - 7일간의 값
 * @returns {string}
 */
export function generateWeeklyChart(values) {
  const max = Math.max(...values, 1);
  const heights = values.map(v => Math.round((v / max) * 5));
  const bars = ['▁', '▂', '▃', '▄', '▅', '█'];

  return heights.map(h => bars[h] || bars[0]).join('');
}

/**
 * 간단한 통계 요약을 반환해요
 * @returns {object}
 */
export function getQuickStats() {
  const data = getGrowthData('week');

  return {
    totalKnowledge: data.summary.totalKnowledge,
    weeklyNew: data.summary.newThisPeriod,
    masteryRate: data.summary.masteryRate,
    streak: data.streaks.current
  };
}

export default {
  generateProgressBar,
  getGrowthData,
  formatGrowthDisplay,
  generateWeeklyChart,
  getQuickStats
};
