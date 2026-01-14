# Glean

> **Never forget what you learn from AI coding sessions**

Glean automatically harvests knowledge from your Claude Code sessions and transforms it into long-term memory using spaced repetition.

[Español](./README.es.md) | [日本語](./README.ja.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![npm downloads](https://img.shields.io/npm/dm/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lledellebell/glean.svg)](https://github.com/lledellebell/glean/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/lledellebell/glean.svg)](https://github.com/lledellebell/glean/commits/main)
[![GitHub code size](https://img.shields.io/github/languages/code-size/lledellebell/glean.svg)](https://github.com/lledellebell/glean)
[![GitHub contributors](https://img.shields.io/github/contributors/lledellebell/glean.svg)](https://github.com/lledellebell/glean/graphs/contributors)
[![Tests](https://img.shields.io/badge/tests-61%20passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Documentation-blue.svg)](https://deepwiki.com/lledellebell/glean)

## The Problem

When AI coding sessions end, valuable information disappears:

- Code patterns and conventions you discovered
- Mistakes you made and how you fixed them
- Concepts you learnt (forgotten by next week)
- Useful commands and workflows

**Glean** captures all of this automatically and helps you retain it permanently.

## Features

### Session Harvesting

Analyse your coding session with 8 specialised AI agents running in parallel:

| Agent | Purpose |
|-------|---------|
| Session Analyzer | Core harvest data generation |
| Doc Analyzer | Documentation update suggestions |
| Automation Finder | Automation opportunity detection |
| Learning Extractor | Learning point extraction |
| Followup Planner | Next task planning |
| Pattern Recognizer | Code pattern detection |
| Mistake Analyzer | Error/mistake analysis |
| Dedup Validator | Result deduplication |

### Spaced Repetition

Built-in SM-2 algorithm schedules reviews at optimal intervals:

| Confidence | Next Review |
|------------|-------------|
| 5/5 | 30 days |
| 4/5 | 14 days |
| 3/5 | 7 days |
| 2/5 | 3 days |
| 1/5 | 1 day |

### Plugin Ecosystem

12 feature plugins for comprehensive session management:

| Plugin | Description |
|--------|-------------|
| `/harvest` | Session knowledge harvesting |
| `/insight` | Pattern and insight extraction |
| `/learn` | Spaced repetition learning |
| `/memory` | Persistent memory (remember/recall) |
| `/context` | Session context save/restore |
| `/plan` | Task planning and tracking |
| `/pr` | Pull request workflow automation |
| `/review` | Code review helper |
| `/history` | Session history search |
| `/sync` | External tool synchronisation |
| `/notify` | Notification management |
| `/stats` | Session statistics |

### Bridge Integrations

Connect with external tools:

- **Obsidian** - Export insights to your vault
- **GitHub** - Create issues from tasks
- **Notion** - Sync learnings to databases

## Installation

### npm

```bash
npm install @deeeep/glean
```

### Manual Installation

```bash
# Clone to your plugins directory
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# Or clone anywhere and reference in settings
git clone https://github.com/lledellebell/glean.git ~/glean
```

### Configuration

Add to your Claude Code settings:

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## Quick Start

```bash
# 1. Start a coding session with Claude Code
claude

# 2. Do your work...

# 3. Harvest knowledge at session end
/glean

# 4. Review your learnings later
/learn review
```

## Commands

### Core Commands

```bash
/glean              # Harvest current session (parallel agents)
/glean --verbose    # Detailed output with all agent results

/harvest            # Quick knowledge harvest
/harvest --full     # Comprehensive analysis

/insight            # Extract insights
/insight --type pattern   # Only patterns
/insight --type mistake   # Only mistakes
```

### Learning Commands

```bash
/learn add "React Query caches by query key"  # Add learning
/learn list                                    # View learnings
/learn review                                  # Start review session
/learn quiz --topic react                      # Quiz mode
```

### Memory Commands

```bash
/remember "API uses camelCase for responses"  # Save to memory
/recall api                                    # Search memory
```

### Workflow Commands

```bash
/plan create "Auth system"    # Create development plan
/plan add "Add login form"    # Add task
/plan done 1                  # Mark complete

/pr create                    # Create pull request
/review src/                  # Code review
```

## Data Storage

```
~/.glean/
├── harvests/     # Session harvest data (JSON)
├── insights/     # Extracted insights
├── learn/        # Learning items with review schedule
├── contexts/     # Saved session contexts
├── history/      # Session history
└── config.json   # Configuration
```

## Configuration

Create `~/.glean/config.json`:

```json
{
  "harvest": {
    "autoHarvest": true,
    "mode": "quick",
    "minDuration": 600
  },
  "learn": {
    "reviewReminder": true,
    "defaultConfidence": 3
  },
  "integrations": {
    "obsidian": {
      "enabled": true,
      "vaultPath": "~/Documents/Obsidian/Vault"
    }
  }
}
```

## Testing

```bash
# Run all tests
npm test

# 61 tests covering:
# - Spaced repetition algorithm
# - Data transformers
# - Plugin detection
```

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code guidelines
- Testing requirements
- Pull request process

## Roadmap

- [ ] Web dashboard for review
- [ ] Team knowledge sharing
- [ ] More integrations (Linear, Jira)
- [ ] AI-powered review suggestions

## Licence

MIT Licence - See [LICENSE](./LICENSE)

## Author

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Remember today what you learnt yesterday"

**Star this repo if Glean helps you learn!**
