# Glean

> **Never forget what you learn from AI coding sessions**

<img width="1024" height="523" alt="image" src="https://github.com/user-attachments/assets/fd533eab-3292-4cf2-b4d4-28961a793e87" />

Glean automatically harvests knowledge from your Claude Code sessions and transforms it into long-term memory using spaced repetition.

[Español](./README.es.md) | [日本語](./README.ja.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@lledellebell/glean.svg)](https://www.npmjs.com/package/@lledellebell/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lledellebell/glean.svg)](https://github.com/lledellebell/glean/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/lledellebell/glean.svg)](https://github.com/lledellebell/glean/commits/main)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## The Problem

When AI coding sessions end, valuable information disappears:

- Code patterns and conventions you discovered
- Mistakes you made and how you fixed them
- Concepts you learnt (forgotten by next week)
- Useful commands and workflows

**Glean** captures all of this automatically and helps you retain it permanently.

## Features

### Session Harvesting

Analyse your coding session with specialised AI agents running in parallel:

| Agent | Purpose |
|-------|---------|
| Doc Analyzer | Documentation update suggestions |
| Automation Finder | Automation opportunity detection |
| Learning Extractor | Learning point extraction |
| Followup Planner | Next task planning |
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

14 feature plugins for comprehensive session management:

| Plugin | Description |
|--------|-------------|
| `/harvest` | Session knowledge harvesting |
| `/insight` | Pattern and insight extraction |
| `/learn` | Spaced repetition learning |
| `/flashcard` | Flashcard-style review (what/how/why) |
| `/growth` | Learning progress visualisation |
| `/memory` | Persistent memory (remember/recall) |
| `/context` | Session context save/restore |
| `/plan` | Task planning and tracking |
| `/pr` | Pull request workflow automation |
| `/review` | Code review helper |
| `/history` | Session history search |
| `/sync` | External tool synchronisation |
| `/notify` | Notification management |
| `/stats` | Session statistics |

### Automatic Alerts (Hooks)

Glean provides intelligent hooks that trigger automatically:

| Hook | Trigger | Description |
|------|---------|-------------|
| **Deja-vu Alert** | Session start | Detects similar errors and shows past solutions |
| **Daily One-liner** | Session end | Prompts you to save today's most important learning |
| **Context Review** | Session start | Shows relevant past learnings for current project |

### Bridge Integrations

Connect with external tools:

- **Obsidian** - Export insights to your vault
- **GitHub** - Create issues from tasks

## Installation

### npm (GitHub Packages)

```bash
npm install @lledellebell/glean
```

### Manual Installation

```bash
# Clone to your plugins directory
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

### Configuration

Add to your Claude Code settings:

```json
{
  "commandPaths": ["~/.claude/plugins/glean/commands"]
}
```

## Quick Start

```bash
# 1. Start a coding session with Claude Code
claude

# 2. Do your work...

# 3. Harvest knowledge at session end
/glean

# 4. Review your learnings
/learn review
# or
/flashcard
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

/flashcard                    # Flashcard review
/flashcard --topic react      # Filter by topic
/flashcard --stats            # View statistics

/growth                       # Growth visualisation
/growth --period=week         # This week's progress
/growth --quick               # Quick summary
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
├── daily/        # Daily learnings (one-liners)
├── contexts/     # Saved session contexts
├── history/      # Session history
└── config/       # Configuration
```

## Configuration

Create `.glean.json` in your project:

```json
{
  "harvest": {
    "autoHarvest": true,
    "minDuration": 600
  },
  "daily": {
    "autoPrompt": true,
    "maxDaily": 3
  },
  "contextReview": {
    "enabled": true,
    "limit": 5
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

# 163 tests covering:
# - Spaced repetition algorithm
# - Pattern matching
# - Flashcard generation
# - Growth visualisation
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
