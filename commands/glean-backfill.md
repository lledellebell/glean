---
allowed-tools: Task, Read, Glob, Grep, Bash(node:*), AskUserQuestion
description: Retroactively extract learnings from past Claude Code sessions
---

# /glean-backfill - Historical Session Analyzer

Analyze past Claude Code conversation history stored in `~/.claude/projects/` and extract insights + learnings retroactively.

## Arguments

- `--project=<path>` - Analyze sessions for a specific project path (default: current directory)
- `--all` - Analyze all projects
- `--limit=<n>` - Maximum number of sessions to process (default: 10)
- `--since=<date>` - Only sessions modified after this date (ISO format, e.g. 2024-01-01)
- `--dry-run` - Preview what would be processed without storing results

## Execution Flow

### Phase 1: Discovery

Scan `~/.claude/projects/` for session JSONL files.

```javascript
import { discoverSessions } from './lib/history-parser.js';

const sessions = await discoverSessions({
  project: args.project,      // --project flag
  all: args.all,               // --all flag
  limit: args.limit || 10,    // --limit flag
  since: args.since           // --since flag
});
```

Display discovery results:

```markdown
## Session Discovery

| # | Project | File | Size | Modified |
|---|---------|------|------|----------|
| 1 | /Users/b/projects/glean | abc123.jsonl | 62MB | 2024-01-15 |
| 2 | /Users/b/projects/glean | def456.jsonl | 8MB | 2024-01-14 |

Found **N sessions** across **M projects** (total: X MB)
```

If `--dry-run`, stop here after showing the preview.

### Phase 2: Parsing

For each session file, parse and filter to user/assistant text only.

```javascript
import { parseSession, chunkSession, formatForAgent } from './lib/history-parser.js';

for (const session of sessions) {
  const parsed = await parseSession(session.filepath);
  const chunks = chunkSession(parsed); // 50KB chunks

  // Report compression ratio
  // e.g. "62MB → 719KB (1.1%) after filtering"
}
```

Display parsing summary:

```markdown
## Parsing Results

| Session | Lines | Messages | Text Size | Chunks |
|---------|-------|----------|-----------|--------|
| abc123 | 45,230 | 127 | 312KB | 7 |
| def456 | 8,100 | 43 | 89KB | 2 |
```

### Phase 3: Analysis

For each session's chunks, call the **backfill-extractor** agent using Task tool.

Process sessions **in parallel** (up to 3 concurrent Task calls):

```
For each session:
  For each chunk:
    Call backfill-extractor agent with formatted text

    Prompt: "Extract insights and learnings from this historical session.

    {formatForAgent(chunk, { projectPath, chunkIndex, totalChunks })}"
```

Collect all results and merge per-session:
- Combine insights from all chunks
- Combine learnings from all chunks
- Merge summaries

### Phase 4: Dedup

Compare extracted data against existing stores:

```javascript
import { checkDuplicate } from './lib/insight-store.js';

for (const insight of extractedInsights) {
  const duplicate = checkDuplicate(insight.title, insight.content);
  if (duplicate) {
    // Mark as duplicate, skip storage
  }
}
```

Also deduplicate across sessions (same insight from different sessions).

Report dedup results:

```markdown
## Deduplication

- Extracted: 45 insights, 32 learnings
- Duplicates removed: 8 insights, 5 learnings
- New unique: 37 insights, 27 learnings
```

### Phase 5: Storage

Save deduplicated results to stores with `source.type: 'backfill'`:

```javascript
import { saveInsight } from './lib/insight-store.js';
import { createLearnItem } from './lib/learn-store.js';

for (const insight of newInsights) {
  saveInsight({
    type: insight.type,
    title: insight.title,
    content: insight.content,
    confidence: insight.confidence,
    context: {
      project: projectPath,
      sessionId: sessionFile
    },
    meta: {
      tags: insight.tags,
      status: 'new'
    }
  });
}

for (const learning of newLearnings) {
  createLearnItem({
    title: learning.title,
    description: learning.description,
    keyPoints: [learning.description],
    codeExample: learning.code,
    topic: learning.tags[0] || 'general',
    tags: learning.tags,
    difficulty: learning.difficulty || 'intermediate',
    source: 'backfill',
    project: projectPath
  });
}
```

If `--dry-run`, skip this phase and show what would be saved.

### Phase 6: Report

Display final summary:

```markdown
## Backfill Complete

### Results

| Metric | Count |
|--------|-------|
| Sessions processed | 3 |
| Insights extracted | 37 |
| Learnings extracted | 27 |
| Duplicates skipped | 13 |
| Errors | 0 |

### Insights by Type

| Type | Count |
|------|-------|
| Pattern | 12 |
| Mistake | 8 |
| Optimization | 7 |
| Learning | 10 |

### Learnings by Category

| Category | Count |
|----------|-------|
| Technical | 11 |
| Problem-Solution | 9 |
| Unexpected | 4 |
| Tip | 3 |

### Top Tags
`typescript` (15) · `react` (12) · `api` (8) · `testing` (6)

---
Stored in `~/.glean/insights/` and `~/.glean/learn/`
Run `/glean-stats` to see updated statistics.
```

## Error Handling

- If a session file fails to parse, log the error and continue with remaining sessions
- If the backfill-extractor agent returns invalid JSON, retry once then skip
- If storage fails, report the error but don't stop the batch
- Always display a summary even if some sessions failed

## Examples

```bash
# Backfill current project, last 10 sessions
/glean-backfill

# Preview only
/glean-backfill --dry-run

# All projects, last 5 sessions each
/glean-backfill --all --limit=5

# Specific project since a date
/glean-backfill --project=/Users/b/projects/myapp --since=2024-01-01

# Process more sessions
/glean-backfill --limit=50
```
