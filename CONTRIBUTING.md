# Contributing to Glean

Thank you for your interest in contributing to Glean! 🌾

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Code Guidelines](#code-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Getting Started

Glean is a Claude Code plugin suite for session knowledge harvesting and learning management. Before contributing, please:

1. Read this contributing guide
2. Check existing [issues](https://github.com/lledellebell/glean/issues) and [discussions](https://github.com/lledellebell/glean/discussions)
3. Familiarise yourself with the [project structure](#project-structure)

## Development Setup

### Prerequisites

- Node.js 18+
- Claude Code CLI
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/lledellebell/glean.git
cd glean

# Install dependencies (if any)
npm install

# Run tests to verify setup
npm test
```

### Project Structure

```
glean/
├── agents/            # AI agents for session analysis
│   ├── session-analyzer.md
│   ├── doc-analyzer.md
│   ├── automation-finder.md
│   ├── learning-extractor.md
│   ├── followup-planner.md
│   ├── dedup-validator.md
│   ├── pattern-recognizer.md
│   └── mistake-analyzer.md
├── commands/          # Main slash commands
│   ├── glean.md
│   ├── bridge.md
│   └── glean-*.md
├── plugins/           # Feature plugins
│   ├── harvest/       # Session harvesting
│   ├── insight/       # Insight extraction
│   ├── learn/         # Spaced repetition learning
│   ├── memory/        # Persistent memory
│   ├── context/       # Session context
│   ├── plan/          # Task planning
│   ├── pr/            # Pull request workflow
│   ├── review/        # Code review helper
│   ├── history/       # Session history
│   ├── sync/          # External sync
│   ├── notify/        # Notifications
│   └── stats/         # Statistics
├── lib/               # Core libraries
│   ├── paths.js            # Shared path constants
│   ├── spaced-repetition.js
│   ├── harvest-store.js
│   ├── insight-store.js
│   ├── learn-store.js
│   ├── knowledge-search.js # Unified knowledge search
│   ├── plan-store.js       # Learning plan management
│   ├── session-linker.js   # Cross-session linking
│   ├── doctor.js           # Health diagnostics
│   ├── history-parser.js   # Session history parser
│   └── bridge/             # External integrations
├── hooks/             # Event hooks
├── tests/             # Test files
└── types/             # TypeScript definitions
```

## How to Contribute

### Reporting Issues

Found a bug or have a feature idea? [Create an issue](https://github.com/lledellebell/glean/issues/new).

**Bug Reports** should include:
- Glean version (`cat package.json | grep version`)
- Claude Code version (`claude --version`)
- Steps to reproduce
- Expected vs actual behaviour
- Error messages or logs

**Feature Requests** should include:
- Problem description
- Proposed solution
- Use cases
- Alternatives considered

### Types of Contributions

| Type | Description |
|------|-------------|
| 🐛 Bug fixes | Fix issues and improve stability |
| ✨ Features | Add new commands, agents, or plugins |
| 📝 Documentation | Improve docs, examples, translations |
| 🧪 Tests | Add or improve test coverage |
| 🌍 Translations | Add language support |
| 🔧 Refactoring | Improve code quality |

## Code Guidelines

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |

**Examples:**
```bash
feat(learn): add spaced repetition quiz mode
fix(harvest): handle empty session gracefully
docs(readme): add installation instructions
test(spaced-repetition): add edge case tests
```

### Code Style

**JavaScript:**
```javascript
// Use single quotes
const name = 'glean';

// Use 2-space indentation
function example() {
  return true;
}

// Use semicolons
const value = calculate();

// Use descriptive names
function calculateNextReviewDate(confidence, lastReview) {
  // ...
}

// Add JSDoc comments for public APIs
/**
 * Calculate the next review date based on SM-2 algorithm
 * @param {number} confidence - User confidence (1-5)
 * @param {Date} lastReview - Last review date
 * @returns {{ nextReview: string, easeFactor: number }}
 */
```

**Markdown Commands:**
```markdown
---
allowed-tools: Read, Edit, Bash
description: Short description of what the command does
---

# /command-name - Title

Brief description of the command.

## Usage

\`\`\`bash
/command-name [options]
\`\`\`

## Options

- `--option`: Description

## Examples

\`\`\`bash
/command-name --example
\`\`\`
```

### Agent Guidelines

When creating or modifying agents:

1. Include frontmatter with `name`, `phase`, and `parallel` fields
2. Define clear input/output specifications
3. Provide example prompts and outputs
4. Document post-processing steps

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
node --test tests/spaced-repetition.test.js

# Run with verbose output
node --test --test-reporter spec tests/*.test.js
```

### Writing Tests

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('featureName', () => {
  test('should do something', () => {
    const result = myFunction();
    assert.strictEqual(result, expected);
  });
});
```

### Test Coverage

Please include tests for:
- New features
- Bug fixes
- Edge cases
- Error handling

## Pull Request Process

### Before Submitting

- [ ] Tests pass (`npm test`)
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactoring

## Testing
How was this tested?

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

1. Create PR against `main` branch
2. Request review from maintainers
3. Address feedback
4. Squash and merge when approved

## Community

### Getting Help

- [GitHub Discussions](https://github.com/lledellebell/glean/discussions) - Questions and ideas
- [GitHub Issues](https://github.com/lledellebell/glean/issues) - Bug reports

### Code of Conduct

- Be respectful and inclusive
- Give constructive feedback
- Focus on the issue, not the person
- Help newcomers feel welcome

## Recognition

Contributors are recognised in:
- [MAINTAINERS.md](./MAINTAINERS.md)
- GitHub Contributors page
- Release notes

---

Thank you for contributing to Glean! 🙏
