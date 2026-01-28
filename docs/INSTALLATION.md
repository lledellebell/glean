# Glean 설치 가이드

Glean을 설치하고 설정하는 방법을 안내해요.

## 요구사항

- **Claude Code** CLI가 설치되어 있어야 해요
- **Node.js** 18.0.0 이상 (선택, 개발 시)
- **Git** (수동 설치 시)

## 설치 방법

### 방법 1: Claude Code 마켓플레이스 (권장)

마켓플레이스가 활성화되면 가장 간단한 방법이에요:

```bash
/install glean
```

### 방법 2: Git Clone

```bash
# 플러그인 디렉토리로 클론
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# 의존성 설치 (선택)
cd ~/.claude/plugins/glean
npm install
```

### 방법 3: 수동 다운로드

1. [GitHub Releases](https://github.com/lledellebell/glean/releases)에서 최신 버전 다운로드
2. 압축 해제 후 `~/.claude/plugins/glean`에 복사
3. Claude Code 재시작

## 설치 확인

설치가 완료되면 다음 명령어로 확인해요:

```bash
# 명령어 확인
/harvest --help

# 버전 확인
/glean --version
```

## 초기 설정

### 1. 설정 파일 생성

첫 실행 시 자동으로 기본 설정이 생성돼요. 직접 만들려면:

```bash
mkdir -p ~/.glean
```

`~/.glean/config.json`:
```json
{
  "autoHarvest": false,
  "minSessionDuration": 300,
  "reviewReminder": true,
  "language": "ko",
  "storage": {
    "path": "~/.glean",
    "maxHarvests": 100,
    "compressOld": true
  }
}
```

### 2. 데이터 디렉토리 구조

Glean이 사용하는 데이터 구조에요:

```
~/.glean/
├── config.json        # 전역 설정
├── harvests/          # 세션 수확 데이터
│   └── index.json     # 수확 인덱스
├── insights/          # 추출된 인사이트
│   └── index.json     # 인사이트 인덱스
├── learn/             # 학습 항목
│   └── items.json     # 학습 항목 목록
└── bridge/            # 플러그인 연동
    └── config.json    # 연동 설정
```

## 플러그인 연동 설정

### Obsidian 연동

Obsidian에 인사이트를 내보내려면:

```json
// ~/.glean/bridge.json
{
  "plugins": {
    "obsidian": {
      "enabled": true,
      "vaultPath": "~/Documents/Obsidian/MyVault",
      "autoSync": false
    }
  }
}
```

### claude-code 연동

커밋/PR에서 인사이트를 추출하려면:

```json
// ~/.glean/bridge.json
{
  "plugins": {
    "claude-code": {
      "enabled": true,
      "autoImport": false
    }
  }
}
```

## 업그레이드

### Git으로 설치한 경우

```bash
cd ~/.claude/plugins/glean
git pull origin main
```

### 마켓플레이스로 설치한 경우

```bash
/update glean
```

## 문제 해결

### 명령어가 인식되지 않아요

1. Claude Code 재시작
2. 플러그인 경로 확인: `~/.claude/plugins/glean`
3. `plugin.json` 존재 확인

### 데이터가 저장되지 않아요

1. 디렉토리 권한 확인: `ls -la ~/.glean`
2. 디스크 공간 확인
3. 설정 파일 JSON 문법 확인

### 연동 플러그인이 감지되지 않아요

```bash
# 감지 상태 확인
/bridge detect

# 수동으로 경로 지정
/bridge connect obsidian --path ~/Documents/Obsidian/MyVault
```

## 삭제

Glean을 삭제하려면:

```bash
# 플러그인 삭제
rm -rf ~/.claude/plugins/glean

# 데이터도 삭제하려면 (주의!)
rm -rf ~/.glean
```

## 다음 단계

설치가 완료되면 [사용법 가이드](./USAGE.md)를 참고해서 시작해보세요!
