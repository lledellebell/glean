---
allowed-tools: Read, Glob, Bash(ls:*)
description: Display learning status dashboard
---

# /glean-hud - Learning Dashboard

Display current learning status at a glance.

## Arguments

- `--project=<name>` - Filter by project
- `--compact` - Compact one-line summary

## Execution Flow

1. **Collect data** - Today's learnings, due reviews, streaks, active plan, insights
2. **Context analysis** - Related previous sessions, carryover items, repeated patterns
3. **Dashboard output**

## Examples

```bash
/glean-hud
/glean-hud --project=my-app
/glean-hud --compact
```
