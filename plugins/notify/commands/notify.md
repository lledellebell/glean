# /notify - Notification Management

Manage session notifications and reminders.

## Usage
```
/notify <command> [options]
```

## Subcommands

### config - Notification Settings
```bash
/notify config [--channel <channel>] [--enable|--disable]
```

### test - Test Notification
```bash
/notify test [--channel <channel>]
```

### list - Scheduled Notifications
```bash
/notify list
```

### remind - Set Reminder
```bash
/notify remind "<message>" --at <time>
```

## Notification Channels

### Supported Channels
| Channel | Description | Setup Required |
|---------|-------------|----------------|
| terminal | Terminal bell/banner | None |
| macos | macOS Notification Centre | None |
| slack | Slack message | Webhook URL |
| discord | Discord message | Webhook URL |
| email | Email | SMTP settings |

### Configuration Example
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

## Notification Events

### Automatic Notifications
| Event | Description | Default Channel |
|-------|-------------|-----------------|
| sessionEnd | Session ended | terminal |
| longTask | Long task completed | terminal, macos |
| error | Error occurred | terminal |
| prUpdate | PR status changed | slack |
| reminder | Scheduled reminder | macos |

### Manual Notifications
```bash
/notify send "Build complete!" --channel slack
```

## Output Format

### View Settings
```
## 🔔 Notification Settings

### Active Channels
| Channel | Status | Config |
|---------|--------|--------|
| terminal | ✅ Active | - |
| macos | ✅ Active | - |
| slack | ✅ Active | webhook configured |
| discord | ❌ Inactive | - |

### Event Mapping
- sessionEnd → terminal, macos
- longTask → slack
- error → terminal
```

### Reminder List
```
## ⏰ Scheduled Reminders

| # | Time | Message | Channel |
|---|------|---------|---------|
| 1 | 17:00 | Join meeting | macos |
| 2 | Tomorrow 09:00 | Check PR review | slack |

Cancel: /notify cancel <#>
```

### Notification Example
```
🔔 Glean Notification

Session summary ready!

📊 Today's stats:
- Sessions: 3
- Time: 4h 30m
- Commits: 5

Details: /stats
```

## Examples

```bash
# View notification settings
/notify config

# Enable Slack
/notify config --channel slack --enable

# Test notification
/notify test --channel slack

# Set reminder
/notify remind "PR review" --at 17:00
/notify remind "Meeting" --at "tomorrow 10:00"

# Send notification immediately
/notify send "Task complete!" --channel macos
```

## Long Task Notifications

Notify when background task completes:

```bash
# Notify after build
npm run build && /notify send "Build complete"

# Or configure in .glean.json
{
  "notify": {
    "longTaskThreshold": 60,  // Tasks over 60 seconds
    "longTaskChannels": ["terminal", "macos"]
  }
}
```

## Data Storage
- Settings saved in `~/.glean/notify/`
- Reminder schedule management

## Related Commands
- `/pr` - PR status change notifications
- `/sync` - External service integration status
- `/done` - Session end notifications
