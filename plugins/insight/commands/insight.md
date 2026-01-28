# /insight - 세션 인사이트 추출

현재 세션에서 실행 가능한 인사이트를 추출해요.

## 사용법
```
/insight [--type <type>] [--export <format>]
```

## 옵션
- `--type`: 인사이트 유형 (pattern, mistake, optimization, all) - 기본: all
- `--export`: 내보내기 형식 (md, json, notion)

## 인사이트 유형

### 패턴 (pattern)
- 반복되는 코드 패턴
- 자주 사용하는 접근 방식
- 효과적인 문제 해결 전략

### 실수 (mistake)
- 발생한 에러와 해결 방법
- 잘못된 가정과 수정
- 피해야 할 안티패턴

### 최적화 (optimization)
- 성능 개선 기회
- 코드 품질 향상 제안
- 리팩토링 후보

## 실행 단계

### 1. 세션 분석
현재 세션의 대화 내용을 분석해서:
- 작성/수정한 코드
- 발생한 에러
- 사용한 도구와 명령어

### 2. 인사이트 추출
```
## 발견된 인사이트

### 🔄 패턴
- **커스텀 훅 구조**: useXxx 형태로 로직 분리
- **에러 바운더리**: 컴포넌트 레벨 에러 처리

### ⚠️ 실수에서 배운 것
- TypeScript strict 모드에서 null 체크 누락
- 해결: Optional chaining (?.) 일관 적용

### ⚡ 최적화 기회
- useMemo로 계산 비용 절감 가능한 컴포넌트 3개 발견
```

### 3. 저장 및 내보내기
- `~/.glean/insights/` 에 저장
- 프로젝트별 분류

## 출력 형식

```
## 세션 인사이트

📅 2024-01-15 | 프로젝트: my-app

### 핵심 발견
1. React Query의 staleTime 설정이 API 호출 최적화에 효과적
2. Zod 스키마로 런타임 타입 검증 추가

### 다음 세션에 적용할 것
- [ ] 비슷한 패턴의 다른 컴포넌트에도 적용
- [ ] 팀 문서에 패턴 공유

### 관련 리소스
- [React Query 공식 문서](https://tanstack.com/query)
```

## 예시

```bash
# 모든 인사이트 추출
/insight

# 실수에서 배운 것만
/insight --type mistake

# Notion으로 내보내기
/insight --export notion
```

## 구현 단계

이 명령어가 실행되면 다음 단계를 수행해:

### Step 1: 데이터 소스 결정
```
1. --from harvest: 최근 Harvest 데이터에서 추출
2. --from session: 현재 세션 직접 분석 (기본값)
3. --from all: 모든 소스 종합
```

### Step 2: 에이전트 실행

#### --type pattern 또는 all
```
Task 도구로 pattern-recognizer 에이전트 실행:
- agents/pattern-recognizer.md 참조
- 입력: Harvest 데이터 또는 세션 컨텍스트
```

#### --type mistake 또는 all
```
Task 도구로 mistake-analyzer 에이전트 실행:
- agents/mistake-analyzer.md 참조
- 입력: 세션의 에러/수정 내역
```

### Step 3: 중복 제거 및 검증
```
1. insight-store.checkDuplicate()로 기존 인사이트와 비교
2. confidence 0.7 미만 필터링
3. 유사 인사이트 병합
```

### Step 4: 저장
```
1. insight-store.saveInsights()로 저장
2. ~/.glean/insights/ 에 개별 JSON 파일
3. index.json 업데이트
```

### Step 5: 결과 출력
```
유형별로 그룹화해서 표시:
- 🔄 패턴 (N개)
- ⚠️ 실수 (N개)
- ⚡ 최적화 (N개)
- 📚 학습 (N개)

각 인사이트: 제목, 요약, confidence
```

### Step 6 (선택): 학습 변환
```
--to-learn 옵션 시:
learning 타입 인사이트를 /learn에 자동 추가
insight-store.markAsConvertedToLearn() 호출
```

## 서브커맨드

### /insight list
저장된 인사이트 목록 조회
```bash
/insight list [--type <type>] [--limit 10]
```

### /insight view <id>
특정 인사이트 상세 보기
```bash
/insight view pattern-20240115-abc1
```

### /insight apply <id>
인사이트 적용됨으로 표시
```bash
/insight apply pattern-20240115-abc1
```

## 연동
- `/harvest` - Harvest에서 인사이트 추출
- `/learn` - 학습 기록으로 변환
- `/bridge` - 외부 플러그인 연동
