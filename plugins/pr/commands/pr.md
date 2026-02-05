# /pr - Pull Request 워크플로우

PR 생성, 관리, 리뷰를 자동화해요.

## 사용법
```
/pr <command> [options]
```

## 서브커맨드

### create - PR 생성
```bash
/pr create [--title <title>] [--draft]
```

### list - PR 목록
```bash
/pr list [--state <state>] [--author <author>]
```

### view - PR 상세 보기
```bash
/pr view <number>
```

### review - PR 리뷰
```bash
/pr review <number>
```

### merge - PR 머지
```bash
/pr merge <number> [--squash|--rebase]
```

## PR 생성 워크플로우

### 1. 변경사항 분석
```
현재 브랜치: feature/auth
베이스 브랜치: main
커밋: 5개
변경 파일: 8개
```

### 2. PR 템플릿 생성
```markdown
## Summary
- 사용자 인증 기능 구현
- JWT 토큰 기반 로그인/로그아웃
- 토큰 갱신 로직 추가

## Changes
- `src/auth/` - 인증 관련 컴포넌트
- `src/hooks/useAuth.ts` - 인증 훅
- `src/api/auth.ts` - API 클라이언트

## Test Plan
- [x] 로그인 성공 케이스
- [x] 로그인 실패 케이스
- [x] 토큰 만료 시 갱신
- [ ] E2E 테스트

## Screenshots
(해당 시 추가)
```

### 3. 자동 체크
PR 생성 전 자동 검사:
- [ ] 린트 통과
- [ ] 타입 체크 통과
- [ ] 테스트 통과
- [ ] 코드 리뷰 (/review)

## 출력 형식

### PR 생성
```
✅ PR 생성됨

🔗 #123: feat: 사용자 인증 기능 구현
📌 feature/auth → main

상태: Draft
리뷰어: 미지정
라벨: feature, auth

URL: https://github.com/user/repo/pull/123

다음 단계:
- /pr review 123 으로 셀프 리뷰
- 리뷰어 지정 후 Ready 전환
```

### PR 목록
```
## 📋 Pull Requests

| # | 제목 | 상태 | 작성자 | 업데이트 |
|---|------|------|--------|----------|
| 123 | feat: 인증 기능 | 🟡 Draft | me | 1h ago |
| 120 | fix: 버그 수정 | 🟢 Open | me | 2d ago |
| 118 | docs: README | ✅ Merged | other | 3d ago |

Open: 2 | Draft: 1 | Merged: 15
```

### PR 상세
```
## PR #123: feat: 사용자 인증 기능

📌 feature/auth → main
👤 작성자: me
📅 생성: 2024-01-15
🏷️ 라벨: feature, auth

### CI 상태
- ✅ lint
- ✅ typecheck
- ✅ test
- ⏳ deploy-preview

### 리뷰
- 🟡 reviewer1: Changes requested
- ⏳ reviewer2: Pending

### 변경 파일 (8)
+342 -45 across 8 files
```

## 예시

```bash
# PR 생성 (자동 제목)
/pr create

# Draft PR 생성
/pr create --draft

# 제목 지정
/pr create --title "feat: 인증 기능"

# 내 PR 목록
/pr list --author me

# PR 상세 보기
/pr view 123

# PR 리뷰
/pr review 123

# Squash 머지
/pr merge 123 --squash
```

## 자동화 옵션

`.glean.json` 설정:
```json
{
  "pr": {
    "template": ".github/PULL_REQUEST_TEMPLATE.md",
    "autoReview": true,
    "requiredChecks": ["lint", "typecheck", "test"],
    "defaultReviewers": ["teammate1", "teammate2"]
  }
}
```

## 연동
- `/review` - PR 생성 전 코드 리뷰
- `/history` - PR 관련 세션 기록
- `/sync --github` - GitHub Issues 연동
- `/notify` - PR 상태 알림
