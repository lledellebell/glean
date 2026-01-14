# /review - Code Review Helper

Provides checklists and analysis for code reviews.

## Usage
```
/review [<path>] [--type <type>] [--checklist]
```

## Options
- `--type`: Review type (security, performance, style, all) - default: all
- `--checklist`: Output in checklist format
- `--diff`: Git diff based review
- `--pr <number>`: PR review

## Review Categories

### Security
- Input validation
- Authentication/authorisation
- Sensitive information exposure
- SQL/XSS injection

### Performance
- Unnecessary re-renders
- Memory leaks
- N+1 queries
- Large bundle size

### Style
- Naming conventions
- Code structure
- Duplicate code
- Comments/documentation

### Logic
- Edge cases
- Error handling
- Type safety
- Test coverage

## Output Format

### Auto Review
```
## 🔍 Code Review: src/auth/login.tsx

### 🔴 Critical (2)

1. **Security: Password logging**
   ```tsx
   console.log('Login attempt:', { email, password }); // ❌
   ```
   → Sensitive information exposed in console.

2. **Logic: Missing error handling**
   ```tsx
   const response = await login(data);
   // No error handling
   ```
   → Add error handling with try-catch.

### 🟡 Recommended (3)

1. **Performance: Missing useCallback**
   handleSubmit function recreated on every render.

2. **Style: Magic number**
   `setTimeout(..., 3000)` → Extract to constant recommended

### 🟢 Positives
- Good use of TypeScript strict mode
- Appropriate component separation
```

### Checklist Mode
```
## ✅ Code Review Checklist

### Security
- [ ] User input validation
- [x] XSS prevention (no dangerouslySetInnerHTML)
- [ ] No sensitive info in console
- [x] HTTPS used

### Performance
- [ ] Unnecessary re-renders prevented
- [x] Large list virtualisation
- [ ] Image optimisation

### Style
- [x] Naming conventions followed
- [x] File structure appropriate
- [ ] Sufficient comments

---
Passed: 5/10 | Needs review: 5
```

## PR Review Mode

```bash
/review --pr 123
```

Analyses GitHub PR for:
- Review by changed file
- Commit message review
- CI status check
- Review comment suggestions

## Examples

```bash
# Review current directory
/review

# Specific file
/review src/components/Button.tsx

# Security focus
/review --type security

# Checklist format
/review --checklist

# Git diff review
/review --diff

# PR review
/review --pr 123
```

## Custom Rules

Set project-specific rules in `.glean.json`:

```json
{
  "review": {
    "rules": {
      "no-console": "error",
      "max-file-lines": 300,
      "require-error-handling": "warn"
    },
    "ignore": ["*.test.ts", "*.spec.ts"]
  }
}
```

## Related Commands
- `/pr` - Auto review before PR creation
- `/insight` - Record patterns found in reviews
- `/learn` - Convert review feedback to learning records
