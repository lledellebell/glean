---
name: backfill-extractor
phase: 1
parallel: true
---

# Backfill Extractor Agent

Extract insights and learnings from pre-filtered historical session transcripts.

## Purpose

- Analyze past conversation text that has been pre-filtered (user/assistant only)
- Extract both insights and learnings in a single pass
- Handle partial context gracefully (no tool results, no file contents)
- Produce lower confidence scores (0.6-0.8) reflecting retroactive analysis

## Key Differences from Live Extraction

| Aspect | Live (learning-extractor) | Backfill (this agent) |
|--------|--------------------------|----------------------|
| Context | Full session with tool results | Text-only, filtered |
| Confidence | 0.8-1.0 | 0.6-0.8 |
| Passes | Part of multi-agent pipeline | Single pass |
| Output | Learnings only | Insights + Learnings |
| Source | Current session | Historical JSONL |

## Prompt

```
Extract insights and learnings from this historical coding session transcript.

NOTE: This is a pre-filtered transcript containing only user/assistant text.
Tool results, file contents, and progress messages have been removed.
Adjust confidence accordingly (0.6-0.8 range).

## Session Transcript
{{sessionText}}

## Analysis Tasks

1. **Insights** - Extract reusable knowledge:
   - Patterns: Recurring approaches or conventions
   - Mistakes: Errors made and how they were resolved
   - Optimizations: Performance or workflow improvements
   - Learnings: New technical knowledge gained

2. **Learnings** - Extract study-worthy items:
   - Technical: New APIs, libraries, patterns discovered
   - Problem-Solution: Error → Fix pairs
   - Unexpected: Surprising behaviors encountered
   - Tips: Shortcuts and tricks

3. **Context Assessment**
   - What project/technology was being worked on?
   - What was the main goal of the session?
   - How confident are we in the extractions given partial context?

## Confidence Guidelines

- 0.8: Clear, explicit discussion of the topic
- 0.7: Inferred from conversation flow, likely accurate
- 0.6: Possible but context is limited

Do NOT fabricate information not present in the transcript.
When uncertain, prefer lower confidence over guessing.

## Output Requirements

Return JSON:

```json
{
  "insights": [
    {
      "type": "pattern|mistake|optimization|learning",
      "title": "Short descriptive title",
      "content": "Detailed description",
      "confidence": 0.7,
      "tags": ["tag1", "tag2"],
      "codeSnippet": "Optional code if mentioned"
    }
  ],
  "learnings": [
    {
      "category": "technical|problem-solution|unexpected|tip",
      "title": "Short descriptive title",
      "description": "Detailed explanation",
      "code": "Optional code snippet",
      "tags": ["tag1", "tag2"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.7,
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "summary": {
    "totalInsights": 3,
    "totalLearnings": 4,
    "byInsightType": {
      "pattern": 1,
      "mistake": 1,
      "optimization": 0,
      "learning": 1
    },
    "byLearningCategory": {
      "technical": 2,
      "problem-solution": 1,
      "unexpected": 1,
      "tip": 0
    },
    "sessionDate": "2024-01-15",
    "projectContext": "Brief description of what the session was about"
  }
}
```
```

## Examples

### Input Transcript
```
### User
I need to set up ESLint with TypeScript in this Next.js project

### Assistant
I'll help set up ESLint with TypeScript for Next.js. First, let me install the dependencies...

We need @typescript-eslint/parser and @typescript-eslint/eslint-plugin...

### User
It's showing a conflict with the prettier config

### Assistant
This is a common issue. The eslint-config-prettier package resolves conflicts by disabling ESLint rules that conflict with Prettier. Let me update the config to extend prettier last...

### User
That fixed it. Can we also add the import sorting plugin?

### Assistant
Yes, eslint-plugin-import with the typescript resolver works well here. The key is setting the resolver in the import/resolver setting...
```

### Output
```json
{
  "insights": [
    {
      "type": "pattern",
      "title": "ESLint + Prettier conflict resolution",
      "content": "When using ESLint with Prettier, extend eslint-config-prettier last in the extends array to disable conflicting rules.",
      "confidence": 0.8,
      "tags": ["eslint", "prettier", "config"]
    },
    {
      "type": "learning",
      "title": "TypeScript ESLint setup for Next.js",
      "content": "Next.js TypeScript ESLint setup requires @typescript-eslint/parser, @typescript-eslint/eslint-plugin, and eslint-config-prettier for Prettier compatibility.",
      "confidence": 0.7,
      "tags": ["eslint", "typescript", "nextjs"]
    }
  ],
  "learnings": [
    {
      "category": "technical",
      "title": "ESLint TypeScript resolver for import sorting",
      "description": "eslint-plugin-import requires the typescript resolver (eslint-import-resolver-typescript) to properly resolve TS paths and aliases.",
      "tags": ["eslint", "typescript", "imports"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.7,
      "difficulty": "intermediate"
    },
    {
      "category": "problem-solution",
      "title": "ESLint-Prettier rule conflicts",
      "description": "ESLint and Prettier can conflict on formatting rules. Fix by installing eslint-config-prettier and adding 'prettier' as the last item in the extends array.",
      "tags": ["eslint", "prettier"],
      "reusable": true,
      "projectSpecific": false,
      "confidence": 0.8,
      "difficulty": "beginner"
    }
  ],
  "summary": {
    "totalInsights": 2,
    "totalLearnings": 2,
    "byInsightType": {
      "pattern": 1,
      "mistake": 0,
      "optimization": 0,
      "learning": 1
    },
    "byLearningCategory": {
      "technical": 1,
      "problem-solution": 1,
      "unexpected": 0,
      "tip": 0
    },
    "projectContext": "Setting up ESLint with TypeScript and Prettier in a Next.js project"
  }
}
```
