---
allowed-tools: Read, Glob, Bash(ls:*)
description: Diagnose Glean setup and data health
---

# /glean-doctor - Health Check

Glean 설정 상태와 데이터 무결성을 진단해요.

## Arguments

- `--fix` - 자동 수정 가능한 문제 해결
- `--verbose` - 상세 진단 정보 표시

## Execution Flow

1. **디렉토리 확인**
   - `~/.glean/` 존재 여부
   - 하위 디렉토리 (harvests, insights, learn, daily, plans) 확인

2. **인덱스 파일 검증**
   - `index.json`, `stats.json` 파싱 가능 여부
   - 카운트 일관성 확인

3. **데이터 무결성**
   - 모든 JSON 파일 파싱 테스트
   - 깨진 파일 목록 표시

4. **설정 확인**
   - `global.json` 유효성
   - `plugin.json` 유효성

5. **플러그인 연결 상태**
   - Obsidian vault 감지
   - Git 연동 상태

## Output Format

```markdown
🩺 **Glean Doctor**

✅ ~/.glean/ 디렉토리 존재
✅ 모든 데이터 디렉토리 존재
✅ 인덱스 파일 정상
✅ 42개 데이터 파일 모두 정상
✅ 전역 설정 파일 정상
✅ plugin.json 정상

---
✅ **전체 정상** (6/6 통과)
```

### 문제 발견 시

```markdown
🩺 **Glean Doctor**

✅ ~/.glean/ 디렉토리 존재
⚠️ 일부 디렉토리 없음: daily, plans
❌ 깨진 인덱스 파일: learn/stats.json
✅ 38개 데이터 파일 중 36개 정상
❌ 2개 파일 깨짐
✅ 전역 설정 파일 정상

---
❌ **문제 발견** (통과: 3, 경고: 1, 오류: 2)
```

## Examples

```bash
# 기본 진단
/glean-doctor

# 상세 정보
/glean-doctor --verbose

# 자동 수정
/glean-doctor --fix
```
