---
name: "validation-patterns"
description: "Patterns de validation TypeScript avec Zod. Utiliser pour valider des entrées API, créer des schémas type-safe, ou implémenter de la validation côté client/serveur."
user-invocable: true
disable-model-invocation: false
---

# Validation Patterns avec Zod

Skill pour implémenter de la validation robuste et type-safe avec Zod dans TypeScript.

## Quand Utiliser Ce Skill

✅ Utiliser quand:
- Validation d'entrées utilisateur (API, formulaires)
- Définition de schémas de données
- Parsing de données externes (JSON, APIs tierces)
- Besoin d'inférence de types depuis les schémas

❌ Ne PAS utiliser pour:
- Validation simple (ex: `typeof x === 'string'`)
- Types statiques purs (utilisez des interfaces/types)

## Installation

```bash
npm install zod
```

## Pattern 1: Schéma de Base

```typescript
import { z } from 'zod';

// Définir le schéma
const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  createdAt: z.date(),
  tags: z.array(z.string()).default([]),
});

// Inférer le type depuis le schéma
type Task = z.infer<typeof taskSchema>;
// Équivaut à:
// interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   status: 'todo' | 'in_progress' | 'done';
//   createdAt: Date;
//   tags: string[];
// }

// ✅ Avantage: Single Source of Truth (schéma = types)
```

## Pattern 2: Validation avec safeParse

```typescript
// ✅ Recommandé: safeParse (ne throw pas)
const result = taskSchema.safeParse(data);

if (result.success) {
  // result.data est typé comme Task
  const task: Task = result.data;
  console.log(task.title);
} else {
  // result.error contient les erreurs de validation
  console.error('Validation failed:', result.error.format());

  // Exemple d'erreur formatée:
  // {
  //   title: { _errors: ['String must contain at least 3 character(s)'] },
  //   status: { _errors: ['Invalid enum value'] }
  // }
}

// ❌ À éviter: parse (throw en cas d'erreur)
try {
  const task = taskSchema.parse(data); // Throw ZodError si invalide
} catch (err) {
  // Gestion d'erreur moins pratique
}
```

## Pattern 3: Schémas pour API Endpoints

```typescript
// Schéma pour la création (sans id, sans createdAt)
const createTaskSchema = taskSchema.omit({
  id: true,
  createdAt: true,
});

type CreateTaskInput = z.infer<typeof createTaskSchema>;
// { title: string, description?: string, status: ..., tags: string[] }

// Schéma pour la mise à jour (tous les champs optionnels)
const updateTaskSchema = taskSchema.partial().omit({
  id: true,
  createdAt: true,
});

type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
// { title?: string, description?: string, status?: ..., tags?: string[] }

// Utilisation dans Fastify
app.post('/api/v1/tasks', async (request, reply) => {
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

## Pattern 4: Transformations et Preprocessing

```typescript
const taskInputSchema = z.object({
  title: z.string()
    .trim() // Enlever les espaces
    .min(3)
    .max(200)
    .transform(s => s.toLowerCase()), // Normaliser

  status: z.enum(['todo', 'in_progress', 'done'])
    .default('todo'), // Valeur par défaut

  priority: z.coerce.number() // Convertir string → number
    .int()
    .min(1)
    .max(5)
    .default(3),

  dueDate: z.string()
    .datetime() // Valider format ISO 8601
    .transform(s => new Date(s)), // Convertir string → Date
});

// Exemple d'utilisation
const input = {
  title: '  My Task  ',
  status: 'todo',
  priority: '4', // String sera converti en number
  dueDate: '2026-03-20T10:00:00Z',
};

const result = taskInputSchema.safeParse(input);
if (result.success) {
  console.log(result.data);
  // {
  //   title: 'my task',
  //   status: 'todo',
  //   priority: 4,
  //   dueDate: Date(2026-03-20T10:00:00.000Z)
  // }
}
```

## Pattern 5: Schémas Imbriqués

```typescript
const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  zipCode: z.string().regex(/^\d{5}$/),
});

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  address: addressSchema, // Schéma imbriqué
  tasks: z.array(taskSchema), // Array de schémas
});

type User = z.infer<typeof userSchema>;
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   address: {
//     street: string;
//     city: string;
//     zipCode: string;
//   };
//   tasks: Task[];
// }
```

## Pattern 6: Unions et Discriminated Unions

```typescript
// Union simple
const idSchema = z.union([
  z.string().uuid(),
  z.string().regex(/^task-\d+$/),
]);

// Discriminated union (pour polymorphisme)
const notificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    to: z.string().email(),
    subject: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal('sms'),
    phoneNumber: z.string(),
    message: z.string().max(160),
  }),
  z.object({
    type: z.literal('push'),
    deviceId: z.string(),
    title: z.string(),
    body: z.string(),
  }),
]);

