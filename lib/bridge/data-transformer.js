/**
 * Glean Data Transformer
 * 플러그인 간 데이터 형식 변환
 */

/**
 * Glean Insight → Obsidian Note 변환
 * @param {object} insight - Glean Insight
 * @returns {object} Obsidian Note 형식
 */
export function insightToObsidianNote(insight) {
  const frontmatter = {
    title: insight.title,
    type: insight.type,
    tags: insight.meta?.tags || [],
    created: insight.meta?.createdAt,
    source: 'glean',
    confidence: insight.confidence
  };

  let content = `# ${insight.title}\n\n`;
  content += `${insight.content}\n\n`;

  // 유형별 추가 정보
  if (insight.type === 'pattern' && insight.pattern) {
    content += `## 패턴 설명\n${insight.pattern.description}\n\n`;
    if (insight.pattern.example) {
      content += `## 예시\n\`\`\`\n${insight.pattern.example}\n\`\`\`\n\n`;
    }
    if (insight.pattern.antiPattern) {
      content += `## 피해야 할 방식\n${insight.pattern.antiPattern}\n\n`;
    }
  }

  if (insight.type === 'mistake' && insight.mistake) {
    content += `## 무엇이 잘못됐나\n${insight.mistake.what}\n\n`;
    content += `## 왜 잘못됐나\n${insight.mistake.why}\n\n`;
    content += `## 해결 방법\n${insight.mistake.how}\n\n`;
    content += `## 방지책\n${insight.mistake.prevention}\n\n`;
  }

  // 코드 스니펫
  if (insight.context?.codeSnippet) {
    content += `## 코드\n\`\`\`\n${insight.context.codeSnippet}\n\`\`\`\n\n`;
  }

  return {
    frontmatter,
    content,
    filename: `glean-${insight.type}-${insight.id}.md`
  };
}

/**
 * Glean Learn Item → Obsidian Note 변환
 * @param {object} learnItem - Glean Learn Item
 * @returns {object} Obsidian Note 형식
 */
export function learnToObsidianNote(learnItem) {
  const frontmatter = {
    title: learnItem.content.title,
    topic: learnItem.classification.topic,
    tags: learnItem.classification.tags,
    difficulty: learnItem.classification.difficulty,
    confidence: learnItem.spaceRep.confidence,
    nextReview: learnItem.spaceRep.nextReview,
    created: learnItem.meta.createdAt,
    source: 'glean-learn'
  };

  let content = `# ${learnItem.content.title}\n\n`;
  content += `${learnItem.content.description}\n\n`;

  // 핵심 포인트
  if (learnItem.content.keyPoints?.length > 0) {
    content += `## 핵심 포인트\n`;
    for (const point of learnItem.content.keyPoints) {
      content += `- ${point}\n`;
    }
    content += '\n';
  }

  // 코드 예시
  if (learnItem.content.codeExample) {
    content += `## 코드 예시\n\`\`\`\n${learnItem.content.codeExample}\n\`\`\`\n\n`;
  }

  // 참고 자료
  if (learnItem.content.resources?.length > 0) {
    content += `## 참고 자료\n`;
    for (const resource of learnItem.content.resources) {
      content += `- ${resource}\n`;
    }
    content += '\n';
  }

  // 복습 정보
  content += `## 복습 정보\n`;
  content += `- 이해도: ${'⭐'.repeat(learnItem.spaceRep.confidence)}\n`;
  content += `- 복습 횟수: ${learnItem.spaceRep.reviewCount}\n`;
  content += `- 다음 복습: ${learnItem.spaceRep.nextReview}\n`;

  return {
    frontmatter,
    content,
    filename: `learn-${learnItem.classification.topic}-${learnItem.id}.md`
  };
}

/**
 * Git Commit → Glean Harvest 변환 (부분)
 * @param {object} commit - Git commit 정보
 * @returns {object} Harvest changes 형식
 */
export function commitToHarvestChange(commit) {
  return {
    hash: commit.hash || commit.sha,
    message: commit.message || commit.commit?.message,
    timestamp: commit.date || commit.commit?.author?.date,
    filesChanged: commit.stats?.total || commit.files?.length || 0
  };
}

/**
 * PR 정보 → Glean Insight 변환
 * @param {object} pr - Pull Request 정보
 * @returns {object} Glean Insight 형식
 */
