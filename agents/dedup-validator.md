---
name: dedup-validator
phase: 2
parallel: false
---

# Dedup Validator Agent

Validate and deduplicate Phase 1 results.

## Purpose

- Remove suggestions that already exist
- Remove duplicates between agents
- Flag conflicts with existing rules
- Prioritize and sort final results

## Execution

This agent runs **after** Phase 1 completes. It receives:
- Results from all Phase 1 agents
- Current project documentation

## Validation Rules

### 1. Exact Match
Content already exists verbatim in documentation.
→ Status: `duplicate`, remove from suggestions

### 2. Semantic Match
Content means the same thing, differently worded.
→ Status: `duplicate`, remove from suggestions

### 3. Conflict Detection
New suggestion contradicts existing rule.
→ Status: `conflict`, flag for user review

### 4. Quality Filter
Suggestion is too generic or obvious.
→ Status: `filtered`, remove from suggestions

### 5. Cross-Agent Duplicate
Same suggestion from multiple agents.
→ Keep highest confidence version

## Prompt

```
Validate and deduplicate the Phase 1 analysis results.

## Phase 1 Results

### Doc Analyzer
{{docAnalyzerResults}}

### Automation Finder
{{automationFinderResults}}

### Learning Extractor
{{learningExtractorResults}}

### Followup Planner
{{followupPlannerResults}}

## Existing Documentation
{{existingDocs}}

## Validation Tasks

1. **Check for Exact Duplicates**
   - Is this content already in the documentation?
   - Mark as duplicate if exists

2. **Check for Semantic Duplicates**
   - Does existing doc cover the same concept?
   - Mark as duplicate if meaning is same

3. **Check for Conflicts**
   - Does this contradict existing rules?
   - Mark as conflict and note the conflict

4. **Cross-Agent Deduplication**
   - Did multiple agents suggest the same thing?
   - Keep only the best version

5. **Quality Filter**
   - Is the suggestion specific and valuable?
   - Remove generic or obvious suggestions

6. **Prioritize**
   - Sort by priority (critical > high > medium > low)
   - Within priority, sort by confidence

## Output Requirements

Return JSON:

```json
{
  "validated": [
    {
      "source": "agent-name",
      "type": "doc|automation|learning|followup",
      "suggestion": { /* original suggestion */ },
      "status": "new|duplicate|conflict|filtered",
      "reason": "Why this status",
      "mergedFrom": ["agent1", "agent2"] | null
    }
  ],
  "removed": [
    {
      "source": "agent-name",
      "suggestion": { /* removed suggestion */ },
      "reason": "Why removed"
    }
  ],
  "conflicts": [
    {
      "suggestion": { /* conflicting suggestion */ },
      "existingRule": "The existing rule text",
      "recommendation": "How to resolve"
    }
  ],
  "summary": {
    "total": 15,
    "new": 10,
    "duplicates": 3,
    "conflicts": 1,
    "filtered": 1
  }
}
```
```

## Example

### Phase 1 Input
```json
{
  "docAnalyzer": [
    { "content": "Use snake_case for hooks", "priority": "high" },
    { "content": "All API returns { data, error }", "priority": "high" }
  ],
  "learningExtractor": [
    { "title": "Hook naming convention", "description": "Hooks use snake_case" }
  ]
}
```

### Existing Docs
```markdown
## Code Style
- Hook files: snake_case (use_xxx.ts)
```

### Output
```json
{
  "validated": [
    {
      "source": "doc-analyzer",
      "type": "doc",
      "suggestion": { "content": "All API returns { data, error }", "priority": "high" },
      "status": "new",
      "reason": "Not documented, valuable pattern",
      "mergedFrom": null
    }
  ],
  "removed": [
    {
      "source": "doc-analyzer",
      "suggestion": { "content": "Use snake_case for hooks" },
      "reason": "Already documented in Code Style section"
    },
    {
      "source": "learning-extractor",
      "suggestion": { "title": "Hook naming convention" },
      "reason": "Duplicate of doc-analyzer suggestion, already documented"
    }
  ],
  "conflicts": [],
  "summary": {
    "total": 3,
    "new": 1,
    "duplicates": 2,
    "conflicts": 0,
    "filtered": 0
  }
}
```
