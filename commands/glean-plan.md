---
allowed-tools: Read, Write, Glob, Bash(ls:*), AskUserQuestion
description: Declare learning intentions for the session
---

# /glean-plan - Learning Plan

Declare learning intentions at session start, compare with results at session end.

## Arguments

- `<intentions>` - Learning intentions (comma-separated or interactive)
- `--review` - Check current active plan
- `--complete` - Complete plan and compare results
- `--carryover` - Check carryover items from previous session

## Execution Flow

### Create mode (default)
1. Check previous session carryover items
2. Collect learning intentions from user
3. Save plan to `~/.glean/plans/`
4. Show related previous learnings if any

### Complete mode (`--complete`)
1. Collect actual learnings from session
2. Compare intentions vs actual
3. Show achievement rate, missed, unexpected
4. Save missed items as carryover candidates

## Examples

```bash
/glean-plan "Learn RSC, compare data fetching, cache strategies"
/glean-plan --review
/glean-plan --complete
/glean-plan --carryover
```
