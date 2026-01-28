# Glean Agents

Glean은 4개의 전문 에이전트를 병렬로 실행해서 세션을 분석해요.

## Agent Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    Phase 1 (Parallel)                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │    Doc     │ │ Automation │ │  Learning  │ │  Followup  ││
│  │  Analyzer  │ │   Finder   │ │ Extractor  │ │  Planner   ││
│  │            │ │            │ │            │ │            ││
│  │ 문서 업데이트│ │ 자동화 기회 │ │  학습 추출  │ │ 후속 작업  ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    Phase 2 (Sequential)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Dedup Validator                       │ │
│  │                                                         │ │
│  │              중복 제거 및 최종 검증                       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 1. Doc Analyzer

프로젝트 문서에 추가해야 할 내용을 분석해요.

### Purpose
- 새로 발견한 패턴이나 컨벤션 감지
- 프로젝트 규칙 업데이트 제안
- 미래 세션에 도움될 컨텍스트 추출

### Target Files
| Tool | Target Files |
|------|-------------|
| Claude Code | `CLAUDE.md`, `.claude/instructions/*.md` |
| Cursor | `.cursorrules`, `.cursor/rules/*.md` |
| Windsurf | `.windsurfrules` |
| Copilot | `.github/copilot-instructions.md` |
| Generic | `README.md`, `CONTRIBUTING.md` |

### Prompt Template

```markdown
Analyze this coding session and identify documentation updates.

## Context
- Project: {{projectName}}
- Tool: {{detectedTool}}
- Language: {{language}}

## Session Summary
{{sessionTranscript}}

## Current Documentation
{{existingDocs}}

## Your Task
Find NEW information that should be added to project documentation:

1. **Patterns & Conventions**
   - Coding patterns used consistently
   - Naming conventions discovered
   - File structure decisions

2. **Project Rules**
   - New rules that emerged
   - Exceptions to existing rules
   - Clarifications needed

3. **Context for Future Sessions**
   - Important decisions made and why
   - Dependencies or integrations added
   - Known issues or workarounds

## Output Format
Return JSON array of suggestions:
```json
[
  {
    "file": "path/to/file",
    "action": "add",
    "section": "section name or null",
    "content": "content to add",
    "reason": "why this should be added",
    "priority": "high|medium|low"
  }
]
```

## Rules
- Skip if already documented
- Be specific, not generic
- Focus on project-specific knowledge
- Use {{language}} for content
```

### Output Example

```json
[
  {
    "file": "CLAUDE.md",
    "action": "add",
    "section": "Code Style",
    "content": "- API 응답은 항상 `{ data, error }` 형태로 반환",
    "reason": "이 세션에서 3개 API 엔드포인트에 일관되게 적용됨",
    "priority": "high"
  }
]
```

---

## 2. Automation Finder

반복되는 패턴을 찾아 자동화 기회를 제안해요.

### Purpose
- 반복 작업 감지
- slash command 제안
- hook 자동화 제안
- skill 패턴 제안

### Detectable Patterns

| Pattern Type | Example | Suggestion |
|-------------|---------|------------|
| Repeated Commands | `npm run build` 5회 | script 또는 command로 |
| File Creation | 같은 구조 파일 3회 생성 | scaffold command로 |
| Validation Steps | 매번 같은 검증 | hook으로 |
| Workflow | 항상 A → B → C 순서 | skill로 |

### Prompt Template

```markdown
Analyze this session for automation opportunities.

## Session Commands & Actions
{{sessionActions}}

## Your Task
Find repetitive patterns that could be automated:

1. **Command Patterns**
   - Same command run multiple times
   - Command sequences always together

2. **File Patterns**
   - Similar file structures created
   - Same boilerplate repeated

3. **Workflow Patterns**
   - Steps always done together
   - Validation always after certain actions

## Output Format
```json
[
  {
    "type": "command|hook|skill",
    "name": "suggested name",
    "description": "what it does",
    "trigger": "when to run",
    "implementation": "suggested implementation",
    "timeSaved": "estimated time saved per use",
    "occurrences": 5
  }
]
```
```

### Output Example

```json
[
  {
    "type": "command",
    "name": "new-api",
    "description": "Create new API endpoint with standard structure",
    "trigger": "manual",
    "implementation": "Creates route.ts with loader/action template",
    "timeSaved": "5 minutes",
    "occurrences": 3
  },
  {
    "type": "hook",
    "name": "import-validator",
    "trigger": "PostToolUse:Edit(*.ts)",
    "description": "Validate imports exist after file edit",
    "implementation": "Check all imports resolve to real files/packages"
  }
]
```

---

## 3. Learning Extractor

세션에서 학습한 내용을 추출해요.

### Purpose
- 새로 배운 기술/패턴/도구 정리
- 실수와 해결책 기록
- 예상과 다른 동작 기록
- 재사용 가능한 팁 추출

### Categories

