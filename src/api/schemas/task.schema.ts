/**
 * Schémas de validation Zod pour les tâches
 *
 * @module schemas
 */

import { z } from 'zod';
import type { ITask, CreateTaskInput, UpdateTaskInput } from '../../models/task.model.js';

/**
 * Schéma de validation pour une tâche complète
 *
 * Utilisé pour valider les données de tâches retournées par l'API.
 */
export const taskSchema = z.object({
  id: z.string().uuid('Invalid task ID format'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Status must be one of: todo, in_progress, done' }),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
}) satisfies z.ZodType<ITask>;

/**
 * Schéma pour créer une nouvelle tâche
 *
 * Omet les champs générés automatiquement (id, createdAt, updatedAt).
 *
 * @example
 * ```typescript
 * const result = createTaskSchema.safeParse({
 *   title: 'My task',
 *   status: 'todo'
 * });
 *
 * if (result.success) {
 *   const validData: CreateTaskInput = result.data;
 * }
 * ```
 */
export const createTaskSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'done'])
    .default('todo'),
}) satisfies z.ZodType<CreateTaskInput>;

/**
 * Schéma pour mettre à jour une tâche existante
 *
 * Tous les champs sont optionnels.
 *
 * @example
 * ```typescript
 * const result = updateTaskSchema.safeParse({
 *   status: 'done'
 * });
 *
 * if (result.success) {
 *   const validData: UpdateTaskInput = result.data;
 * }
 * ```
 */
export const updateTaskSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .optional(),
  status: z.enum(['todo', 'in_progress', 'done'])
    .optional(),
}) satisfies z.ZodType<UpdateTaskInput>;

/**
 * Schéma pour valider un ID de tâche
 */
export const taskIdSchema = z.string().uuid('Invalid task ID format');
