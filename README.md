# Glean

> **Never forget what you learn from AI coding sessions**

Glean automatically harvests knowledge from your Claude Code sessions and transforms it into long-term memory using spaced repetition.

[Español](./README.es.md) | [日本語](./README.ja.md)

## Why Glean?

When AI coding sessions end, valuable information disappears:

- Code patterns and conventions you discovered
- Mistakes you made and how you fixed them
- Concepts you learnt (forgotten by next week)

**Glean** captures all of this automatically and helps you retain it permanently.

## Key Features

### `/glean` - Session Harvester

Analyse your session and extract valuable knowledge with parallel agents.

```bash
/glean              # Harvest current session
/glean --verbose    # Detailed output
```

### `/harvest` - Knowledge Collection

Collect insights from your coding session.

```bash
/harvest            # Quick harvest
/harvest --full     # Comprehensive analysis
```

### Spaced Repetition

Built-in SM-2 algorithm schedules reviews at optimal intervals:

| Confidence | Next Review |
|------------|-------------|
| ⭐⭐⭐⭐⭐ | 30 days |
| ⭐⭐⭐⭐ | 14 days |
| ⭐⭐⭐ | 7 days |
| ⭐⭐ | 3 days |
| ⭐ | 1 day |

## Installation

### From Claude Code Marketplace

```bash
/install glean
```

### Manual Installation

```bash
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## Quick Start

```bash
# 1. Harvest knowledge at session end
/glean

# 2. Review suggestions
# 3. Apply what you've learnt
```

## Data Storage

```
~/.glean/
├── harvests/     # Session harvest data
├── insights/     # Extracted insights
└── config.json   # Configuration
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Licence

MIT Licence - See [LICENSE](./LICENSE)

## Author

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Remember today what you learnt yesterday" 🧠
