---
name: "refactor-to-strict"
description: "Migre du code TypeScript vers le mode strict. Utiliser pour améliorer la type-safety d'un fichier ou module existant."
---

# Refactor to Strict Mode Prompt

Ce prompt aide à migrer du code TypeScript existant vers le mode strict complet (`strict: true`).

## Objectif

Transformer du code TypeScript permissif en code strict qui passe toutes les vérifications:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`

## Instructions

### Étape 1: Activer le Strict Mode

Modifier `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Étape 2: Identifier les Erreurs

Exécuter le type-checker:

```bash
npm run type-check
```

Analyser les erreurs et les classer par catégorie:
1. `any` implicites
2. `null`/`undefined` non gérés
3. Propriétés non initialisées
4. `this` implicite
5. Fonctions sans type de retour

### Étape 3: Fixes par Catégorie

#### Fix 1: Éliminer les `any` Implicites

```typescript
// ❌ Avant (implicite any)
function process(data) {
  return data.value * 2;
}

// ✅ Après (type explicite)
function process(data: { value: number }): number {
  return data.value * 2;
}

// Ou avec unknown + type guard
function process(data: unknown): number {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.value === 'number') {
      return obj.value * 2;
    }
  }
  throw new TypeError('Invalid data structure');
}
```

#### Fix 2: Gérer `null` et `undefined`

```typescript
// ❌ Avant
function greet(name: string | null) {
  return `Hello ${name.toUpperCase()}`; // Crash si null
}

function getTask(id: string): ITask {
  return tasks.find(t => t.id === id); // Retourne undefined si pas trouvé
}

// ✅ Après
function greet(name: string | null): string {
  if (name === null) {
    return 'Hello stranger';
  }
  return `Hello ${name.toUpperCase()}`;
}

function getTask(id: string): ITask | null {
  return tasks.find(t => t.id === id) ?? null;
}

// Ou avec optional chaining
function getUserEmail(user: IUser | null): string | null {
  return user?.email ?? null;
}
```

#### Fix 3: Initialiser les Propriétés de Classe

```typescript
// ❌ Avant
class TaskManager {
  tasks: ITask[]; // Erreur: propriété non initialisée

  constructor() {
    // Oubli d'initialiser tasks
  }
}

// ✅ Après (initialisation dans constructor)
class TaskManager {
  tasks: ITask[];

  constructor() {
    this.tasks = [];
  }
}

// ✅ Ou (initialisation inline)
class TaskManager {
  tasks: ITask[] = [];
}

// ✅ Ou (definite assignment assertion si initialisé plus tard)
class TaskManager {
  tasks!: ITask[]; // "Je promets que ce sera initialisé"

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.tasks = loadTasksFromStorage();
  }
}
```

#### Fix 4: Typer `this` Explicitement

```typescript
// ❌ Avant
class Logger {
  prefix = '[LOG]';

  log = function(message: string) {
    console.log(this.prefix, message); // this est 'any'
  };
}

// ✅ Après (arrow function)
class Logger {
  prefix = '[LOG]';

  log = (message: string): void => {
    console.log(this.prefix, message); // this est lié correctement
  };
}

// ✅ Ou (annotation de this)
class Logger {
  prefix = '[LOG]';

  log(this: Logger, message: string): void {
    console.log(this.prefix, message);
  }
}
```

#### Fix 5: Types de Retour Explicites

```typescript
// ❌ Avant (type de retour implicite)
function getTasks() {
  return tasks.filter(t => t.status === 'todo');
}

async function fetchTask(id: string) {
  const response = await fetch(`/api/tasks/${id}`);
  return response.json();
}

// ✅ Après (types explicites)
function getTasks(): ITask[] {
  return tasks.filter(t => t.status === 'todo');
}

async function fetchTask(id: string): Promise<ITask> {
  const response = await fetch(`/api/tasks/${id}`);
  const data: unknown = await response.json();

  // Valider le type
  if (isTask(data)) {
    return data;
  }
  throw new Error('Invalid task data');
}

// Type guard
function isTask(value: unknown): value is ITask {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'status' in value
  );
}
```

### Étape 4: Patterns Avancés

#### Pattern: Union Types au Lieu de `any`

```typescript
// ❌ Avant
function handleEvent(event: any) {
  if (event.type === 'click') {
    console.log(event.x, event.y);
  } else if (event.type === 'keypress') {
    console.log(event.key);
  }
}

// ✅ Après
type ClickEvent = { type: 'click'; x: number; y: number };
type KeypressEvent = { type: 'keypress'; key: string };
type Event = ClickEvent | KeypressEvent;

function handleEvent(event: Event): void {
  if (event.type === 'click') {
    console.log(event.x, event.y); // TypeScript sait que c'est ClickEvent
  } else {
    console.log(event.key); // TypeScript sait que c'est KeypressEvent
  }
}
```

#### Pattern: Assertion de Type pour APIs Externes

```typescript
// ❌ Avant
const data = await fetch('/api/task').then(r => r.json());
const task = data as ITask; // Cast dangereux

// ✅ Après
function assertTask(value: unknown): asserts value is ITask {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('id' in value) ||
    !('title' in value) ||
    !('status' in value)
  ) {
    throw new Error('Invalid task structure');
  }

  // Vérifications supplémentaires...
}

const data: unknown = await fetch('/api/task').then(r => r.json());
assertTask(data);
// À partir d'ici, TypeScript sait que data est ITask
console.log(data.title);
```

