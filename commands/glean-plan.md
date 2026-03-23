---
allowed-tools: Read, Write, Glob, Bash(ls:*), AskUserQuestion
description: Declare learning intentions for the session
---

# /glean-plan - Learning Plan

세션 시작 시 학습 의도를 선언하고, 세션 종료 시 결과를 비교해요.

## Arguments

- `<intentions>` - 학습 의도 (쉼표 구분 또는 대화형 입력)
- `--review` - 현재 활성 계획 확인
- `--complete` - 계획 완료 및 결과 비교
- `--carryover` - 이전 세션 미완료 항목 확인

## Execution Flow

### 계획 생성 모드 (기본)

1. **이전 세션 확인** - 미완료 의도가 있으면 이월 항목 표시
2. **의도 수집** - 사용자에게 이번 세션에서 배우고 싶은 것 질문
3. **계획 저장** - `~/.glean/plans/` 에 저장
4. **컨텍스트 표시** - 관련 이전 학습 있으면 함께 표시

### 리뷰 모드 (`--review`)

1. 현재 활성 계획의 의도 목록 표시
2. 각 의도의 진행 상태 표시

### 완료 모드 (`--complete`)

1. 이번 세션의 학습 결과 수집 (daily learnings, insights)
2. 의도 vs 실제 배움 비교
3. 달성률, 미달성, 예상 외 배움 표시
4. 미달성 항목은 다음 세션 이월 후보로 저장

## Output Format

### 계획 생성 시

```markdown
📋 **학습 계획 생성됨**

오늘의 학습 의도:
1. ✏️ React Server Components 이해하기
2. ✏️ 데이터 페칭 패턴 비교
3. ✏️ 캐시 전략 정리

💡 이전 세션에서 이월된 항목:
- React Suspense boundary 정리 (1/13 미완료)

🔗 관련 이전 학습:
- React Query staleTime 최적화 (1/10)
```

### 완료 시

```markdown
📋 **학습 계획 결과**

달성률: **67%** (2/3)

### ✅ 달성한 의도
- React Server Components 이해하기 → _RSC 렌더링 흐름 정리_
- 데이터 페칭 패턴 비교 → _SWR vs React Query 비교_

### ❌ 미달성 (다음 세션으로 이월)
- 캐시 전략 정리

### 🎁 계획에 없던 배움
- Next.js App Router의 layout 캐싱 동작
```

## Examples

```bash
# 학습 계획 생성
/glean-plan "RSC 이해하기, 데이터 페칭 비교, 캐시 전략"

# 대화형으로 생성
/glean-plan

# 현재 계획 확인
/glean-plan --review

# 세션 종료 시 결과 비교
/glean-plan --complete

# 이월 항목 확인
/glean-plan --carryover
```