type Notification = z.infer<typeof notificationSchema>;
// type Notification =
//   | { type: 'email', to: string, subject: string, body: string }
//   | { type: 'sms', phoneNumber: string, message: string }
//   | { type: 'push', deviceId: string, title: string, body: string }

// ✅ TypeScript comprend le discriminant
function sendNotification(notif: Notification) {
  switch (notif.type) {
    case 'email':
      // notif.to est accessible (TypeScript sait que c'est un email)
      sendEmail(notif.to, notif.subject, notif.body);
      break;
    case 'sms':
      // notif.phoneNumber est accessible
      sendSMS(notif.phoneNumber, notif.message);
      break;
    case 'push':
      // notif.deviceId est accessible
      sendPush(notif.deviceId, notif.title, notif.body);
      break;
  }
}
```

## Pattern 7: Refinements (Validations Custom)

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /\d/.test(password),
    'Password must contain at least one number'
  );

// Refinement avec contexte
const taskWithDueDateSchema = taskSchema.refine(
  (task) => {
    if (task.status === 'done' && !task.completedAt) {
      return false; // Validation échoue
    }
    return true;
  },
  {
    message: 'Completed tasks must have a completedAt date',
    path: ['completedAt'], // Indique le champ en erreur
  }
);

// Refinement avec données croisées
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
);
```

## Pattern 8: Schémas Réutilisables avec extend

```typescript
// Schéma de base
const baseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Étendre le schéma
const taskSchema = baseEntitySchema.extend({
  title: z.string().min(3).max(200),
  status: z.enum(['todo', 'in_progress', 'done']),
});

const userSchema = baseEntitySchema.extend({
  name: z.string(),
  email: z.string().email(),
});

// Picker/Omit pour composition
const publicTaskSchema = taskSchema.omit({
  createdBy: true,
  internalNotes: true,
});
```

## Pattern 9: Validation Côté Client ET Serveur

```typescript
// shared/schemas.ts (partagé entre client et serveur)
export const createTaskSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
});

// server/routes/tasks.ts
import { createTaskSchema } from '../shared/schemas';

app.post('/api/v1/tasks', async (request, reply) => {
  const result = createTaskSchema.safeParse(request.body);
  if (!result.success) {
    return reply.code(400).send({ error: result.error.format() });
  }
  // ...
});

// client/components/TaskForm.tsx
import { createTaskSchema } from '../shared/schemas';

function TaskForm() {
  const handleSubmit = (data: unknown) => {
    const result = createTaskSchema.safeParse(data);
    if (!result.success) {
      showErrors(result.error.format());
      return;
    }
    // Envoyer au serveur
    fetch('/api/v1/tasks', {
      method: 'POST',
      body: JSON.stringify(result.data),
    });
  };
}
```

## Pattern 10: Gestion d'Erreurs Personnalisée

```typescript
import { ZodError } from 'zod';

class ValidationError extends Error {
  constructor(public zodError: ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
  }

  format(): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of this.zodError.issues) {
      const path = issue.path.join('.');
      if (!formatted[path]) {
        formatted[path] = [];
      }
      formatted[path].push(issue.message);
    }

    return formatted;
  }
}

// Utilisation
const result = taskSchema.safeParse(data);
if (!result.success) {
  throw new ValidationError(result.error);
}

// Dans le error handler
if (error instanceof ValidationError) {
  return reply.code(400).send({
    error: 'Validation failed',
    details: error.format(),
  });
}
```

## Bonnes Pratiques

### ✅ À Faire

1. **Utiliser `safeParse`** au lieu de `parse` (gestion d'erreur explicite)
2. **Inférer les types** depuis les schémas (`z.infer<typeof schema>`)
3. **Centraliser les schémas** dans un dossier `schemas/`
4. **Valider tôt** — à l'entrée du système (routes API)
5. **Messages d'erreur clairs** — aider l'utilisateur à corriger

### ❌ À Éviter

1. **Ne pas valider deux fois** — une fois suffit (côté serveur minimum)
2. **Pas de schémas trop permissifs** — `.passthrough()` avec prudence
3. **Éviter les refinements complexes** — préférer la logique métier ailleurs
4. **Ne pas ignorer les erreurs** — toujours gérer `!result.success`

## Checklist d'Implémentation

Pour un endpoint API complet:

- [ ] Schéma de création défini (`createSchema`)
- [ ] Schéma de mise à jour défini (`updateSchema`)
- [ ] Types inférés depuis les schémas
- [ ] Validation dans la route avec `safeParse`
- [ ] Erreurs 400 retournées avec détails
- [ ] Messages d'erreur clairs et actionnables
- [ ] Tests de validation (cas valides + invalides)

## Ressources

- [Documentation Zod](https://zod.dev/)
- [Zod Error Formatting](https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md)
- [Zod to JSON Schema](https://github.com/StefanTerdell/zod-to-json-schema) (pour OpenAPI)

---

**Conseil**: Commencez simple, ajoutez des refinements seulement si nécessaire. La validation de base couvre 90% des cas !
