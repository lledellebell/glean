# /bridge - Plugin Integration Hub

Integrate data with other Claude Code plugins.

## Usage
```
/bridge <command> [options]
```

## Subcommands

### detect - Plugin Detection
```bash
/bridge detect
```
Auto-detect installed plugins

### connect - Plugin Connection
```bash
/bridge connect <plugin>
```
Enable plugin integration

### sync - Data Synchronisation
```bash
/bridge sync [--plugin <name>] [--direction <import|export>]
```
Run data synchronisation

### status - Integration Status
```bash
/bridge status
```
Check current integration status

## Supported Plugins

| Plugin | Description | Data Direction |
|--------|-------------|----------------|
| claude-code | Official plugin (commits, PRs) | Import |
| task-master | Task management | Bidirectional |
| obsidian | Note app | Export |

## Output Format

### /bridge detect
```
## 🔍 Plugin Detection Results

| Plugin | Status | Version | Features |
|--------|--------|---------|----------|
| claude-code | ✅ Found | 1.2.0 | commits, prs |
| task-master | ❌ Not installed | - | - |
| obsidian | ✅ Found | 0.5.0 | notes |

Connectable: 2
```

### /bridge status
```
## 🔗 Bridge Status

### Connected Plugins (2)

| Plugin | Status | Last Sync | Item Count |
|--------|--------|-----------|------------|
| claude-code | 🟢 Connected | 1 hour ago | 15 commits |
| obsidian | 🟢 Connected | 30 min ago | 8 notes |

### Sync Statistics
- Total syncs: 24
- Items imported: 45
- Items exported: 32
```

### /bridge sync
```
## 🔄 Sync Results

### claude-code (Import)
✅ 5 commits imported
✅ 2 insights extracted from PRs

### obsidian (Export)
✅ 3 insights → notes converted
✅ 2 learn items → notes converted

---
Total processed: 12 items
```

## Implementation Steps

### /bridge detect Implementation
```
1. Use lib/bridge/plugin-detector.js
2. Call detectAllPlugins()
3. Display each plugin status
4. Guide available connections
```

### /bridge connect Implementation
```
1. Verify plugin exists
2. Update config file (~/.glean/bridge.json)
3. Run initial connection test
4. Enable capabilities on success
```

### /bridge sync Implementation
```
1. Check connected plugins
2. Based on direction:
   - import: External → Glean conversion
   - export: Glean → External conversion
3. Use data-transformer.js
4. Save results and report
```

## Configuration File

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

## Data Flow

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

## Examples

```bash
# Detect plugins
/bridge detect

# Connect claude-code
/bridge connect claude-code

# Export to obsidian
/bridge sync --plugin obsidian --direction export

# Sync all connected plugins
/bridge sync

# Check status
/bridge status
```

## Related Commands
- `/harvest` - Source for export data
- `/insight` - Import/export insights
- `/learn` - Export learning items
