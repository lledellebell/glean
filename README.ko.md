# Glean

> **AI 코딩 세션에서 배운 것을 절대 잊지 마세요**

Glean은 Claude Code 세션에서 자동으로 지식을 수확하고, 간격 반복을 통해 장기 기억으로 전환합니다.

[English](./README.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![npm downloads](https://img.shields.io/npm/dm/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lledellebell/glean.svg)](https://github.com/lledellebell/glean/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/lledellebell/glean.svg)](https://github.com/lledellebell/glean/commits/main)
[![GitHub code size](https://img.shields.io/github/languages/code-size/lledellebell/glean.svg)](https://github.com/lledellebell/glean)
[![GitHub contributors](https://img.shields.io/github/contributors/lledellebell/glean.svg)](https://github.com/lledellebell/glean/graphs/contributors)
[![CI](https://github.com/lledellebell/glean/actions/workflows/ci.yml/badge.svg)](https://github.com/lledellebell/glean/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-문서-blue.svg)](https://deepwiki.com/lledellebell/glean)

## 문제

AI 코딩 세션이 끝나면 소중한 정보가 사라집니다:

- 발견한 코드 패턴과 컨벤션
- 실수와 해결 방법
- 배운 개념 (다음 주면 잊어버림)
- 유용한 명령어와 워크플로우

**Glean**은 이 모든 것을 자동으로 캡처하고 영구적으로 기억할 수 있도록 도와줍니다.

## 기능

### 세션 수확

8개의 전문 AI 에이전트가 병렬로 코딩 세션을 분석합니다:

| 에이전트 | 목적 |
|----------|------|
| Session Analyzer | 핵심 수확 데이터 생성 |
| Doc Analyzer | 문서 업데이트 제안 |
| Automation Finder | 자동화 기회 탐지 |
| Learning Extractor | 학습 포인트 추출 |
| Followup Planner | 다음 작업 계획 |
| Pattern Recognizer | 코드 패턴 탐지 |
| Mistake Analyzer | 오류/실수 분석 |
| Dedup Validator | 결과 중복 제거 |

### 간격 반복

내장된 SM-2 알고리즘이 최적의 간격으로 복습을 스케줄링합니다:

| 자신감 | 다음 복습 |
|--------|-----------|
| 5/5 | 30일 |
| 4/5 | 14일 |
| 3/5 | 7일 |
| 2/5 | 3일 |
| 1/5 | 1일 |

### 플러그인 생태계

세션 관리를 위한 12개의 기능 플러그인:

| 플러그인 | 설명 |
|----------|------|
| `/harvest` | 세션 지식 수확 |
| `/insight` | 패턴 및 인사이트 추출 |
| `/learn` | 간격 반복 학습 |
| `/memory` | 영구 메모리 (remember/recall) |
| `/context` | 세션 컨텍스트 저장/복원 |
| `/plan` | 작업 계획 및 추적 |
| `/pr` | Pull Request 워크플로우 자동화 |
| `/review` | 코드 리뷰 도우미 |
| `/history` | 세션 히스토리 검색 |
| `/sync` | 외부 도구 동기화 |
| `/notify` | 알림 관리 |
| `/stats` | 세션 통계 |

### 브릿지 연동

외부 도구와 연결:

- **Obsidian** - 인사이트를 볼트로 내보내기
- **GitHub** - 작업에서 이슈 생성
- **Notion** - 학습 내용을 데이터베이스에 동기화

## 설치

### Claude Code Plugin Marketplace (권장)

<p align="center">
  <img src="./assets/glean.png" alt="Glean" width="300" />
</p>

```bash
claude plugin marketplace add lledellebell/glean
claude plugin install glean-core@glean
```

### npm

```bash
npm install @deeeep/glean
```

### 수동 설치

```bash
# 플러그인 디렉토리에 클론
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# 또는 원하는 곳에 클론하고 설정에서 참조
git clone https://github.com/lledellebell/glean.git ~/glean
```

### 설정

Claude Code 설정에 추가:

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## 빠른 시작

```bash
# 1. 설정 마법사 실행
npx @deeeep/glean init

# 2. Claude Code로 코딩 세션 시작
claude

# 3. 작업 수행...

# 4. 세션 종료 시 지식 수확
/glean

# 5. 나중에 학습 내용 복습
/learn review
```

## CLI

```bash
# 설정 마법사 - 대화형으로 Glean 설정
npx @deeeep/glean init

# 현재 설정 확인
npx @deeeep/glean status

# 도움말 표시
npx @deeeep/glean help
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
/learn add "React Query는 query key로 캐싱한다"  # 학습 추가
/learn list                                       # 학습 목록 보기
/learn review                                     # 복습 세션 시작
/learn quiz --topic react                         # 퀴즈 모드
```

### 메모리 명령어

```bash
/remember "API는 응답에 camelCase를 사용"  # 메모리에 저장
/recall api                                 # 메모리 검색
```

### 워크플로우 명령어

```bash
/plan create "인증 시스템"    # 개발 계획 생성
/plan add "로그인 폼 추가"   # 작업 추가
/plan done 1                  # 완료 표시

/pr create                    # Pull Request 생성
/review src/                  # 코드 리뷰
```

## 데이터 저장소

```
~/.glean/
├── harvests/     # 세션 수확 데이터 (JSON)
├── insights/     # 추출된 인사이트
├── learn/        # 복습 스케줄이 포함된 학습 항목
├── contexts/     # 저장된 세션 컨텍스트
├── history/      # 세션 히스토리
└── config.json   # 설정
```

## 설정

`~/.glean/config.json` 생성:

```json
{
  "harvest": {
    "autoHarvest": true,
    "mode": "quick",
    "minDuration": 600
  },
  "learn": {
    "reviewReminder": true,
    "defaultConfidence": 3
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
# 전체 테스트 실행
npm test

# 61개 테스트 커버리지:
# - 간격 반복 알고리즘
# - 데이터 변환기
# - 플러그인 감지
```

## 기여

기여를 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고하세요:

- 개발 환경 설정
- 코드 가이드라인
- 테스트 요구사항
- Pull Request 절차

## 로드맵

- [ ] 복습용 웹 대시보드
- [ ] 팀 지식 공유
- [ ] 추가 연동 (Linear, Jira)
- [ ] AI 기반 복습 제안

## 라이선스

MIT 라이선스 - [LICENSE](./LICENSE) 참조

## 작성자

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "어제 배운 것을 오늘 기억하세요"

**Glean이 학습에 도움이 되었다면 스타를 눌러주세요!**
