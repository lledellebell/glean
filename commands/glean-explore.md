---
allowed-tools: Read, Glob, Grep, Bash(ls:*), AskUserQuestion
description: Search across all stored knowledge with natural language
---

# /glean-explore - Knowledge Explorer

자연어로 전체 지식 저장소를 통합 검색해요.

## Arguments

- `<query>` - 검색 쿼리 (필수)
- `--source=<list>` - 검색 소스 필터 (insights,learn,daily,harvests)
- `--project=<name>` - 프로젝트 필터
- `--limit=<n>` - 최대 결과 수 (기본: 10)

## Execution Flow

1. **쿼리 파싱** - 인자에서 검색어와 옵션 추출
2. **통합 검색** - 모든 지식 저장소에서 유사도 기반 검색
   - `~/.glean/insights/` - 인사이트
   - `~/.glean/learn/` - 학습 항목
   - `~/.glean/daily/` - 일일 배움
   - `~/.glean/harvests/` - 세션 수확
3. **결과 정렬** - 관련도 순으로 정렬
4. **포맷 출력** - 소스별 아이콘과 함께 표시

## Output Format

```markdown
🔍 **검색 결과** (N건)

💡 **React Query staleTime 최적화** (85% 관련)
> 자주 변경되지 않는 데이터는 staleTime을 길게 설정...
_프로젝트: my-app | 날짜: 2025-01-15 | 태그: react, optimization_

📚 **Error Boundary 패턴** (72% 관련)
> React Error Boundary를 사용한 에러 처리 전략...
_프로젝트: my-app | 날짜: 2025-01-10_

📝 **useEffect cleanup 주의사항** (65% 관련)
> 비동기 작업 시 cleanup 함수에서 abort...
_프로젝트: my-app | 날짜: 2025-01-08_
```

## Examples

```bash
# 기본 검색
/glean-explore "React 상태 관리에서 겪은 실수들"

# 인사이트만 검색
/glean-explore "TypeScript 타입 에러" --source=insights

# 특정 프로젝트에서 검색
/glean-explore "성능 최적화" --project=my-app

# 결과 수 제한
/glean-explore "테스트 패턴" --limit=5
```
