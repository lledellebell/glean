# Glean Suite - 전체 아키텍처

> 세션 분석 + 번들 확장 + 통합 강화

## Vision

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           GLEAN SUITE                                   │
│                  "AI 코딩 세션의 모든 것을 수확한다"                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   HARVEST   │  │   MEMORY    │  │   FLOW      │  │   INSIGHT   │    │
│  │  세션 분석   │  │  컨텍스트   │  │  워크플로우  │  │   인사이트   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      INTEGRATIONS                                │   │
│  │  Notion │ Obsidian │ GitHub │ Linear │ Slack │ Discord │ Web    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 번들 구성 (12 Plugins)

### Core - 세션 분석 (깊이 집중)

| Plugin | 설명 | 명령어 |
|--------|------|--------|
| **glean-harvest** | 세션 종료 분석 (기존 /glean) | `/harvest` |
| **glean-insight** | AI 기반 인사이트 & 예측 | `/insight` |
| **glean-stats** | 통계 대시보드 | `/stats` |
| **glean-history** | 히스토리 조회 | `/history` |

### Memory - 컨텍스트 관리

| Plugin | 설명 | 명령어 |
|--------|------|--------|
| **glean-memory** | 세션 간 기억 유지 | `/remember`, `/recall` |
| **glean-context** | 프로젝트 컨텍스트 관리 | `/context` |
| **glean-learn** | 학습 패턴 축적 | `/learn`, `/unlearn` |

### Flow - 워크플로우

| Plugin | 설명 | 명령어 |
|--------|------|--------|
| **glean-plan** | 태스크 계획 & 추적 | `/plan`, `/tasks` |
| **glean-review** | 코드 리뷰 도우미 | `/review` |
| **glean-pr** | PR 생성 & 관리 | `/pr` |

### Integrate - 외부 연동

| Plugin | 설명 | 명령어 |
|--------|------|--------|
| **glean-sync** | 외부 도구 동기화 | `/sync` |
| **glean-notify** | 알림 & 리포트 | `/notify`, `/report` |

---

## 2. 깊이 집중 - 세션 분석의 끝판왕

### 2.1 Advanced Analytics

```typescript
interface SessionAnalytics {
  // 기본 메트릭
  basic: {
    duration: number;
    toolCalls: number;
    filesChanged: number;
    linesAdded: number;
    linesRemoved: number;
  };

  // AI 인사이트
  insights: {
    productivityScore: number;      // 0-100
    focusScore: number;             // 집중도
    complexityHandled: number;      // 처리한 복잡도
    learningVelocity: number;       // 학습 속도
  };

  // 예측
  predictions: {
    estimatedCompletion: Date;      // 예상 완료일
    potentialBlockers: string[];    // 예상 블로커
    suggestedBreaks: Date[];        // 권장 휴식
  };

  // 패턴
  patterns: {
    peakHours: number[];            // 최고 생산성 시간
    commonErrors: ErrorPattern[];   // 자주 발생하는 에러
    workflowBottlenecks: string[]; // 워크플로우 병목
  };
}
```

### 2.2 Multi-Agent Deep Analysis

```
Phase 1: Surface Analysis (4 agents, parallel)
├── doc-analyzer
├── automation-finder
├── learning-extractor
└── followup-planner

Phase 2: Deep Analysis (3 agents, parallel)
├── pattern-detector      # 반복 패턴 심층 분석
├── productivity-analyzer # 생산성 요인 분석
└── risk-assessor         # 리스크 & 기술부채 평가

Phase 3: Synthesis (1 agent)
└── insight-synthesizer   # 모든 분석 통합 & 인사이트 생성
```

### 2.3 Predictive Features

```markdown
## 예측 기능

### 작업 완료 예측
- 현재 진행 속도 기반
- 과거 유사 작업 참조
- 외부 요인(회의, 휴식) 고려

### 블로커 예측
- 의존성 분석
- 과거 블로킹 패턴
- 기술적 복잡도

### 최적 시간 제안
- 개인 생산성 패턴
- 작업 유형별 최적 시간
- 피로도 예측
```

---

## 3. 통합 강화 - 외부 도구 연동

### 3.1 Supported Integrations

