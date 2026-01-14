# Glean 🌾

> **Nunca olvides lo que aprendes en las sesiones de programación con IA**

Glean recolecta automáticamente el conocimiento de tus sesiones de Claude Code y lo transforma en memoria a largo plazo usando repetición espaciada.

[English](./README.md) | [日本語](./README.ja.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@deeeep/glean.svg)](https://www.npmjs.com/package/@deeeep/glean)
[![Tests](https://img.shields.io/badge/tests-61%20passing-brightgreen.svg)]()
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Documentación-blue.svg)](https://deepwiki.com/lledellebell/glean)

## El Problema

Cuando terminan las sesiones de programación con IA, información valiosa desaparece:

- 💡 Patrones de código y convenciones que descubriste
- ⚠️ Errores que cometiste y cómo los solucionaste
- 📚 Conceptos que aprendiste (olvidados la próxima semana)
- 🔧 Comandos y flujos de trabajo útiles

**Glean** captura todo esto automáticamente y te ayuda a retenerlo permanentemente.

## Características

### 🌾 Recolección de Sesiones

Analiza tu sesión de programación con 8 agentes de IA especializados ejecutándose en paralelo:

| Agente | Propósito |
|--------|-----------|
| Session Analyzer | Generación de datos de recolección |
| Doc Analyzer | Sugerencias de actualización de documentación |
| Automation Finder | Detección de oportunidades de automatización |
| Learning Extractor | Extracción de puntos de aprendizaje |
| Followup Planner | Planificación de próximas tareas |
| Pattern Recognizer | Detección de patrones de código |
| Mistake Analyzer | Análisis de errores |
| Dedup Validator | Deduplicación de resultados |

### 🧠 Repetición Espaciada

Algoritmo SM-2 integrado programa revisiones en intervalos óptimos:

| Confianza | Próxima Revisión |
|-----------|------------------|
| ⭐⭐⭐⭐⭐ | 30 días |
| ⭐⭐⭐⭐ | 14 días |
| ⭐⭐⭐ | 7 días |
| ⭐⭐ | 3 días |
| ⭐ | 1 día |

### 🔌 Ecosistema de Plugins

12 plugins de características para gestión completa de sesiones:

| Plugin | Descripción |
|--------|-------------|
| `/harvest` | Recolección de conocimiento de sesiones |
| `/insight` | Extracción de patrones e insights |
| `/learn` | Aprendizaje con repetición espaciada |
| `/memory` | Memoria persistente (remember/recall) |
| `/context` | Guardar/restaurar contexto de sesión |
| `/plan` | Planificación y seguimiento de tareas |
| `/pr` | Automatización de pull requests |
| `/review` | Ayudante de revisión de código |
| `/history` | Búsqueda de historial de sesiones |
| `/sync` | Sincronización con herramientas externas |
| `/notify` | Gestión de notificaciones |
| `/stats` | Estadísticas de sesiones |

### 🌉 Integraciones Bridge

Conecta con herramientas externas:

- **Obsidian** - Exporta insights a tu vault
- **GitHub** - Crea issues desde tareas
- **Notion** - Sincroniza aprendizajes a bases de datos

## Instalación

### Instalación Manual

```bash
# Clona al directorio de plugins
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# O clona en cualquier lugar y referencia en settings
git clone https://github.com/lledellebell/glean.git ~/glean
```

### Configuración

Añade a tu configuración de Claude Code:

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## Inicio Rápido

```bash
# 1. Inicia una sesión con Claude Code
claude

# 2. Haz tu trabajo...

# 3. Recolecta conocimiento al final de la sesión
/glean

# 4. Revisa tus aprendizajes después
/learn review
```

## Comandos

### Comandos Principales

```bash
/glean              # Recolecta sesión actual (agentes paralelos)
/glean --verbose    # Salida detallada con todos los resultados

/harvest            # Recolección rápida de conocimiento
/harvest --full     # Análisis completo

/insight            # Extraer insights
/insight --type pattern   # Solo patrones
/insight --type mistake   # Solo errores
```

### Comandos de Aprendizaje

```bash
/learn add "React Query cachea por query key"  # Añadir aprendizaje
/learn list                                     # Ver aprendizajes
/learn review                                   # Iniciar sesión de revisión
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
├── harvests/     # Datos de recolección (JSON)
├── insights/     # Insights extraídos
├── learn/        # Items de aprendizaje con calendario de revisión
├── contexts/     # Contextos de sesión guardados
├── history/      # Historial de sesiones
└── config.json   # Configuración
```

## Contribuir

¡Damos la bienvenida a contribuciones! Ver [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licencia

Licencia MIT - Ver [LICENSE](./LICENSE)

## Autor

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Recuerda hoy lo que aprendiste ayer" 🧠

**¡Dale ⭐ a este repo si Glean te ayuda a aprender!**
