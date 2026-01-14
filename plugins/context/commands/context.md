# /context - Context Management

Save and restore session context.

## Usage
```
/context <command> [options]
```

## Subcommands

### save - Save Current Context
```bash
/context save [--name <name>] [--tag <tags>]
```

### load - Restore Context
```bash
/context load <name|id>
```

### list - List Saved Contexts
```bash
/context list [--project <name>]
```

### delete - Delete Context
```bash
/context delete <name|id>
```

## Information Included in Context

### Auto-collected
- Current working directory
- Open file list
- Recently modified files
- Git branch/status
- Running tasks (Todo)

### Manually Addable
- Work notes
- Related document links
- Next tasks

## Output Format

### On Save
```
✅ Context saved

📌 Name: auth-feature
🏷️ Tags: #auth #feature
📁 Project: my-app
📅 Saved: 2024-01-15 15:30

Included information:
- 5 working files
- 3 todo items
- Git branch: feature/auth

Restore command: /context load auth-feature
```

### List View
```
## Saved Contexts

| Name | Project | Date | Tags |
|------|---------|------|------|
| auth-feature | my-app | 01-15 | #auth |
| api-refactor | api-server | 01-14 | #refactor |
| bug-fix-123 | my-app | 01-13 | #bugfix |
```

### On Restore
```
✅ Context restored: auth-feature

📁 Project: /Users/me/projects/my-app
🌿 Git branch: feature/auth

### Files in Progress
- src/auth/login.tsx
- src/hooks/useAuth.ts
- src/api/auth.ts

### Incomplete Tasks
- [ ] Implement logout feature
- [ ] Add token refresh logic
- [ ] Improve error handling

### Notes
Decided to store JWT refresh tokens in httpOnly cookies
```

## Auto Context

### Auto-restore on Session Start
```bash
# .glean.json settings
{
  "autoContext": {
    "enabled": true,
    "strategy": "last" | "branch" | "manual"
  }
}
```

- `last`: Auto-load last context
- `branch`: Load context by Git branch
- `manual`: Load manually only

### Auto-save on Session End
```bash
# Context automatically saved when /done is executed
```

## Examples

```bash
# Save current context
/context save --name "auth-wip" --tag "auth,feature"

# Restore context
/context load auth-wip

# View list
/context list

# Specific project only
/context list --project my-app

# Delete
/context delete old-context
```

## Data Storage
- Saved in `~/.glean/contexts/`
- Subdirectories by project
- JSON format

## Related Commands
- `/history` - Restore from session history
- `/plan` - Include work plans
- `/memory` - Integration with persistent memory
