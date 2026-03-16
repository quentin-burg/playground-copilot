/**
 * Types et interfaces pour le système de gestion de tâches
 *
 * @module models
 */

/**
 * Statuts possibles pour une tâche
 *
 * - `todo`: Tâche à faire
 * - `in_progress`: Tâche en cours
 * - `done`: Tâche terminée
 */
export type TaskStatus = 'todo' | 'in_progress' | 'done';

/**
 * Liste des statuts possibles (pour validation)
 */
export const TASK_STATUSES = ['todo', 'in_progress', 'done'] as const;

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

/**
 * Données nécessaires pour créer une nouvelle tâche
 *
 * @example
 * ```typescript
 * const input: CreateTaskInput = {
 *   title: 'My new task',
 *   description: 'Task description',
 *   status: 'todo'
 * };
 * ```
 */
export interface CreateTaskInput {
  /** Titre de la tâche */
  title: string;

  /** Description optionnelle */
  description?: string;

  /** Statut initial (default: 'todo') */
  status?: TaskStatus;
}

/**
 * Données pour mettre à jour une tâche existante
 *
 * Tous les champs sont optionnels. Seuls les champs fournis seront mis à jour.
 *
 * @example
 * ```typescript
 * const update: UpdateTaskInput = {
 *   status: 'done'
 * };
 * ```
 */
export interface UpdateTaskInput {
  /** Nouveau titre */
  title?: string;

  /** Nouvelle description */
  description?: string;

  /** Nouveau statut */
  status?: TaskStatus;
}
