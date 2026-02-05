---
allowed-tools: Read, Write, Glob
description: Save information to remember across sessions
---

# /remember - Save to Memory

Store information that should persist across coding sessions.

## Usage

```bash
/remember "React Query needs explicit invalidation after mutations"
/remember --tag=remix "Cookies in redirect need headers option"
/remember --project "This project uses snake_case for hooks"
```

## Arguments

- `<content>` - Information to remember (required)
- `--tag=<tag>` - Category tag (optional)
- `--project` - Project-specific memory (default: global)
- `--ttl=<days>` - Auto-expire after N days (optional)

## Storage

```
~/.glean/memory/
├── global.json          # Cross-project memories
└── {project-hash}.json  # Project-specific memories
```

## Memory Schema

```json
{
  "id": "uuid",
  "content": "The information to remember",
  "tags": ["tag1", "tag2"],
  "createdAt": "2025-01-13T10:00:00Z",
  "accessCount": 0,
  "lastAccessed": null,
  "expiresAt": null,
  "projectSpecific": false
}
```

## Examples

```bash
# Global memory
/remember "Always run tests before committing"

# Tagged memory
/remember --tag=typescript "Use z.infer for Zod types"

# Project-specific
/remember --project "API routes are in app/routes/api/"

# Auto-expiring
/remember --ttl=7 "Temporary workaround for issue #123"
```

## Output

```
✅ Remembered!

"React Query needs explicit invalidation after mutations"

📁 Saved to: global memory
🏷️  Tags: react-query
📊 Total memories: 47
```
