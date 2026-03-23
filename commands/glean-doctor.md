---
allowed-tools: Read, Glob, Bash(ls:*)
description: Diagnose Glean setup and data health
---

# /glean-doctor - Health Check

Diagnose Glean setup and data integrity.

## Arguments

- `--fix` - Auto-fix recoverable issues
- `--verbose` - Show detailed diagnostics

## Checks

1. **Directory structure** - ~/.glean/ and subdirectories
2. **Index files** - JSON validity of index and stats files
3. **Data integrity** - Parse test all JSON data files
4. **Configuration** - Global config validity
5. **Plugin files** - plugin.json validity

## Examples

```bash
/glean-doctor
/glean-doctor --verbose
/glean-doctor --fix
```
