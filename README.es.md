# Glean

> **Nunca olvides lo que aprendes en tus sesiones de programación con IA**

Glean recolecta automáticamente el conocimiento de tus sesiones de Claude Code y lo transforma en memoria a largo plazo usando repetición espaciada.

[English](./README.md) | [日本語](./README.ja.md)

## ¿Por qué Glean?

Cuando terminan las sesiones de programación con IA, información valiosa desaparece:

- Patrones de código y convenciones que descubriste
- Errores que cometiste y cómo los solucionaste
- Conceptos que aprendiste (olvidados para la próxima semana)

**Glean** captura todo esto automáticamente y te ayuda a retenerlo permanentemente.

## Características Principales

### `/glean` - Cosechador de Sesiones

Analiza tu sesión y extrae conocimiento valioso con agentes paralelos.

```bash
/glean              # Cosechar sesión actual
/glean --verbose    # Salida detallada
```

### `/harvest` - Recolección de Conocimiento

Recolecta insights de tu sesión de programación.

```bash
/harvest            # Cosecha rápida
/harvest --full     # Análisis completo
```

### Repetición Espaciada

Algoritmo SM-2 integrado programa revisiones en intervalos óptimos:

| Confianza | Próxima Revisión |
|-----------|------------------|
| ⭐⭐⭐⭐⭐ | 30 días |
| ⭐⭐⭐⭐ | 14 días |
| ⭐⭐⭐ | 7 días |
| ⭐⭐ | 3 días |
| ⭐ | 1 día |

## Instalación

### Desde el Marketplace de Claude Code

```bash
/install glean
```

### Instalación Manual

```bash
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean
```

## Inicio Rápido

```bash
# 1. Cosecha conocimiento al final de la sesión
/glean

# 2. Revisa las sugerencias
# 3. Aplica lo que has aprendido
```

## Almacenamiento de Datos

```
~/.glean/
├── harvests/     # Datos de cosecha de sesiones
├── insights/     # Insights extraídos
└── config.json   # Configuración
```

## Contribuir

Consulta [CONTRIBUTING.md](./CONTRIBUTING.md) para las directrices.

## Licencia

Licencia MIT - Ver [LICENSE](./LICENSE)

## Autor

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Recuerda hoy lo que aprendiste ayer" 🧠
