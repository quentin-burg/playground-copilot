---
description: "Standards de développement et bonnes pratiques pour le projet Task Manager"
---

# Standards de Développement — Task Manager

Ce projet démontre les bonnes pratiques de développement TypeScript avec l'aide de l'IA générative.

## Gestion des Erreurs

### Types d'Erreurs Custom

Toujours créer des classes d'erreur typées plutôt que des `Error` génériques:

```typescript
// ❌ Mauvais
throw new Error('Task not found');

// ✅ Bon
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

throw new NotFoundError('Task', taskId);
```

### Gestion Explicite

Toujours gérer les erreurs explicitement, jamais de `catch` vide:

```typescript
// ❌ Mauvais
try {
  await riskyOperation();
} catch (err) {
  // Silence...
}

// ✅ Bon
try {
  await riskyOperation();
} catch (err) {
  if (err instanceof ValidationError) {
    logger.warn('Validation failed', { error: err });
    return { success: false, error: err.message };
  }
  throw err; // Re-throw si non géré
}
```

## Logs Structurés

Utiliser des logs structurés avec contexte:

```typescript
// ❌ Mauvais
console.log('Task created');

// ✅ Bon
logger.info('Task created', {
  taskId: task.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

## Validation des Entrées

Toujours valider les entrées utilisateur avec Zod:

```typescript
// ✅ Toujours valider avant traitement
const result = taskSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError(result.error);
}
const validatedTask = result.data;
```

## Immutabilité

Préférer l'immutabilité quand c'est pertinent:

```typescript
// ✅ Interfaces avec readonly pour états
interface ITask {
  readonly id: string;
  readonly createdAt: Date;
  title: string; // Modifiable
  status: TaskStatus;
}

// ✅ Utiliser as const pour constantes
const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

// ✅ Éviter les mutations
const updatedTasks = tasks.map((t) =>
  t.id === taskId ? { ...t, status: 'done' } : t
);
```

## Types Stricts

- Jamais de `any` — utiliser `unknown` avec type guards
- Préférer les types union aux enums
- Utiliser `readonly` pour les propriétés immuables
- Branded types pour les IDs

## Documentation

Documenter toutes les fonctions exportées avec TSDoc:

```typescript
/**
 * Récupère une tâche par son ID
 *
 * @param id - L'identifiant unique de la tâche
 * @returns La tâche trouvée
 * @throws {NotFoundError} Si la tâche n'existe pas
 */
export function getTaskById(id: string): ITask {
  // ...
}
```

## Qualité

- Coverage des tests > 80%
- Aucun warning ESLint
- Code formaté avec Prettier
- Types stricts activés dans tsconfig.json
