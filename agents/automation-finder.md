---
name: automation-finder
phase: 1
parallel: true
---

# Automation Finder Agent

Detect repetitive patterns and suggest automation opportunities.

## Purpose

- Find repeated commands or actions
- Identify workflow patterns
- Suggest commands, hooks, or skills

## Detection Targets

| Pattern Type | Example | Automation Type |
|-------------|---------|-----------------|
| Repeated command | `npm run build` 5x | Command or script |
| File boilerplate | Same structure 3x | Scaffold command |
| Post-edit validation | Always lint after edit | Hook |
| Workflow sequence | A → B → C always | Skill |

## Prompt

```
Analyze this session for automation opportunities.

## Session Actions
{{sessionActions}}

## Your Analysis Tasks

1. **Command Patterns**
   - Which commands were run multiple times?
   - Which command sequences always appear together?
   - Minimum 2 occurrences to suggest

2. **File Creation Patterns**
   - Were similar file structures created?
   - Is there repeatable boilerplate?
   - Could this be a scaffold template?

3. **Workflow Patterns**
   - What steps always happen together?
   - What validations are always done?
   - Could these be automated?

## Output Requirements

Return a JSON array:

```json
[
  {
    "type": "command|hook|skill",
    "name": "suggested-name",
    "description": "What it does",
    "trigger": "When to run (for hooks: PreToolUse/PostToolUse)",
    "implementation": {
      "summary": "Brief implementation description",
      "template": "Code template or structure"
    },
    "evidence": {
      "occurrences": 5,
      "examples": ["example 1", "example 2"]
    },
    "impact": {
      "timeSaved": "~5 min per use",
      "errorsPrevented": "Optional: what errors this prevents"
    }
  }
]
```

## Automation Types

### Command
User-triggered actions via `/command-name`.

```markdown
---
allowed-tools: Bash, Write, Edit
description: Short description
---
# /command-name
Instructions...
```

### Hook
Automatic triggers on tool use.

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit(*.ts)",
      "hooks": [{
        "type": "command",
        "command": "npm run typecheck"
      }]
    }]
  }
}
```

### Skill
Complex workflows invokable by name.

```markdown
---
name: skill-name
description: What it does
---
# Skill instructions
Multi-step workflow...
```

## Rules

1. **Minimum threshold** - At least 2 occurrences
2. **Real value** - Must save meaningful time
3. **Not over-automated** - Skip if automation is more complex than manual
4. **Tool-appropriate** - Suggest the right automation type
```

## Examples

### Session Actions
```
1. npm run build (5 times)
2. Created app/routes/api/users/route.ts with loader/action
3. Created app/routes/api/posts/route.ts with loader/action
4. Created app/routes/api/comments/route.ts with loader/action
5. After each Edit(*.tsx), ran typecheck
```

### Output
```json
[
  {
    "type": "command",
    "name": "new-api",
    "description": "Create a new API route with standard loader/action template",
    "trigger": "manual",
    "implementation": {
      "summary": "Creates app/routes/api/{name}/route.ts with loader and action",
      "template": "loader + action + types template"
    },
    "evidence": {
      "occurrences": 3,
      "examples": ["users", "posts", "comments"]
    },
    "impact": {
      "timeSaved": "~3 min per API route"
    }
  },
  {
    "type": "hook",
    "name": "auto-typecheck",
    "description": "Run typecheck after editing TypeScript files",
    "trigger": "PostToolUse:Edit(*.tsx)",
    "implementation": {
      "summary": "PostToolUse hook that runs npm run typecheck",
      "template": "{ \"matcher\": \"Edit(*.tsx)\", \"command\": \"npm run typecheck\" }"
    },
    "evidence": {
      "occurrences": 8,
      "examples": ["After UserCard.tsx edit", "After Header.tsx edit"]
    },
    "impact": {
      "timeSaved": "Catches errors immediately",
      "errorsPrevented": "Type errors discovered earlier"
    }
  }
]
```
