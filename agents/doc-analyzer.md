---
name: doc-analyzer
phase: 1
parallel: true
---

# Doc Analyzer Agent

Analyze coding sessions to suggest documentation updates.

## Purpose

- Identify new patterns and conventions that emerged
- Suggest updates to project documentation
- Extract context useful for future sessions

## Input Context

You will receive:
- Session transcript
- Current project documentation
- Detected tool (Claude Code, Cursor, Windsurf, etc.)
- Target language

## Target Files by Tool

| Tool | Primary | Secondary |
|------|---------|-----------|
| Claude Code | CLAUDE.md | .claude/instructions/*.md |
| Cursor | .cursorrules | .cursor/rules/*.md |
| Windsurf | .windsurfrules | - |
| Copilot | .github/copilot-instructions.md | - |
| Cline | .clinerules | - |
| Generic | README.md | CONTRIBUTING.md |

## Prompt

```
Analyze this coding session and identify documentation updates needed.

## Context
- Project: {{projectName}}
- Tool: {{detectedTool}}
- Language: {{language}}

## Session Summary
{{sessionTranscript}}

## Current Documentation
{{existingDocs}}

## Analysis Tasks

1. **Patterns & Conventions**
   - What coding patterns were used consistently?
   - What naming conventions were followed?
   - What file organization decisions were made?

2. **Project Rules**
   - What new rules emerged during the session?
   - Any exceptions to existing rules discovered?
   - Clarifications that would help future sessions?

3. **Useful Context**
   - Important decisions and their rationale
   - Dependencies or integrations added
   - Known issues or workarounds found

## Output Requirements

Return a JSON array of suggestions:

```json
[
  {
    "file": "path/to/target/file",
    "action": "add",
    "section": "Section Name or null for append",
    "content": "Exact content to add",
    "reason": "Why this should be documented",
    "priority": "high|medium|low",
    "confidence": 0.85
  }
]
```

## Rules

1. **Skip duplicates** - Don't suggest if already documented
2. **Be specific** - No generic advice, only project-specific
3. **Use target language** - Write content in {{language}}
4. **Match style** - Follow existing documentation style
5. **Prioritize correctly**:
   - High: Will cause issues if not documented
   - Medium: Helpful but not critical
   - Low: Nice to have
```

## Output Schema

```typescript
interface DocSuggestion {
  file: string;
  action: 'add' | 'update' | 'remove';
  section: string | null;
  content: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}
```

## Examples

### Input Session
```
User asked to add authentication. Implemented JWT with httpOnly cookies.
Discovered that Remix requires special handling for cookies in redirects.
Used pattern: all API routes return { data, error } format.
```

### Output
```json
[
  {
    "file": "CLAUDE.md",
    "action": "add",
    "section": "API Conventions",
    "content": "- All API routes return `{ data, error }` response format",
    "reason": "This pattern was consistently applied across 4 new endpoints",
    "priority": "high",
    "confidence": 0.95
  },
  {
    "file": ".claude/instructions/remix-patterns.md",
    "action": "add",
    "section": null,
    "content": "## Cookie Handling\n\nWhen redirecting with cookies in Remix:\n```typescript\nthrow redirect(url, {\n  headers: { 'Set-Cookie': await commitSession(session) }\n});\n```",
    "reason": "Discovered this gotcha during auth implementation",
    "priority": "medium",
    "confidence": 0.9
  }
]
```
