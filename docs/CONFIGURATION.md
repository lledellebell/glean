# Glean Configuration Guide

## Configuration Files

Glean은 여러 레벨의 설정을 지원해요.

```
우선순위 (높음 → 낮음)
1. CLI 옵션          /glean --lang=ko
2. 프로젝트 설정      .glean.json
3. 전역 설정         ~/.glean/config/global.json
4. 기본값            내장 기본값
```

## Project Configuration

프로젝트 루트에 `.glean.json` 파일을 생성하세요.

### Full Schema

```json
{
  "$schema": "https://glean.dev/schema/config.json",

  // 언어 설정
  "language": "auto",  // auto | en | ko | ja | zh | es | fr | de | ...

  // 에이전트 설정
  "agents": {
    "doc-analyzer": true,
    "automation-finder": true,
    "learning-extractor": true,
    "followup-planner": true
  },

  // 에이전트별 세부 옵션
  "agentOptions": {
    "doc-analyzer": {
      "includeReadme": true,
      "maxSuggestions": 10,
      "minConfidence": 0.7
    },
    "automation-finder": {
      "minOccurrences": 2,
      "includeHooks": true,
      "includeCommands": true
    },
    "learning-extractor": {
      "shareGlobally": false,
      "categories": ["technical", "problem-solution", "unexpected", "tip"]
    },
    "followup-planner": {
      "maxTasks": 10,
      "includeEstimates": true
    }
  },

  // 대상 파일 설정
  "targets": {
    "docs": [
      "CLAUDE.md",
      "README.md",
      ".cursorrules"
    ],
    "rules": [
      ".claude/instructions/",
      ".cursor/rules/"
    ],
    "commands": [
      ".claude/commands/"
    ]
  },

  // 히스토리 설정
  "history": {
    "enabled": true,
    "retention": 90,           // 일 단위
    "location": "default",     // default | project | custom path
    "includeMetrics": true
  },

  // 팀 공유 설정
  "team": {
    "enabled": false,
    "sharedPath": ".team/learnings.md",
    "syncStrategy": "merge",   // merge | append | manual
    "autoSync": false,
    "filters": {
      "includePatterns": true,
      "includeSolutions": true,
      "includeContexts": false
    }
  },

  // 출력 설정
  "output": {
    "format": "markdown",      // markdown | json | yaml
    "sections": [
      "summary",
      "learnings",
      "suggestions",
      "followups"
    ],
    "verbose": false
  },

  // 액션 설정
  "actions": {
    "autoCommit": false,
    "commitPrefix": "docs: ",
    "autoApply": false,
    "confirmBeforeApply": true
  },

  // 무시 패턴
  "ignore": {
    "files": [
      "*.test.ts",
      "*.spec.ts"
    ],
    "patterns": [
      "TODO:",
      "FIXME:"
    ]
  }
}
```

## Common Configurations

### Minimal Setup

```json
{
  "language": "auto",
  "agents": {
    "doc-analyzer": true,
    "learning-extractor": true
  }
}
```

### Full Analytics

```json
{
  "language": "auto",
  "history": {
    "enabled": true,
    "retention": 365,
    "includeMetrics": true
  },
  "output": {
    "sections": ["summary", "learnings", "suggestions", "followups", "stats"]
  }
}
```

### Team Collaboration

```json
{
  "team": {
    "enabled": true,
    "sharedPath": ".team/learnings.md",
    "syncStrategy": "merge",
    "autoSync": true
  }
}
```

### Korean Project

```json
{
  "language": "ko",
  "targets": {
    "docs": ["CLAUDE.md"],
    "rules": [".claude/instructions/"]
  },
  "output": {
    "format": "markdown"
  }
}
```

## Global Configuration

전역 설정은 `~/.glean/config/global.json`에 저장돼요.

```json
{
  // 모든 프로젝트에 적용되는 기본값
  "defaults": {
    "language": "auto",
    "history": {
      "enabled": true,
      "retention": 90
    }
  },

  // 프로젝트별 오버라이드
  "projects": {
    "/Users/me/work/project-a": {
      "language": "en",
      "team": { "enabled": true }
    }
  },

  // 통계 설정
  "stats": {
    "enabled": true,
    "anonymousUsage": false
  }
}
```

## Tool-Specific Defaults

Glean은 감지된 도구에 따라 기본 설정을 조정해요.

### Claude Code

```json
{
  "targets": {
    "docs": ["CLAUDE.md"],
    "rules": [".claude/instructions/"],
    "commands": [".claude/commands/"]
  }
}
```

### Cursor

```json
{
  "targets": {
    "docs": [".cursorrules"],
    "rules": [".cursor/rules/"]
  }
}
```

### Windsurf

```json
{
  "targets": {
    "docs": [".windsurfrules"]
  }
}
```

### GitHub Copilot

```json
{
  "targets": {
    "docs": [".github/copilot-instructions.md"]
  }
}
```

## CLI Options

설정 파일 대신 CLI 옵션을 사용할 수도 있어요.

```bash
# 언어 지정
/glean --lang=ko

# 에이전트 선택
/glean --agents=doc-analyzer,learning-extractor

# 히스토리 건너뛰기
/glean --no-history

# 자동 적용
/glean --auto-apply

# 출력 형식
/glean --format=json

# 팀 동기화
/glean --team-sync

# 상세 출력
/glean --verbose

# 드라이 런
/glean --dry-run
```

## Environment Variables

환경 변수로도 설정할 수 있어요.

```bash
# 전역 설정 경로
export GLEAN_CONFIG_PATH=~/.config/glean

# 기본 언어
export GLEAN_LANGUAGE=ko

# 히스토리 비활성화
export GLEAN_HISTORY_ENABLED=false

# 팀 모드
export GLEAN_TEAM_ENABLED=true
```

## Configuration Validation

설정 파일 검증:

```bash
# 설정 검증
/glean config validate

# 현재 설정 출력
/glean config show

# 설정 초기화
/glean config init
```

## Migration

이전 버전에서 마이그레이션:

```bash
# 마이그레이션 체크
/glean config migrate --check

# 마이그레이션 실행
/glean config migrate
```
