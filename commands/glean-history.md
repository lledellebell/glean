---
allowed-tools: Read, Glob, Bash(ls:*), AskUserQuestion
description: View session history and learnings
---

# /glean history - Session History Viewer

View past session summaries and accumulated learnings.

## Arguments

- `--days=<n>` - Show last N days (default: 7)
- `--project=<path>` - Specific project (default: current)
- `--all` - Show all projects
- `--learnings` - Focus on learnings only
- `--format=<type>` - Output format (table, json, markdown)

## Usage

```bash
# Last 7 days for current project
/glean history

# Last 30 days
/glean history --days=30

# All learnings
/glean history --learnings

# All projects
/glean history --all
```

## Execution

1. **Load History**
   - Read from `~/.glean/history/{project-hash}/`
   - Filter by date range
   - Sort by date descending

2. **Format Output**
   - Group by date
   - Show session summaries
   - Highlight learnings

3. **Interactive Options**
   - Search within history
   - Export to file
   - Share specific entries

## Output Format

```markdown
## Session History

### 2025-01-13

#### Session 1 (2h 30m)
**Tasks Completed:**
- Implemented user authentication
- Fixed cookie handling bug

**Learnings:**
- Remix redirect with cookies needs headers option

**Files Changed:** 8 (+245/-67)

---

### 2025-01-12

#### Session 1 (1h 15m)
...

---

## Summary (Last 7 days)
- Total Sessions: 5
- Total Time: 8h 45m
- Tasks Completed: 12
- Learnings: 7
```