#### Pattern: Narrow Types avec Type Guards

```typescript
// ❌ Avant
function processValue(value: string | number) {
  return value.toFixed(2); // Erreur: toFixed n'existe pas sur string
}

// ✅ Après
function processValue(value: string | number): string {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  return value; // TypeScript sait que c'est string ici
}

// Pattern avec in operator
function processTask(task: ITask | { id: string }): void {
  if ('title' in task) {
    // TypeScript sait que c'est ITask
    console.log(task.title);
  } else {
    console.log('Task without title');
  }
}
```

### Étape 5: Migration Incrémentale

Si le projet est grand, migrer progressivement:

1. **Activer `noImplicitAny` d'abord**
   ```json
   { "noImplicitAny": true }
   ```
   Fixer toutes les erreurs.

2. **Activer `strictNullChecks`**
   ```json
   { "strictNullChecks": true }
   ```
   Fixer toutes les erreurs.

3. **Activer `strict: true` finalement**
   ```json
   { "strict": true }
   ```

4. **Par fichier**: Utiliser `// @ts-check` en haut des fichiers JS
   ```javascript
   // @ts-check
   /** @type {string} */
   const name = 'Alice';
   ```

### Étape 6: Checklist de Vérification

Après refactoring, vérifier:

- [ ] `npm run type-check` passe sans erreur
- [ ] Aucun `any` (sauf justifié avec `// eslint-disable-next-line`)
- [ ] Tous les `null`/`undefined` gérés explicitement
- [ ] Propriétés de classe initialisées
- [ ] Types de retour explicites pour fonctions publiques
- [ ] Tests passent toujours (`npm test`)
- [ ] Pas de régression fonctionnelle

## Cas Spéciaux

### Cas 1: Bibliothèques Sans Types

Si une bibliothèque n'a pas de types:

```typescript
// Option 1: Déclarer les types manuellement
declare module 'some-untyped-lib' {
  export function doSomething(input: string): number;
}

// Option 2: Créer un fichier .d.ts
// src/types/some-untyped-lib.d.ts
declare module 'some-untyped-lib' {
  export function doSomething(input: string): number;
}

// Option 3: Installer les types si disponibles
// npm install --save-dev @types/some-lib
```

### Cas 2: Code Dynamique (JSON.parse, etc.)

```typescript
// ❌ Avant
const data = JSON.parse(jsonString);

// ✅ Après
const data: unknown = JSON.parse(jsonString);

// Valider avec Zod
const result = taskSchema.safeParse(data);
if (result.success) {
  const task: ITask = result.data;
}

// Ou avec type guard
if (isTask(data)) {
  const task: ITask = data;
}
```

### Cas 3: Événements DOM

```typescript
// ❌ Avant
function handleClick(event) {
  console.log(event.target.value);
}

// ✅ Après
function handleClick(event: MouseEvent): void {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    console.log(target.value);
  }
}

// Pour formulaires
function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.target;
  if (form instanceof HTMLFormElement) {
    const formData = new FormData(form);
    // ...
  }
}
```

## Outils Utiles

```bash
# Vérifier les types
npm run type-check

# Avec mode watch
npm run type-check -- --watch

# Générer rapport détaillé
npx tsc --noEmit --listFiles

# Voir les erreurs par fichier
npx tsc --noEmit | grep "error TS"

# Compter les erreurs
npx tsc --noEmit | grep "error TS" | wc -l
```

## Anti-Patterns à Éviter

❌ **Ne PAS faire**:

```typescript
// 1. Casts dangereux
const task = data as ITask; // Peut crash à runtime

// 2. any pour éviter les erreurs
const result: any = complexFunction();

// 3. Ignorer les erreurs TypeScript
// @ts-ignore
const value = obj.property;

// 4. Types trop larges
function process(input: object): void { // object est trop large
  // ...
}

// 5. Assertions sans vérification
function getTask(id: string): ITask {
  return tasks.find(t => t.id === id)!; // ! dangereux
}
```

✅ **Faire plutôt**:

```typescript
// 1. Validation avant cast
if (isTask(data)) {
  const task: ITask = data;
}

// 2. unknown + type guards
function handleUnknown(value: unknown): void {
  if (typeof value === 'string') {
    console.log(value.toUpperCase());
  }
}

// 3. Fix l'erreur au lieu de l'ignorer
const value: string | undefined = obj.property;
if (value !== undefined) {
  console.log(value);
}

// 4. Types précis
function process(input: { id: string; name: string }): void {
  // ...
}

// 5. Gérer le cas null
function getTask(id: string): ITask | null {
  return tasks.find(t => t.id === id) ?? null;
}
```

## Résultat Attendu

Après migration complète:

```bash
$ npm run type-check
✓ TypeScript compilation successful (0 errors)

$ npm run lint
✓ ESLint passed (0 warnings, 0 errors)

$ npm test
✓ All tests passed
```

---

**Conseil**: Migrer progressivement, fichier par fichier. Ne pas tout faire d'un coup ! 🎯
