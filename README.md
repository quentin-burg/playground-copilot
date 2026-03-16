# Task Manager — Cours IA Générative pour le Développement

> Projet de démonstration pour le cours "Qualité des Systèmes d'Information" — Master 2
>
> **Objectif**: Montrer comment utiliser l'IA générative (GitHub Copilot) avec des customisations (instructions, agents, skills, prompts) pour améliorer la qualité du développement TypeScript.

## 📋 Description

Application de gestion de tâches (Task Manager) avec:
- **Backend**: API REST TypeScript avec Fastify
- **Frontend**: Interface HTML + TypeScript vanilla
- **Validation**: Schémas Zod pour type-safety end-to-end
- **Tests**: Suite de tests unitaires avec Vitest
- **Documentation**: Générée automatiquement avec TypeDoc

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Vérifier les types TypeScript
npm run type-check

# Lancer les tests
npm test

# Générer la documentation
npm run docs
```

## 🔧 Développement

```bash
# Lancer le serveur de développement (avec hot reload)
npm run dev

# Le serveur démarre sur http://localhost:3000
# Frontend accessible sur http://localhost:3000/
# API accessible sur http://localhost:3000/api/v1/tasks
```

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Mode watch (re-exécution automatique)
npm run test:watch

# Avec couverture de code
npm run test:coverage
```

## 📝 Structure du Projet

```
cours_ia_init/
├── .github/                          # Customisations IA
│   ├── copilot-instructions.md       # Standards généraux
│   ├── instructions/                 # Instructions ciblées
│   ├── agents/                       # Agents custom
│   ├── skills/                       # Skills domain-specific
│   └── prompts/                      # Prompts réutilisables
├── src/
│   ├── api/                          # Code serveur
│   │   ├── server.ts                 # Point d'entrée Fastify
│   │   ├── routes/                   # Endpoints REST
│   │   └── schemas/                  # Schémas Zod
│   ├── models/                       # Types TypeScript
│   ├── utils/                        # Utilitaires
│   └── frontend/                     # Code client
│       ├── index.html
│       └── app.ts
├── tests/                            # Tests unitaires
└── docs/                             # Documentation générée

```

## 🎯 Concepts IA Démontrés

### 1. **Instructions Personnalisées**
Fichiers `.instructions.md` qui définissent les standards de code:
- **copilot-instructions.md**: Standards généraux (gestion erreurs, logs, immutabilité)
- **typescript.instructions.md**: Règles TypeScript strict (pas de `any`, type guards, branded types)
- **api-design.instructions.md**: Conventions REST (status codes, versioning)

### 2. **Agents Custom**
Modes spécialisés invocables via `/agent-name`:
- **testing-expert**: Génère des tests unitaires complets (structure AAA, fixtures typées)
- **quality-guard**: Review qualité code (checklist QSI, couverture, documentation)

### 3. **Skills Domain-Specific**
Base de connaissances pour domaines spécifiques:
- **validation-patterns**: Patterns validation Zod avec inférence de types
- **error-handling**: Gestion erreurs TypeScript (types custom, Error classes)

### 4. **Prompts Réutilisables**
Templates pour tâches répétitives:
- **generate-docs**: Génération documentation TypeDoc automatique
- **refactor-to-strict**: Migration code vers strict mode TypeScript

## 📚 API Endpoints

### Tasks

```http
GET    /api/v1/tasks           # Liste toutes les tâches
GET    /api/v1/tasks/:id       # Récupère une tâche par ID
POST   /api/v1/tasks           # Crée une nouvelle tâche
PUT    /api/v1/tasks/:id       # Met à jour une tâche
DELETE /api/v1/tasks/:id       # Supprime une tâche
```

### Exemple de Requête

```bash
# Créer une tâche
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Compléter le cours IA",
    "description": "Finir les exercices post-cours",
    "status": "todo"
  }'

# Lister les tâches
curl http://localhost:3000/api/v1/tasks
```

## 🎓 Pour les Étudiants

### Exercices Post-Cours

Consultez le fichier [EXERCICES.md](EXERCICES.md) pour:
- Exercice 1: Créer un agent "security-analyzer"
- Exercice 2: Créer un skill "async-patterns"
- Exercice 3: Créer une instruction "api-versioning"
- Exercice 4: Créer un prompt "generate-openapi"
- Exercice 5: Mini-projet personnel complet

### Utilisation des Customisations

1. **Voir les customisations actives**:
   - Ouvrir le panneau "AI Customization" dans VS Code
   - Toutes les instructions/agents/skills sont listés

2. **Invoquer un agent**:
   ```
   /testing-expert src/utils/validators.ts
   ```

3. **Invoquer un skill**:
   ```
   /skill validation-patterns
   ```

4. **Tester les instructions**:
   - Ouvrir un fichier `.ts` → l'instruction `typescript.instructions.md` s'applique
   - Demander à Copilot de générer du code → il respecte les standards

## 🔍 Vérification Qualité (QSI)

Le projet démontre plusieurs critères de qualité:

✅ **Type Safety**: `strict: true` dans tsconfig, aucun type `any`
✅ **Validation**: Schémas Zod pour entrées/sorties API
✅ **Tests**: Couverture > 80% avec tests unitaires
✅ **Documentation**: TypeDoc générée automatiquement
✅ **Linting**: ESLint configuré avec règles strictes
✅ **Formatting**: Prettier pour cohérence du code

## 📖 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Fastify Documentation](https://www.fastify.io/docs/latest/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

## 📄 Licence

MIT License — Projet pédagogique pour Master 2 QSI

---

**Bon apprentissage ! 🚀**
