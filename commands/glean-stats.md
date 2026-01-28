---
allowed-tools: Read, Glob, Bash(ls:*)
description: View session statistics and productivity trends
---

# /glean stats - Analytics Dashboard

View statistics, trends, and insights from your coding sessions.

## Arguments

- `--period=<range>` - Time period (week, month, quarter, year, all)
- `--project=<path>` - Specific project (default: current)
- `--all` - All projects combined
- `--compare` - Compare with previous period
- `--export=<file>` - Export to file

## Usage

```bash
# Current project, last month
/glean stats

# All projects, last quarter
/glean stats --all --period=quarter

# Compare with previous period
/glean stats --compare

# Export to JSON
/glean stats --export=stats.json
```

## Metrics

### Session Metrics
- Total sessions
- Total time spent
- Average session duration
- Sessions per week trend

### Productivity Metrics
- Tasks completed per session
- Files changed per session
- Lines of code (added/removed)
- Tool calls per session

### Learning Metrics
- Total learnings accumulated
- Learnings applied (reused)
- Learnings shared with team
- Top learning categories

### Automation Metrics
- Commands created from suggestions
- Hooks created from suggestions
- Time saved estimates
- Automation adoption rate

### Pattern Analysis
- Most frequent task types
- Common file patterns
- Repeated workflows
- Peak productivity hours

## Output Format

```markdown
## Glean Statistics

### Overview (Last 30 days)
| Metric | Value | Trend |
|--------|-------|-------|
| Sessions | 23 | +15% |
| Total Time | 45h 30m | +8% |
| Avg Duration | 1h 58m | -3% |

### Productivity
```
Sessions per Week
█████████████████████ 6
████████████████ 5
███████████████████ 5
████████████████████████ 7
```

### Learning Progress
| Category | Count | Applied |
|----------|-------|---------|
| Technical | 15 | 12 (80%) |
| Problem-Solution | 8 | 6 (75%) |
| Tips | 5 | 5 (100%) |

### Top Patterns
1. API endpoint creation (12 times)
2. Component scaffolding (8 times)
3. Test file setup (6 times)

### Automation Impact
- Commands created: 3
- Hooks created: 2
- Estimated time saved: ~2h 15m

### Insights
- Peak productivity: Tuesday, 2-4 PM
- Most common task: Bug fixes (35%)
- Longest session: Jan 10, 4h 20m
```

## Comparison Mode

With `--compare` flag:

```markdown
## Period Comparison

| Metric | This Month | Last Month | Change |
|--------|------------|------------|--------|
| Sessions | 23 | 18 | +28% |
| Avg Duration | 1h 58m | 2h 15m | -13% |
| Tasks/Session | 3.2 | 2.8 | +14% |
| Learnings | 28 | 22 | +27% |
```
