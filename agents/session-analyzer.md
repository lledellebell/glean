---
name: session-analyzer
phase: 1
parallel: true
---

# Session Analyzer Agent

Core agent that analyses current session conversation to generate Harvest data.

## Purpose

Analyse work performed in the session and convert it into structured Harvest data.

## Input

- Full conversation context of current session
- Current project path
- Harvest mode (quick/full/auto)

## Output

Harvest data in JSON format

## Prompt

```
Analyse this session's conversation and extract the following information:

### 1. Session Summary
- Summarise main tasks performed in this session in 3-5 sentences
- Extract key keywords (max 5)

### 2. File Changes
- List of created/modified/deleted files
- Language and estimated change volume for each file

### 3. Git Activity
- List of commits created (hash, message)
- Overall change statistics

### 4. Tool Usage Statistics
Tool usage count in session:
- Read, Edit, Write, Bash, Grep, Glob, Task, etc.

### 5. Insight Extraction
Classify and extract by type:

#### Pattern
- Code patterns used repeatedly in this session
- Effective approaches

#### Mistake
- Errors or problems encountered
- Wrong assumptions or attempts
- How they were resolved

#### Optimisation
- Performance or quality improvement opportunities
- Refactoring candidates

#### Learning
- Newly discovered knowledge
- Previously unknown APIs or patterns

### 6. Follow-up Work
- Incomplete tasks (todos)
- Remaining questions
- Blockers

---

## Output Format

Output in the following JSON format:

```json
{
  "summary": {
    "description": "...",
    "mainTasks": ["...", "..."],
    "keywords": ["...", "..."]
  },
  "changes": {
    "files": [
      {"path": "...", "action": "created|modified|deleted", "language": "...", "linesAdded": 0, "linesRemoved": 0}
    ],
    "commits": [
      {"hash": "...", "message": "...", "timestamp": "...", "filesChanged": 0}
    ]
  },
  "tools": [
    {"tool": "Read", "count": 10},
    {"tool": "Edit", "count": 5}
  ],
  "insights": [
    {"type": "pattern|mistake|optimization|learning", "content": "...", "confidence": 0.8}
  ],
  "followUp": {
    "todos": ["..."],
    "questions": ["..."],
    "blockers": ["..."]
  }
}
```

---

## Quick Mode vs Full Mode

### Quick Mode
- Extract only summary and key insights
- Processing time: Fast
- Output: Brief summary

### Full Mode
- Analyse all items in detail
- Processing time: Slow
- Output: Complete Harvest data
```

## Usage Example

```
Run this agent with Task tool:

prompt: "Analyse current session and generate Harvest data. Mode: quick"
subagent_type: "general-purpose"
```

## Notes

- Exclude sensitive information (API keys, passwords, etc.) from insights
- Set confidence low for uncertain information
- Convert file paths to relative paths
