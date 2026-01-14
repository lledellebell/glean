# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-14

### Added

- Initial public release
- **8 AI Agents** for parallel session analysis
  - Session Analyzer - Core harvest data generation
  - Doc Analyzer - Documentation update suggestions
  - Automation Finder - Automation opportunity detection
  - Learning Extractor - Learning point extraction
  - Followup Planner - Next task planning
  - Pattern Recognizer - Code pattern detection
  - Mistake Analyzer - Error/mistake analysis
  - Dedup Validator - Result deduplication

- **12 Feature Plugins**
  - `/harvest` - Session knowledge harvesting
  - `/insight` - Pattern and insight extraction
  - `/learn` - Spaced repetition learning (SM-2 algorithm)
  - `/memory` - Persistent memory (remember/recall)
  - `/context` - Session context save/restore
  - `/plan` - Task planning and tracking
  - `/pr` - Pull request workflow automation
  - `/review` - Code review helper
  - `/history` - Session history search
  - `/sync` - External tool synchronisation
  - `/notify` - Notification management
  - `/stats` - Session statistics

- **Bridge Integrations**
  - Obsidian vault export
  - GitHub issues integration
  - Notion database sync

- **Core Libraries**
  - `spaced-repetition.js` - SM-2 algorithm implementation
  - `harvest-store.js` - Harvest data management
  - `insight-store.js` - Insight storage
  - `learn-store.js` - Learning item management
  - Bridge modules for external integrations

- **Documentation**
  - Multilingual README (English, Spanish, Japanese)
  - Contributing guide
  - MIT License

- **Testing**
  - 61 test cases covering core functionality
  - Spaced repetition algorithm tests
  - Data transformer tests
  - Plugin detection tests

[0.1.0]: https://github.com/lledellebell/glean/releases/tag/v0.1.0
