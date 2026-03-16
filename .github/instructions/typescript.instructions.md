---
description: "Standards TypeScript stricts pour garantir la qualité et la sécurité du code"
applyTo: "**/*.ts"
---

# Standards TypeScript Stricts

Règles TypeScript strictes pour ce projet orienté qualité (QSI).

## Configuration Obligatoire

Le fichier `tsconfig.json` DOIT avoir:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true
  }
}
```

## Interdictions

### ❌ Pas de Type `any`

Utiliser `unknown` avec type guards:

```typescript
// ❌ Interdit
function process(data: any) {
  return data.value;
}

// ✅ Correct
function process(data: unknown): number {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.value === 'number') {
      return obj.value;
    }
  }
  throw new TypeError('Invalid data structure');
}
```

### ❌ Pas de `null` ou `undefined` Non Gérés

```typescript
// ❌ Mauvais
function greet(name: string | null) {
  return `Hello ${name.toUpperCase()}`; // Crash si null
}

// ✅ Bon
function greet(name: string | null): string {
  if (name === null) {
    return 'Hello stranger';
  }
  return `Hello ${name.toUpperCase()}`;
}
```

## Conventions de Nommage

### Interfaces

Préfixe `I` obligatoire:

```typescript
// ✅ Bon
interface ITask {
  id: string;
  title: string;
}

interface IUser {
  id: string;
  name: string;
}
```

### Types

PascalCase sans préfixe:

```typescript
// ✅ Bon
type TaskStatus = 'todo' | 'in_progress' | 'done';
type ErrorHandler = (error: Error) => void;
```

### Variables et Fonctions

camelCase, les booléens commencent par `is`/`has`:

```typescript
const taskCount = 5;
const isCompleted = true;
const hasDescription = false;

function getTaskById(id: string): ITask | null {
  // ...
}
```

## Branded Types pour IDs

Utiliser des branded types pour les identifiants:

```typescript
// ✅ Pattern recommandé
type TaskId = string & { readonly __brand: 'TaskId' };
type UserId = string & { readonly __brand: 'UserId' };

function createTaskId(raw: string): TaskId {
  return raw as TaskId;
}

function getTask(id: TaskId): ITask {
  // Le système de types garantit qu'on ne peut pas passer un UserId
}

// ✅ Utilisation
const taskId = createTaskId('task-123');
getTask(taskId); // OK
getTask('task-456'); // ❌ Erreur de type
```

## Propriétés Readonly

Utiliser `readonly` pour les propriétés immuables:

```typescript
interface ITask {
  readonly id: string;
  readonly createdAt: Date;
  readonly userId: string;

  // Propriétés modifiables
  title: string;
  status: TaskStatus;
  description?: string;
}
```

## Type Guards

Créer des type guards pour les validations:

```typescript
function isTask(value: unknown): value is ITask {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'status' in value &&
    typeof (value as ITask).id === 'string' &&
    typeof (value as ITask).title === 'string'
  );
}

// ✅ Utilisation
if (isTask(data)) {
  // TypeScript sait que data est de type ITask ici
  console.log(data.title);
}
```

## Types Union vs Enums

Préférer les types union aux enums:

```typescript
// ✅ Préféré
type TaskStatus = 'todo' | 'in_progress' | 'done';
const status: TaskStatus = 'todo';

// ❌ Éviter (sauf cas spécifiques)
enum TaskStatus {
  Todo = 'todo',
  InProgress = 'in_progress',
  Done = 'done',
}
```

## Inférence de Types

Laisser TypeScript inférer quand c'est évident:

```typescript
// ✅ Bon (inférence)
const tasks = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' },
];

// ❌ Redondant
const tasks: Array<{ id: string; title: string }> = [
  { id: '1', title: 'Task 1' },
  { id: '2', title: 'Task 2' },
];

// ✅ Mais explicite pour les paramètres/retours de fonction
function getTasks(): ITask[] {
  return tasks;
}
```

## Gestion du `this`

Utiliser arrow functions ou annoter le type de `this`:

```typescript
class TaskService {
  private tasks: ITask[] = [];

  // ✅ Arrow function (this lié)
  getTasks = (): ITask[] => {
    return this.tasks;
  };

  // ✅ Annotation explicite du this
  addTask(this: TaskService, task: ITask): void {
    this.tasks.push(task);
  }
}
```

## Strictes pour Paramètres Optionnels

```typescript
// ❌ Mauvais (undefined implicite)
function createTask(title: string, description?: string) {
  console.log(description.length); // Crash si undefined
}

// ✅ Bon
function createTask(title: string, description?: string): ITask {
  const desc = description ?? 'No description';
  return {
    id: generateId(),
    title,
    description: desc,
    status: 'todo',
    createdAt: new Date(),
  };
}
```

## Vérification Avant Compilation

Toujours exécuter `npm run type-check` avant de commiter:

```bash
npm run type-check  # Vérifie les types sans générer de build
```
