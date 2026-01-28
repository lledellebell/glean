# Contributing to Glean

Glean에 기여해주셔서 감사해요! 🌾

## How to Contribute

### Reporting Issues

버그를 발견하거나 기능 제안이 있다면 [GitHub Issues](https://github.com/lledellebell/glean/issues)에 등록해주세요.

**버그 리포트 포함 사항:**
- Glean 버전
- Claude Code 버전
- 재현 단계
- 예상 동작 vs 실제 동작
- 관련 로그/스크린샷

**기능 제안 포함 사항:**
- 문제 상황 설명
- 제안하는 해결책
- 대안 검토 여부

### Pull Requests

1. **Fork** 저장소
2. **Branch** 생성: `git checkout -b feature/your-feature`
3. **Commit** 변경사항
4. **Push**: `git push origin feature/your-feature`
5. **PR** 생성

### Commit Convention

커밋 메시지는 한글로 작성해요:

```
<type>: <subject>

<body>
```

**Type:**
| Type | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `docs` | 문서 수정 |
| `refactor` | 코드 리팩토링 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 설정 변경 |

**예시:**
```
feat: /remember 명령어에 태그 기능 추가

- --tag 옵션으로 메모리에 태그 지정 가능
- 태그별 필터링 지원
```

### Code Style

- 들여쓰기: 2 spaces
- 문자열: 작은따옴표 (`'`)
- 세미콜론: 사용
- 주석: 한글로 작성

### Directory Structure

```
glean/
├── commands/          # 공개 명령어
├── plugins/           # 플러그인 번들
│   └── {name}/
│       ├── plugin.json
│       └── commands/
├── docs/              # 공개 문서
└── shared/            # 공유 유틸리티
```

### Testing

PR 전에 확인할 것:
- [ ] 명령어가 정상 동작하는지
- [ ] 기존 기능이 깨지지 않았는지
- [ ] 문서가 업데이트되었는지

## Code of Conduct

- 서로 존중하기
- 건설적인 피드백 주고받기
- 다양성 존중하기

## Questions?

질문이 있으면 [Discussions](https://github.com/lledellebell/glean/discussions)에 남겨주세요.

감사합니다! 🙏
