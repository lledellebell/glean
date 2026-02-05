---
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
description: Manage Glean configuration
---

# /glean config - Configuration Manager

Manage Glean settings at project and global level.

## Subcommands

### /glean config show

Display current configuration.

```bash
/glean config show           # Merged config for current project
/glean config show --global  # Global config only
/glean config show --project # Project config only
/glean config show --resolved # Show where each value comes from
```

### /glean config init

Initialize configuration for current project.

```bash
/glean config init           # Interactive setup
/glean config init --preset=minimal
/glean config init --preset=full
/glean config init --preset=team
```

**Presets:**

| Preset | Description |
|--------|-------------|
| minimal | Basic analysis, no history |
| standard | All agents, history enabled |
| full | Everything including team sync |
| team | Optimized for team collaboration |

### /glean config set

Set a configuration value.

```bash
/glean config set language ko
/glean config set agents.doc-analyzer false
/glean config set history.retention 180
/glean config set --global defaults.language en
```

### /glean config validate

Validate configuration files.

```bash
/glean config validate       # Validate project config
/glean config validate --all # Validate all configs
```

### /glean config migrate

Migrate from older config versions.

```bash
/glean config migrate --check  # Check if migration needed
/glean config migrate          # Run migration
```

## Interactive Init Flow

```
🌾 Glean Configuration

1. Language
   > Auto-detect (recommended)
     English
     Korean
     Japanese
     Other...

2. Agents to enable
   [x] Doc Analyzer - Update documentation
   [x] Automation Finder - Find automation opportunities
   [x] Learning Extractor - Extract learnings
   [x] Followup Planner - Plan next steps

3. History
   > Enable (recommended)
     Disable

4. Team Mode
   > Disable
     Enable with .team/learnings.md
     Custom path...

5. Detected Tool: Claude Code
   Configure targets for Claude Code?
   > Use defaults (CLAUDE.md, .claude/instructions/)
     Customize...

✅ Configuration saved to .glean.json
```

## Output Format

### /glean config show

```markdown
## Glean Configuration

### Source: .glean.json (project)

| Setting | Value | Source |
|---------|-------|--------|
| language | auto | default |
| agents.doc-analyzer | true | project |
| agents.automation-finder | true | project |
| history.enabled | true | global |
| history.retention | 90 | default |
| team.enabled | false | default |

### Detected Tool
Claude Code

### Target Files
- CLAUDE.md
- .claude/instructions/
- .claude/commands/
```
