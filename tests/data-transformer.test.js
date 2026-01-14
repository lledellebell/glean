/**
 * Data Transformer Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  insightToObsidianNote,
  learnToObsidianNote,
  commitToHarvestChange,
  prToInsight,
  harvestToMarkdown
} from '../lib/bridge/data-transformer.js';

describe('insightToObsidianNote', () => {
  const mockInsight = {
    id: 'ins_123',
    type: 'pattern',
    title: 'React Query staleTime Optimisation',
    content: 'Set longer staleTime for infrequently changing data',
    confidence: 0.9,
    meta: {
      tags: ['react', 'optimization'],
      createdAt: '2024-01-15T10:00:00Z'
    },
    pattern: {
      description: 'Adjust staleTime based on data characteristics',
      example: 'staleTime: 1000 * 60 * 5',
      antiPattern: 'Setting staleTime to 0 causes refetch on every render'
    }
  };

  it('frontmatter includes required fields', () => {
    const result = insightToObsidianNote(mockInsight);

    assert.strictEqual(result.frontmatter.title, mockInsight.title);
    assert.strictEqual(result.frontmatter.type, mockInsight.type);
    assert.strictEqual(result.frontmatter.source, 'glean');
  });

  it('tags included as array', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(Array.isArray(result.frontmatter.tags));
    assert.deepStrictEqual(result.frontmatter.tags, ['react', 'optimization']);
  });

  it('content includes title', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes(`# ${mockInsight.title}`));
  });

  it('pattern type includes pattern description', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes('## Pattern Description'));
    assert.ok(result.content.includes(mockInsight.pattern.description));
  });

  it('includes antiPattern if present', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.ok(result.content.includes('## Anti-Pattern'));
    assert.ok(result.content.includes(mockInsight.pattern.antiPattern));
  });

  it('filename has correct format', () => {
    const result = insightToObsidianNote(mockInsight);
    assert.match(result.filename, /^glean-pattern-ins_123\.md$/);
  });
});

describe('insightToObsidianNote - mistake type', () => {
  const mockMistake = {
    id: 'ins_456',
    type: 'mistake',
    title: 'Missing null check',
    content: 'Missing null check when accessing optional property',
    confidence: 0.85,
    meta: { tags: ['typescript'], createdAt: '2024-01-15' },
    mistake: {
      what: 'user.profile.name where profile can be null',
      why: 'TypeScript does not catch runtime null',
      how: 'Use optional chaining: user.profile?.name',
      prevention: 'Enable strict null checks'
    }
  };

  it('mistake type includes 4 sections', () => {
    const result = insightToObsidianNote(mockMistake);

    assert.ok(result.content.includes('## What Went Wrong'));
    assert.ok(result.content.includes('## Why It Was Wrong'));
    assert.ok(result.content.includes('## How to Fix'));
    assert.ok(result.content.includes('## Prevention'));
  });
});

describe('learnToObsidianNote', () => {
  const mockLearnItem = {
    id: 'learn_123',
    content: {
      title: 'useCallback Usage',
      description: 'Hook for function memoisation',
      keyPoints: ['Manage dependency array', 'Maintain referential equality'],
      codeExample: 'const memoized = useCallback(() => {}, [dep])',
      resources: ['https://react.dev/reference/react/useCallback']
    },
    classification: {
      topic: 'react-hooks',
      tags: ['react', 'hooks', 'optimization'],
      difficulty: 'intermediate'
    },
    spaceRep: {
      confidence: 4,
      nextReview: '2024-01-22',
      reviewCount: 3
    },
    meta: {
      createdAt: '2024-01-01'
    }
  };

  it('frontmatter includes learning-related fields', () => {
    const result = learnToObsidianNote(mockLearnItem);

    assert.strictEqual(result.frontmatter.title, mockLearnItem.content.title);
    assert.strictEqual(result.frontmatter.topic, 'react-hooks');
    assert.strictEqual(result.frontmatter.difficulty, 'intermediate');
    assert.strictEqual(result.frontmatter.source, 'glean-learn');
  });

  it('key points included as list', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## Key Points'));
    assert.ok(result.content.includes('- Manage dependency array'));
  });

  it('code example included as code block', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## Code Example'));
    assert.ok(result.content.includes('```'));
    assert.ok(result.content.includes(mockLearnItem.content.codeExample));
  });

  it('review info section included', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.ok(result.content.includes('## Review Info'));
    assert.ok(result.content.includes('Review Count: 3'));
  });

  it('filename includes topic and id', () => {
    const result = learnToObsidianNote(mockLearnItem);
    assert.match(result.filename, /^learn-react-hooks-learn_123\.md$/);
  });
});

describe('commitToHarvestChange', () => {
  it('converts Git commit object to harvest change', () => {
    const commit = {
      hash: 'abc123def456',
      message: 'feat: add new feature',
      date: '2024-01-15T10:00:00Z',
      stats: { total: 5 }
    };

    const result = commitToHarvestChange(commit);

    assert.strictEqual(result.hash, 'abc123def456');
    assert.strictEqual(result.message, 'feat: add new feature');
    assert.strictEqual(result.timestamp, '2024-01-15T10:00:00Z');
    assert.strictEqual(result.filesChanged, 5);
  });

  it('handles alternative commit format', () => {
    const commit = {
      sha: 'xyz789',
      commit: {
        message: 'fix: bug fix',
        author: { date: '2024-01-15' }
      },
      files: [{}, {}, {}]
    };

    const result = commitToHarvestChange(commit);

    assert.strictEqual(result.hash, 'xyz789');
    assert.strictEqual(result.message, 'fix: bug fix');
    assert.strictEqual(result.filesChanged, 3);
  });
});

describe('prToInsight', () => {
  const mockPR = {
    title: 'feat: add authentication system',
    body: 'Implemented JWT-based authentication system',
    repo: 'lledellebell/glean',
    files: [{ filename: 'lib/auth.js' }, { filename: 'lib/jwt.js' }],
    labels: [{ name: 'feature' }, { name: 'auth' }],
    createdAt: '2024-01-15T10:00:00Z'
  };

  it('converts PR to learning type insight', () => {
    const result = prToInsight(mockPR);

    assert.strictEqual(result.type, 'learning');
    assert.ok(result.title.includes('PR Review:'));
    assert.strictEqual(result.content, mockPR.body);
  });

  it('context includes project and file list', () => {
    const result = prToInsight(mockPR);

    assert.strictEqual(result.context.project, 'lledellebell/glean');
    assert.deepStrictEqual(result.context.files, ['lib/auth.js', 'lib/jwt.js']);
  });

  it('meta includes PR-related tags', () => {
    const result = prToInsight(mockPR);

    assert.ok(result.meta.tags.includes('pr'));
    assert.ok(result.meta.tags.includes('code-review'));
  });

  it('learning info includes keyPoints', () => {
    const result = prToInsight(mockPR);

    assert.ok(result.learning.keyPoints.includes(mockPR.title));
    assert.ok(result.learning.keyPoints.some(p => p.includes('Labels:')));
  });
});

describe('harvestToMarkdown', () => {
  const mockHarvest = {
    id: 'harvest_123',
    session: {
      startTime: '2024-01-15T09:00:00Z',
      endTime: '2024-01-15T12:00:00Z',
      project: 'my-project'
    },
    summary: {
      description: 'Implemented authentication feature',
      mainTasks: ['Implement JWT tokens', 'Add login API'],
      keywords: ['auth', 'jwt']
    },
    changes: {
      files: [
        { path: 'lib/auth.js', action: 'created' },
        { path: 'lib/jwt.js', action: 'modified' }
      ],
      commits: [
        { hash: 'abc123', message: 'feat: add JWT' }
      ]
    },
    insights: [
      { type: 'pattern', content: 'Store token in httpOnly cookie' }
    ]
  };

  it('title includes harvest ID', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('# Session Harvest: harvest_123'));
  });

  it('includes session info', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('Project: my-project'));
  });

  it('includes summary section', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## Summary'));
    assert.ok(md.includes('Implemented authentication feature'));
  });

  it('includes main tasks list', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## Main Tasks'));
    assert.ok(md.includes('- Implement JWT tokens'));
  });

  it('includes changed files list', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## Changed Files'));
    assert.ok(md.includes('lib/auth.js (created)'));
  });

  it('includes commits list', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## Commits'));
    assert.ok(md.includes('feat: add JWT'));
    assert.ok(md.includes('abc123'));
  });

  it('includes insights list', () => {
    const md = harvestToMarkdown(mockHarvest);
    assert.ok(md.includes('## Insights'));
    assert.ok(md.includes('[pattern]'));
    assert.ok(md.includes('Store token in httpOnly cookie'));
  });
});
