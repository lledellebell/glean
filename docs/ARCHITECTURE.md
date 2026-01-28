# Glean Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         /glean Command                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Context Collector                          │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  Session  │  │  Project  │  │   Tool    │  │ Language  │    │
│  │  Context  │  │  Config   │  │  Detect   │  │  Detect   │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent Orchestrator                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Phase 1: Parallel Analysis                  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │   Doc    │ │Automation│ │ Learning │ │ Followup │    │   │
│  │  │ Analyzer │ │  Finder  │ │Extractor │ │ Planner  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Phase 2: Validation                         │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │              Dedup Validator                      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Output Handler                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐    │
│  │  History  │  │   Team    │  │   Stats   │  │   User    │    │
│  │   Store   │  │   Sync    │  │  Update   │  │  Prompt   │    │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Context Collector

세션 시작 시 필요한 모든 컨텍스트를 수집해요.

```typescript
interface SessionContext {
  // 세션 정보
  sessionId: string;
  startTime: Date;

  // 프로젝트 정보
  projectPath: string;
  projectName: string;

  // 감지된 설정
  tool: DetectedTool;
  language: DetectedLanguage;
  config: GleanConfig;
}

type DetectedTool =
  | 'claude-code'
  | 'cursor'
  | 'windsurf'
  | 'copilot'
  | 'cline'
  | 'generic';

type DetectedLanguage = 'en' | 'ko' | 'ja' | 'zh' | 'auto';
```

#### Tool Detection Logic

```typescript
function detectTool(projectPath: string): DetectedTool {
  const markers = {
    'claude-code': ['.claude/', 'CLAUDE.md'],
    'cursor': ['.cursor/', '.cursorrules'],
    'windsurf': ['.windsurfrules'],
    'copilot': ['.github/copilot-instructions.md'],
    'cline': ['.clinerules']
  };

  for (const [tool, files] of Object.entries(markers)) {
    if (files.some(f => exists(join(projectPath, f)))) {
      return tool as DetectedTool;
    }
  }

  return 'generic';
}
```

#### Language Detection Logic

```typescript
function detectLanguage(context: SessionContext): DetectedLanguage {
  // 1. 설정 파일 확인
  if (context.config.language !== 'auto') {
    return context.config.language;
  }

  // 2. 프로젝트 문서 언어 분석
  const docContent = readProjectDocs(context.projectPath);
  const docLang = analyzeTextLanguage(docContent);

  // 3. 세션 대화 언어 분석
  const sessionLang = analyzeTextLanguage(context.sessionTranscript);

  // 4. 우선순위: 세션 > 문서 > 기본값
  return sessionLang || docLang || 'en';
}
```

### 2. Agent Orchestrator

4개의 전문 에이전트를 병렬로 실행하고 결과를 통합해요.

#### Phase 1: Parallel Analysis

```typescript
interface AgentResult {
  agent: AgentType;
  suggestions: Suggestion[];
  metadata: {
    processingTime: number;
    confidence: number;
  };
}

type AgentType =
  | 'doc-analyzer'
  | 'automation-finder'
  | 'learning-extractor'
  | 'followup-planner';

async function runPhase1(context: SessionContext): Promise<AgentResult[]> {
  const agents = getEnabledAgents(context.config);

  // 병렬 실행
  return Promise.all(
    agents.map(agent => runAgent(agent, context))
  );
}
```

#### Phase 2: Validation

```typescript
async function runPhase2(
  results: AgentResult[],
  context: SessionContext
): Promise<ValidatedResult> {
  // 기존 문서 로드
  const existingDocs = await loadExistingDocs(context);

  // 중복 제거
  const dedupedSuggestions = results
    .flatMap(r => r.suggestions)
    .filter(s => !isDuplicate(s, existingDocs));

  // 우선순위 정렬
  return {
    suggestions: sortByPriority(dedupedSuggestions),
    summary: generateSummary(results)
  };
}
```

### 3. Storage Layer

#### Directory Structure

```
~/.glean/
├── config/
│   └── global.json           # 전역 설정
├── history/
│   └── {project-hash}/
│       ├── 2025-01-13.json   # 일별 세션 요약
│       ├── 2025-01-12.json
│       └── ...
├── learnings/
│   ├── global.json           # 프로젝트 간 공유 학습
│   └── {project-hash}.json   # 프로젝트별 학습
├── stats/
│   └── {project-hash}.json   # 프로젝트별 통계
└── cache/
    └── ...                   # 임시 캐시
```

#### History Schema

