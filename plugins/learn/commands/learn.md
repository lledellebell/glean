# /learn - 학습 기록 관리

세션에서 배운 것을 기록하고 추적해요.

## 사용법
```
/learn <command> [options]
```

## 서브커맨드

### add - 학습 기록 추가
```bash
/learn add "<내용>" [--topic <topic>] [--source <source>]
```

### list - 학습 기록 조회
```bash
/learn list [--topic <topic>] [--period <period>]
```

### review - 복습 필요한 항목
```bash
/learn review [--count <n>]
```

### quiz - 퀴즈 모드
```bash
/learn quiz [--topic <topic>]
```

## 학습 기록 구조

### 자동 수집 (세션 분석)
- 새로 사용한 API/라이브러리
- 해결한 에러와 해결 방법
- 발견한 패턴과 안티패턴

### 수동 기록
- 개념 설명
- 코드 스니펫
- 참고 링크

## 학습 메타데이터

| 필드 | 설명 |
|------|------|
| topic | 주제 분류 (react, typescript, git 등) |
| difficulty | 난이도 (beginner, intermediate, advanced) |
| source | 출처 (문서, 블로그, 실험 등) |
| confidence | 이해도 (1-5) |
| lastReview | 마지막 복습 날짜 |

## 출력 형식

### 학습 추가
```
✅ 학습 기록 추가됨

📚 React Query의 staleTime vs cacheTime 차이
🏷️ 주제: react-query
📊 난이도: intermediate
📅 추가: 2024-01-15

관련 기록:
- React Query 기본 사용법 (01-10)
- useQuery 옵션들 (01-12)
```

### 학습 목록
```
## 📚 학습 기록

### 이번 주 (5개)

| 주제 | 내용 | 이해도 | 날짜 |
|------|------|--------|------|
| react-query | staleTime vs cacheTime | ⭐⭐⭐⭐ | 01-15 |
| typescript | 조건부 타입 | ⭐⭐⭐ | 01-14 |
| git | rebase vs merge | ⭐⭐⭐⭐⭐ | 01-13 |

### 주제별 분포
- React (12개)
- TypeScript (8개)
- Git (5개)
```

### 복습 모드
```
## 🔄 복습이 필요한 항목

### 1. TypeScript 조건부 타입
📅 마지막 복습: 7일 전
📊 이해도: ⭐⭐⭐

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

[이해했어요 ✓] [다시 복습] [설명 보기]

---
남은 복습 항목: 4개
```

## 스페이스드 리피티션

복습 주기 자동 관리:
- 이해도 5: 30일 후 복습
- 이해도 4: 14일 후 복습
- 이해도 3: 7일 후 복습
- 이해도 2: 3일 후 복습
- 이해도 1: 1일 후 복습

## 예시

```bash
# 학습 기록 추가
/learn add "React useCallback은 함수 참조를 메모이제이션" --topic react

# 주제별 조회
/learn list --topic typescript

# 이번 주 학습
/learn list --period week

# 복습 시작
/learn review

# 퀴즈 모드
/learn quiz --topic react
```

## 데이터 저장
- `~/.glean/learn/` 에 저장
- 주제별 분류
- Markdown + JSON 메타데이터

## 구현 단계

### /learn add 구현
```
1. 입력 파싱 (내용, topic, difficulty 등)
2. learn-store.createLearnItem() 호출
3. 초기 confidence 3, nextReview 7일 후 설정
4. ~/.glean/learn/learn-xxx.json 저장
5. 결과 출력
```

### /learn list 구현
```
1. learn-store.getAllItems(filter) 호출
2. 필터 적용 (topic, period, status)
3. 테이블 형식으로 출력
4. 주제별/난이도별 통계 표시
```

### /learn review 구현
```
1. learn-store.getDueItems(limit) 호출
2. 우선순위순 정렬 (urgent → normal → low)
3. 각 항목에 대해:
   a. 내용 표시
   b. AskUserQuestion으로 이해도 질문
   c. learn-store.completeReview(id, confidence) 호출
   d. 다음 복습 일정 표시
4. 세션 종료 시 통계 표시
```

### /learn quiz 구현
```
1. 주제별 항목 필터링
2. 랜덤 순서로 출제
3. 각 항목:
   a. 제목만 표시
   b. "설명해보세요" 또는 "코드 예시?"
   c. 정답 공개 후 자기 평가
4. 결과 기반 confidence 업데이트
```

### 스페이스드 리피티션 상세

```javascript
// lib/spaced-repetition.js 사용

// 복습 후 다음 일정 계산
const { nextReview, newEaseFactor } = calculateNextReview(
  newConfidence,  // 1-5
  lastReview,     // 마지막 복습일
  reviewCount,    // 복습 횟수
  easeFactor      // SM-2 난이도 계수
);

// Mastered 조건
// confidence 5가 3회 연속 → status: 'mastered'
```

### 인사이트 → 학습 변환
```
/insight에서 --to-learn 옵션 시:
1. learning 타입 인사이트 필터
2. learn-store.createFromInsight(insight) 호출
3. insight-store.markAsConvertedToLearn(id, learnId)
```

## 연동
- `/harvest` - 세션에서 학습 항목 자동 추출
- `/insight` - 인사이트를 학습 기록으로 변환
- `/bridge` - 외부 플러그인 연동
