# /harvest - 세션 수확

현재 세션의 지식을 수확하고 저장해요.

## 사용법
```
/harvest [--mode <mode>] [--output <path>]
```

## 옵션
- `--mode`: 수확 모드 (quick, full, custom) - 기본: quick
- `--output`: 출력 경로 - 기본: ~/.glean/harvests/
- `--no-save`: 저장하지 않고 미리보기만

## 수확 모드

### quick (빠른 수확)
세션의 핵심 정보만 빠르게 추출:
- 작업 요약
- 수정된 파일
- 커밋 내역

### full (전체 수확)
세션의 모든 정보를 상세히 추출:
- 전체 대화 분석
- 인사이트 추출
- 학습 항목
- 다음 할 일

### custom (커스텀)
선택한 항목만 수확:
```bash
/harvest --mode custom --include "insights,todos,commits"
```

## 수확 내용

### 자동 수집 항목
| 항목 | 설명 |
|------|------|
| summary | 세션 작업 요약 |
| files | 수정/생성한 파일 |
| commits | 커밋 내역 |
| duration | 세션 시간 |
| tools | 사용한 도구 통계 |

### 분석 항목
| 항목 | 설명 |
|------|------|
| insights | 발견한 패턴, 실수 |
| learnings | 새로 배운 것 |
| todos | 미완료/다음 작업 |
| questions | 남은 질문 |

## 출력 형식

```
## 🌾 세션 수확 완료

📅 2024-01-15 14:30 ~ 16:00 (1h 30m)
📁 프로젝트: my-app

### 작업 요약
- 사용자 인증 기능 구현
- JWT 토큰 처리 로직 추가

### 수정 파일 (5)
- src/auth/login.tsx (생성)
- src/hooks/useAuth.ts (생성)
- src/api/auth.ts (수정)
...

### 커밋 (2)
- feat: 로그인 기능 구현 (abc1234)
- fix: 토큰 갱신 버그 수정 (def5678)

### 발견한 인사이트
1. httpOnly 쿠키로 토큰 저장 시 보안 강화
2. React Query로 인증 상태 캐싱 효과적

### 배운 것
- JWT 리프레시 토큰 패턴
- Axios 인터셉터 활용

### 다음 할 일
- [ ] 로그아웃 기능
- [ ] 비밀번호 재설정

---
💾 저장됨: ~/.glean/harvests/2024-01-15-session-1.md
```

## 에이전트 실행

full 모드에서 실행되는 에이전트:

1. **doc-analyzer**: 문서화할 내용 분석
2. **learning-extractor**: 학습 항목 추출
3. **followup-planner**: 다음 작업 계획
4. **automation-finder**: 자동화 기회 탐색

## 예시

```bash
# 빠른 수확
/harvest

# 전체 수확
/harvest --mode full

# 미리보기만
/harvest --no-save

# 특정 경로에 저장
/harvest --output ./docs/sessions/
```

## 자동 수확

세션 종료 시 자동 수확 설정:

```json
{
  "harvest": {
    "autoHarvest": true,
    "mode": "quick",
    "minDuration": 600  // 10분 이상 세션만
  }
}
```

## 구현 단계

이 명령어가 실행되면 다음 단계를 수행해:

### Step 1: 세션 정보 수집
```
1. 현재 프로젝트 경로 확인
2. Git 상태 확인 (브랜치, 최근 커밋)
3. 세션 시작 시간 추정 (첫 메시지 기준)
```

### Step 2: session-analyzer 에이전트 실행
```
Task 도구로 session-analyzer 에이전트 실행:
- subagent_type: "general-purpose"
- prompt: agents/session-analyzer.md 참조
- 모드에 따라 quick/full 분석
```

### Step 3: 결과 저장
```
1. ~/.glean/harvests/ 디렉토리에 JSON 저장
2. 파일명: harvest-YYYY-MM-DD-HHMMSS-xxxx.json
3. index.json 업데이트
```

### Step 4: 결과 출력
```
사용자에게 수확 결과 요약 표시:
- 세션 정보 (시간, 프로젝트)
- 주요 작업
- 핵심 인사이트
- 저장 경로
```

### Step 5 (선택): 학습 항목 변환
```
--to-learn 옵션 시:
인사이트 중 learning 타입을 /learn에 자동 추가
```

## 연동
- `/done` - 세션 종료 시 자동 수확
- `/insight` - 인사이트 상세 분석
- `/learn` - 학습 항목으로 변환
- `/bridge` - 외부 플러그인 연동
