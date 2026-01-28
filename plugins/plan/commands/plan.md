---
allowed-tools: Read, Write, Edit, Glob
description: Create and manage development plans
---

# /plan - Development Planning

Create, view, and manage development plans for your project.

## Usage

```bash
/plan                        # Show current plan
/plan create "Auth system"   # Create new plan
/plan add "Add login form"   # Add task to current plan
/plan done 1                 # Mark task 1 as done
/plan next                   # Show next priority task
```

## Subcommands

### /plan create

```bash
/plan create "Feature name"
/plan create "Feature name" --breakdown  # Auto-generate tasks
```

### /plan add

```bash
/plan add "Task description"
/plan add "Task" --priority=high
/plan add "Task" --blocked-by=2  # Blocked by task 2
```

### /plan done

```bash
/plan done 1          # Mark task 1 complete
/plan done 1,2,3      # Mark multiple tasks
```

### /plan next

```bash
/plan next            # Show next unblocked task
/plan next --reason   # Include why this is next
```

## Plan Storage

```
~/.glean/plans/
└── {project-hash}/
    ├── current.json     # Active plan
    └── archive/         # Completed plans
```

## Plan Schema

```json
{
  "id": "uuid",
  "name": "Auth System Implementation",
  "createdAt": "2025-01-13T10:00:00Z",
  "status": "in_progress",
  "tasks": [
    {
      "id": 1,
      "description": "Design database schema",
      "priority": "high",
      "status": "completed",
      "blockedBy": [],
      "completedAt": "2025-01-13T12:00:00Z"
    },
    {
      "id": 2,
      "description": "Implement login endpoint",
      "priority": "high",
      "status": "in_progress",
      "blockedBy": [1]
    }
  ]
}
```

## Output

```
📋 Current Plan: Auth System Implementation

Progress: ████████░░ 40% (4/10 tasks)

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1 | Design database schema | High | ✅ Done |
| 2 | Implement login endpoint | High | 🔄 In Progress |
| 3 | Add password hashing | High | ⏳ Blocked by #2 |
| 4 | Create login form | Medium | ⏸️ Pending |

⚡ Next: #2 Implement login endpoint
```
