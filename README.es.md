# Glean

> **Nunca olvides lo que aprendes en las sesiones de programacion con IA**

Glean recolecta automaticamente el conocimiento de tus sesiones de Claude Code y lo transforma en memoria a largo plazo usando repeticion espaciada.

[English](./README.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md)

<!-- Badges -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@lledellebell/glean.svg)](https://www.npmjs.com/package/@lledellebell/glean)
[![GitHub stars](https://img.shields.io/github/stars/lledellebell/glean.svg)](https://github.com/lledellebell/glean/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/lledellebell/glean.svg)](https://github.com/lledellebell/glean/issues)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## El Problema

Cuando terminan las sesiones de programacion con IA, informacion valiosa desaparece:

- Patrones de codigo y convenciones que descubriste
- Errores que cometiste y como los solucionaste
- Conceptos que aprendiste (olvidados la proxima semana)
- Comandos y flujos de trabajo utiles

**Glean** captura todo esto automaticamente y te ayuda a retenerlo permanentemente.

## Caracteristicas

### Recoleccion de Sesiones

Analiza tu sesion de programacion con agentes de IA especializados ejecutandose en paralelo:

| Agente | Proposito |
|--------|-----------|
| Doc Analyzer | Sugerencias de actualizacion de documentacion |
| Automation Finder | Deteccion de oportunidades de automatizacion |
| Learning Extractor | Extraccion de puntos de aprendizaje |
| Followup Planner | Planificacion de proximas tareas |
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

14 plugins para gestion completa de sesiones:

| Plugin | Descripcion |
|--------|-------------|
| `/harvest` | Recoleccion de conocimiento de sesiones |
| `/insight` | Extraccion de patrones e insights |
| `/learn` | Aprendizaje con repeticion espaciada |
| `/flashcard` | Revision con tarjetas (que/como/por que) |
| `/growth` | Visualizacion de progreso de aprendizaje |
| `/memory` | Memoria persistente (remember/recall) |
| `/context` | Guardar/restaurar contexto de sesion |
| `/plan` | Planificacion y seguimiento de tareas |
| `/pr` | Automatizacion de pull requests |
| `/review` | Ayudante de revision de codigo |
| `/history` | Busqueda de historial de sesiones |
| `/sync` | Sincronizacion con herramientas externas |
| `/notify` | Gestion de notificaciones |
| `/stats` | Estadisticas de sesiones |

### Alertas Automaticas (Hooks)

Glean proporciona hooks inteligentes que se activan automaticamente:

| Hook | Activador | Descripcion |
|------|-----------|-------------|
| **Deja-vu Alert** | Inicio de sesion | Detecta errores similares y muestra soluciones pasadas |
| **Daily One-liner** | Fin de sesion | Te invita a guardar el aprendizaje mas importante del dia |
| **Context Review** | Inicio de sesion | Muestra aprendizajes pasados relevantes para el proyecto actual |

### Integraciones Bridge

Conecta con herramientas externas:

- **Obsidian** - Exporta insights a tu vault
- **GitHub** - Crea issues desde tareas

## Instalacion

### npm (GitHub Packages)

```bash
npm install @lledellebell/glean
```

### Instalacion Manual

```bash
# Clona al directorio de plugins
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## Inicio Rapido

```bash
# 1. Inicia una sesion con Claude Code
claude

# 2. Haz tu trabajo...

# 3. Recolecta conocimiento al final de la sesion
/glean

# 4. Revisa tus aprendizajes
/learn review
# o
/flashcard
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

/flashcard                    # Revision con tarjetas
/flashcard --topic react      # Filtrar por tema
/flashcard --stats            # Ver estadisticas

/growth                       # Visualizacion de crecimiento
/growth --period=week         # Progreso de esta semana
/growth --quick               # Resumen rapido
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
├── daily/        # Aprendizajes diarios (one-liners)
├── contexts/     # Contextos de sesion guardados
├── history/      # Historial de sesiones
└── config/       # Configuracion
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
