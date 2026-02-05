# Glean

> **AI 코딩 세션에서 배운 것을 절대 잊지 않게 해주는 도구**

Glean은 Claude Code 세션에서 지식을 자동으로 수확하고, 간격 반복(Spaced Repetition)을 사용해 장기 기억으로 변환해요.

[English](./README.md) | [Espanol](./README.es.md) | [日本語](./README.ja.md)

## 문제

AI 코딩 세션이 끝나면 소중한 정보가 사라져요:

- 발견한 코드 패턴과 컨벤션
- 실수했다가 고친 내용 (같은 실수를 또 하게 됨)
- 배운 개념들 (다음 주면 잊어버림)
- 유용한 명령어와 워크플로우

**Glean**은 이 모든 것을 자동으로 수집하고, 영구적으로 기억할 수 있도록 도와줘요.

## 기능

### 세션 수확 (Harvesting)

전문 AI 에이전트가 병렬로 실행되어 코딩 세션을 분석해요:

| 에이전트 | 역할 |
|----------|------|
| Doc Analyzer | 문서 업데이트 제안 |
| Automation Finder | 자동화 기회 탐지 |
| Learning Extractor | 학습 포인트 추출 |
| Followup Planner | 후속 작업 계획 |
| Dedup Validator | 결과 중복 제거 |

### 간격 반복 (Spaced Repetition)

내장된 SM-2 알고리즘이 최적의 간격으로 복습을 스케줄링해요:

| 이해도 | 다음 복습 |
|--------|----------|
| 5/5 | 30일 후 |
| 4/5 | 14일 후 |
| 3/5 | 7일 후 |
| 2/5 | 3일 후 |
| 1/5 | 1일 후 |

### 플러그인 생태계

세션 관리를 위한 14개의 기능 플러그인:

| 플러그인 | 설명 |
|----------|------|
| `/harvest` | 세션 지식 수확 |
| `/insight` | 패턴과 인사이트 추출 |
| `/learn` | 간격 반복 학습 |
| `/flashcard` | 플래시카드 복습 (what/how/why) |
| `/growth` | 학습 진행 시각화 |
| `/memory` | 영구 메모리 (remember/recall) |
| `/context` | 세션 컨텍스트 저장/복원 |
| `/plan` | 작업 계획 및 추적 |
| `/pr` | 풀 리퀘스트 워크플로우 자동화 |
| `/review` | 코드 리뷰 도우미 |
| `/history` | 세션 히스토리 검색 |
| `/sync` | 외부 도구 동기화 |
| `/notify` | 알림 관리 |
| `/stats` | 세션 통계 |

### 자동 알림 (Hooks)

Glean은 자동으로 트리거되는 스마트 훅을 제공해요:

| 훅 | 트리거 | 설명 |
|----|--------|------|
| **Deja-vu Alert** | 세션 시작 | 유사한 에러를 감지하고 과거 해결법을 표시 |
| **Daily One-liner** | 세션 종료 | 오늘 가장 중요한 배움을 저장하도록 제안 |
| **Context Review** | 세션 시작 | 현재 프로젝트와 관련된 과거 배움을 표시 |

### Bridge 연동

외부 도구와 연결:

- **Obsidian** - 인사이트를 vault로 내보내기
- **GitHub** - 작업에서 issue 생성

## 설치

### npm (GitHub Packages)

```bash
npm install @lledellebell/glean
```

### 수동 설치

```bash
# 플러그인 디렉토리에 클론
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## 빠른 시작

```bash
# 1. Claude Code로 세션 시작
claude

# 2. 작업 수행...

# 3. 세션 종료 시 지식 수확
/glean

# 4. 학습 복습
/learn review
# 또는
/flashcard
```

## 명령어

### 핵심 명령어

```bash
/glean              # 현재 세션 수확 (병렬 에이전트)
/glean --verbose    # 모든 에이전트 결과를 포함한 상세 출력

/harvest            # 빠른 지식 수확
/harvest --full     # 종합 분석

/insight            # 인사이트 추출
/insight --type pattern   # 패턴만
/insight --type mistake   # 실수만
```

### 학습 명령어

```bash
/learn add "React Query는 query key로 캐시한다"  # 학습 추가
/learn list                                      # 학습 목록
/learn review                                    # 복습 세션 시작

/flashcard                    # 플래시카드 복습
/flashcard --topic react      # 토픽으로 필터
/flashcard --stats            # 통계 보기

/growth                       # 성장 시각화
/growth --period=week         # 이번 주 진행상황
/growth --quick               # 간단 요약
```

### 메모리 명령어

```bash
/remember "API는 응답에 camelCase를 사용"  # 메모리에 저장
/recall api                                 # 메모리 검색
```

## 데이터 저장 위치

```
~/.glean/
├── harvests/     # 세션 수확 데이터 (JSON)
├── insights/     # 추출된 인사이트
├── learn/        # 복습 스케줄이 있는 학습 항목
├── daily/        # 일일 배움 (one-liners)
├── contexts/     # 저장된 세션 컨텍스트
├── history/      # 세션 히스토리
└── config/       # 설정
```

## 설정

프로젝트에 `.glean.json` 생성:

```json
{
  "harvest": {
    "autoHarvest": true,
    "minDuration": 600
  },
  "daily": {
    "autoPrompt": true,
    "maxDaily": 3
  },
  "contextReview": {
    "enabled": true,
    "limit": 5
  },
  "integrations": {
    "obsidian": {
      "enabled": true,
      "vaultPath": "~/Documents/Obsidian/Vault"
    }
  }
}
```

## 테스트

```bash
# 모든 테스트 실행
npm test

# 163개 테스트 커버:
# - 간격 반복 알고리즘
# - 패턴 매칭
# - 플래시카드 생성
# - 성장 시각화
# - 데이터 변환기
# - 플러그인 감지
```

## 기여하기

기여를 환영해요! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조해주세요.

## 라이선스

MIT 라이선스 - [LICENSE](./LICENSE)

## 저자

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "오늘 배운 것을 내일도 기억하자"

**Glean이 학습에 도움이 됐다면 스타를 눌러주세요!**
