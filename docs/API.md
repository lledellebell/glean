# Glean API 레퍼런스

Glean의 내부 모듈과 데이터 구조를 설명해요.

## 데이터 타입

### Harvest

세션 수확 데이터 구조에요.

```typescript
interface Harvest {
  id: string;                    // 고유 ID (harvest_xxx)
  session: {
    startTime: string;           // ISO 8601
    endTime: string;
    duration: number;            // 초 단위
    project: string;             // 프로젝트 경로
  };
  changes: {
    files: FileChange[];
    commits: Commit[];
    linesAdded: number;
    linesRemoved: number;
  };
  tools: ToolUsage[];
  insights: ExtractedInsight[];
  summary: {
    description: string;
    mainTasks: string[];
    keywords: string[];
  };
  meta: {
    createdAt: string;
    version: string;
  };
}

interface FileChange {
  path: string;
  action: 'created' | 'modified' | 'deleted';
  linesAdded?: number;
  linesRemoved?: number;
}

interface Commit {
  hash: string;
  message: string;
  timestamp: string;
  filesChanged: number;
}

interface ToolUsage {
  tool: string;
  count: number;
  examples?: string[];
}

interface ExtractedInsight {
  type: 'pattern' | 'mistake' | 'learning' | 'optimization';
  content: string;
  confidence: number;
}
```

### Insight

인사이트 데이터 구조에요.

```typescript
type InsightType = 'pattern' | 'mistake' | 'optimization' | 'learning';

interface Insight {
  id: string;                    // ins_xxx
  type: InsightType;
  title: string;
  content: string;
  confidence: number;            // 0.0 ~ 1.0
  context: {
    project?: string;
    files?: string[];
    codeSnippet?: string;
    relatedCommits?: string[];
  };
  meta: {
    tags: string[];
    createdAt: string;
    sourceHarvest?: string;
    convertedToLearn?: boolean;
  };
  // 유형별 추가 필드
  pattern?: PatternDetail;
  mistake?: MistakeDetail;
  optimization?: OptimizationDetail;
  learning?: LearningDetail;
}

interface PatternDetail {
  description: string;
  example?: string;
  antiPattern?: string;
  useCases?: string[];
}

interface MistakeDetail {
  what: string;                  // 무엇이 잘못됐나
  why: string;                   // 왜 잘못됐나
  how: string;                   // 어떻게 해결했나
  prevention: string;            // 어떻게 방지할 수 있나
}

interface OptimizationDetail {
  before: string;
  after: string;
  improvement: string;
  metrics?: Record<string, number>;
}

interface LearningDetail {
  topic: string;
  keyPoints: string[];
  resources?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
```

### LearnItem

학습 항목 데이터 구조에요.

```typescript
interface LearnItem {
  id: string;                    // learn_xxx
  content: {
    title: string;
    description: string;
    keyPoints: string[];
    codeExample?: string;
    resources?: string[];
  };
  classification: {
    topic: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  spaceRep: {
    confidence: 1 | 2 | 3 | 4 | 5;
    nextReview: string;          // ISO 8601
    lastReview?: string;
    reviewCount: number;
    easeFactor: number;          // SM-2 알고리즘
    streak: number;
  };
  source: {
    type: 'insight' | 'harvest' | 'manual';
    insightId?: string;
    harvestId?: string;
    project?: string;
  };
  meta: {
    createdAt: string;
    updatedAt: string;
    mastered: boolean;
  };
}

interface ReviewRecord {
  date: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  responseTime?: number;         // 밀리초
}
```

---

## 저장소 모듈

### harvest-store.js

수확 데이터 관리 모듈이에요.

```javascript
import {
  saveHarvest,
  getHarvest,
  getRecentHarvests,
  searchHarvests,
  deleteHarvest
} from 'glean/lib/harvest-store.js';

// 수확 저장
const id = await saveHarvest(harvestData);

// 수확 조회
const harvest = await getHarvest('harvest_abc123');

// 최근 수확 목록
const recent = await getRecentHarvests({ limit: 10 });

// 검색
const results = await searchHarvests({
  project: 'my-project',
  dateRange: { from: '2024-01-01', to: '2024-01-31' }
});

// 삭제
await deleteHarvest('harvest_abc123');
```

### insight-store.js

인사이트 데이터 관리 모듈이에요.

```javascript
import {
  saveInsight,
  getInsight,
  getAllInsights,
  searchInsights,
  checkDuplicate,
  markAsConvertedToLearn
} from 'glean/lib/insight-store.js';

// 인사이트 저장
const id = await saveInsight(insightData);

// 중복 체크
const isDuplicate = await checkDuplicate(insightData);

// 검색
const patterns = await searchInsights({
  type: 'pattern',
  tags: ['react']
});

// 학습 변환 표시
await markAsConvertedToLearn('ins_abc123', 'learn_xyz789');
```

### learn-store.js

학습 항목 관리 모듈이에요.

```javascript
import {
  createLearnItem,
  getLearnItem,
  getDueItems,
  completeReview,
  updateConfidence,
  getStats,
  createFromInsight
} from 'glean/lib/learn-store.js';

// 학습 항목 생성
const id = await createLearnItem({
  title: '...',
  description: '...',
  topic: 'react',
  confidence: 3
});

// 인사이트에서 생성
const id = await createFromInsight('ins_abc123');

// 복습 대상 조회
const dueItems = await getDueItems();

// 복습 완료
await completeReview('learn_abc123', 4); // 이해도 4

// 통계
const stats = await getStats();
```

### spaced-repetition.js

스페이스드 리피티션 알고리즘 모듈이에요.

