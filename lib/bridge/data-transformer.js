/**
 * Glean Data Transformer
 * Data format conversion between plugins
 */

/**
 * Convert Glean Insight to Obsidian Note
 * @param {object} insight - Glean Insight
 * @returns {object} Obsidian Note format
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

  // Type-specific additional information
  if (insight.type === 'pattern' && insight.pattern) {
    content += `## Pattern Description\n${insight.pattern.description}\n\n`;
    if (insight.pattern.example) {
      content += `## Example\n\`\`\`\n${insight.pattern.example}\n\`\`\`\n\n`;
    }
    if (insight.pattern.antiPattern) {
      content += `## Anti-Pattern\n${insight.pattern.antiPattern}\n\n`;
    }
  }

  if (insight.type === 'mistake' && insight.mistake) {
    content += `## What Went Wrong\n${insight.mistake.what}\n\n`;
    content += `## Why It Was Wrong\n${insight.mistake.why}\n\n`;
    content += `## How to Fix\n${insight.mistake.how}\n\n`;
    content += `## Prevention\n${insight.mistake.prevention}\n\n`;
  }

  // Code snippet
  if (insight.context?.codeSnippet) {
    content += `## Code\n\`\`\`\n${insight.context.codeSnippet}\n\`\`\`\n\n`;
  }

  return {
    frontmatter,
    content,
    filename: `glean-${insight.type}-${insight.id}.md`
  };
}

/**
 * Convert Glean Learn Item to Obsidian Note
 * @param {object} learnItem - Glean Learn Item
 * @returns {object} Obsidian Note format
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

  // Key points
  if (learnItem.content.keyPoints?.length > 0) {
    content += `## Key Points\n`;
    for (const point of learnItem.content.keyPoints) {
      content += `- ${point}\n`;
    }
    content += '\n';
  }

  // Code example
  if (learnItem.content.codeExample) {
    content += `## Code Example\n\`\`\`\n${learnItem.content.codeExample}\n\`\`\`\n\n`;
  }

  // Resources
  if (learnItem.content.resources?.length > 0) {
    content += `## Resources\n`;
    for (const resource of learnItem.content.resources) {
      content += `- ${resource}\n`;
    }
    content += '\n';
  }

  // Review information
  content += `## Review Info\n`;
  content += `- Confidence: ${'⭐'.repeat(learnItem.spaceRep.confidence)}\n`;
  content += `- Review Count: ${learnItem.spaceRep.reviewCount}\n`;
  content += `- Next Review: ${learnItem.spaceRep.nextReview}\n`;

  return {
    frontmatter,
    content,
    filename: `learn-${learnItem.classification.topic}-${learnItem.id}.md`
  };
}

/**
 * Convert Git Commit to Glean Harvest format (partial)
 * @param {object} commit - Git commit info
 * @returns {object} Harvest changes format
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
 * Convert PR info to Glean Insight
 * @param {object} pr - Pull Request info
 * @returns {object} Glean Insight format
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
 * Extract key points from PR (simple version)
 */
function extractKeyPointsFromPR(pr) {
  const points = [];

  // Extract from PR title
  if (pr.title) {
    points.push(pr.title);
  }

  // Extract from labels
  if (pr.labels?.length > 0) {
    const labelNames = pr.labels.map(l => l.name || l).join(', ');
    points.push(`Labels: ${labelNames}`);
  }

  // Number of changed files
  if (pr.changed_files || pr.files?.length) {
    points.push(`${pr.changed_files || pr.files.length} files changed`);
  }

  return points;
}

/**
 * Convert Task Master Task to Glean Learn Item
 * @param {object} task - Task Master task
 * @returns {object} Glean Learn Item format (partial)
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
 * Convert Notion Page to Glean Learn Item
 * @param {object} page - Notion page
 * @returns {object} Glean Learn Item format (partial)
 */
export function notionPageToLearnItem(page) {
  // Convert based on Notion page structure
  const title = page.properties?.Name?.title?.[0]?.plain_text
    || page.properties?.title?.title?.[0]?.plain_text
    || 'Untitled';

  const tags = page.properties?.Tags?.multi_select?.map(t => t.name) || [];

  return {
    content: {
      title,
      description: '', // Body requires separate API call
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
 * Convert Glean Harvest to Markdown (for export)
 * @param {object} harvest - Glean Harvest
 * @returns {string} Markdown string
 */
export function harvestToMarkdown(harvest) {
  let md = `# Session Harvest: ${harvest.id}\n\n`;
  md += `📅 ${harvest.session?.startTime} ~ ${harvest.session?.endTime}\n`;
  md += `📁 Project: ${harvest.session?.project}\n\n`;

  // Summary
  md += `## Summary\n${harvest.summary?.description}\n\n`;

  // Main tasks
  if (harvest.summary?.mainTasks?.length > 0) {
    md += `## Main Tasks\n`;
    for (const task of harvest.summary.mainTasks) {
      md += `- ${task}\n`;
    }
    md += '\n';
  }

  // Changed files
  if (harvest.changes?.files?.length > 0) {
    md += `## Changed Files (${harvest.changes.files.length})\n`;
    for (const file of harvest.changes.files) {
      md += `- ${file.path} (${file.action})\n`;
    }
    md += '\n';
  }

  // Commits
  if (harvest.changes?.commits?.length > 0) {
    md += `## Commits (${harvest.changes.commits.length})\n`;
    for (const commit of harvest.changes.commits) {
      md += `- ${commit.message} (${commit.hash.substring(0, 7)})\n`;
    }
    md += '\n';
  }

  // Insights
  if (harvest.insights?.length > 0) {
    md += `## Insights\n`;
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
