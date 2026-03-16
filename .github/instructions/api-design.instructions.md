---
description: "Conventions pour la conception d'API REST de qualité"
applyTo: "**/routes/**/*.ts, **/api/**/*.ts"
---

# Standards API REST

Conventions pour les endpoints REST du projet Task Manager.

## Structure des URLs

### Pattern Obligatoire

```
/api/v{version}/{resource}[/{id}][/{sub-resource}]
```

Exemples:
- ✅ `/api/v1/tasks`
- ✅ `/api/v1/tasks/123`
- ✅ `/api/v1/tasks/123/comments`
- ❌ `/tasks` (pas de version)
- ❌ `/api/task` (singulier)

## Méthodes HTTP

Utiliser les méthodes HTTP de manière sémantique:

| Méthode | Usage | Body | Idempotent |
|---------|-------|------|------------|
| GET | Lecture | Non | ✅ |
| POST | Création | ✅ | ❌ |
| PUT | Mise à jour complète | ✅ | ✅ |
| PATCH | Mise à jour partielle | ✅ | ❌ |
| DELETE | Suppression | Non | ✅ |

```typescript
// ✅ Exemples corrects
app.get('/api/v1/tasks', getAllTasks);
app.get('/api/v1/tasks/:id', getTaskById);
app.post('/api/v1/tasks', createTask);
app.put('/api/v1/tasks/:id', updateTask);
app.delete('/api/v1/tasks/:id', deleteTask);
```

## Codes de Statut HTTP

Utiliser les codes de statut appropriés:

### Succès (2xx)

```typescript
// 200 OK - Succès général
reply.code(200).send({ data: tasks });

// 201 Created - Ressource créée
reply.code(201).send({ data: newTask });

// 204 No Content - Succès sans corps de réponse
reply.code(204).send();
```

### Erreurs Client (4xx)

```typescript
// 400 Bad Request - Données invalides
reply.code(400).send({
  error: 'Validation failed',
  details: validationErrors
});

// 404 Not Found - Ressource inexistante
reply.code(404).send({
  error: 'Task not found',
  taskId: id
});

// 409 Conflict - Conflit (ex: doublon)
reply.code(409).send({
  error: 'Task with this title already exists'
});

// 422 Unprocessable Entity - Données syntaxiquement valides mais sémantiquement invalides
reply.code(422).send({
  error: 'Cannot mark task as done without completing subtasks'
});
```

### Erreurs Serveur (5xx)

```typescript
// 500 Internal Server Error - Erreur non gérée
reply.code(500).send({
  error: 'Internal server error',
  requestId: req.id
});
```

## Format des Réponses

### Structure Standard

Toutes les réponses suivent cette structure:

```typescript
// ✅ Succès
interface SuccessResponse<T> {
  data: T;
  metadata?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

// ✅ Erreur
interface ErrorResponse {
  error: string;
  details?: unknown;
  timestamp?: string;
  path?: string;
}
```

### Exemples

```typescript
// GET /api/v1/tasks
{
  "data": [
    {
      "id": "task-1",
      "title": "Complete course",
      "status": "in_progress",
      "createdAt": "2026-03-16T10:00:00Z"
    }
  ],
  "metadata": {
    "total": 1
  }
}

// POST /api/v1/tasks (succès)
{
  "data": {
    "id": "task-2",
    "title": "New task",
    "status": "todo",
    "createdAt": "2026-03-16T11:00:00Z"
  }
}

// POST /api/v1/tasks (erreur validation)
{
  "error": "Validation failed",
  "details": {
    "title": "Title is required and must be at least 3 characters"
  },
  "timestamp": "2026-03-16T11:00:00Z",
  "path": "/api/v1/tasks"
}
```

## Validation des Entrées

Toujours valider avec Zod au niveau des routes:

```typescript
import { z } from 'zod';

const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
});

app.post('/api/v1/tasks', async (request, reply) => {
  // ✅ Validation
  const result = createTaskSchema.safeParse(request.body);

  if (!result.success) {
    return reply.code(400).send({
      error: 'Validation failed',
      details: result.error.format(),
    });
  }

  const task = await taskService.create(result.data);
  return reply.code(201).send({ data: task });
});
```

## Headers de Réponse

### Headers Standard

```typescript
// Content-Type
reply.header('Content-Type', 'application/json; charset=utf-8');

// CORS (si nécessaire)
reply.header('Access-Control-Allow-Origin', '*');
reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

// Cache-Control
reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');

// Rate limiting info (optionnel)
reply.header('X-RateLimit-Limit', '100');
reply.header('X-RateLimit-Remaining', '95');
```

## Pagination

Pour les collections, supporter la pagination:

```typescript
// GET /api/v1/tasks?page=1&perPage=20

interface PaginationParams {
  page: number; // Default: 1
  perPage: number; // Default: 20, Max: 100
}

// Réponse
{
  "data": [...],
  "metadata": {
    "total": 150,
    "page": 1,
    "perPage": 20,
    "totalPages": 8
  }
}
```

## Filtrage et Tri

```typescript
// GET /api/v1/tasks?status=todo&sortBy=createdAt&order=desc

interface QueryParams {
  status?: TaskStatus;
  sortBy?: 'title' | 'createdAt' | 'status';
  order?: 'asc' | 'desc';
}
```

## Gestion des Erreurs

Handler global pour les erreurs:

```typescript
app.setErrorHandler((error, request, reply) => {
  // Log l'erreur
  request.log.error(error);

  // Erreur de validation Zod
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation failed',
      details: error.validation,
      path: request.url,
    });
  }

  // Erreur custom (NotFoundError, etc.)
  if (error instanceof NotFoundError) {
    return reply.code(404).send({
      error: error.message,
      path: request.url,
    });
  }

  // Erreur générique
  return reply.code(500).send({
    error: 'Internal server error',
    requestId: request.id,
  });
});
```

## Documentation OpenAPI

Toujours documenter les endpoints:

```typescript
// Utiliser fastify-swagger ou commentaires JSDoc
/**
 * GET /api/v1/tasks
 *
 * @summary Liste toutes les tâches
 * @tags Tasks
 * @param {number} page.query - Numéro de page (default: 1)
 * @param {number} perPage.query - Éléments par page (default: 20)
 * @return {Array<Task>} 200 - Liste des tâches
 * @return {Error} 500 - Erreur serveur
 */
```

## Idempotence

Les opérations idempotentes (GET, PUT, DELETE) doivent produire le même résultat:

```typescript
// ✅ DELETE est idempotent
app.delete('/api/v1/tasks/:id', async (request, reply) => {
  const { id } = request.params;

  const deleted = await taskService.delete(id);

  // Même si la ressource n'existe pas, retourner 204
  return reply.code(204).send();
});
```

## Sécurité

```typescript
// Validation stricte des IDs
const idSchema = z.string().uuid(); // ou .regex(/^task-\d+$/)

// Sanitization des entrées
const sanitizedTitle = title.trim().slice(0, 200);

// Pas de données sensibles dans les logs
logger.info('Task created', { taskId: task.id }); // ✅
logger.info('Task created', { task }); // ❌ (peut contenir des données sensibles)
```