```javascript
import {
  calculateNextReview,
  updateAfterReview,
  getIntervalDays,
  checkMastered
} from 'glean/lib/spaced-repetition.js';

// 다음 복습일 계산
const nextDate = calculateNextReview(
  confidence,    // 1-5
  lastReview,    // Date
  reviewCount,   // number
  easeFactor     // number (기본 2.5)
);

// 복습 후 업데이트
const updated = updateAfterReview(learnItem, newConfidence);

// 마스터 여부 확인
const isMastered = checkMastered(learnItem);
// confidence 5 + streak 3 이상이면 마스터
```

---

## Bridge 모듈

### plugin-detector.js

플러그인 감지 모듈이에요.

```javascript
import {
  detectAllPlugins,
  getPluginInfo,
  getConnectablePlugins,
  checkPluginStatus
} from 'glean/lib/bridge/plugin-detector.js';

// 모든 플러그인 감지
const plugins = detectAllPlugins();
// [{ type, detected, path, version, capabilities }, ...]

// 특정 플러그인 정보
const info = getPluginInfo('/path/to/plugin');

// 연결 가능한 플러그인
const connectable = getConnectablePlugins();

// 상태 확인
const status = checkPluginStatus('obsidian');
// 'connected' | 'disconnected' | 'not_installed'
```

### data-transformer.js

데이터 변환 모듈이에요.

```javascript
import {
  insightToObsidianNote,
  learnToObsidianNote,
  harvestToMarkdown,
  commitToHarvestChange,
  prToInsight
} from 'glean/lib/bridge/data-transformer.js';

// Insight → Obsidian 노트
const { frontmatter, content, filename } = insightToObsidianNote(insight);

// Learn → Obsidian 노트
const note = learnToObsidianNote(learnItem);

// Harvest → Markdown
const markdown = harvestToMarkdown(harvest);

// Git commit → Harvest change
const change = commitToHarvestChange(commit);

// PR → Insight
const insight = prToInsight(pullRequest);
```

### obsidian.js

Obsidian 연동 모듈이에요.

```javascript
import {
  findVault,
  ensureGleanFolder,
  exportInsight,
  exportLearnItem,
  exportHarvest,
  exportBatch,
  initializeConnection,
  getExistingNotes
} from 'glean/lib/bridge/obsidian.js';

// 볼트 찾기
const vaultPath = findVault(customPath);

// 연결 초기화
const status = initializeConnection(vaultPath);
// { connected, vaultPath, gleanFolder, message }

// 내보내기
const filepath = exportInsight(insight, vaultPath);
const filepath = exportLearnItem(learnItem, vaultPath);
const filepath = exportHarvest(harvest, vaultPath);

// 일괄 내보내기
const results = exportBatch({ insights, learn, harvests }, vaultPath);
```

### claude-code.js

Claude Code 연동 모듈이에요.

```javascript
import {
  getRecentCommits,
  getCommitDetails,
  commitsToHarvestChanges,
  getRecentPRs,
  getPRDetails,
  extractInsightsFromPRs,
  getTodaySummary,
  initializeConnection
} from 'glean/lib/bridge/claude-code.js';

// 최근 커밋
const commits = getRecentCommits({
  limit: 10,
  since: '2024-01-01',
  project: '/path/to/project'
});

// 커밋 상세
const details = getCommitDetails(hash, project);

// PR 목록
const prs = getRecentPRs({ limit: 5, state: 'all' });

// PR에서 인사이트 추출
const insights = extractInsightsFromPRs(prs);

// 오늘 요약
const summary = getTodaySummary(project);
```

---

## 에이전트

### session-analyzer

세션을 분석해서 Harvest 데이터를 생성하는 에이전트에요.

**입력**: 세션 대화 컨텍스트
**출력**: JSON 형식의 Harvest 데이터

### pattern-recognizer

Harvest에서 패턴 인사이트를 추출하는 에이전트에요.

**입력**: Harvest 데이터
**출력**: PatternInsight[]

### mistake-analyzer

Harvest에서 실수 인사이트를 추출하는 에이전트에요.

**입력**: Harvest 데이터
**출력**: MistakeInsight[]

---

## 훅

### auto-harvest.js

세션 종료 시 자동 수확을 트리거하는 훅이에요.

**이벤트**: Stop
**동작**: 세션이 minDuration 이상이면 /harvest 제안

### review-reminder.js

세션 시작 시 복습 알림을 표시하는 훅이에요.

**이벤트**: SessionStart
**동작**: 복습 대기 항목이 있으면 알림 표시

---

## 설정 스키마

`~/.glean/config.json`:

```typescript
interface GleanConfig {
  // 자동화
  autoHarvest: boolean;          // 자동 수확 여부
  minSessionDuration: number;    // 최소 세션 시간 (초)
  reviewReminder: boolean;       // 복습 알림 여부
  reminderThreshold: number;     // 알림 임계값

  // 언어
  language: 'ko' | 'en' | 'auto';

  // 저장소
  storage: {
    path: string;                // 데이터 경로
    maxHarvests: number;         // 최대 수확 저장 수
    compressOld: boolean;        // 오래된 데이터 압축
  };

  // 학습
  learn: {
    defaultConfidence: number;   // 기본 이해도
    masteryThreshold: number;    // 마스터 기준 연속 횟수
    maxDailyReviews: number;     // 일일 최대 복습 수
  };

  // 연동
  bridge: {
    autoDetect: boolean;         // 자동 플러그인 감지
    syncOnStartup: boolean;      // 시작 시 동기화
  };
}
```
