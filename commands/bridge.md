# /bridge - 플러그인 연동 허브

다른 Claude Code 플러그인들과 데이터를 연동해요.

## 사용법
```
/bridge <command> [options]
```

## 서브커맨드

### detect - 플러그인 감지
```bash
/bridge detect
```
설치된 플러그인 자동 감지

### connect - 플러그인 연결
```bash
/bridge connect <plugin>
```
플러그인 연동 활성화

### sync - 데이터 동기화
```bash
/bridge sync [--plugin <name>] [--direction <import|export>]
```
데이터 동기화 실행

### status - 연동 상태
```bash
/bridge status
```
현재 연동 상태 확인

## 지원 플러그인

| 플러그인 | 설명 | 데이터 방향 |
|---------|------|-----------|
| claude-code | 공식 플러그인 (커밋, PR) | Import |
| task-master | 태스크 관리 | Bidirectional |
| obsidian | 노트 앱 | Export |

## 출력 형식

### /bridge detect
```
## 🔍 플러그인 감지 결과

| 플러그인 | 상태 | 버전 | 기능 |
|---------|------|------|------|
| claude-code | ✅ 발견 | 1.2.0 | commits, prs |
| task-master | ❌ 미설치 | - | - |
| obsidian | ✅ 발견 | 0.5.0 | notes |

연결 가능: 2개
```

### /bridge status
```
## 🔗 Bridge 상태

### 연결된 플러그인 (2)

| 플러그인 | 상태 | 마지막 동기화 | 항목 수 |
|---------|------|-------------|--------|
| claude-code | 🟢 연결됨 | 1시간 전 | 15 commits |
| obsidian | 🟢 연결됨 | 30분 전 | 8 notes |

### 동기화 통계
- 총 동기화: 24회
- 가져온 항목: 45개
- 내보낸 항목: 32개
```

### /bridge sync
```
## 🔄 동기화 결과

### claude-code (Import)
✅ 5 commits 가져옴
✅ 2 PRs에서 인사이트 추출

### obsidian (Export)
✅ 3 insights → notes 변환
✅ 2 learn items → notes 변환

---
총 처리: 12 항목
```

## 구현 단계

### /bridge detect 구현
```
1. lib/bridge/plugin-detector.js 사용
2. detectAllPlugins() 호출
3. 각 플러그인 상태 표시
4. 연결 가능한 플러그인 안내
```

### /bridge connect 구현
```
1. 플러그인 존재 확인
2. 설정 파일 (~/.glean/bridge.json) 업데이트
3. 초기 연결 테스트
4. 성공 시 capabilities 활성화
```

### /bridge sync 구현
```
1. 연결된 플러그인 확인
2. 방향에 따라:
   - import: 외부 → Glean 변환
   - export: Glean → 외부 변환
3. data-transformer.js 사용
4. 결과 저장 및 보고
```

## 설정 파일

`~/.glean/bridge.json`:
```json
{
  "version": "1.0",
  "plugins": {
    "claude-code": {
      "enabled": true,
      "autoSync": false,
      "dataDirection": "import"
    },
    "obsidian": {
      "enabled": true,
      "autoSync": true,
      "syncInterval": 30,
      "dataDirection": "export",
      "config": {
        "vaultPath": "~/Documents/Obsidian/MyVault"
      }
    }
  },
  "globalSettings": {
    "autoDetect": true,
    "syncOnStartup": false
  }
}
```

## 데이터 흐름

```
┌─────────────────┐
│   claude-code   │
│  (commits, PR)  │
└────────┬────────┘
         │ import
         ▼
┌─────────────────┐
│      Glean      │
│ harvest/insight │
│     /learn      │
└────────┬────────┘
         │ export
         ▼
┌─────────────────┐
│    obsidian     │
│   (notes)       │
└─────────────────┘
```

## 예시

```bash
# 플러그인 감지
/bridge detect

# claude-code 연결
/bridge connect claude-code

# obsidian으로 내보내기
/bridge sync --plugin obsidian --direction export

# 모든 연결된 플러그인 동기화
/bridge sync

# 상태 확인
/bridge status
```

## 연동
- `/harvest` - 수확 데이터 내보내기 소스
- `/insight` - 인사이트 내보내기/가져오기
- `/learn` - 학습 항목 내보내기
