# /stats - Session Statistics

Show coding session statistics and productivity analysis.

## Usage
```
/stats [--period <period>] [--project <name>]
```

## Options
- `--period`: Period (today, week, month, all) - default: today
- `--project`: Filter by specific project
- `--compare`: Compare with previous period

## Statistics Items

### Session Metrics
| Item | Description |
|------|-------------|
| Sessions | Total session count |
| Total time | Cumulative work time |
| Average length | Average time per session |
| Messages | Messages exchanged |

### Code Metrics
| Item | Description |
|------|-------------|
| Files modified | Number of modified files |
| Lines added/deleted | Code change volume |
| Commits | Commits created |
| Language distribution | TypeScript, JavaScript, etc. |

### Tool Usage
| Item | Description |
|------|-------------|
| Search count | Grep, Glob usage |
| File reads | Read calls |
| Agent runs | Task usage |

### Insight Metrics
| Item | Description |
|------|-------------|
| Patterns found | Number of insights |
| Errors resolved | Problems solved |
| Learning items | Newly learned |

## Output Format

```
## 📊 Session Statistics

### Today (2024-01-15)

| Metric | Value | Change |
|--------|-------|--------|
| Sessions | 3 | +1 |
| Time | 2h 30m | +45m |
| Files | 12 | +5 |
| Commits | 4 | +2 |

### Language Distribution
```
TypeScript  ████████████░░░░  75%
CSS         ███░░░░░░░░░░░░░  15%
Markdown    ██░░░░░░░░░░░░░░  10%
```

### Top 5 Tool Usage
1. Read (45)
2. Edit (32)
3. Grep (18)
4. Bash (12)
5. Task (8)

### This Week's Trend
📈 Productivity: +15% (vs last week)
🎯 Focus sessions: 2 (1h+ continuous)
```

## Dashboard Mode

```bash
/stats --dashboard
```

Displays real-time updating dashboard:
- Current session progress
- Goal progress
- Real-time statistics

## Examples

```bash
# Today's stats
/stats

# This week's stats
/stats --period week

# Specific project
/stats --project my-app

# Compare with last week
/stats --period week --compare
```

## Data Storage
- Saved daily in `~/.glean/stats/`
- Stored in JSON format
- Retained for 30 days (configurable)

## Related Commands
- `/insight` - Include insight statistics
- `/history` - Detailed session records
- `/sync` - Export to external tools