```typescript
interface DailyHistory {
  date: string;  // YYYY-MM-DD
  projectPath: string;
  sessions: SessionSummary[];
}

interface SessionSummary {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;  // minutes

  // 요약
  tasksCompleted: string[];
  learnings: string[];
  suggestionsApplied: string[];

  // 메트릭
  metrics: {
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
    toolCalls: number;
  };
}
```

#### Learning Schema

```typescript
interface LearningStore {
  version: string;
  lastUpdated: string;

  // 패턴 학습
  patterns: Pattern[];

  // 해결책 학습
  solutions: Solution[];

  // 컨텍스트 학습
  contexts: Context[];
}

interface Pattern {
  id: string;
  type: 'automation' | 'convention' | 'workflow';
  description: string;
  occurrences: number;
  lastSeen: string;
  projects: string[];
}

interface Solution {
  id: string;
  problem: string;
  solution: string;
  tags: string[];
  successCount: number;
}
```

### 4. Team Sync

팀원과 학습 내용을 동기화하는 레이어예요.

```typescript
interface TeamConfig {
  enabled: boolean;
  sharedPath: string;  // 예: .team/learnings.md
  syncStrategy: 'merge' | 'append' | 'manual';
  filters: {
    includePatterns: boolean;
    includeSolutions: boolean;
    includeContexts: boolean;
  };
}

async function syncWithTeam(
  learnings: LearningStore,
  config: TeamConfig
): Promise<void> {
  if (!config.enabled) return;

  const sharedFile = join(projectPath, config.sharedPath);

  switch (config.syncStrategy) {
    case 'merge':
      await mergeLearnings(sharedFile, learnings, config.filters);
      break;
    case 'append':
      await appendLearnings(sharedFile, learnings, config.filters);
      break;
    case 'manual':
      // 사용자에게 diff 보여주고 선택하게 함
      await promptManualSync(sharedFile, learnings);
      break;
  }
}
```

### 5. Statistics Engine

세션 통계를 수집하고 분석해요.

```typescript
interface ProjectStats {
  projectPath: string;

  // 전체 통계
  totalSessions: number;
  totalTime: number;  // minutes

  // 평균 메트릭
  averages: {
    sessionDuration: number;
    tasksPerSession: number;
    filesPerSession: number;
  };

  // 트렌드
  trends: {
    sessionsPerWeek: number[];
    productivityScore: number[];
  };

  // 패턴 분석
  topPatterns: Pattern[];
  frequentTasks: string[];

  // 학습 진행
  learningProgress: {
    totalLearnings: number;
    appliedCount: number;
    sharedCount: number;
  };
}

function generateStats(history: DailyHistory[]): ProjectStats {
  // 통계 계산 로직
}
```

## Data Flow

```
1. /glean 실행
       │
       ▼
2. Context Collector
   - 프로젝트 설정 로드
   - 도구 감지 (Claude/Cursor/Windsurf/...)
   - 언어 감지
       │
       ▼
3. Agent Orchestrator
   - 4개 에이전트 병렬 실행
   - 결과 수집 및 통합
   - 중복 검증
       │
       ▼
4. User Prompt
   - 요약 표시
   - 액션 선택
       │
       ▼
5. Action Executor
   - 선택된 액션 실행
   - 문서 업데이트
   - 커밋 생성
       │
       ▼
6. Post-Processing
   - 히스토리 저장
   - 통계 업데이트
   - 팀 동기화
```

## Extension Points

### Custom Agents

```typescript
// agents/custom-agent.md
interface CustomAgent {
  name: string;
  description: string;
  prompt: string;
  outputSchema: JSONSchema;
}

// 등록
registerAgent({
  name: 'security-checker',
  description: 'Check for security issues',
  prompt: `Analyze the session for security concerns...`,
  outputSchema: securitySchema
});
```

### Custom Output Handlers

```typescript
interface OutputHandler {
  name: string;
  format: (result: ValidatedResult) => string;
  write: (content: string, path: string) => Promise<void>;
}

// 등록
registerOutputHandler({
  name: 'notion',
  format: (result) => formatForNotion(result),
  write: async (content, path) => {
    await notionAPI.createPage(content);
  }
});
```

## Performance Considerations

### Parallel Execution
- 4개 에이전트 동시 실행으로 지연 최소화
- 각 에이전트는 독립적으로 실행

### Caching
- 프로젝트 설정 캐싱
- 기존 문서 내용 캐싱
- 중복 검사 결과 캐싱

### Lazy Loading
- 히스토리는 필요할 때만 로드
- 통계는 요청 시 계산

## Security

### Data Privacy
- 모든 데이터는 로컬 저장 (`~/.glean/`)
- 클라우드 동기화 없음
- 팀 공유는 명시적 설정 필요

### Sensitive Data
- API 키, 비밀번호 등 자동 필터링
- `.gitignore` 패턴 존중
