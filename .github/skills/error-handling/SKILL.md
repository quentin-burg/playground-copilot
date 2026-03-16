---
name: "error-handling"
description: "Patterns de gestion d'erreurs TypeScript. Utiliser pour implémenter des error classes custom, gérer les erreurs async, ou structurer la gestion d'erreurs dans une application."
user-invocable: true
disable-model-invocation: false
---

# Error Handling Patterns

Skill pour implémenter une gestion d'erreurs robuste et type-safe en TypeScript.

## Quand Utiliser Ce Skill

✅ Utiliser quand:
- Création de classes d'erreur custom
- Gestion d'erreurs dans des APIs REST
- Wrapping d'erreurs de bibliothèques tierces
- Besoin de traçabilité et logging structuré

❌ Ne PAS utiliser pour:
- Erreurs de compilation TypeScript (utiliser le compilateur)
- Validation de données (utiliser Zod — voir `validation-patterns` skill)

## Pattern 1: Classes d'Erreur Custom

```typescript
// ❌ Mauvais: erreurs génériques
throw new Error('Task not found');
throw new Error('Invalid input');
throw new Error('Database error');

// ✅ Bon: classes d'erreur typées

// Classe de base pour erreurs métier
abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Erreur 404 — Ressource non trouvée
class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, { resource, id });
  }
}

// Erreur 400 — Données invalides
class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string, public readonly fields?: Record<string, string[]>) {
    super(message, { fields });
  }
}

// Erreur 409 — Conflit (ex: doublon)
class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

// Erreur 500 — Erreur interne
class InternalError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false; // Ne pas exposer les détails au client

  constructor(message: string, public readonly originalError?: Error) {
    super(message, { originalStack: originalError?.stack });
  }
}

// Erreur 401 — Non authentifié
class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly isOperational = true;

  constructor(message: string = 'Authentication required') {
    super(message);
  }
}

// Erreur 403 — Accès refusé
class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly isOperational = true;

  constructor(resource: string, action: string) {
    super(`Access denied for ${action} on ${resource}`, { resource, action });
  }
}
```

## Pattern 2: Utilisation dans le Code Métier

```typescript
// Service
class TaskService {
  private tasks: Map<string, ITask> = new Map();

  getById(id: string): ITask {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }
    return task;
  }

  create(input: CreateTaskInput): ITask {
    // Vérifier doublon
    const existing = Array.from(this.tasks.values())
      .find(t => t.title === input.title);

    if (existing) {
      throw new ConflictError('Task with this title already exists', {
        title: input.title,
        existingId: existing.id,
      });
    }

    const task: ITask = {
      id: generateId(),
      ...input,
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  delete(id: string): void {
    if (!this.tasks.has(id)) {
      throw new NotFoundError('Task', id);
    }
    this.tasks.delete(id);
  }
}
```

## Pattern 3: Error Handler Global (Fastify)

```typescript
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  // Logger l'erreur
  request.log.error({
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      id: request.id,
      method: request.method,
      url: request.url,
    },
  });

  // Erreurs custom de l'app
  if (error instanceof AppError) {
    const response: {
      error: string;
      details?: unknown;
      requestId: string;
    } = {
      error: error.message,
      requestId: request.id,
    };

    // Exposer les détails uniquement pour les erreurs opérationnelles
    if (error.isOperational && error.context) {
      response.details = error.context;
    }

    return void reply.code(error.statusCode).send(response);
  }

  // Erreurs de validation Fastify/Zod
  if (error.validation) {
    return void reply.code(400).send({
      error: 'Validation failed',
      details: error.validation,
      requestId: request.id,
    });
  }

  // Erreur inconnue — ne pas exposer les détails
  return void reply.code(500).send({
    error: 'Internal server error',
    requestId: request.id,
  });
}

// Enregistrer le handler
app.setErrorHandler(errorHandler);
```

## Pattern 4: Try-Catch avec Types

```typescript
// ❌ Mauvais: catch sans typage
try {
  const result = await riskyOperation();
} catch (err) {
  console.log(err.message); // err est 'unknown'
}

// ✅ Bon: type guard pour les erreurs
try {
  const result = await riskyOperation();
} catch (err) {
  if (err instanceof NotFoundError) {
    // Gérer l'erreur 404
    console.log(`Resource not found: ${err.context?.resource}`);
    return null;
  }

  if (err instanceof ValidationError) {
    // Gérer l'erreur de validation
    console.log('Validation errors:', err.fields);
    return { success: false, errors: err.fields };
  }

  if (err instanceof Error) {
    // Erreur générique
    console.log('Unexpected error:', err.message);
  }

  // Re-throw si non géré
  throw err;
}
```

## Pattern 5: Result Type (Alternative aux Exceptions)

Pour les flux où les erreurs sont attendues (pas exceptionnelles):

```typescript
// Type Result
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Fonction qui retourne un Result
function parseTask(input: unknown): Result<ITask, ValidationError> {
  const result = taskSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: new ValidationError('Invalid task data', /* ... */),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

// Utilisation (pas de try-catch nécessaire)
const result = parseTask(input);

if (result.success) {
  console.log(result.data.title);
} else {
  console.error(result.error.message);
}

// ✅ Avantage: l'appelant DOIT gérer l'erreur (type system oblige)
```

## Pattern 6: Async Error Handling

