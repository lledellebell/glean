# Glean 사용법 가이드

Glean의 모든 기능과 사용법을 상세히 설명해요.

## 핵심 워크플로우

Glean의 기본 사용 흐름이에요:

```
세션 종료 → /harvest → /insight extract → /insight apply → /learn review
     ↓           ↓            ↓                 ↓              ↓
  코딩 작업    수확 저장    인사이트 추출    학습 항목 생성   복습 완료
```

---

## `/harvest` - 지식 수확

세션에서 가치 있는 정보를 자동으로 추출해요.

### 기본 사용

```bash
# 현재 세션 수확
/harvest

# 상세 분석 포함
/harvest --all

# 저장 없이 미리보기
/harvest --dry-run

# 특정 프로젝트 지정
/harvest --project ./my-project
```

### 수확되는 정보

1. **파일 변경**: 생성/수정/삭제된 파일 목록
2. **커밋 기록**: 세션 중 만든 커밋
3. **도구 사용**: 사용한 명령어, 도구 통계
4. **대화 인사이트**: 배운 것, 해결한 문제

### 출력 예시

```markdown
## 세션 수확 완료!

📅 2024-01-15 14:30 ~ 16:45 (2시간 15분)
📁 프로젝트: learn-cs-remix

### 변경 파일 (12)
- ✏️ app/routes/_index.tsx (수정)
- ✨ app/hooks/use_auth.ts (생성)
- 🗑️ app/utils/old-helper.ts (삭제)

### 커밋 (3)
- fix: 인증 로직 수정
- feat: useAuth 훅 추가
- refactor: 불필요한 파일 정리

### 추출된 인사이트 (2)
- 🎯 React Query staleTime 최적화 패턴
- ⚠️ null 체크 누락 실수

저장됨: ~/.glean/harvests/2024-01-15-session-1.json
```

---

## `/insight` - 인사이트 관리

수확된 데이터에서 실행 가능한 인사이트를 관리해요.

### 서브커맨드

#### `extract` - 인사이트 추출

```bash
# 최근 수확에서 추출
/insight extract

# 특정 수확에서 추출
/insight extract --harvest 2024-01-15-session-1

# 특정 유형만 추출
/insight extract --type pattern
/insight extract --type mistake
```

#### `list` - 인사이트 조회

```bash
# 전체 목록
/insight list

# 유형별 필터
/insight list --type pattern
/insight list --type mistake

# 최근 N개
/insight list --limit 10

# 프로젝트별
/insight list --project learn-cs-remix
```

#### `view` - 상세 보기

```bash
/insight view <insight-id>
```

출력 예시:
```markdown
## 인사이트: ins_abc123

**유형**: mistake
**제목**: null 체크 누락으로 인한 런타임 에러

### 무엇이 잘못됐나
user.profile.name에 접근할 때 profile이 null일 수 있는 케이스를 처리하지 않음

### 왜 잘못됐나
API 응답에서 profile이 optional인데, TypeScript가 이를 감지하지 못함

### 해결 방법
Optional chaining 사용: user.profile?.name

### 방지책
- strict null checks 활성화
- API 응답 타입 정확히 정의

**생성일**: 2024-01-15
**프로젝트**: learn-cs-remix
```

#### `apply` - 학습 항목으로 변환

```bash
# 인사이트를 학습 항목으로 변환
/insight apply <insight-id>

# 초기 이해도 지정
/insight apply <insight-id> --confidence 3
```

---

## `/learn` - 학습 관리

스페이스드 리피티션으로 인사이트를 장기 기억화해요.

### 서브커맨드

#### `review` - 복습하기

```bash
# 오늘 복습할 항목 확인
/learn review

# 복습 시작 (인터랙티브)
/learn review --start
```

복습 시 이해도를 선택해요:
- **5**: 완벽하게 기억함
- **4**: 약간 망설였지만 기억함
- **3**: 힌트 후 기억함
- **2**: 기억나지 않음
- **1**: 완전히 잊어버림

#### `add` - 수동 추가

```bash
# 학습 항목 추가
/learn add "React useCallback은 함수 메모이제이션에 사용"

# 주제와 함께
/learn add "useCallback 사용법" --topic react-hooks

# 초기 이해도 지정
/learn add "..." --confidence 3
```

#### `quiz` - 퀴즈 모드

```bash
# 퀴즈 시작
/learn quiz

# 특정 주제만
/learn quiz --topic react-hooks

# 문제 수 지정
/learn quiz --count 5
```

#### `stats` - 통계 확인

```bash
/learn stats
```

출력 예시:
```markdown
## 학습 통계

### 전체 현황
- 총 학습 항목: 47개
- 마스터한 항목: 12개 (25%)
- 복습 대기: 5개

### 주제별 분포
| 주제 | 항목 수 | 마스터 |
|------|---------|--------|
| react-hooks | 15 | 4 |
| typescript | 12 | 3 |
| css | 10 | 2 |

### 복습 기록
- 오늘 복습: 3개
- 이번 주: 15개
- 연속 복습 일수: 7일 🔥

### 다음 복습
- 오늘: 5개
- 내일: 3개
- 이번 주: 12개
```

---

## `/bridge` - 플러그인 연동

다른 플러그인과 데이터를 연동해요.

### 서브커맨드

#### `detect` - 플러그인 감지

```bash
/bridge detect
```

출력:
```markdown
## 플러그인 감지 결과

| 플러그인 | 상태 | 버전 | 기능 |
|---------|------|------|------|
| claude-code | ✅ 발견 | 1.2.0 | commits, prs |
| obsidian | ✅ 발견 | - | notes |
| task-master | ❌ 미설치 | - | - |

연결 가능: 2개
```

#### `connect` - 플러그인 연결

```bash
# 기본 연결
/bridge connect obsidian

# 경로 지정
/bridge connect obsidian --path ~/Documents/Obsidian/MyVault
```

#### `sync` - 데이터 동기화

```bash
# 전체 동기화
/bridge sync

# 특정 플러그인만
/bridge sync --plugin obsidian

# 방향 지정
/bridge sync --plugin obsidian --direction export
```

#### `status` - 연동 상태

```bash
/bridge status
```

---

## 자동화 설정

### Hook으로 자동 수확

세션 종료 시 자동으로 수확을 제안해요.

`~/.glean/config.json`:
```json
{
  "autoHarvest": true,
  "minSessionDuration": 300,
  "autoHarvestPrompt": true
}
```

### 복습 알림

세션 시작 시 복습 항목을 알려줘요.

```json
{
  "reviewReminder": true,
  "reminderThreshold": 1
}
```

---

## 팁과 트릭

### 효과적인 수확을 위해

1. **세션 종료 시 바로 수확**: 기억이 생생할 때 수확해요
2. **의미 있는 커밋 메시지**: 수확 품질에 영향을 줘요
3. **문제 해결 과정 기록**: 대화 중 명시적으로 언급하면 더 잘 추출돼요

### 효과적인 학습을 위해

1. **매일 복습**: 짧은 시간이라도 매일 복습해요
2. **정직한 이해도 선택**: 자기기만은 학습에 해로워요
3. **연속 복습 유지**: 스트릭을 유지하면 동기부여가 돼요

### 연동 활용

1. **Obsidian으로 내보내기**: 개인 지식 베이스와 통합
2. **PR에서 인사이트 추출**: 코드 리뷰에서도 배워요

---

## 다음 단계

- [API 레퍼런스](./API.md)에서 프로그래매틱 사용법 확인
- [아키텍처](./ARCHITECTURE.md)에서 내부 구조 이해
