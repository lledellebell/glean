# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in Glean, please report it responsibly.

### How to Report

**Do NOT create a public GitHub issue for security vulnerabilities.**

Instead, please:

1. **Email**: Send details to the maintainer (via GitHub profile)
2. **Private disclosure**: Use GitHub's private vulnerability reporting feature

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution target**: Within 30 days (depending on severity)

### What to Expect

1. Acknowledgement of your report
2. Assessment of the vulnerability
3. Development of a fix
4. Coordinated disclosure

### Scope

This security policy covers:

- Core Glean libraries (`/lib/`)
- Agents (`/agents/`)
- Hooks (`/hooks/`)
- Plugin implementations (`/plugins/`)

### Out of Scope

- Third-party integrations (Obsidian, Notion, etc.)
- Claude Code itself
- User configuration issues

## Security Best Practices

When using Glean:

1. **Never commit sensitive data** - Don't store API keys or secrets in Glean's memory
2. **Review harvested data** - Check what gets saved to `~/.glean/`
3. **Keep updated** - Use the latest version of Glean

Thank you for helping keep Glean secure!
