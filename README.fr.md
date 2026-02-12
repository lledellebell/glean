# Glean

> **N'oubliez jamais ce que vous apprenez lors de vos sessions de codage IA**

Glean récolte automatiquement les connaissances de vos sessions Claude Code et les transforme en mémoire à long terme grâce à la répétition espacée.

[English](./README.md) | [Español](./README.es.md) | [日本語](./README.ja.md) | [한국어](./README.ko.md) | [Deutsch](./README.de.md)

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
[![DeepWiki](https://img.shields.io/badge/DeepWiki-Documentation-blue.svg)](https://deepwiki.com/lledellebell/glean)

## Le problème

Quand les sessions de codage IA se terminent, des informations précieuses disparaissent :

- Les patterns et conventions de code découverts
- Les erreurs commises et comment les corriger
- Les concepts appris (oubliés dès la semaine suivante)
- Les commandes et workflows utiles

**Glean** capture tout cela automatiquement et vous aide à le retenir de façon permanente.

## Fonctionnalités

### Récolte de session

Analysez votre session de codage avec 8 agents IA spécialisés fonctionnant en parallèle :

| Agent | Objectif |
|-------|----------|
| Session Analyzer | Génération des données de récolte principales |
| Doc Analyzer | Suggestions de mise à jour de documentation |
| Automation Finder | Détection d'opportunités d'automatisation |
| Learning Extractor | Extraction des points d'apprentissage |
| Followup Planner | Planification des prochaines tâches |
| Pattern Recognizer | Détection de patterns de code |
| Mistake Analyzer | Analyse des erreurs/fautes |
| Dedup Validator | Déduplication des résultats |

### Répétition espacée

L'algorithme SM-2 intégré planifie les révisions à des intervalles optimaux :

| Confiance | Prochaine révision |
|-----------|--------------------|
| 5/5 | 30 jours |
| 4/5 | 14 jours |
| 3/5 | 7 jours |
| 2/5 | 3 jours |
| 1/5 | 1 jour |

### Écosystème de plugins

12 plugins fonctionnels pour une gestion complète des sessions :

| Plugin | Description |
|--------|-------------|
| `/harvest` | Récolte des connaissances de session |
| `/insight` | Extraction de patterns et d'insights |
| `/learn` | Apprentissage par répétition espacée |
| `/memory` | Mémoire persistante (remember/recall) |
| `/context` | Sauvegarde/restauration du contexte de session |
| `/plan` | Planification et suivi des tâches |
| `/pr` | Automatisation du workflow de Pull Request |
| `/review` | Assistant de revue de code |
| `/history` | Recherche dans l'historique des sessions |
| `/sync` | Synchronisation avec des outils externes |
| `/notify` | Gestion des notifications |
| `/stats` | Statistiques de session |

### Intégrations Bridge

Connectez-vous avec des outils externes :

- **Obsidian** - Exportez les insights vers votre coffre
- **GitHub** - Créez des issues à partir des tâches
- **Notion** - Synchronisez les apprentissages vers des bases de données

## Installation

### Claude Code Plugin Marketplace (Recommandé)

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

### Installation manuelle

```bash
# Clonez dans votre répertoire de plugins
git clone https://github.com/lledellebell/glean.git ~/.claude/plugins/glean

# Ou clonez n'importe où et référencez dans les paramètres
git clone https://github.com/lledellebell/glean.git ~/glean
```

### Configuration

Ajoutez à vos paramètres Claude Code :

```json
{
  "commandPaths": ["~/glean/commands", "~/glean/plugins/*/commands"]
}
```

## Démarrage rapide

```bash
# 1. Lancez l'assistant de configuration
npx @deeeep/glean init

# 2. Démarrez une session de codage avec Claude Code
claude

# 3. Travaillez...

# 4. Récoltez les connaissances en fin de session
/glean

# 5. Révisez vos apprentissages plus tard
/learn review
```

## CLI

```bash
# Assistant de configuration - configurez Glean de manière interactive
npx @deeeep/glean init

# Vérifiez la configuration actuelle
npx @deeeep/glean status

# Afficher l'aide
npx @deeeep/glean help
```

## Commandes

### Commandes principales

```bash
/glean              # Récolter la session en cours (agents parallèles)
/glean --verbose    # Sortie détaillée avec tous les résultats d'agents

/harvest            # Récolte rapide de connaissances
/harvest --full     # Analyse complète

/insight            # Extraire les insights
/insight --type pattern   # Patterns uniquement
/insight --type mistake   # Erreurs uniquement
```

### Commandes d'apprentissage

```bash
/learn add "React Query met en cache par query key"  # Ajouter un apprentissage
/learn list                                           # Voir les apprentissages
/learn review                                         # Démarrer une session de révision
/learn quiz --topic react                             # Mode quiz
```

### Commandes mémoire

```bash
/remember "L'API utilise camelCase pour les réponses"  # Sauvegarder en mémoire
/recall api                                             # Rechercher en mémoire
```

### Commandes workflow

```bash
/plan create "Système d'auth"     # Créer un plan de développement
/plan add "Ajouter formulaire"    # Ajouter une tâche
/plan done 1                      # Marquer comme terminé

/pr create                        # Créer une Pull Request
/review src/                      # Revue de code
```

## Stockage des données

```
~/.glean/
├── harvests/     # Données de récolte de session (JSON)
├── insights/     # Insights extraits
├── learn/        # Éléments d'apprentissage avec calendrier de révision
├── contexts/     # Contextes de session sauvegardés
├── history/      # Historique des sessions
└── config.json   # Configuration
```

## Configuration

Créez `~/.glean/config.json` :

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
# Exécuter tous les tests
npm test

# 61 tests couvrant :
# - Algorithme de répétition espacée
# - Transformateurs de données
# - Détection de plugins
```

## Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](./CONTRIBUTING.md) pour :

- Configuration de l'environnement de développement
- Directives de code
- Exigences de test
- Processus de Pull Request

## Feuille de route

- [ ] Tableau de bord web pour la révision
- [ ] Partage de connaissances en équipe
- [ ] Plus d'intégrations (Linear, Jira)
- [ ] Suggestions de révision alimentées par l'IA

## Licence

Licence MIT - Voir [LICENSE](./LICENSE)

## Auteur

**lledellebell** - [GitHub](https://github.com/lledellebell)

---

> "Souvenez-vous aujourd'hui de ce que vous avez appris hier"

**Mettez une étoile à ce dépôt si Glean vous aide à apprendre !**
