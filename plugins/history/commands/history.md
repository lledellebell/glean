# /history - Session History

Search and explore past session records.

## Usage
```
/history [--search <query>] [--limit <n>]
```

## Options
- `--search`: Keyword search
- `--limit`: Number of sessions to display - default: 10
- `--project`: Project filter
- `--date`: Date filter (YYYY-MM-DD or range)
- `--tag`: Tag filter

## History Items

Information included in each session record:
- Session ID
- Start/end time
- Project path
- Main task summary
- Modified file list
- Commits (if any)
- Tags

## Output Format

```
## 📜 Session History

### Recent Sessions (10)

| # | Date | Project | Summary | Duration |
|---|------|---------|---------|----------|
| 1 | 01-15 | my-app | Auth feature implementation | 1h 20m |
| 2 | 01-15 | my-app | Bug fix | 30m |
| 3 | 01-14 | api-server | API endpoint addition | 2h |
| ... | ... | ... | ... | ... |

---
View session details: /history --id <session_id>
```

### Detail View

```
## Session Details (#abc123)

📅 2024-01-15 14:30 ~ 15:50 (1h 20m)
📁 /Users/me/projects/my-app

### Task Summary
- Implemented user authentication
- Added JWT token handling logic
- Created login/logout UI

### Modified Files
- src/auth/login.tsx (created)
- src/auth/logout.tsx (created)
- src/hooks/useAuth.ts (created)
- src/api/auth.ts (modified)

### Commits
- feat: Implement user authentication (abc1234)

### Insights
- Applied JWT refresh token pattern
- Enhanced security with httpOnly cookies

### Tags
#auth #feature #react
```

## Search Examples

```bash
# Keyword search
/history --search "auth"

# Last 5 only
/history --limit 5

# Specific project
/history --project my-app

# Date range
/history --date 2024-01-01:2024-01-15

# Search by tag
/history --tag auth

# Combined search
/history --search "API" --project api-server --limit 20
```

## Session Restore

Load past session context into current session:

```bash
/history --restore <session_id>
```

Information restored:
- Files in progress
- Discovered insights
- Incomplete task list

## Export

```bash
# Export to Markdown
/history --export md --output ./session-log.md

# Export to JSON
/history --export json
```

## Data Location
- Saved in `~/.glean/history/`
- JSON file per session
- Index file for fast search

## Related Commands
- `/context` - Session context restore
- `/stats` - History-based statistics
- `/sync` - Sync to external tools
