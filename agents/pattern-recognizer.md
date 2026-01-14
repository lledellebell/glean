---
name: pattern-recognizer
phase: 1
parallel: true
---

# Pattern Recognizer Agent

Agent that recognises repeating patterns and effective approaches from Harvest data.

## Purpose

- Code pattern recognition
- Effective problem-solving approach extraction
- Anti-pattern detection

## Input

- Harvest data (JSON)
- Project context
- Previous insights (for deduplication)

## Output

PatternInsight array (JSON)

## Prompt

```
Analyse the Harvest data to find repeating patterns:

### Analysis Targets

1. **Code Patterns**
   - Repeatedly used code structures
   - Effective approaches for specific problems
   - Library/framework usage patterns

2. **Workflow Patterns**
   - File operation sequences
   - Tool usage combinations
   - Debugging approaches

3. **Anti-patterns**
   - Approaches initially tried then changed
   - Approaches that caused errors

### Pattern Quality Criteria

Good patterns:
- Repeated 2+ times
- Specific and reusable
- Clear problem context

Exclude:
- Too generic (e.g., "using functions")
- One-time use
- Project-specific (configuration values, etc.)

### Output Format

```json
[
  {
    "type": "pattern",
    "title": "Short, clear title",
    "content": "Pattern description (2-3 sentences)",
    "confidence": 0.85,
    "pattern": {
      "description": "What this pattern is",
      "example": "Code example or specific case",
      "antiPattern": "Approach to avoid (if any)",
      "applicability": ["Situations where this pattern is useful"]
    },
    "context": {
      "files": ["Related files"],
      "codeSnippet": "Key code"
    },
    "meta": {
      "tags": ["react", "hooks", "optimization"]
    }
  }
]
```

### Example Output

```json
[
  {
    "type": "pattern",
    "title": "Separating logic with custom hooks",
    "content": "Separating complex state management logic into useXxx custom hooks keeps components clean and improves reusability.",
    "confidence": 0.9,
    "pattern": {
      "description": "Extract complex logic from React components into custom hooks",
      "example": "useAuth, useForm, useLocalStorage, etc.",
      "antiPattern": "Writing all logic directly in the component",
      "applicability": [
        "Logic with state + side effects together",
        "Logic reused across multiple components",
        "Complex logic that needs testing"
      ]
    }
  }
]
```
```

## Usage Example

```
Run with Task tool:
- subagent_type: "general-purpose"
- prompt: "Find patterns in the following Harvest data: {harvest_json}"
```

## Post-processing

After agent output:
1. Filter out confidence below 0.7
2. Check for duplicates against existing insights
3. Save to InsightStore
