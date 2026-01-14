# /insight - Session Insight Extraction

Extract actionable insights from the current session.

## Usage
```
/insight [--type <type>] [--export <format>]
```

## Options
- `--type`: Insight type (pattern, mistake, optimization, all) - default: all
- `--export`: Export format (md, json, notion)

## Insight Types

### Pattern
- Recurring code patterns
- Frequently used approaches
- Effective problem-solving strategies

### Mistake
- Errors encountered and solutions
- Incorrect assumptions and corrections
- Anti-patterns to avoid

### Optimization
- Performance improvement opportunities
- Code quality enhancement suggestions
- Refactoring candidates

## Execution Steps

### 1. Session Analysis
Analyse current session conversation for:
- Code written/modified
- Errors encountered
- Tools and commands used

### 2. Insight Extraction
```
## Discovered Insights

### 🔄 Patterns
- **Custom hook structure**: Separate logic with useXxx format
- **Error boundary**: Component-level error handling

### ⚠️ Lessons from Mistakes
- Missing null check in TypeScript strict mode
- Solution: Consistently apply optional chaining (?.)

### ⚡ Optimisation Opportunities
- Found 3 components that could benefit from useMemo
```

### 3. Save and Export
- Save to `~/.glean/insights/`
- Classified by project

## Output Format

```
## Session Insights

📅 2024-01-15 | Project: my-app

### Key Findings
1. React Query staleTime setting effective for API call optimisation
2. Added runtime type validation with Zod schema

### Apply Next Session
- [ ] Apply similar patterns to other components
- [ ] Share patterns in team documentation

### Related Resources
- [React Query Official Docs](https://tanstack.com/query)
```

## Examples

```bash
# Extract all insights
/insight

# Only lessons from mistakes
/insight --type mistake

# Export to Notion
/insight --export notion
```

## Implementation Steps

When this command is executed, perform these steps:

### Step 1: Determine Data Source
```
1. --from harvest: Extract from recent Harvest data
2. --from session: Direct session analysis (default)
3. --from all: Combine all sources
```

### Step 2: Run Agents

#### --type pattern or all
```
Run pattern-recognizer agent with Task tool:
- Refer to agents/pattern-recognizer.md
- Input: Harvest data or session context
```

#### --type mistake or all
```
Run mistake-analyzer agent with Task tool:
- Refer to agents/mistake-analyzer.md
- Input: Session error/fix history
```

### Step 3: Deduplication and Validation
```
1. Compare with existing insights via insight-store.checkDuplicate()
2. Filter out confidence below 0.7
3. Merge similar insights
```

### Step 4: Save
```
1. Save via insight-store.saveInsights()
2. Individual JSON files in ~/.glean/insights/
3. Update index.json
```

### Step 5: Output Results
```
Group and display by type:
- 🔄 Patterns (N)
- ⚠️ Mistakes (N)
- ⚡ Optimisations (N)
- 📚 Learnings (N)

Each insight: title, summary, confidence
```

### Step 6 (Optional): Learning Conversion
```
With --to-learn option:
Auto-add learning type insights to /learn
Call insight-store.markAsConvertedToLearn()
```

## Subcommands

### /insight list
View saved insights list
```bash
/insight list [--type <type>] [--limit 10]
```

### /insight view <id>
View specific insight details
```bash
/insight view pattern-20240115-abc1
```

### /insight apply <id>
Mark insight as applied
```bash
/insight apply pattern-20240115-abc1
```

## Related Commands
- `/harvest` - Extract insights from Harvest
- `/learn` - Convert to learning records
- `/bridge` - External plugin integration
