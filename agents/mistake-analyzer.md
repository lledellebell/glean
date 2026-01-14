---
name: mistake-analyzer
phase: 1
parallel: true
---

# Mistake Analyzer Agent

Agent that analyses mistakes and errors in sessions to extract learning points.

## Purpose

- Error/mistake detection
- Solution process tracking
- Prevention measures derivation

## Input

- Harvest data (JSON)
- Session conversation content (including error messages)

## Output

MistakeInsight array (JSON)

## Prompt

```
Analyse mistakes and errors that occurred in the session:

### Analysis Targets

1. **Technical Errors**
   - Compile/build errors
   - Runtime errors
   - Type errors

2. **Logical Mistakes**
   - Wrong assumptions
   - Missing cases
   - Incorrect implementation

3. **Workflow Mistakes**
   - Wrong order
   - Missing steps
   - Unnecessary work

### Mistake Analysis Criteria

Valuable mistakes:
- Something was learned during resolution
- Could occur in other situations
- Has clear prevention measures

Exclude:
- Simple typos
- One-time configuration issues
- External factors (network, etc.)

### Output Format

```json
[
  {
    "type": "mistake",
    "title": "Short, clear title",
    "content": "Mistake summary (2-3 sentences)",
    "confidence": 0.85,
    "mistake": {
      "what": "What went wrong",
      "why": "Why it was wrong (root cause)",
      "how": "How it was resolved",
      "prevention": "How to prevent in the future"
    },
    "context": {
      "files": ["Related files"],
      "codeSnippet": "Problem/solution code"
    },
    "meta": {
      "tags": ["typescript", "null-check", "error-handling"]
    }
  }
]
```

### Example Output

```json
[
  {
    "type": "mistake",
    "title": "Runtime error from missing Optional Chaining",
    "content": "API response could be null but properties were accessed directly, causing 'Cannot read property of null' error.",
    "confidence": 0.95,
    "mistake": {
      "what": "Directly accessed API response data without null check",
      "why": "Assumed API always returns data, but returns null on error cases",
      "how": "Used optional chaining (?.) and nullish coalescing (??) for safe access",
      "prevention": "Always consider null/undefined possibility for external data. Use TypeScript strict mode."
    },
    "context": {
      "files": ["src/api/user.ts"],
      "codeSnippet": "// Before: user.profile.name\n// After: user?.profile?.name ?? 'Unknown'"
    }
  }
]
```

### Severity Assessment

high (must remember):
- Security related
- Potential data loss
- Production impact

medium (recommended):
- Performance impact
- Maintainability degradation
- User experience impact

low (reference):
- Code style
- Minor impact
```

## Usage Example

```
Run with Task tool:
- subagent_type: "general-purpose"
- prompt: "Analyse mistakes and errors that occurred in this session"
```

## Post-processing

1. Sort by severity
2. Remove duplicates
3. Mark candidates for /learn conversion
