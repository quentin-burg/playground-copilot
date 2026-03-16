---
name: "generate-docs"
description: "Génère automatiquement la documentation TypeDoc à partir du code source TypeScript. Utiliser pour créer/mettre à jour la documentation du projet."
---

# Generate Documentation Prompt

Ce prompt génère automatiquement la documentation TypeDoc complète pour le projet TypeScript.

## Objectif

Analyser le code TypeScript du projet et générer:
1. **Commentaires TSDoc** pour toutes les fonctions/classes exportées
2. **Configuration TypeDoc** optimale
3. **Documentation HTML** dans le dossier `docs/`
4. **README** mis à jour avec liens vers la documentation

## Instructions

### Étape 1: Analyser le Code

Scannez tous les fichiers TypeScript dans `src/` et identifiez:
- Toutes les fonctions exportées
- Toutes les classes exportées
- Toutes les interfaces exportées
- Tous les types exportés

### Étape 2: Générer/Compléter les Commentaires TSDoc

Pour chaque export public **sans documentation** ou **avec documentation incomplète**, ajoutez des commentaires TSDoc complets:

```typescript
/**
 * [Description courte d'une ligne]
 *
 * [Description détaillée optionnelle sur plusieurs lignes]
 *
 * @param paramName - Description du paramètre
 * @param optionalParam - Description du paramètre optionnel
 * @returns Description de ce qui est retourné
 * @throws {ErrorType} Quand cette erreur est lancée
 *
 * @example
 * ```typescript
 * const result = functionName('example');
 * console.log(result);
 * ```
 *
 * @see {@link RelatedFunction} Fonction liée
 * @since 1.0.0
 */
export function functionName(paramName: string, optionalParam?: number): ReturnType {
  // ...
}
```

**Règles pour les commentaires**:
- Description courte: 1 phrase, commence par un verbe d'action
- @param: Décrire le rôle et les valeurs attendues
- @returns: Décrire ce qui est retourné et dans quelles conditions
- @throws: Lister toutes les erreurs possibles (NotFoundError, ValidationError, etc.)
- @example: Fournir au moins un exemple d'utilisation réaliste
- Utiliser markdown dans les descriptions (liens, code inline, listes)

### Étape 3: Créer/Mettre à Jour typedoc.json

Créez ou mettez à jour le fichier `typedoc.json` à la racine:

```json
{
  "$schema": "https://typedoc.org/schema.json",
  "entryPoints": ["src"],
  "entryPointStrategy": "expand",
  "out": "docs",
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/node_modules/**"
  ],
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeInternal": true,
  "readme": "README.md",
  "name": "Task Manager API Documentation",
  "includeVersion": true,
  "sort": ["source-order"],
  "kindSortOrder": [
    "Project",
    "Module",
    "Namespace",
    "Class",
    "Interface",
    "TypeAlias",
    "Function",
    "Variable"
  ],
  "navigation": {
    "includeCategories": true,
    "includeGroups": true
  },
  "plugin": [],
  "theme": "default",
  "lightHighlightTheme": "light-plus",
  "darkHighlightTheme": "dark-plus",
  "validation": {
    "notExported": true,
    "invalidLink": true,
    "notDocumented": false
  },
  "treatWarningsAsErrors": false
}
```

### Étape 4: Organiser avec @category et @group

Utilisez les tags TSDoc pour organiser la documentation:

```typescript
/**
 * Récupère une tâche par son ID
 *
 * @category Task Management
 * @group CRUD Operations
 */
export function getTaskById(id: string): ITask | null {
  // ...
}

/**
 * Valide les données d'une tâche
 *
 * @category Validation
 * @group Validators
 */
export function validateTask(data: unknown): Result<ITask> {
  // ...
}
```

### Étape 5: Générer la Documentation

Exécutez TypeDoc:

```bash
npm run docs
```

Vérifiez que:
- Le dossier `docs/` a été créé
- Aucune erreur ou warning TypeDoc
- Tous les exports sont documentés
- Les exemples fonctionnent

### Étape 6: Mettre à Jour README.md

Ajoutez une section "Documentation" dans le README:

```markdown
## 📖 Documentation

La documentation complète de l'API est disponible dans le dossier `docs/`.

Pour consulter la documentation:

1. Générer la documentation:
   ```bash
   npm run docs
   ```

2. Ouvrir dans le navigateur:
   ```bash
   open docs/index.html
   ```

### Documentation par Module

- **[Task Management](docs/modules/Task_Management.html)** — Gestion des tâches (CRUD)
- **[Validation](docs/modules/Validation.html)** — Schémas Zod et validateurs
- **[Error Handling](docs/modules/Error_Handling.html)** — Classes d'erreur custom
- **[API Routes](docs/modules/API_Routes.html)** — Endpoints REST

### Exemples de Code

Consultez la section "Examples" de chaque fonction pour voir des cas d'utilisation concrets.
```

## Checklist de Qualité

Avant de considérer la documentation comme complète:

