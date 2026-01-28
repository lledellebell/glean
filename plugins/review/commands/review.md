# /review - 코드 리뷰 도우미

코드 리뷰를 위한 체크리스트와 분석을 제공해요.

## 사용법
```
/review [<path>] [--type <type>] [--checklist]
```

## 옵션
- `--type`: 리뷰 유형 (security, performance, style, all) - 기본: all
- `--checklist`: 체크리스트 형식으로 출력
- `--diff`: Git diff 기반 리뷰
- `--pr <number>`: PR 리뷰

## 리뷰 카테고리

### 보안 (security)
- 입력 검증
- 인증/인가
- 민감 정보 노출
- SQL/XSS 인젝션

### 성능 (performance)
- 불필요한 렌더링
- 메모리 누수
- N+1 쿼리
- 큰 번들 사이즈

### 스타일 (style)
- 네이밍 컨벤션
- 코드 구조
- 중복 코드
- 주석/문서화

### 로직 (logic)
- 엣지 케이스
- 에러 처리
- 타입 안정성
- 테스트 커버리지

## 출력 형식

### 자동 리뷰
```
## 🔍 코드 리뷰: src/auth/login.tsx

### 🔴 중요 (2)

1. **보안: 비밀번호 로깅**
   ```tsx
   console.log('Login attempt:', { email, password }); // ❌
   ```
   → 민감 정보가 콘솔에 노출돼요.

2. **로직: 에러 처리 누락**
   ```tsx
   const response = await login(data);
   // 에러 처리 없음
   ```
   → try-catch로 에러 처리를 추가하세요.

### 🟡 권장 (3)

1. **성능: useCallback 누락**
   handleSubmit 함수가 매 렌더링마다 재생성돼요.

2. **스타일: 매직 넘버**
   `setTimeout(..., 3000)` → 상수로 추출 권장

### 🟢 좋은 점
- TypeScript strict 모드 활용
- 컴포넌트 분리 적절
```

### 체크리스트 모드
```
## ✅ 코드 리뷰 체크리스트

### 보안
- [ ] 사용자 입력 검증
- [x] XSS 방지 (dangerouslySetInnerHTML 미사용)
- [ ] 민감 정보 콘솔 출력 없음
- [x] HTTPS 사용

### 성능
- [ ] 불필요한 리렌더링 방지
- [x] 큰 리스트 가상화
- [ ] 이미지 최적화

### 스타일
- [x] 네이밍 컨벤션 준수
- [x] 파일 구조 적절
- [ ] 주석 충분

---
통과: 5/10 | 검토 필요: 5개
```

## PR 리뷰 모드

```bash
/review --pr 123
```

GitHub PR을 분석해서:
- 변경 파일별 리뷰
- 커밋 메시지 검토
- CI 상태 확인
- 리뷰 코멘트 제안

## 예시

```bash
# 현재 디렉토리 리뷰
/review

# 특정 파일
/review src/components/Button.tsx

# 보안 중점
/review --type security

# 체크리스트 형식
/review --checklist

# Git diff 리뷰
/review --diff

# PR 리뷰
/review --pr 123
```

## 커스텀 규칙

`.glean.json`에서 프로젝트별 규칙 설정:

```json
{
  "review": {
    "rules": {
      "no-console": "error",
      "max-file-lines": 300,
      "require-error-handling": "warn"
    },
    "ignore": ["*.test.ts", "*.spec.ts"]
  }
}
```

## 연동
- `/pr` - PR 생성 전 자동 리뷰
- `/insight` - 리뷰에서 발견한 패턴 기록
- `/learn` - 리뷰 피드백을 학습 기록으로
