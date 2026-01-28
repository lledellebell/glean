---
allowed-tools: Read, Write, Bash(curl:*), WebFetch
description: Sync Glean data with external tools
---

# /sync - External Tool Synchronization

Sync your learnings, tasks, and insights with external tools.

## Usage

```bash
/sync                        # Sync all configured integrations
/sync notion                 # Sync to Notion only
/sync github --issues        # Create GitHub issues from tasks
/sync obsidian --learnings   # Sync learnings to Obsidian
```

## Supported Integrations

| Integration | Sync Type | Features |
|-------------|-----------|----------|
| Notion | Push | Learnings → Database, Tasks → Kanban |
| Obsidian | Push | Learnings → Markdown, Daily notes |
| GitHub | Push | Tasks → Issues, Learnings → Discussions |
| Linear | Push | Tasks → Issues |
| Slack | Push | Summary → Channel message |
| Discord | Push | Summary → Webhook |

## Configuration

```json
// .glean.json
{
  "integrations": {
    "notion": {
      "enabled": true,
      "token": "${NOTION_TOKEN}",
      "databases": {
        "learnings": "database-id",
        "tasks": "database-id"
      }
    },
    "github": {
      "enabled": true,
      "repo": "user/repo",
      "labels": ["from-glean"]
    },
    "obsidian": {
      "enabled": true,
      "vaultPath": "~/Documents/Obsidian/Vault",
      "folder": "Glean"
    }
  }
}
```

## Sync Options

```bash
/sync --dry-run              # Preview without syncing
/sync --force                # Sync even if already synced
/sync --since="2025-01-01"   # Sync from specific date
/sync --filter=learnings     # Only sync learnings
```

## Output

```
🔄 Syncing to external tools...

Notion:
  ✅ 5 learnings synced to "Dev Learnings" database
  ✅ 3 tasks synced to "Tasks" board

GitHub:
  ✅ Created issue #45: "Add rate limiting"
  ✅ Created issue #46: "Write auth tests"
  ⏭️  Skipped 2 (already exists)

Obsidian:
  ✅ Created: 2025-01-13-learnings.md
  ✅ Updated: React-Query-Notes.md

📊 Sync Summary
  Total: 12 items
  Created: 8
  Updated: 2
  Skipped: 2
```
