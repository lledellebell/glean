---
allowed-tools: Read, Glob, Bash(ls:*)
description: Display learning status dashboard
---

# /glean-hud - Learning Dashboard

현재 학습 상태를 한눈에 보여주는 대시보드에요.

## Arguments

- `--project=<name>` - 프로젝트 필터
- `--compact` - 간략 모드 (한 줄 요약)

## Execution Flow

1. **데이터 수집**
   - 오늘의 배움 수 (`~/.glean/daily/`)
   - 복습 대기 항목 수 (`~/.glean/learn/`)
   - 연속 학습일 (`~/.glean/learn/stats.json`)
   - 활성 학습 계획 (`~/.glean/plans/`)
   - 최근 인사이트 수 (`~/.glean/insights/`)

2. **컨텍스트 분석**
   - 현재 프로젝트 관련 이전 세션 학습
   - 이월된 학습 의도
   - 반복된 실수 패턴 감지

3. **대시보드 출력**

## Output Format

### 기본 모드

```markdown
╭───────────────────────────────────────╮
│           🌱 Glean Dashboard          │
╰───────────────────────────────────────╯

📊 오늘: 3개 배움 | 복습 2개 남음 | 🔥 5일 연속

📋 활성 계획: "RSC, 데이터 페칭, 캐시" (1/3 달성)

💡 이 프로젝트 인사이트 12개
📚 학습 항목 28개 (마스터 8개)

🔗 이전 세션 관련:
  - React Query staleTime 최적화 (1/10)
  - Error Boundary 패턴 (1/8)

⚠️ 주의: "useEffect cleanup" 관련 실수 2회 반복
```

### 간략 모드 (`--compact`)

```
🌱 오늘 3배움 | 복습 2개 | 🔥5일 | 계획 1/3 | 인사이트 12 | 학습 28
```

## Examples

```bash
# 기본 대시보드
/glean-hud

# 특정 프로젝트
/glean-hud --project=my-app

# 간략 모드
/glean-hud --compact
```