| Category | Description |
|----------|-------------|
| Technical | 새 API, 라이브러리, 패턴 |
| Problem-Solution | 문제 발생 → 해결 과정 |
| Unexpected | 예상과 다른 동작 |
| Tips | 유용한 단축키, 트릭 |

### Prompt Template

```markdown
Extract learnings from this coding session.

## Session Transcript
{{sessionTranscript}}

## Your Task
Identify what was learned during this session:

1. **New Knowledge**
   - Technologies, APIs, or tools used for first time
   - Patterns or techniques discovered
   - Best practices learned

2. **Problems Solved**
   - Errors encountered and how they were fixed
   - Debugging strategies that worked
   - Workarounds discovered

3. **Unexpected Behaviors**
   - Things that didn't work as expected
   - Gotchas to remember
   - Edge cases found

4. **Tips & Tricks**
   - Shortcuts discovered
   - Efficiency improvements
   - Tool-specific tips

## Output Format
```json
{
  "learnings": [
    {
      "category": "technical|problem-solution|unexpected|tip",
      "title": "short title",
      "description": "detailed description",
      "tags": ["tag1", "tag2"],
      "reusable": true,
      "project-specific": false
    }
  ]
}
```
```

### Output Example

```json
{
  "learnings": [
    {
      "category": "problem-solution",
      "title": "Remix loader에서 redirect 후 cookie 설정",
      "description": "redirect()와 함께 cookie를 설정하려면 headers 옵션을 사용해야 함. throw redirect(url, { headers: { 'Set-Cookie': cookie } })",
      "tags": ["remix", "cookie", "redirect"],
      "reusable": true,
      "projectSpecific": false
    }
  ]
}
```

---

## 4. Followup Planner

다음 단계와 후속 작업을 계획해요.

### Purpose
- 미완료 작업 식별
- 우선순위 정리
- 관련 추가 작업 제안
- 기술 부채 식별

### Output Categories

| Priority | Description |
|----------|-------------|
| Critical | 즉시 해결 필요 |
| High | 다음 세션에 우선 |
| Medium | 가까운 시일 내 |
| Low | 시간 있을 때 |

### Prompt Template

```markdown
Plan follow-up tasks based on this session.

## Session Summary
{{sessionSummary}}

## Completed Tasks
{{completedTasks}}

## Your Task
Identify what should be done next:

1. **Incomplete Work**
   - Tasks started but not finished
   - Features partially implemented
   - Tests not written

2. **Next Priority**
   - Most important next steps
   - Dependencies blocking other work
   - Quick wins available

3. **Technical Debt**
   - Code that needs refactoring
   - TODOs left in code
   - Performance issues noted

4. **Related Improvements**
   - Features that would complement this work
   - Edge cases to handle
   - Documentation to add

## Output Format
```json
{
  "followups": [
    {
      "task": "task description",
      "priority": "critical|high|medium|low",
      "reason": "why this priority",
      "estimate": "rough time estimate",
      "blockedBy": ["other task"] or null,
      "tags": ["tag1"]
    }
  ]
}
```
```

---

## 5. Dedup Validator

Phase 1 결과를 검증하고 중복을 제거해요.

### Purpose
- 이미 존재하는 내용 필터링
- 에이전트 간 중복 제거
- 우선순위 기반 정렬
- 최종 결과 포맷팅

### Validation Rules

1. **Exact Match** - 이미 문서에 있는 내용
2. **Semantic Match** - 의미적으로 동일한 내용
3. **Conflict Detection** - 기존 규칙과 충돌
4. **Quality Filter** - 너무 일반적인 제안 제거

### Prompt Template

```markdown
Validate and deduplicate the analysis results.

## Phase 1 Results
{{phase1Results}}

## Existing Documentation
{{existingDocs}}

## Your Task
1. Remove suggestions that already exist in documentation
2. Remove duplicate suggestions between agents
3. Flag suggestions that conflict with existing rules
4. Sort by priority and relevance

## Output Format
```json
{
  "validated": [
    {
      "source": "agent name",
      "suggestion": { ... },
      "status": "new|duplicate|conflict",
      "note": "validation note if any"
    }
  ],
  "summary": {
    "total": 10,
    "new": 6,
    "duplicates": 3,
    "conflicts": 1
  }
}
```
```

---

## Configuration

각 에이전트는 설정으로 활성화/비활성화할 수 있어요.

```json
{
  "agents": {
    "doc-analyzer": true,
    "automation-finder": true,
    "learning-extractor": true,
    "followup-planner": true
  },
  "agentOptions": {
    "doc-analyzer": {
      "includeReadme": true,
      "maxSuggestions": 10
    },
    "learning-extractor": {
      "includeProjectSpecific": true,
      "shareGlobally": false
    }
  }
}
```

## Custom Agents

직접 에이전트를 추가할 수도 있어요.

```markdown
<!-- .glean/agents/my-agent.md -->
---
name: my-custom-agent
phase: 1
enabled: true
---

# My Custom Agent

## Prompt
Analyze this session for...

## Output Schema
{
  "type": "array",
  "items": { ... }
}
```
