/**
 * History Parser Tests
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  projectDirToPath,
  pathToProjectDir,
  parseSession,
  chunkSession,
  formatForAgent
} from '../lib/history-parser.js';

// Test fixtures directory
const TEST_DIR = join(tmpdir(), 'glean-test-history-' + Date.now());
const FIXTURES_DIR = join(TEST_DIR, 'fixtures');

before(() => {
  mkdirSync(FIXTURES_DIR, { recursive: true });
});

after(() => {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true });
  }
});

describe('projectDirToPath', () => {
  it('converts project dir to filesystem path', () => {
    const result = projectDirToPath('-Users-b-projects-glean');
    assert.strictEqual(result, '/Users/b/projects/glean');
  });

  it('handles nested paths', () => {
    const result = projectDirToPath('-Users-b-projects-my-app-frontend');
    assert.strictEqual(result, '/Users/b/projects/my/app/frontend');
  });

  it('handles root-level paths', () => {
    const result = projectDirToPath('-tmp');
    assert.strictEqual(result, '/tmp');
  });
});

describe('pathToProjectDir', () => {
  it('converts filesystem path to project dir name', () => {
    const result = pathToProjectDir('/Users/b/projects/glean');
    assert.strictEqual(result, '-Users-b-projects-glean');
  });

  it('is inverse of projectDirToPath for simple paths', () => {
    const dirName = '-Users-b-projects-test';
    const path = projectDirToPath(dirName);
    const backToDir = pathToProjectDir(path);
    assert.strictEqual(backToDir, dirName);
  });
});

describe('parseSession', () => {
  it('parses human/assistant messages from JSONL', async () => {
    const filepath = join(FIXTURES_DIR, 'basic-session.jsonl');
    const lines = [
      JSON.stringify({ type: 'human', text: 'Hello, help me with React' }),
      JSON.stringify({ type: 'assistant', text: 'Sure! What do you need help with?' }),
      JSON.stringify({ type: 'human', text: 'How do I use useState?' }),
      JSON.stringify({ type: 'assistant', text: 'useState is a React hook for managing state.' })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 4);
    assert.strictEqual(result.messages[0].role, 'user');
    assert.strictEqual(result.messages[0].text, 'Hello, help me with React');
    assert.strictEqual(result.messages[1].role, 'assistant');
    assert.strictEqual(result.totalLines, 4);
    assert.strictEqual(result.filteredLines, 4);
  });

  it('handles content array format', async () => {
    const filepath = join(FIXTURES_DIR, 'content-array.jsonl');
    const lines = [
      JSON.stringify({
        type: 'human',
        content: [{ type: 'text', text: 'Hello' }]
      }),
      JSON.stringify({
        type: 'assistant',
        content: [
          { type: 'text', text: 'Part 1' },
          { type: 'text', text: 'Part 2' }
        ]
      })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 2);
    assert.strictEqual(result.messages[0].text, 'Hello');
    assert.strictEqual(result.messages[1].text, 'Part 1\n\nPart 2');
  });

  it('filters out tool_result and other noise', async () => {
    const filepath = join(FIXTURES_DIR, 'noisy-session.jsonl');
    const lines = [
      JSON.stringify({ type: 'human', text: 'Fix the bug' }),
      JSON.stringify({ type: 'tool_result', content: 'file contents...' }),
      JSON.stringify({ type: 'progress', message: 'Running tests...' }),
      JSON.stringify({ type: 'assistant', text: 'I found the issue.' }),
      JSON.stringify({ type: 'tool_use', name: 'read_file', input: {} })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 2);
    assert.strictEqual(result.filteredLines, 2);
    assert.strictEqual(result.totalLines, 5);
  });

  it('skips malformed JSON lines', async () => {
    const filepath = join(FIXTURES_DIR, 'malformed.jsonl');
    const lines = [
      JSON.stringify({ type: 'human', text: 'Valid message' }),
      'not valid json {{{',
      JSON.stringify({ type: 'assistant', text: 'Another valid message' })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 2);
  });

  it('skips entries with empty text', async () => {
    const filepath = join(FIXTURES_DIR, 'empty-text.jsonl');
    const lines = [
      JSON.stringify({ type: 'human', text: '' }),
      JSON.stringify({ type: 'human', text: '   ' }),
      JSON.stringify({ type: 'assistant', text: 'Real content' })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 1);
    assert.strictEqual(result.messages[0].text, 'Real content');
  });

  it('handles role-based format', async () => {
    const filepath = join(FIXTURES_DIR, 'role-format.jsonl');
    const lines = [
      JSON.stringify({ role: 'user', text: 'User message' }),
      JSON.stringify({ role: 'assistant', text: 'Assistant reply' })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 2);
    assert.strictEqual(result.messages[0].role, 'user');
    assert.strictEqual(result.messages[1].role, 'assistant');
  });

  it('handles message wrapper format', async () => {
    const filepath = join(FIXTURES_DIR, 'message-wrapper.jsonl');
    const lines = [
      JSON.stringify({
        type: 'human',
        message: { text: 'Wrapped message' }
      })
    ];
    writeFileSync(filepath, lines.join('\n'));

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 1);
    assert.strictEqual(result.messages[0].text, 'Wrapped message');
  });

  it('returns empty for empty file', async () => {
    const filepath = join(FIXTURES_DIR, 'empty.jsonl');
    writeFileSync(filepath, '');

    const result = await parseSession(filepath);

    assert.strictEqual(result.messages.length, 0);
    assert.strictEqual(result.totalLines, 0);
  });
});

describe('chunkSession', () => {
  it('returns empty array for empty messages', () => {
    const result = chunkSession({ messages: [] });
    assert.strictEqual(result.length, 0);
  });

  it('puts small sessions in single chunk', () => {
    const parsed = {
      messages: [
        { role: 'user', text: 'Hello' },
        { role: 'assistant', text: 'Hi there' }
      ]
    };

    const chunks = chunkSession(parsed, 50 * 1024);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].chunkIndex, 0);
    assert.strictEqual(chunks[0].totalChunks, 1);
    assert.strictEqual(chunks[0].messages.length, 2);
  });

  it('splits large sessions into multiple chunks', () => {
    const longText = 'x'.repeat(1024);
    const messages = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      text: longText
    }));

    const chunks = chunkSession({ messages }, 5 * 1024); // 5KB chunks

    assert.ok(chunks.length > 1, `Expected multiple chunks, got ${chunks.length}`);

    // Verify all messages are included
    const totalMessages = chunks.reduce((sum, c) => sum + c.messages.length, 0);
    assert.strictEqual(totalMessages, 20);

    // Verify chunk metadata
    for (let i = 0; i < chunks.length; i++) {
      assert.strictEqual(chunks[i].chunkIndex, i);
      assert.strictEqual(chunks[i].totalChunks, chunks.length);
    }
  });

  it('respects custom maxSize', () => {
    const messages = [
      { role: 'user', text: 'a'.repeat(500) },
      { role: 'assistant', text: 'b'.repeat(500) },
      { role: 'user', text: 'c'.repeat(500) }
    ];

    const chunksSmall = chunkSession({ messages }, 600);
    const chunksLarge = chunkSession({ messages }, 50000);

    assert.ok(chunksSmall.length >= chunksLarge.length);
  });
});

describe('formatForAgent', () => {
  it('formats messages as readable transcript', () => {
    const parsed = {
      messages: [
        { role: 'user', text: 'How do I use hooks?' },
        { role: 'assistant', text: 'Hooks are functions that...' }
      ]
    };

    const result = formatForAgent(parsed);

    assert.ok(result.includes('### User'));
    assert.ok(result.includes('How do I use hooks?'));
    assert.ok(result.includes('### Assistant'));
    assert.ok(result.includes('Hooks are functions that...'));
  });

  it('includes project path when provided', () => {
    const parsed = { messages: [{ role: 'user', text: 'Hello' }] };
    const result = formatForAgent(parsed, { projectPath: '/Users/b/projects/test' });

    assert.ok(result.includes('## Project: /Users/b/projects/test'));
  });

  it('includes chunk info when provided', () => {
    const parsed = { messages: [{ role: 'user', text: 'Hello' }] };
    const result = formatForAgent(parsed, { chunkIndex: 2, totalChunks: 5 });

    assert.ok(result.includes('## Chunk 3 of 5'));
  });

  it('omits chunk info for single chunk', () => {
    const parsed = { messages: [{ role: 'user', text: 'Hello' }] };
    const result = formatForAgent(parsed, { totalChunks: 1 });

    assert.ok(!result.includes('Chunk'));
  });

  it('handles raw message array input', () => {
    const messages = [
      { role: 'user', text: 'Direct array' }
    ];

    const result = formatForAgent(messages);
    assert.ok(result.includes('Direct array'));
  });
});
