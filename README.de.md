# Glean

> **Vergessen Sie nie, was Sie in KI-Coding-Sessions lernen**

Glean erntet automatisch Wissen aus Ihren Claude Code Sessions und verwandelt es durch verteilte Wiederholung in Langzeitgedächtnis.

[English](./README.md) | [Español](./README.es.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Français](./README.fr.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![npm downloads](https://img.shields.io/npm/dm/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lledellebell/glean.svg)](https://github.com/lledellebell/glean/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/lledellebell/glean.svg)](https://github.com/lledellebell/glean/commits/main)
[![GitHub code size](https://img.shields.io/github/languages/code-size/lledellebell/glean.svg)](https://github.com/lledellebell/glean)
[![GitHub contributors](https://img.shields.io/github/contributors/lledellebell/glean.svg)](https://github.com/lledellebell/glean/graphs/contributors)
[![CI](https://github.com/lledellebell/glean/actions/workflows/ci.yml/badge.svg)](https://github.com/lledellebell/glean/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Dokumentation-blue.svg)](https://deepwiki.com/lledellebell/glean)

## Das Problem

Wenn KI-Coding-Sessions enden, gehen wertvolle Informationen verloren:

- Entdeckte Code-Patterns und Konventionen
- Gemachte Fehler und deren Lösungen
- Gelernte Konzepte (nächste Woche schon vergessen)
- Nützliche Befehle und Workflows

**Glean** erfasst all dies automatisch und hilft Ihnen, es dauerhaft zu behalten.

## Funktionen

### Session-Ernte

Analysieren Sie Ihre Coding-Session mit 9 spezialisierten KI-Agenten, die parallel arbeiten:

| Agent | Zweck |
|-------|-------|
| Session Analyzer | Generierung der Kern-Erntedaten |
| Doc Analyzer | Vorschläge für Dokumentationsaktualisierungen |
| Automation Finder | Erkennung von Automatisierungsmöglichkeiten |
| Learning Extractor | Extraktion von Lernpunkten |
| Followup Planner | Planung der nächsten Aufgaben |
| Pattern Recognizer | Erkennung von Code-Patterns |
| Mistake Analyzer | Analyse von Fehlern |
| Backfill Extractor | Rückwirkende Analyse vergangener Sessions |
| Dedup Validator | Deduplizierung der Ergebnisse |

### Verteilte Wiederholung

Der integrierte SM-2-Algorithmus plant Wiederholungen in optimalen Abständen:

| Sicherheit | Nächste Wiederholung |
|------------|----------------------|
| 5/5 | 30 Tage |
| 4/5 | 14 Tage |
| 3/5 | 7 Tage |
| 2/5 | 3 Tage |
| 1/5 | 1 Tag |

### Plugin-Ökosystem

12 Funktions-Plugins für umfassende Session-Verwaltung:

| Plugin | Beschreibung |
|--------|--------------|
| `/harvest` | Ernte von Session-Wissen |
| `/insight` | Extraktion von Patterns und Erkenntnissen |
| `/learn` | Lernen mit verteilter Wiederholung |
| `/memory` | Dauerhafter Speicher (remember/recall) |
| `/context` | Session-Kontext speichern/wiederherstellen |
| `/plan` | Aufgabenplanung und -verfolgung |
| `/pr` | Automatisierung des Pull-Request-Workflows |
| `/review` | Code-Review-Assistent |
| `/history` | Session-Historie durchsuchen |
| `/sync` | Synchronisation mit externen Tools |
| `/notify` | Benachrichtigungsverwaltung |
| `/stats` | Session-Statistiken |

### Bridge-Integrationen

Verbinden Sie sich mit externen Tools:

- **Obsidian** - Erkenntnisse in Ihren Vault exportieren
- **GitHub** - Issues aus Aufgaben erstellen
- **Notion** - Lerneinheiten mit Datenbanken synchronisieren

## Installation

### Claude Code Plugin Marketplace (Empfohlen)

<p align="center">
  <img src="./assets/glean.png" alt="Glean" width="300" />
</p>

```bash
claude plugin install glean-core@glean
```

### npm

```bash
npm install @deeeep/glean
```

### Manuelle Installation

```bash
# In Ihr Plugin-Verzeichnis klonen
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# Oder beliebig klonen und in den Einstellungen referenzieren
git clone https://github.com/lledellebell/glean.git ~/glean
```

### Konfiguration

Zu Ihren Claude Code Einstellungen hinzufügen:

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## Schnellstart

```bash
# 1. Einrichtungsassistent starten
npx @deeeep/glean init

# 2. Eine Coding-Session mit Claude Code starten
claude

# 3. Arbeiten...

# 4. Wissen am Ende der Session ernten
/glean

# 5. Gelerntes später wiederholen
/learn review
```

## CLI

```bash
# Einrichtungsassistent - Glean interaktiv konfigurieren
npx @deeeep/glean init

# Aktuelle Konfiguration prüfen
npx @deeeep/glean status

# Hilfe anzeigen
npx @deeeep/glean help
```

## Befehle

### Kernbefehle

```bash
/glean              # Aktuelle Session ernten (parallele Agenten)
/glean --verbose    # Detaillierte Ausgabe mit allen Agenten-Ergebnissen

/glean-backfill             # Vergangene Sessions rückwirkend analysieren (aktuelles Projekt)
/glean-backfill --all       # Alle Projekte rückwirkend analysieren
/glean-backfill --dry-run   # Vorschau ohne Speicherung

/harvest            # Schnelle Wissensernte
/harvest --full     # Umfassende Analyse

/insight            # Erkenntnisse extrahieren
/insight --type pattern   # Nur Patterns
/insight --type mistake   # Nur Fehler
```

### Lernbefehle

```bash
/learn add "React Query cached nach Query Key"  # Lerneinheit hinzufügen
/learn list                                      # Lerneinheiten anzeigen
/learn review                                    # Wiederholungssession starten
/learn quiz --topic react                        # Quiz-Modus
```

### Speicherbefehle

```bash
/remember "API verwendet camelCase für Antworten"  # Im Speicher sichern
/recall api                                         # Speicher durchsuchen
```

### Workflow-Befehle

```bash
/plan create "Auth-System"        # Entwicklungsplan erstellen
/plan add "Login-Formular"        # Aufgabe hinzufügen
/plan done 1                      # Als erledigt markieren

/pr create                        # Pull Request erstellen
/review src/                      # Code-Review
```

## Datenspeicherung

```
~/.glean/
├── harvests/     # Session-Erntedaten (JSON)
├── insights/     # Extrahierte Erkenntnisse
├── learn/        # Lernelemente mit Wiederholungsplan
├── contexts/     # Gespeicherte Session-Kontexte
├── history/      # Session-Historie
└── config.json   # Konfiguration
```

## Konfiguration

Erstellen Sie `~/.glean/config.json`:

```json
{
  "harvest": {
    "autoHarvest": true,
    "mode": "quick",
    "minDuration": 600
  },
  "learn": {
    "reviewReminder": true,
    "defaultConfidence": 3
  },
  "integrations": {
    "obsidian": {
      "enabled": true,
      "vaultPath": "~/Documents/Obsidian/Vault"
    }
  }
}
```

## Tests

```bash
# Alle Tests ausführen
npm test

# 83 Tests abdeckend:
# - Algorithmus für verteilte Wiederholung
# - Daten-Transformer
# - Plugin-Erkennung
```

## Mitwirken

Beiträge sind willkommen! Siehe [CONTRIBUTING.md](./CONTRIBUTING.md) für:

- Einrichtung der Entwicklungsumgebung
- Code-Richtlinien
- Testanforderungen
- Pull-Request-Prozess

## Roadmap

- [ ] Web-Dashboard für Wiederholungen
- [ ] Team-Wissensaustausch
- [ ] Weitere Integrationen (Linear, Jira)
- [ ] KI-gestützte Wiederholungsvorschläge

## Lizenz

MIT-Lizenz - Siehe [LICENSE](./LICENSE)

## Autor

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Erinnern Sie sich heute an das, was Sie gestern gelernt haben"

**Geben Sie diesem Repo einen Stern, wenn Glean Ihnen beim Lernen hilft!**
