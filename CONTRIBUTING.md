# Contributing to Glean

Thank you for contributing to Glean! 🌾

## How to Contribute

### Reporting Issues

If you find a bug or have a feature suggestion, please create an issue on [GitHub Issues](https://github.com/lledellebell/glean/issues).

**Bug report should include:**
- Glean version
- Claude Code version
- Steps to reproduce
- Expected behaviour vs actual behaviour
- Related logs/screenshots

**Feature suggestion should include:**
- Problem description
- Proposed solution
- Alternatives considered

### Pull Requests

1. **Fork** the repository
2. **Branch** creation: `git checkout -b feature/your-feature`
3. **Commit** your changes
4. **Push**: `git push origin feature/your-feature`
5. **PR** creation

### Commit Convention

Commit messages follow this format:

```
<type>: <subject>

<body>
```

**Type:**
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `test` | Test additions/modifications |
| `chore` | Build, configuration changes |

**Example:**
```
feat: Add tag feature to /remember command

- Tag memory with --tag option
- Support filtering by tag
```

### Code Style

- Indentation: 2 spaces
- Strings: Single quotes (`'`)
- Semicolons: Use them
- Comments: In English

### Directory Structure

```
glean/
├── commands/          # Public commands
├── plugins/           # Plugin bundles
│   └── {name}/
│       ├── plugin.json
│       └── commands/
├── docs/              # Public documentation
└── shared/            # Shared utilities
```

### Testing

Before submitting a PR:
- [ ] Command works correctly
- [ ] Existing features are not broken
- [ ] Documentation is updated

## Code of Conduct

- Respect each other
- Give and receive constructive feedback
- Respect diversity

## Questions?

If you have questions, please leave them in [Discussions](https://github.com/lledellebell/glean/discussions).

Thank you! 🙏
