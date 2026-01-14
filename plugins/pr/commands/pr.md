# /pr - Pull Request Workflow

Automate PR creation, management, and reviews.

## Usage
```
/pr <command> [options]
```

## Subcommands

### create - Create PR
```bash
/pr create [--title <title>] [--draft]
```

### list - List PRs
```bash
/pr list [--state <state>] [--author <author>]
```

### view - View PR Details
```bash
/pr view <number>
```

### review - Review PR
```bash
/pr review <number>
```

### merge - Merge PR
```bash
/pr merge <number> [--squash|--rebase]
```

## PR Creation Workflow

### 1. Analyse Changes
```
Current branch: feature/auth
Base branch: main
Commits: 5
Changed files: 8
```

### 2. Generate PR Template
```markdown
## Summary
- Implemented user authentication
- JWT token-based login/logout
- Added token refresh logic

## Changes
- `src/auth/` - Authentication components
- `src/hooks/useAuth.ts` - Auth hook
- `src/api/auth.ts` - API client

## Test Plan
- [x] Login success case
- [x] Login failure case
- [x] Token refresh on expiry
- [ ] E2E tests

## Screenshots
(Add if applicable)
```

### 3. Auto Checks
Auto-checks before PR creation:
- [ ] Lint passed
- [ ] Type check passed
- [ ] Tests passed
- [ ] Code review (/review)

## Output Format

### PR Creation
```
✅ PR Created

🔗 #123: feat: Implement user authentication
📌 feature/auth → main

Status: Draft
Reviewers: None assigned
Labels: feature, auth

URL: https://github.com/user/repo/pull/123

Next steps:
- Self-review with /pr review 123
- Assign reviewers and mark Ready
```

### PR List
```
## 📋 Pull Requests

| # | Title | Status | Author | Updated |
|---|-------|--------|--------|---------|
| 123 | feat: Auth feature | 🟡 Draft | me | 1h ago |
| 120 | fix: Bug fix | 🟢 Open | me | 2d ago |
| 118 | docs: README | ✅ Merged | other | 3d ago |

Open: 2 | Draft: 1 | Merged: 15
```

### PR Details
```
## PR #123: feat: User Authentication

📌 feature/auth → main
👤 Author: me
📅 Created: 2024-01-15
🏷️ Labels: feature, auth

### CI Status
- ✅ lint
- ✅ typecheck
- ✅ test
- ⏳ deploy-preview

### Reviews
- 🟡 reviewer1: Changes requested
- ⏳ reviewer2: Pending

### Changed Files (8)
+342 -45 across 8 files
```

## Examples

```bash
# Create PR (auto title)
/pr create

# Create Draft PR
/pr create --draft

# Specify title
/pr create --title "feat: Auth feature"

# My PR list
/pr list --author me

# View PR details
/pr view 123

# Review PR
/pr review 123

# Squash merge
/pr merge 123 --squash
```

## Automation Options

`.glean.json` settings:
```json
{
  "pr": {
    "template": ".github/PULL_REQUEST_TEMPLATE.md",
    "autoReview": true,
    "requiredChecks": ["lint", "typecheck", "test"],
    "defaultReviewers": ["teammate1", "teammate2"]
  }
}
```

## Related Commands
- `/review` - Code review before PR creation
- `/history` - PR-related session history
- `/sync --github` - GitHub Issues integration
- `/notify` - PR status notifications
