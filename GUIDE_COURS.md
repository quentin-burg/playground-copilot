# Guide de Démarrage — Cours IA Générative

Bienvenue dans ce projet de démonstration pour le cours d'initiation à l'IA générative dans le développement !

## 🎯 Objectifs du Cours

Ce cours démontre comment utiliser les **customisations GitHub Copilot** pour améliorer la qualité du code TypeScript :

1. **Instructions personnalisées** — Standards de code automatiques
2. **Agents custom** — Modes spécialisés pour tester, reviewer
3. **Skills** — Base de connaissances pour domaines spécifiques
4. **Prompts réutilisables** — Automatisation de tâches répétitives

## 🚀 Installation & Démarrage Rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer les tests (vérification qualité)
npm test

# 3. Lancer le serveur de développement
npm run dev

# Le serveur démarre sur http://localhost:3000
# Frontend: http://localhost:3000/
# API: http://localhost:3000/api/v1/tasks
```

## 📁 Structure du Projet

```
cours_ia_init/
├── .github/                          # ⭐ Customisations IA
│   ├── copilot-instructions.md       # Standards généraux du projet
│   ├── instructions/                 # Instructions ciblées
│   │   ├── typescript.instructions.md
│   │   └── api-design.instructions.md
│   ├── agents/                       # Agents custom invocables
│   │   ├── testing-expert.agent.md
│   │   └── quality-guard.agent.md
│   ├── skills/                       # Base de connaissances
│   │   ├── validation-patterns/SKILL.md
│   │   └── error-handling/SKILL.md
│   └── prompts/                      # Prompts réutilisables
│       ├── generate-docs.prompt.md
│       └── refactor-to-strict.prompt.md
├── src/
│   ├── api/                          # Backend API REST
│   │   ├── server.ts                 # Serveur Fastify
│   │   ├── routes/tasks.ts           # Endpoints CRUD
│   │   ├── schemas/task.schema.ts    # Validation Zod
│   │   └── services/task.service.ts  # Logique métier
│   ├── models/task.model.ts          # Types TypeScript
│   ├── utils/errors.ts               # Classes d'erreur custom
│   └── frontend/                     # Frontend simple
│       ├── index.html
│       └── app.ts
├── tests/                            # Tests unitaires
│   ├── services/task.service.test.ts
│   └── schemas/task.schema.test.ts
├── EXERCICES.md                      # ⭐ Exercices post-cours
└── README.md                         # Documentation principale
```

## 🎓 Comment Utiliser les Customisations

### 1. Voir les Customisations Actives

Ouvrez le panneau **"AI Customization"** dans VS Code :
- Cmd+Shift+P (Mac) ou Ctrl+Shift+P (Windows/Linux)
- Recherchez "AI Customization"
- Vous verrez toutes les instructions, agents, skills listés

### 2. Utiliser un Agent Custom

Dans le chat GitHub Copilot, tapez:

```
/testing-expert src/utils/validators.ts
```

L'agent génère automatiquement des tests complets avec:
- Structure Arrange-Act-Assert
- Fixtures typées avec `as const`
- Couverture des cas nominaux + edge cases

```
/quality-guard src/api/services/task.service.ts
```

L'agent effectue une revue qualité complète:
- Type safety (aucun `any`)
- Couverture de tests
- Documentation TSDoc
- Standards du projet

### 3. Invoquer un Skill

```
/skill validation-patterns
```

Le skill vous guide pour:
- Créer des schémas Zod
- Inférer les types TypeScript
- Gérer les erreurs de validation
- Patterns avancés (transformations, refinements)

### 4. Utiliser un Prompt

Les prompts s'invoquent comme des commandes, par exemple:

```
Utilise le prompt "generate-docs" pour générer la documentation TypeDoc
```

Le prompt:
1. Scanne tous les fichiers TypeScript
2. Génère les commentaires TSDoc manquants
3. Configure TypeDoc
4. Génère la documentation HTML

## 💡 Démonstration Pratique

### Exemple 1: Créer une Nouvelle Route API

1. **Ouvrez** `src/api/routes/tasks.ts`
2. **Demandez** à Copilot: "Ajoute un endpoint GET /api/v1/tasks/stats qui retourne les statistiques"
3. **Observez**: Copilot applique automatiquement:
   - Structure d'endpoint correcte (`/api/v1/...`)
   - Validation des données (Zod)
   - Gestion d'erreurs avec classes custom
   - Documentation TSDoc

→ C'est l'instruction `api-design.instructions.md` qui guide Copilot !

### Exemple 2: Écrire des Tests

1. **Invoquez** l'agent: `/testing-expert src/api/routes/tasks.ts`
2. **L'agent produit**:
   - Tests pour tous les endpoints
   - Mocks appropriés
   - Assertions complètes
   - Cas d'erreur (404, 400, etc.)

### Exemple 3: Vérifier la Qualité

1. **Invoquez** l'agent: `/quality-guard`
2. **L'agent analyse**:
   - Couverture de tests (doit être >80%)
   - Présence de types `any`
   - Documentation manquante
   - Conformité aux standards

3. **Rapport généré**:
```markdown
## Quality Report

