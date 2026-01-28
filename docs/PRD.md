# Glean PRD (Product Requirements Document)

## 1. 개요

### 1.1 제품 비전
> **"AI 세션에서 배운 것을 절대 잊지 않게 해주는 도구"**

Claude Code 세션에서 발생하는 지식을 자동으로 수확하고, 기존 생태계와 연동하여 개발자의 학습과 생산성을 극대화하는 플러그인.

### 1.2 핵심 가치 제안 (Value Proposition)
1. **지식 수확**: 세션에서 배운 패턴, 실수, 인사이트 자동 추출
2. **망각 방지**: 스페이스드 리피티션으로 학습 내용 장기 기억화
3. **생태계 통합**: 기존 인기 플러그인들과 원활한 데이터 연동

### 1.3 타겟 사용자
- Claude Code를 일상적으로 사용하는 개발자
- 세션에서 배운 것을 체계적으로 관리하고 싶은 사람
- 여러 플러그인을 사용하지만 데이터가 분산된 사람

---

## 2. 문제 정의

### 2.1 현재 문제점
| 문제 | 설명 | 영향 |
|------|------|------|
| **지식 휘발** | 세션에서 배운 것이 다음 세션에서 잊혀짐 | 같은 실수 반복, 학습 효율 저하 |
| **도구 분산** | 여러 플러그인 사용 시 데이터가 흩어짐 | 컨텍스트 전환 비용, 통합 뷰 부재 |
| **수동 기록** | 인사이트를 수동으로 기록해야 함 | 귀찮아서 안 함 → 지식 손실 |

### 2.2 경쟁 환경 분석
| 경쟁자 | 강점 | Glean 차별점 |
|--------|------|-------------|
| anthropics/claude-code | 공식, PR/커밋 워크플로우 | 학습 추적 없음 |
| claude-task-master | 태스크 관리 | 인사이트 추출 없음 |
| wshobson/agents | 규모 (68 plugins) | 지식 수확 특화 없음 |
| obsidian-skills | 노트 연동 | Claude 세션 분석 없음 |

**Glean의 포지셔닝**: 세션 지식 수확 + 생태계 허브

---

## 3. 제품 요구사항

### 3.1 핵심 기능 (Must Have)

#### 3.1.1 `/harvest` - 지식 수확
**목적**: 세션에서 가치 있는 정보를 자동 추출

**기능**:
- 세션 대화 분석
- 작성/수정한 코드 패턴 추출
- 발생한 에러와 해결 방법 기록
- 사용한 명령어/도구 통계

**출력**:
```markdown
## 세션 수확 결과
- 패턴: React Query staleTime 최적화
- 실수: null 체크 누락 → Optional chaining으로 해결
- 배운 것: httpOnly 쿠키로 토큰 저장
```

**저장**: `~/.glean/harvests/YYYY-MM-DD-session-N.json`

#### 3.1.2 `/insight` - 인사이트 추출
**목적**: 수확된 데이터에서 실행 가능한 인사이트 도출

**기능**:
- 패턴 인식 (자주 사용하는 코드 구조)
- 안티패턴 감지 (반복되는 실수)
- 최적화 기회 식별

**출력 유형**:
- `pattern`: 반복되는 좋은 패턴
- `mistake`: 실수에서 배운 것
- `optimization`: 개선 기회

#### 3.1.3 `/learn` - 학습 관리
**목적**: 스페이스드 리피티션으로 장기 기억화

**기능**:
- 학습 항목 자동/수동 추가
- 이해도 기반 복습 주기 계산
- 복습 알림 및 퀴즈 모드

**스페이스드 리피티션 알고리즘**:
```
이해도 5 → 30일 후 복습
이해도 4 → 14일 후 복습
이해도 3 → 7일 후 복습
이해도 2 → 3일 후 복습
이해도 1 → 1일 후 복습
```

### 3.2 통합 기능 (Should Have)

#### 3.2.1 플러그인 연동
| 대상 플러그인 | 연동 방식 | 데이터 흐름 |
|--------------|----------|------------|
| anthropics/claude-code | 커밋/PR 정보 읽기 | PR 리뷰에서 인사이트 추출 |
| claude-task-master | 태스크 동기화 | 완료된 태스크에서 학습 항목 생성 |
| obsidian-skills | 노트 내보내기 | 인사이트 → Obsidian 노트 |

#### 3.2.2 `/bridge` - 데이터 브릿지
**목적**: 플러그인 간 데이터 흐름 관리

**기능**:
- 플러그인 감지 및 연결
- 데이터 포맷 변환
- 양방향 동기화

### 3.3 부가 기능 (Nice to Have)
- 웹 대시보드 (통계 시각화)
- 팀 공유 모드
- VS Code 확장

---

## 4. 기술 요구사항

### 4.1 아키텍처
```
┌─────────────────────────────────────────────────┐
│                   Glean Core                     │
├─────────────┬─────────────┬─────────────────────┤
│   Harvest   │   Insight   │       Learn         │
│   Engine    │   Analyzer  │   (Spaced Rep)      │
├─────────────┴─────────────┴─────────────────────┤
│                 Data Layer                       │
│  ~/.glean/{harvests, insights, learn, bridge}   │
├─────────────────────────────────────────────────┤
│                Bridge Layer                      │
│  claude-code │ task-master │ obsidian │ ...    │
└─────────────────────────────────────────────────┘
```

### 4.2 데이터 스키마

#### Harvest 데이터
```typescript
interface Harvest {
  id: string;
  timestamp: string;
  project: string;
  duration: number;
  summary: string;
  files: FileChange[];
  commits: Commit[];
  insights: string[];
  learnings: string[];
  tools: ToolUsage[];
}
```

#### Learn 데이터
```typescript
interface LearnItem {
  id: string;
  content: string;
  topic: string;
  source: 'auto' | 'manual';
  sourceSession?: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  nextReview: string;
  reviewHistory: ReviewRecord[];
}
```

### 4.3 구현 방식
- **명령어**: Markdown 기반 (.md)
- **로직**: JavaScript/TypeScript (hooks, agents)
- **저장**: JSON 파일 (로컬 우선)
- **동기화**: 플러그인 API 호출

---

## 5. 성공 지표 (KPIs)

### 5.1 사용자 지표
| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 일일 활성 사용자 | 100+ | /harvest 실행 횟수 |
| 학습 항목 생성 | 5+/세션 | /learn add 횟수 |
| 복습 완료율 | 70%+ | 복습 완료/알림 |

### 5.2 품질 지표
| 지표 | 목표 |
|------|------|
| GitHub Stars | 1,000+ (3개월) |
| 플러그인 연동 | 3개+ |
| 버그 리포트 | <5/월 |

---

## 6. 범위 제외 (Out of Scope)

현재 버전에서 제외:
- ❌ 웹 대시보드
- ❌ 팀 협업 기능
- ❌ 유료 기능
- ❌ 클라우드 동기화
- ❌ `/pr`, `/review`, `/notify` 등 중복 기능

---

## 7. 릴리즈 계획

| Phase | 내용 | 기간 |
|-------|------|------|
| **Phase 1** | Core 구현 (harvest, insight, learn) | - |
| **Phase 2** | Bridge 구현 (플러그인 연동) | - |
| **Phase 3** | 최적화 및 피드백 반영 | - |

---

## 8. 리스크 및 완화

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| 기존 플러그인과 중복 | 사용자 혼란 | 명확한 포지셔닝, 연동 강조 |
| 세션 분석 정확도 | 낮은 품질 | 에이전트 프롬프트 최적화 |
| 플러그인 API 변경 | 연동 실패 | 느슨한 결합, 폴백 처리 |