```
┌─────────────────────────────────────────────────────────────┐
│                    GLEAN INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 Documentation                                           │
│  ├── Notion      - 페이지/DB 동기화                          │
│  ├── Obsidian    - 마크다운 볼트 동기화                       │
│  └── Confluence  - 팀 위키 동기화                            │
│                                                             │
│  🔧 Development                                             │
│  ├── GitHub      - Issues, PRs, Discussions                 │
│  ├── GitLab      - Issues, MRs                              │
│  └── Linear      - 이슈 트래킹                               │
│                                                             │
│  💬 Communication                                           │
│  ├── Slack       - 채널 알림, DM                            │
│  └── Discord     - 웹훅 알림                                │
│                                                             │
│  📊 Analytics                                               │
│  ├── Web Dashboard - 실시간 대시보드                         │
│  └── Email Report  - 주간/월간 리포트                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Integration Architecture

```typescript
interface Integration {
  name: string;
  type: 'documentation' | 'development' | 'communication' | 'analytics';

  // 인증
  auth: {
    type: 'oauth' | 'api-key' | 'webhook';
    config: Record<string, string>;
  };

  // 동기화 설정
  sync: {
    direction: 'push' | 'pull' | 'bidirectional';
    frequency: 'realtime' | 'on-harvest' | 'scheduled';
    filters: SyncFilter[];
  };

  // 매핑
  mappings: {
    learnings: string;      // 학습 내용 저장 위치
    tasks: string;          // 태스크 저장 위치
    insights: string;       // 인사이트 저장 위치
  };
}
```

### 3.3 Notion Integration Example

```json
{
  "integrations": {
    "notion": {
      "enabled": true,
      "auth": {
        "type": "oauth",
        "token": "${NOTION_TOKEN}"
      },
      "sync": {
        "direction": "push",
        "frequency": "on-harvest"
      },
      "mappings": {
        "learnings": "database:Learning Log",
        "tasks": "database:Dev Tasks",
        "insights": "page:Weekly Insights"
      },
      "templates": {
        "learning": {
          "Title": "{{title}}",
          "Category": "{{category}}",
          "Tags": "{{tags}}",
          "Date": "{{date}}",
          "Project": "{{project}}"
        }
      }
    }
  }
}
```

### 3.4 GitHub Integration Example

```json
{
  "integrations": {
    "github": {
      "enabled": true,
      "auth": {
        "type": "oauth",
        "token": "${GITHUB_TOKEN}"
      },
      "features": {
        "auto-issues": {
          "enabled": true,
          "fromFollowups": true,
          "minPriority": "high",
          "labels": ["from-glean", "ai-suggested"]
        },
        "pr-summary": {
          "enabled": true,
          "includeStats": true,
          "includeLearnings": true
        },
        "discussions": {
          "enabled": true,
          "category": "Dev Learnings",
          "shareLearnings": true
        }
      }
    }
  }
}
```

### 3.5 Web Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🌾 Glean Dashboard                      [lledellebell] ▼   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Sessions    │ │ Learnings   │ │ Productivity│           │
│  │    23       │ │    47       │ │    85%      │           │
│  │ this month  │ │ accumulated │ │ avg score   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  📈 Productivity Trend                                      │
│  ████████████████████░░░░ 85%                              │
│  ███████████████████████░ 92%                              │
│  ██████████████████░░░░░░ 78%                              │
│  █████████████████████░░░ 88%                              │
│                                                             │
│  🎯 Top Learnings This Week                                │
│  1. Remix redirect with cookies                            │
│  2. Zod type inference                                     │
│  3. React Query cache invalidation                         │
│                                                             │
│  ⚡ Suggested Actions                                       │
│  • Complete: Add rate limiting (High)                      │
│  • Review: Authentication tests                            │
│  • Document: Cookie handling pattern                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. 전체 플러그인 구조

```
glean/
├── .claude-plugin/
│   ├── marketplace.json
│   └── plugin.json
│
├── plugins/
│   ├── harvest/              # Core: 세션 분석
│   │   ├── plugin.json
│   │   ├── commands/
│   │   │   └── harvest.md
│   │   └── agents/
│   │       ├── doc-analyzer.md
│   │       ├── automation-finder.md
│   │       ├── learning-extractor.md
│   │       ├── followup-planner.md
│   │       └── dedup-validator.md
│   │
│   ├── insight/              # Core: AI 인사이트
│   │   ├── plugin.json
│   │   ├── commands/
│   │   │   └── insight.md
│   │   └── agents/
│   │       ├── pattern-detector.md
│   │       ├── productivity-analyzer.md
│   │       ├── risk-assessor.md
│   │       └── insight-synthesizer.md
│   │
│   ├── memory/               # Memory: 기억 관리
│   │   ├── plugin.json
│   │   └── commands/
│   │       ├── remember.md
│   │       └── recall.md
│   │
│   ├── context/              # Memory: 컨텍스트
│   │   ├── plugin.json
│   │   └── commands/
│   │       └── context.md
│   │
│   ├── learn/                # Memory: 학습
│   │   ├── plugin.json
│   │   └── commands/
│   │       ├── learn.md
│   │       └── unlearn.md
│   │
│   ├── plan/                 # Flow: 계획
│   │   ├── plugin.json
│   │   └── commands/
│   │       ├── plan.md
│   │       └── tasks.md
│   │
│   ├── review/               # Flow: 리뷰
│   │   ├── plugin.json
│   │   └── commands/
│   │       └── review.md
│   │
│   ├── pr/                   # Flow: PR
│   │   ├── plugin.json
│   │   └── commands/
│   │       └── pr.md
│   │
│   ├── sync/                 # Integrate: 동기화
│   │   ├── plugin.json
│   │   ├── commands/
│   │   │   └── sync.md
│   │   └── integrations/
│   │       ├── notion.md
│   │       ├── obsidian.md
│   │       ├── github.md
│   │       ├── linear.md
│   │       ├── slack.md
│   │       └── discord.md
│   │
│   └── notify/               # Integrate: 알림
│       ├── plugin.json
│       └── commands/
│           ├── notify.md
│           └── report.md
│
├── shared/                   # 공유 유틸리티
│   ├── storage.md
│   ├── config.md
│   └── i18n.md
│
├── dashboard/                # 웹 대시보드 (선택)
│   ├── package.json
│   └── src/
│
└── docs/
    ├── README.md
    ├── ARCHITECTURE.md
    ├── PLUGINS.md
    ├── INTEGRATIONS.md
    └── ROADMAP.md