### ✅ Type Safety: 🟢 Excellent
- 0 occurrences de `any`
- Tous les types explicites

### ✅ Test Coverage: 🟢 Excellent
- Lines: 85%
- Branches: 82%
- Functions: 90%

### Documentation: 🟡 Acceptable
- 12/15 fonctions documentées (80%)
- **Action requise**: Documenter `validateTask()`, `formatDate()`, `sanitizeInput()`
```

## 📊 Vérification Qualité (QSI)

Exécutez la checklist complète:

```bash
# 1. Vérification des types
npm run type-check
# ✅ 0 erreurs TypeScript

# 2. Linting
npm run lint
# ✅ 0 warnings ESLint

# 3. Tests avec couverture
npm run test:coverage
# ✅ 33/33 tests passent
# ✅ Couverture: 85%+ (lines, branches, functions)

# 4. Documentation
npm run docs
# ✅ Documentation générée dans docs/
```

## 🎯 Exercices Post-Cours

Consultez [EXERCICES.md](EXERCICES.md) pour approfondir:

1. **⭐⭐☆☆☆** Créer un agent "security-analyzer"
2. **⭐⭐⭐☆☆** Créer un skill "async-patterns"
3. **⭐⭐☆☆☆** Créer une instruction "api-versioning"
4. **⭐⭐⭐⭐☆** Créer un prompt "generate-openapi"
5. **⭐⭐⭐⭐⭐** Mini-projet personnel complet

## 📚 Ressources Complémentaires

- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation Fastify](https://www.fastify.io/docs/latest/)
- [Documentation Zod](https://zod.dev/)
- [Documentation Vitest](https://vitest.dev/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

## 🔍 Points Clés à Retenir

### 1. Instructions = Standards Automatiques

Au lieu de documenter des règles dans un wiki que personne ne lit, les **instructions** les appliquent automatiquement :

```markdown
<!-- .github/instructions/typescript.instructions.md -->
---
applyTo: "**/*.ts"
---
# Jamais de type `any`, utiliser `unknown` avec type guards
```

→ Copilot respecte cette règle dans **tous** les fichiers `.ts`

### 2. Agents = Expertise Spécialisée

Au lieu de chercher sur Stack Overflow comment écrire des tests, l'**agent testing-expert** le fait pour vous avec les bonnes pratiques du projet.

### 3. Skills = Documentation Vivante

Au lieu de documenter des patterns dans Confluence, les **skills** sont invoqués au bon moment avec des exemples concrets.

### 4. Prompts = Automatisation

Au lieu de répéter manuellement des tâches (générer docs, migrer code), les **prompts** les automatisent.

## 🎉 Conclusion

Ce projet démontre comment l'IA générative, **bien configurée**, devient un amplificateur de qualité plutôt qu'un générateur de code médiocre.

**La clé**: Ne pas utiliser Copilot "brut", mais le customiser selon vos standards !

---

**Questions ?** Consultez le [README.md](README.md) principal ou les [EXERCICES.md](EXERCICES.md)

**Bon cours ! 🚀**