```typescript
// ❌ Mauvais: Promise rejection non gérée
async function createTask(input: CreateTaskInput): Promise<ITask> {
  const task = await taskService.create(input); // Peut throw
  return task;  // Si ça throw, Promise rejection non catchée
}

// ✅ Bon: wrapper avec gestion d'erreur
async function createTaskSafe(
  input: CreateTaskInput
): Promise<Result<ITask, AppError>> {
  try {
    const task = await taskService.create(input);
    return { success: true, data: task };
  } catch (err) {
    if (err instanceof AppError) {
      return { success: false, error: err };
    }

    // Wrapper les erreurs inconnues
    return {
      success: false,
      error: new InternalError('Failed to create task', err as Error),
    };
  }
}

// Dans les routes Fastify
app.post('/api/v1/tasks', async (request, reply) => {
  const result = await createTaskSafe(request.body);

  if (!result.success) {
    return reply.code(result.error.statusCode).send({
      error: result.error.message,
    });
  }

  return reply.code(201).send({ data: result.data });
});
```

## Pattern 7: Error Recovery et Retry

```typescript
// Retry avec backoff exponentiel
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = attempt === maxRetries - 1;

      // Ne pas retry pour les erreurs opérationnelles (4xx)
      if (err instanceof AppError && err.isOperational) {
        throw err;
      }

      if (isLastAttempt) {
        throw err;
      }

      // Attendre avant de retry (backoff exponentiel)
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unreachable');
}

// Utilisation
const task = await withRetry(() => fetchTaskFromAPI(id));
```

## Pattern 8: Error Boundaries (pour Frontend)

```typescript
// React Error Boundary (concept applicable en TypeScript)
class ErrorBoundary {
  private fallbackUI: (error: Error) => string;

  constructor(fallbackUI: (error: Error) => string) {
    this.fallbackUI = fallbackUI;
  }

  wrap<T>(fn: () => T): T | string {
    try {
      return fn();
    } catch (err) {
      if (err instanceof Error) {
        return this.fallbackUI(err);
      }
      return this.fallbackUI(new Error('Unknown error'));
    }
  }
}

// Utilisation
const boundary = new ErrorBoundary((error) => {
  return `<div class="error">Error: ${error.message}</div>`;
});

const html = boundary.wrap(() => {
  // Code qui peut throw
  return renderTask(task);
});
```

## Pattern 9: Logging Structuré avec Erreurs

```typescript
import type { Logger } from 'pino'; // ou Winston, etc.

class LoggerService {
  constructor(private logger: Logger) {}

  logError(error: Error | AppError, context?: Record<string, unknown>): void {
    const logData: Record<string, unknown> = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      ...context,
    };

    if (error instanceof AppError) {
      logData.statusCode = error.statusCode;
      logData.isOperational = error.isOperational;
      logData.context = error.context;
    }

    // Log niveau approprié
    if (error instanceof AppError && error.isOperational) {
      this.logger.warn(logData, 'Operational error');
    } else {
      this.logger.error(logData, 'Unexpected error');
    }
  }
}

// Utilisation
try {
  const task = taskService.getById(id);
} catch (err) {
  loggerService.logError(err as Error, {
    operation: 'getTask',
    taskId: id,
    userId: request.user?.id,
  });
  throw err;
}
```

## Pattern 10: Assertion Helpers

```typescript
// Assertion avec erreur custom
function assert(
  condition: boolean,
  message: string,
  ErrorClass: new (msg: string) => AppError = InternalError
): asserts condition {
  if (!condition) {
    throw new ErrorClass(message);
  }
}

function assertNonNull<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value == null) {
    throw new InternalError(message);
  }
}

// Utilisation
function processTask(task: ITask | null): void {
  assertNonNull(task, 'Task cannot be null');
  // TypeScript sait maintenant que task n'est pas null
  console.log(task.title);
}

function divideNumbers(a: number, b: number): number {
  assert(b !== 0, 'Division by zero', ValidationError);
  return a / b;
}
```

## Bonnes Pratiques

### ✅ À Faire

1. **Créer des error classes spécifiques** — pas de `throw new Error()`
2. **Distinguer erreurs opérationnelles vs programmation** — `isOperational` flag
3. **Logger AVANT de lancer** — contexte utile pour debug
4. **Inclure du contexte** — IDs, paramètres, état
5. **Handler global** — centraliser la gestion dans l'app
6. **Messages clairs** — aider à résoudre le problème
7. **Status codes appropriés** — 4xx pour client, 5xx pour serveur

### ❌ À Éviter

1. **Catch silencieux** — toujours logger ou re-throw
2. **Exposer la stack trace** — seulement en dev
3. **Erreurs génériques** — `Error` trop vague
4. **Swallowing errors** — `catch (err) { /* rien */ }`
5. **Throw strings/objects** — toujours des Error instances
6. **Détails sensibles dans les logs** — pas de mots de passe, tokens

## Checklist d'Implémentation

Pour une API complète:

- [ ] Classes d'erreur custom définies (NotFoundError, ValidationError, etc.)
- [ ] Error handler global enregistré
- [ ] Logging structuré pour toutes les erreurs
- [ ] Status codes HTTP appropriés
- [ ] Pas de stack traces exposées en production
- [ ] Tests des cas d'erreur (404, 400, 500)
- [ ] Documentation des erreurs possibles (TSDoc `@throws`)

## Exemple Complet

```typescript
// errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly isOperational: boolean;

  constructor(message: string, public context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, { resource, id });
  }
}

// service.ts
class TaskService {
  getById(id: string): ITask {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }
    return task;
  }
}

// routes.ts
app.get('/api/v1/tasks/:id', async (request, reply) => {
  try {
    const task = taskService.getById(request.params.id);
    return reply.send({ data: task });
  } catch (err) {
    throw err; // Le error handler global s'en occupe
  }
});

// app.ts
app.setErrorHandler((error, request, reply) => {
  if (error instanceof AppError) {
    return reply.code(error.statusCode).send({ error: error.message });
  }
  return reply.code(500).send({ error: 'Internal server error' });
});
```

---

**Conseil**: Commencez avec 3-4 classes d'erreur (NotFound, Validation, Internal), étendez au besoin !
