# /history - 세션 히스토리

과거 세션 기록을 검색하고 탐색해요.

## 사용법
```
/history [--search <query>] [--limit <n>]
```

## 옵션
- `--search`: 키워드 검색
- `--limit`: 표시할 세션 수 - 기본: 10
- `--project`: 프로젝트 필터
- `--date`: 날짜 필터 (YYYY-MM-DD 또는 범위)
- `--tag`: 태그 필터

## 히스토리 항목

각 세션 기록에 포함되는 정보:
- 세션 ID
- 시작/종료 시간
- 프로젝트 경로
- 주요 작업 요약
- 수정한 파일 목록
- 커밋 (있는 경우)
- 태그

## 출력 형식

```
## 📜 세션 히스토리

### 최근 세션 (10개)

| # | 날짜 | 프로젝트 | 요약 | 시간 |
|---|------|---------|------|------|
| 1 | 01-15 | my-app | 인증 기능 구현 | 1h 20m |
| 2 | 01-15 | my-app | 버그 수정 | 30m |
| 3 | 01-14 | api-server | API 엔드포인트 추가 | 2h |
| ... | ... | ... | ... | ... |

---
세션 상세 보기: /history --id <session_id>
```

### 상세 보기

```
## 세션 상세 (#abc123)

📅 2024-01-15 14:30 ~ 15:50 (1h 20m)
📁 /Users/me/projects/my-app

### 작업 요약
- 사용자 인증 기능 구현
- JWT 토큰 처리 로직 추가
- 로그인/로그아웃 UI 작성

### 수정 파일
- src/auth/login.tsx (생성)
- src/auth/logout.tsx (생성)
- src/hooks/useAuth.ts (생성)
- src/api/auth.ts (수정)

### 커밋
- feat: 사용자 인증 기능 구현 (abc1234)

### 인사이트
- JWT 리프레시 토큰 패턴 적용
- httpOnly 쿠키로 보안 강화

### 태그
#auth #feature #react
```

## 검색 예시

```bash
# 키워드 검색
/history --search "인증"

# 최근 5개만
/history --limit 5

# 특정 프로젝트
/history --project my-app

# 날짜 범위
/history --date 2024-01-01:2024-01-15

# 태그로 검색
/history --tag auth

# 복합 검색
/history --search "API" --project api-server --limit 20
```

## 세션 복원

과거 세션의 컨텍스트를 현재 세션에 로드:

```bash
/history --restore <session_id>
```

복원되는 정보:
- 작업 중이던 파일들
- 발견한 인사이트
- 미완료 작업 목록

## 내보내기

```bash
# Markdown으로 내보내기
/history --export md --output ./session-log.md

# JSON으로 내보내기
/history --export json
```

## 데이터 위치
- `~/.glean/history/` 에 저장
- 세션별 JSON 파일
- 인덱스 파일로 빠른 검색

## 연동
- `/context` - 세션 컨텍스트 복원
- `/stats` - 히스토리 기반 통계
- `/sync` - 외부 도구로 동기화
