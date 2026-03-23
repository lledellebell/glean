---
allowed-tools: Read, Glob, Grep, Bash(ls:*), AskUserQuestion
description: Search across all stored knowledge with natural language
---

# /glean-explore - Knowledge Explorer

Search across all knowledge stores with natural language queries.

## Arguments

- `<query>` - Search query (required)
- `--source=<list>` - Filter sources (insights,learn,harvests)
- `--project=<name>` - Filter by project
- `--limit=<n>` - Max results (default: 10)

## Execution Flow

1. **Parse query** - Extract search terms and options
2. **Unified search** - Search all knowledge stores by similarity
   - `~/.glean/insights/` - Insights
   - `~/.glean/learn/` - Learn items
   - `~/.glean/harvests/` - Session harvests
3. **Sort results** - Order by relevance
4. **Format output** - Display with source icons

## Examples

```bash
/glean-explore "React state management mistakes"
/glean-explore "TypeScript type errors" --source=insights
/glean-explore "performance optimization" --project=my-app
```