export function prToInsight(pr) {
  return {
    type: 'learning',
    title: `PR Review: ${pr.title}`,
    content: pr.body || pr.description || '',
    confidence: 0.7,
    context: {
      project: pr.repo || pr.repository,
      files: pr.files?.map(f => f.filename || f.path) || []
    },
    meta: {
      tags: ['pr', 'code-review'],
      createdAt: pr.created_at || pr.createdAt
    },
    learning: {
      topic: 'code-review',
      keyPoints: extractKeyPointsFromPR(pr),
      difficulty: 'intermediate'
    }
  };
}

/**
 * PR에서 핵심 포인트 추출 (간단한 버전)
 */
function extractKeyPointsFromPR(pr) {
  const points = [];

  // PR 제목에서 추출
  if (pr.title) {
    points.push(pr.title);
  }

  // 라벨에서 추출
  if (pr.labels?.length > 0) {
    const labelNames = pr.labels.map(l => l.name || l).join(', ');
    points.push(`Labels: ${labelNames}`);
  }

  // 변경 파일 수
  if (pr.changed_files || pr.files?.length) {
    points.push(`${pr.changed_files || pr.files.length} files changed`);
  }

  return points;
}

/**
 * Task Master Task → Glean Learn Item 변환
 * @param {object} task - Task Master task
 * @returns {object} Glean Learn Item 형식 (부분)
 */
export function taskToLearnItem(task) {
  return {
    content: {
      title: task.title || task.name,
      description: task.description || '',
      keyPoints: task.subtasks?.map(s => s.title || s.name) || []
    },
    classification: {
      topic: task.category || task.project || 'task',
      tags: task.tags || [],
      difficulty: 'intermediate'
    },
    source: {
      type: 'harvest',
      project: task.project
    }
  };
}

/**
 * Notion Page → Glean Learn Item 변환
 * @param {object} page - Notion page
 * @returns {object} Glean Learn Item 형식 (부분)
 */
export function notionPageToLearnItem(page) {
  // Notion 페이지 구조에 따라 변환
  const title = page.properties?.Name?.title?.[0]?.plain_text
    || page.properties?.title?.title?.[0]?.plain_text
    || 'Untitled';

  const tags = page.properties?.Tags?.multi_select?.map(t => t.name) || [];

  return {
    content: {
      title,
      description: '', // 본문은 별도 API 호출 필요
      keyPoints: []
    },
    classification: {
      topic: tags[0] || 'notion',
      tags,
      difficulty: 'intermediate'
    },
    source: {
      type: 'manual',
      project: 'notion'
    }
  };
}

/**
 * Glean Harvest → Markdown 변환 (내보내기용)
 * @param {object} harvest - Glean Harvest
 * @returns {string} Markdown 문자열
 */
export function harvestToMarkdown(harvest) {
  let md = `# 세션 수확: ${harvest.id}\n\n`;
  md += `📅 ${harvest.session?.startTime} ~ ${harvest.session?.endTime}\n`;
  md += `📁 프로젝트: ${harvest.session?.project}\n\n`;

  // 요약
  md += `## 요약\n${harvest.summary?.description}\n\n`;

  // 주요 작업
  if (harvest.summary?.mainTasks?.length > 0) {
    md += `## 주요 작업\n`;
    for (const task of harvest.summary.mainTasks) {
      md += `- ${task}\n`;
    }
    md += '\n';
  }

  // 변경 파일
  if (harvest.changes?.files?.length > 0) {
    md += `## 변경 파일 (${harvest.changes.files.length})\n`;
    for (const file of harvest.changes.files) {
      md += `- ${file.path} (${file.action})\n`;
    }
    md += '\n';
  }

  // 커밋
  if (harvest.changes?.commits?.length > 0) {
    md += `## 커밋 (${harvest.changes.commits.length})\n`;
    for (const commit of harvest.changes.commits) {
      md += `- ${commit.message} (${commit.hash.substring(0, 7)})\n`;
    }
    md += '\n';
  }

  // 인사이트
  if (harvest.insights?.length > 0) {
    md += `## 인사이트\n`;
    for (const insight of harvest.insights) {
      md += `- **[${insight.type}]** ${insight.content}\n`;
    }
    md += '\n';
  }

  return md;
}

export default {
  insightToObsidianNote,
  learnToObsidianNote,
  commitToHarvestChange,
  prToInsight,
  taskToLearnItem,
  notionPageToLearnItem,
  harvestToMarkdown
};
