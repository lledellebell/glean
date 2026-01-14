# Glean

> **Nunca olvides lo que aprendes en las sesiones de programacion con IA**

Glean recolecta automaticamente el conocimiento de tus sesiones de Claude Code y lo transforma en memoria a largo plazo usando repeticion espaciada.

[English](./README.md) | [日本語](./README.ja.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![npm downloads](https://img.shields.io/npm/dm/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lledellebell/glean.svg)](https://github.com/lledellebell/glean/network/members)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![GitHub last commit](https://img.shields.io/github/last-commit/lledellebell/glean.svg)](https://github.com/lledellebell/glean/commits/main)
[![Tests](https://img.shields.io/badge/tests-61%20passing-brightgreen.svg)]()
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Documentacion-blue.svg)](https://deepwiki.com/lledellebell/glean)

## El Problema

Cuando terminan las sesiones de programacion con IA, informacion valiosa desaparece:

- Patrones de codigo y convenciones que descubriste
- Errores que cometiste y como los solucionaste
- Conceptos que aprendiste (olvidados la proxima semana)
- Comandos y flujos de trabajo utiles

**Glean** captura todo esto automaticamente y te ayuda a retenerlo permanentemente.

## Caracteristicas

### Recoleccion de Sesiones

Analiza tu sesion de programacion con 8 agentes de IA especializados ejecutandose en paralelo:

| Agente | Proposito |
|--------|-----------|
| Session Analyzer | Generacion de datos de recoleccion |
| Doc Analyzer | Sugerencias de actualizacion de documentacion |
| Automation Finder | Deteccion de oportunidades de automatizacion |
| Learning Extractor | Extraccion de puntos de aprendizaje |
| Followup Planner | Planificacion de proximas tareas |
| Pattern Recognizer | Deteccion de patrones de codigo |
| Mistake Analyzer | Analisis de errores |
| Dedup Validator | Deduplicacion de resultados |

### Repeticion Espaciada

Algoritmo SM-2 integrado programa revisiones en intervalos optimos:

| Confianza | Proxima Revision |
|-----------|------------------|
| 5/5 | 30 dias |
| 4/5 | 14 dias |
| 3/5 | 7 dias |
| 2/5 | 3 dias |
| 1/5 | 1 dia |

### Ecosistema de Plugins

12 plugins de caracteristicas para gestion completa de sesiones:

| Plugin | Descripcion |
|--------|-------------|
| `/harvest` | Recoleccion de conocimiento de sesiones |
| `/insight` | Extraccion de patrones e insights |
| `/learn` | Aprendizaje con repeticion espaciada |
| `/memory` | Memoria persistente (remember/recall) |
| `/context` | Guardar/restaurar contexto de sesion |
| `/plan` | Planificacion y seguimiento de tareas |
| `/pr` | Automatizacion de pull requests |
| `/review` | Ayudante de revision de codigo |
| `/history` | Busqueda de historial de sesiones |
| `/sync` | Sincronizacion con herramientas externas |
| `/notify` | Gestion de notificaciones |
| `/stats` | Estadisticas de sesiones |

### Integraciones Bridge

Conecta con herramientas externas:

- **Obsidian** - Exporta insights a tu vault
- **GitHub** - Crea issues desde tareas
- **Notion** - Sincroniza aprendizajes a bases de datos

## Instalacion

### npm

```bash
npm install @deeeep/glean
```

### Instalacion Manual

```bash
# Clona al directorio de plugins
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# O clona en cualquier lugar y referencia en settings
git clone https://github.com/lledellebell/glean.git ~/glean
```

### Configuracion

Anade a tu configuracion de Claude Code:

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## Inicio Rapido

```bash
# 1. Inicia una sesion con Claude Code
claude

# 2. Haz tu trabajo...

# 3. Recolecta conocimiento al final de la sesion
/glean

# 4. Revisa tus aprendizajes despues
/learn review
```

## Comandos

### Comandos Principales

```bash
/glean              # Recolecta sesion actual (agentes paralelos)
/glean --verbose    # Salida detallada con todos los resultados

/harvest            # Recoleccion rapida de conocimiento
/harvest --full     # Analisis completo

/insight            # Extraer insights
/insight --type pattern   # Solo patrones
/insight --type mistake   # Solo errores
```

### Comandos de Aprendizaje

```bash
/learn add "React Query cachea por query key"  # Anadir aprendizaje
/learn list                                     # Ver aprendizajes
/learn review                                   # Iniciar sesion de revision
/learn quiz --topic react                       # Modo quiz
```

### Comandos de Memoria

```bash
/remember "API usa camelCase para respuestas"  # Guardar en memoria
/recall api                                     # Buscar en memoria
```

## Almacenamiento de Datos

```
~/.glean/
├── harvests/     # Datos de recoleccion (JSON)
├── insights/     # Insights extraidos
├── learn/        # Items de aprendizaje con calendario de revision
├── contexts/     # Contextos de sesion guardados
├── history/      # Historial de sesiones
└── config.json   # Configuracion
```

## Contribuir

Damos la bienvenida a contribuciones! Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

Licencia MIT - Ver [LICENSE](./LICENSE)

## Autor

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Recuerda hoy lo que aprendiste ayer"

**Dale estrella a este repo si Glean te ayuda a aprender!**