- [ ] Toutes les fonctions/classes exportées ont un commentaire TSDoc
- [ ] Tous les `@param` sont documentés avec leur type et rôle
- [ ] Tous les `@returns` décrivent le retour
- [ ] Toutes les `@throws` listent les erreurs possibles
- [ ] Au moins un `@example` par fonction publique importante
- [ ] `typedoc.json` configuré correctement
- [ ] `npm run docs` s'exécute sans erreur
- [ ] Documentation HTML générée et lisible
- [ ] README.md contient un lien vers la documentation

## Priorités

**Haute priorité** (documenter en premier):
1. Fonctions CRUD principales (create, read, update, delete)
2. Schémas de validation (Zod)
3. Classes d'erreur custom
4. Routes API endpoints

**Moyenne priorité**:
1. Fonctions utilitaires exportées
2. Types et interfaces publics
3. Helpers et formatters

**Basse priorité**:
1. Fonctions internes (non exportées)
2. Tests
3. Configurations

## Exemples de Documentation par Type

### Fonction Simple

```typescript
/**
 * Génère un identifiant unique pour une tâche
 *
 * @returns Un UUID v4 valide
 *
 * @example
 * ```typescript
 * const id = generateTaskId();
 * console.log(id); // "550e8400-e29b-41d4-a716-446655440000"
 * ```
 */
export function generateTaskId(): string {
  return crypto.randomUUID();
}
```

### Fonction avec Erreurs

```typescript
/**
 * Récupère une tâche par son identifiant
 *
 * Cette fonction effectue une recherche dans la collection de tâches en mémoire.
 * Si la tâche n'existe pas, une erreur NotFoundError est lancée.
 *
 * @param id - L'identifiant unique de la tâche (UUID v4)
 * @returns La tâche trouvée avec tous ses champs
 * @throws {NotFoundError} Si aucune tâche avec cet ID n'existe
 * @throws {ValidationError} Si l'ID n'est pas un UUID valide
 *
 * @example
 * ```typescript
 * try {
 *   const task = getTaskById('550e8400-e29b-41d4-a716-446655440000');
 *   console.log(task.title);
 * } catch (err) {
 *   if (err instanceof NotFoundError) {
 *     console.error('Task not found');
 *   }
 * }
 * ```
 *
 * @see {@link createTask} pour créer une nouvelle tâche
 * @see {@link updateTask} pour modifier une tâche existante
 */
export function getTaskById(id: string): ITask {
  // ...
}
```

### Classe

```typescript
/**
 * Service de gestion des tâches
 *
 * Cette classe fournit toutes les opérations CRUD pour les tâches,
 * avec validation automatique des données et gestion des erreurs.
 *
 * @example
 * ```typescript
 * const service = new TaskService();
 *
 * // Créer une tâche
 * const task = service.create({
 *   title: 'My task',
 *   status: 'todo'
 * });
 *
 * // Récupérer une tâche
 * const found = service.getById(task.id);
 *
 * // Mettre à jour
 * service.update(task.id, { status: 'done' });
 *
 * // Supprimer
 * service.delete(task.id);
 * ```
 */
export class TaskService {
  /**
   * Collection de tâches en mémoire
   * @private
   */
  private tasks: Map<string, ITask> = new Map();

  /**
   * Crée une nouvelle tâche
   *
   * @param input - Les données de la tâche à créer
   * @returns La tâche créée avec son ID généré
   * @throws {ValidationError} Si les données sont invalides
   * @throws {ConflictError} Si une tâche avec ce titre existe déjà
   */
  create(input: CreateTaskInput): ITask {
    // ...
  }
}
```

### Interface

```typescript
/**
 * Représente une tâche dans le système
 *
 * Une tâche possède un titre, un statut, et peut optionnellement
 * avoir une description. Chaque tâche a un ID unique et des timestamps.
 *
 * @example
 * ```typescript
 * const task: ITask = {
 *   id: '550e8400-e29b-41d4-a716-446655440000',
 *   title: 'Complete documentation',
 *   description: 'Add TSDoc comments to all exports',
 *   status: 'in_progress',
 *   createdAt: new Date('2026-03-16'),
 *   updatedAt: new Date('2026-03-16')
 * };
 * ```
 */
export interface ITask {
  /** Identifiant unique (UUID v4) */
  readonly id: string;

  /** Titre de la tâche (3-200 caractères) */
  title: string;

  /** Description optionnelle de la tâche */
  description?: string;

  /** Statut actuel de la tâche */
  status: TaskStatus;

  /** Date de création (immuable) */
  readonly createdAt: Date;

  /** Date de dernière modification */
  updatedAt: Date;
}
```

## Commandes Utiles

```bash
# Générer la documentation
npm run docs

# Ouvrir la documentation dans le navigateur (macOS)
open docs/index.html

# Ouvrir la documentation (Linux)
xdg-open docs/index.html

# Vérifier les warnings TypeDoc
npx typedoc --validation.notDocumented --treatWarningsAsErrors

# Générer avec mode watch
npx typedoc --watch
```

## Troubleshooting

**Problème**: "No documentation generated"
→ Vérifier que les exports sont bien publics (pas de `@internal`)

**Problème**: "Link not found" warnings
→ Vérifier que les `{@link}` pointent vers des exports existants

**Problème**: Documentation incomplète
→ Ajouter `--validation.notDocumented true` pour voir ce qui manque

---

**Note**: La documentation est un investissement. Prenez le temps de la faire bien dès le début ! 📚
