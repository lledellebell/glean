/**
 * Obsidian Bridge tests
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  findVault,
  ensureGleanFolder,
  exportInsight,
  exportLearnItem,
  exportHarvest,
  exportBatch,
  getExistingNotes
} from '../lib/bridge/obsidian.js';

const TEST_DIR = join(tmpdir(), `glean-obsidian-test-${Date.now()}`);

beforeEach(() => {
  mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('findVault', () => {
  it('returns custom path when it exists', () => {
    const result = findVault(TEST_DIR);
    assert.strictEqual(result, TEST_DIR);
  });

  it('returns null for nonexistent custom path', () => {
    const result = findVault('/nonexistent/path/12345');
    assert.ok(result === null || typeof result === 'string');
  });
});

describe('ensureGleanFolder', () => {
  it('creates Glean folder', () => {
    const result = ensureGleanFolder(TEST_DIR);

    assert.ok(existsSync(result));
    assert.ok(result.endsWith('Glean'));
  });

  it('creates subfolders', () => {
    ensureGleanFolder(TEST_DIR);

    assert.ok(existsSync(join(TEST_DIR, 'Glean', 'Insights')));
    assert.ok(existsSync(join(TEST_DIR, 'Glean', 'Learn')));
    assert.ok(existsSync(join(TEST_DIR, 'Glean', 'Harvests')));
  });

  it('no error when already exists', () => {
    ensureGleanFolder(TEST_DIR);
    const result = ensureGleanFolder(TEST_DIR);

    assert.ok(existsSync(result));
  });
});

describe('exportInsight', () => {
  const mockInsight = {
    id: 'ins_test',
    type: 'pattern',
    title: 'Test Insight',
    content: 'Test content',
    confidence: 0.9,
    meta: {
      tags: ['test'],
      createdAt: '2024-01-15T10:00:00Z'
    }
  };

  it('exports insight as markdown file', () => {
    const filepath = exportInsight(mockInsight, TEST_DIR);

    assert.ok(existsSync(filepath));
    assert.ok(filepath.endsWith('.md'));
  });

  it('file content includes frontmatter', () => {
    const filepath = exportInsight(mockInsight, TEST_DIR);
    const content = readFileSync(filepath, 'utf-8');

    assert.ok(content.startsWith('---\n'));
    assert.ok(content.includes('---\n\n'));
  });
});

describe('exportLearnItem', () => {
  const mockLearnItem = {
    id: 'learn_test',
    content: {
      title: 'Test Learn',
      description: 'Test description',
      keyPoints: ['Point 1'],
      codeExample: 'console.log("test")'
    },
    classification: {
      topic: 'testing',
      tags: ['test'],
      difficulty: 'beginner'
    },
    spaceRep: {
      confidence: 3,
      nextReview: '2024-02-15',
      reviewCount: 1
    },
    meta: {
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      status: 'active'
    }
  };

  it('exports learn item as markdown file', () => {
    const filepath = exportLearnItem(mockLearnItem, TEST_DIR);

    assert.ok(existsSync(filepath));
    assert.ok(filepath.endsWith('.md'));
  });
});

describe('exportHarvest', () => {
  const mockHarvest = {
    id: 'harvest_test',
    session: {
      project: 'test-project',
      duration: 3600,
      startTime: '2024-01-15T10:00:00Z'
    },
    summary: {
      description: 'Test harvest',
      keywords: ['test']
    },
    changes: {
      files: [{ path: 'test.js', action: 'modified' }]
    }
  };

  it('exports harvest as markdown file', () => {
    const filepath = exportHarvest(mockHarvest, TEST_DIR);

    assert.ok(existsSync(filepath));
    assert.ok(filepath.endsWith('.md'));
  });
});

describe('exportBatch', () => {
  it('handles empty data', () => {
    const result = exportBatch({}, TEST_DIR);

    assert.strictEqual(result.insights.success, 0);
    assert.strictEqual(result.learn.success, 0);
    assert.strictEqual(result.harvests.success, 0);
  });

  it('exports multiple items at once', () => {
    const data = {
      insights: [{
        id: 'ins_1', type: 'pattern', title: 'Test', content: 'Content',
        meta: { tags: [], createdAt: '2024-01-15T10:00:00Z' }
      }],
      learn: [{
        id: 'learn_1',
        content: { title: 'Learn Test', description: 'Desc', keyPoints: [] },
        classification: { topic: 'test', tags: [], difficulty: 'beginner' },
        spaceRep: { confidence: 3, nextReview: '2024-02-15', reviewCount: 0 },
        meta: { createdAt: '2024-01-15T10:00:00Z' }
      }]
    };

    const result = exportBatch(data, TEST_DIR);

    assert.strictEqual(result.insights.success, 1);
    assert.strictEqual(result.learn.success, 1);
  });
});

describe('getExistingNotes', () => {
  it('returns empty results when Glean folder missing', () => {
    const result = getExistingNotes(TEST_DIR);

    assert.deepStrictEqual(result.insights, []);
    assert.deepStrictEqual(result.learn, []);
    assert.deepStrictEqual(result.harvests, []);
  });

  it('returns existing note list', () => {
    ensureGleanFolder(TEST_DIR);
    writeFileSync(join(TEST_DIR, 'Glean', 'Insights', 'test.md'), '# Test');

    const result = getExistingNotes(TEST_DIR);

    assert.strictEqual(result.insights.length, 1);
    assert.strictEqual(result.insights[0].filename, 'test.md');
  });
});
