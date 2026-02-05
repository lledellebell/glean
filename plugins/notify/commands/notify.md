# /notify - 알림 관리

세션 알림과 리마인더를 관리해요.

## 사용법
```
/notify <command> [options]
```

## 서브커맨드

### config - 알림 설정
```bash
/notify config [--channel <channel>] [--enable|--disable]
```

### test - 알림 테스트
```bash
/notify test [--channel <channel>]
```

### list - 예약된 알림
```bash
/notify list
```

### remind - 리마인더 설정
```bash
/notify remind "<메시지>" --at <time>
```

## 알림 채널

### 지원 채널
| 채널 | 설명 | 설정 필요 |
|------|------|----------|
| terminal | 터미널 벨/배너 | 없음 |
| macos | macOS 알림 센터 | 없음 |
| slack | Slack 메시지 | Webhook URL |
| discord | Discord 메시지 | Webhook URL |
| email | 이메일 | SMTP 설정 |

### 설정 예시
```json
{
  "notify": {
    "channels": {
      "terminal": { "enabled": true },
      "macos": { "enabled": true },
      "slack": {
        "enabled": true,
        "webhook": "$SLACK_WEBHOOK_URL"
      }
    },
    "events": {
      "sessionEnd": ["terminal", "macos"],
      "longTask": ["slack"],
      "error": ["terminal"]
    }
  }
}
```

## 알림 이벤트

### 자동 알림
| 이벤트 | 설명 | 기본 채널 |
|--------|------|----------|
| sessionEnd | 세션 종료 | terminal |
| longTask | 장시간 작업 완료 | terminal, macos |
| error | 에러 발생 | terminal |
| prUpdate | PR 상태 변경 | slack |
| reminder | 예약된 리마인더 | macos |

### 수동 알림
```bash
/notify send "빌드 완료!" --channel slack
```

## 출력 형식

### 설정 조회
```
## 🔔 알림 설정

### 활성 채널
| 채널 | 상태 | 설정 |
|------|------|------|
| terminal | ✅ 활성 | - |
| macos | ✅ 활성 | - |
| slack | ✅ 활성 | webhook 설정됨 |
| discord | ❌ 비활성 | - |

### 이벤트 매핑
- sessionEnd → terminal, macos
- longTask → slack
- error → terminal
```

### 리마인더 목록
```
## ⏰ 예약된 리마인더

| # | 시간 | 메시지 | 채널 |
|---|------|--------|------|
| 1 | 17:00 | 회의 참석 | macos |
| 2 | 내일 09:00 | PR 리뷰 확인 | slack |

취소: /notify cancel <#>
```

### 알림 예시
```
🔔 Glean 알림

세션 요약 준비됨!

📊 오늘 통계:
- 세션: 3회
- 시간: 4h 30m
- 커밋: 5개

자세히 보기: /stats
```

## 예시

```bash
# 알림 설정 보기
/notify config

# Slack 활성화
/notify config --channel slack --enable

# 테스트 알림
/notify test --channel slack

# 리마인더 설정
/notify remind "PR 리뷰" --at 17:00
/notify remind "회의" --at "tomorrow 10:00"

# 즉시 알림 보내기
/notify send "작업 완료!" --channel macos
```

## 장시간 작업 알림

백그라운드 작업 완료 시 알림:

```bash
# 빌드 완료 후 알림
npm run build && /notify send "빌드 완료"

# 또는 .glean.json 설정
{
  "notify": {
    "longTaskThreshold": 60,  // 60초 이상 작업
    "longTaskChannels": ["terminal", "macos"]
  }
}
```

## 데이터 저장
- `~/.glean/notify/` 에 설정 저장
- 리마인더 스케줄 관리

## 연동
- `/pr` - PR 상태 변경 알림
- `/sync` - 외부 서비스 연동 상태
- `/done` - 세션 종료 알림
