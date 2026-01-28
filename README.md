# Glean

> **AI 세션에서 배운 것을 절대 잊지 않게 해주는 도구**

Glean은 Claude Code 세션에서 지식을 자동으로 수확하고, 스페이스드 리피티션으로 장기 기억화하는 플러그인이에요.

## 왜 Glean인가요?

AI 코딩 세션이 끝나면 많은 가치 있는 정보가 사라져요:

- 새로 발견한 코드 패턴과 컨벤션
- 실수했다가 고친 내용 (같은 실수를 또 하게 됨)
- 배운 개념들 (다음 주면 잊어버림)

**Glean**은 이 모든 것을 자동으로 수집하고, 과학적인 복습 주기로 영구 기억화해줘요.

## 핵심 기능

### `/harvest` - 지식 수확

세션에서 가치 있는 정보를 자동 추출해요.

```bash
/harvest              # 현재 세션 수확
/harvest --all        # 상세 분석 포함
/harvest --dry-run    # 저장 없이 미리보기
```

추출하는 정보:
- 작성/수정한 파일과 패턴
- 발생한 에러와 해결 방법
- 사용한 도구와 명령어
- 대화에서 얻은 인사이트

### `/insight` - 인사이트 관리

수확된 데이터에서 실행 가능한 인사이트를 추출해요.

```bash
/insight extract      # 새 인사이트 추출
/insight list         # 저장된 인사이트 조회
/insight apply <id>   # 인사이트를 학습 항목으로 변환
```

인사이트 유형:
- **pattern**: 반복되는 좋은 패턴
- **mistake**: 실수에서 배운 것
- **optimization**: 개선 기회

### `/learn` - 스페이스드 리피티션 학습

인사이트를 장기 기억으로 만들어줘요.

```bash
/learn review         # 오늘 복습할 항목 확인
/learn add "내용"     # 수동으로 학습 항목 추가
/learn quiz           # 퀴즈 모드로 복습
/learn stats          # 학습 통계
```

복습 주기 (이해도 기반):
| 이해도 | 다음 복습 |
|--------|----------|
| ⭐⭐⭐⭐⭐ | 30일 후 |
| ⭐⭐⭐⭐ | 14일 후 |
| ⭐⭐⭐ | 7일 후 |
| ⭐⭐ | 3일 후 |
| ⭐ | 1일 후 |

### `/bridge` - 플러그인 연동

다른 인기 플러그인과 데이터를 연동해요.

```bash
/bridge detect        # 설치된 플러그인 감지
/bridge connect <plugin>  # 연동 활성화
/bridge sync          # 데이터 동기화
```

지원 플러그인:
| 플러그인 | 연동 방식 |
|---------|----------|
| anthropics/claude-code | 커밋/PR에서 인사이트 추출 |
| Obsidian | 노트로 내보내기 |

## 설치

### Claude Code 마켓플레이스에서 설치

```bash
/install glean
```

### 수동 설치

```bash
# 클론
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# 또는 npm
npm install -g glean-claude-code
```

## 빠른 시작

```bash
# 1. 세션 종료 시 지식 수확
/harvest

# 2. 인사이트 추출
/insight extract

# 3. 학습 항목으로 변환
/insight apply <insight-id>

# 4. 매일 복습
/learn review
```

## 자동화

Glean은 세션 종료 시 자동으로 수확을 제안해요. 설정에서 완전 자동화도 가능해요.

```json
// ~/.glean/config.json
{
  "autoHarvest": true,
  "minSessionDuration": 300,
  "reviewReminder": true
}
```

## 데이터 저장 위치

```
~/.glean/
├── harvests/          # 세션별 수확 데이터
├── insights/          # 추출된 인사이트
├── learn/             # 학습 항목 및 복습 기록
├── bridge/            # 플러그인 연동 데이터
└── config.json        # 설정
```

## 문서

- [설치 가이드](./docs/INSTALLATION.md)
- [사용법 상세](./docs/USAGE.md)
- [API 레퍼런스](./docs/API.md)
- [아키텍처](./docs/ARCHITECTURE.md)
- [PRD](./docs/PRD.md)

## 다른 플러그인과의 차별점

| 기능 | Glean | 다른 플러그인 |
|------|-------|-------------|
| 세션 지식 수확 | ✅ 자동 추출 | ❌ 없음 |
| 스페이스드 리피티션 | ✅ SM-2 알고리즘 | ❌ 없음 |
| 플러그인 간 연동 | ✅ Bridge Layer | ❌ 독립적 |
| 실수 패턴 추적 | ✅ 반복 실수 감지 | ❌ 없음 |

## 기여하기

[CONTRIBUTING.md](./CONTRIBUTING.md)를 참조해주세요.

## 라이선스

MIT License - [LICENSE](./LICENSE)

## 저자

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "오늘 배운 것을 내일도 기억하자" 🧠
