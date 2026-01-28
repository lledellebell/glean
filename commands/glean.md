---
allowed-tools: Task, Read, Glob, Grep, Bash(git:*), AskUserQuestion, Edit, Write
description: Harvest knowledge from your coding session
---

# /glean - Session Knowledge Harvester

Analyze your coding session with parallel agents and extract valuable knowledge.

## Arguments

- `--lang=<code>` - Force language (en, ko, ja, zh, ...)
- `--agents=<list>` - Comma-separated agent list
- `--no-history` - Skip history saving
- `--auto-apply` - Apply suggestions without confirmation
- `--dry-run` - Show what would be done without doing it
- `--verbose` - Detailed output

## Execution Flow

### Phase 1: Context Collection

First, detect the project context:

1. **Tool Detection** - Check for tool-specific files:
   - `.claude/` or `CLAUDE.md` → Claude Code
   - `.cursor/` or `.cursorrules` → Cursor
   - `.windsurfrules` → Windsurf
   - `.github/copilot-instructions.md` → GitHub Copilot
   - `.clinerules` → Cline

2. **Language Detection** - Determine output language:
   - Check `.glean.json` for explicit setting
   - Analyze project documentation language
   - Analyze session conversation language
   - Default to English if uncertain

3. **Load Configuration** - Merge configs in order:
   - CLI arguments
   - `.glean.json` (project)
   - `~/.glean/config/global.json`
   - Built-in defaults

### Phase 2: Parallel Analysis (4 Agents)

Run these 4 agents **in parallel** (single message with 4 Task tool calls):

#### 1. doc-analyzer agent
```
Analyze this session and suggest documentation updates.

Focus on:
- New patterns or conventions discovered
- Project rules that emerged
- Context useful for future sessions

Target files based on detected tool:
- Claude Code: CLAUDE.md, .claude/instructions/
- Cursor: .cursorrules, .cursor/rules/
- Windsurf: .windsurfrules
- Copilot: .github/copilot-instructions.md

Output JSON array of suggestions with: file, action, content, reason, priority
Skip anything already documented.
Use detected language for content.
```

#### 2. automation-finder agent
```
Find automation opportunities in this session.

Look for:
- Commands run multiple times
- Similar file structures created
- Repeated validation steps
- Workflow patterns

Suggest:
- Slash commands
- Hooks (PreToolUse/PostToolUse)
- Skills

Output JSON with: type, name, description, trigger, implementation, occurrences
```

#### 3. learning-extractor agent
```
Extract learnings from this session.

Categories:
- Technical: New APIs, libraries, patterns
- Problem-Solution: Errors fixed and how
- Unexpected: Things that didn't work as expected
- Tips: Shortcuts and tricks discovered

Output JSON with: category, title, description, tags, reusable, projectSpecific
```

#### 4. followup-planner agent
```
Plan follow-up tasks from this session.

Identify:
- Incomplete work
- Next priorities
- Technical debt
- Related improvements

Output JSON with: task, priority (critical/high/medium/low), reason, estimate, blockedBy
```

### Phase 3: Validation

After Phase 1 completes, run the dedup-validator:

#### 5. dedup-validator agent
```
Validate Phase 1 results:

[Insert Phase 1 results here]

Check against existing documentation:
- Remove exact duplicates
- Remove semantically similar suggestions
- Flag conflicts with existing rules
- Sort by priority

Output validated suggestions with status: new, duplicate, or conflict
```

### Phase 4: User Interaction

Present results and ask user for action selection using AskUserQuestion:

**Questions:**
1. "Which actions would you like to take?" (multi-select)
   - Apply documentation updates
   - Create new commands/hooks
   - Save to history
   - Commit changes
   - Sync with team
   - Skip all

Execute selected actions.

### Phase 5: Post-Processing

After user actions:

1. **Save History** (if enabled)
   - Save session summary to `~/.glean/history/{project-hash}/{date}.json`

2. **Update Stats** (if enabled)
   - Update `~/.glean/stats/{project-hash}.json`

3. **Team Sync** (if enabled and selected)
   - Sync learnings to team shared file

## Output Format

```markdown
## Session Summary

### Completed Tasks
- Task 1
- Task 2

### Learnings
| Category | Description |
|----------|-------------|
| Technical | Learned X |
| Problem | Fixed Y by doing Z |

### Suggestions

#### Documentation Updates
| File | Change | Priority |
|------|--------|----------|
| CLAUDE.md | Add X rule | High |

#### Automation Opportunities
| Type | Name | Description |
|------|------|-------------|
| Command | /new-api | Creates API endpoint |

### Follow-up Tasks
| Priority | Task |
|----------|------|
| High | Complete X |
| Medium | Refactor Y |

---
Which actions would you like to take?
```

## Examples

```bash
# Basic usage
/glean

# Korean output
/glean --lang=ko

# Only doc analysis
/glean --agents=doc-analyzer

# Dry run
/glean --dry-run --verbose

# Auto-apply all
/glean --auto-apply
```
