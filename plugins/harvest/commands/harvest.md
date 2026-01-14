# /harvest - Session Harvest

Harvest and save knowledge from your current session.

## Usage
```
/harvest [--mode <mode>] [--output <path>]
```

## Options
- `--mode`: Harvest mode (quick, full, custom) - default: quick
- `--output`: Output path - default: ~/.glean/harvests/
- `--no-save`: Preview only without saving

## Harvest Modes

### quick (Quick Harvest)
Quickly extract core session information:
- Work summary
- Modified files
- Commit history

### full (Full Harvest)
Extract all session information in detail:
- Full conversation analysis
- Insight extraction
- Learning items
- Next todos

### custom (Custom)
Harvest only selected items:
```bash
/harvest --mode custom --include "insights,todos,commits"
```

## Harvest Content

### Auto-collected Items
| Item | Description |
|------|-------------|
| summary | Session work summary |
| files | Modified/created files |
| commits | Commit history |
| duration | Session duration |
| tools | Tool usage statistics |

### Analysis Items
| Item | Description |
|------|-------------|
| insights | Discovered patterns, mistakes |
| learnings | Newly learned items |
| todos | Incomplete/next tasks |
| questions | Remaining questions |

## Output Format

```
## 🌾 Session Harvest Complete

📅 2024-01-15 14:30 ~ 16:00 (1h 30m)
📁 Project: my-app

### Work Summary
- Implemented user authentication
- Added JWT token handling logic

### Modified Files (5)
- src/auth/login.tsx (created)
- src/hooks/useAuth.ts (created)
- src/api/auth.ts (modified)
...

### Commits (2)
- feat: implement login feature (abc1234)
- fix: token refresh bug (def5678)

### Discovered Insights
1. Storing tokens in httpOnly cookies improves security
2. React Query is effective for caching auth state

### Learnings
- JWT refresh token pattern
- Axios interceptor usage

### Next Todos
- [ ] Logout feature
- [ ] Password reset

---
💾 Saved: ~/.glean/harvests/2024-01-15-session-1.md
```

## Agent Execution

Agents run in full mode:

1. **doc-analyzer**: Analyse content to document
2. **learning-extractor**: Extract learning items
3. **followup-planner**: Plan next tasks
4. **automation-finder**: Find automation opportunities

## Examples

```bash
# Quick harvest
/harvest

# Full harvest
/harvest --mode full

# Preview only
/harvest --no-save

# Save to specific path
/harvest --output ./docs/sessions/
```

## Auto Harvest

Configure auto harvest on session end:

```json
{
  "harvest": {
    "autoHarvest": true,
    "mode": "quick",
    "minDuration": 600  // Only sessions over 10 min
  }
}
```

## Implementation Steps

When this command is executed, perform these steps:

### Step 1: Collect Session Info
```
1. Check current project path
2. Check Git status (branch, recent commits)
3. Estimate session start time (based on first message)
```

### Step 2: Run session-analyzer Agent
```
Run session-analyzer agent with Task tool:
- subagent_type: "general-purpose"
- prompt: Refer to agents/session-analyzer.md
- quick/full analysis based on mode
```

### Step 3: Save Results
```
1. Save JSON to ~/.glean/harvests/ directory
2. Filename: harvest-YYYY-MM-DD-HHMMSS-xxxx.json
3. Update index.json
```

### Step 4: Output Results
```
Display harvest summary to user:
- Session info (time, project)
- Main tasks
- Key insights
- Save path
```

### Step 5 (Optional): Convert to Learning
```
With --to-learn option:
Auto-add learning type insights to /learn
```

## Related Commands
- `/done` - Auto harvest on session end
- `/insight` - Detailed insight analysis
- `/learn` - Convert to learning items
- `/bridge` - External plugin integration