```

---

## 5. 로드맵

### Phase 1: Core (Week 1-2)
- [x] glean-harvest (기존 /glean)
- [ ] glean-stats
- [ ] glean-history
- [ ] 기본 스토리지

### Phase 2: Memory (Week 3-4)
- [ ] glean-memory
- [ ] glean-context
- [ ] glean-learn

### Phase 3: Flow (Week 5-6)
- [ ] glean-plan
- [ ] glean-review
- [ ] glean-pr

### Phase 4: Deep Analysis (Week 7-8)
- [ ] glean-insight
- [ ] 고급 에이전트 (pattern-detector, productivity-analyzer 등)
- [ ] 예측 기능

### Phase 5: Integrations (Week 9-12)
- [ ] Notion
- [ ] Obsidian
- [ ] GitHub
- [ ] Linear
- [ ] Slack/Discord
- [ ] Web Dashboard

### Phase 6: Polish & Launch
- [ ] 문서화 완성
- [ ] 테스트 & 버그 수정
- [ ] GitHub 릴리즈
- [ ] 마켓플레이스 등재

---

## 6. 경쟁 우위

| 기존 플러그인 | Glean Suite 차별점 |
|--------------|-------------------|
| claude-mem (13k) | + 세션 분석, + 인사이트, + 통합 |
| task-master (24.8k) | + 학습 축적, + 예측, + 외부 동기화 |
| planning-with-files (7.1k) | + 자동 분석, + 다중 에이전트, + 대시보드 |
| buildwithclaude (2.2k) | + 깊이 있는 분석, + AI 인사이트 |

### Unique Value Proposition

> **"세션이 끝나면 모든 가치를 자동으로 수확하고,
> 어디서든 활용할 수 있게 해주는 유일한 플러그인 스위트"**

- 🌾 **Harvest**: 세션 끝에 자동 분석
- 🧠 **Remember**: 세션 간 기억 유지
- 📊 **Insight**: AI 기반 생산성 인사이트
- 🔄 **Sync**: 어디서든 동기화
