/**
 * Service de gestion des tâches
 *
 * Fournit les opérations CRUD pour les tâches avec validation
 * et gestion des erreurs.
 *
 * @module services
 */

import { randomUUID } from 'node:crypto';
import type { ITask, CreateTaskInput, UpdateTaskInput } from '../../models/task.model.js';
import { NotFoundError, ConflictError } from '../../utils/errors.js';

/**
 * Service de gestion des tâches en mémoire
 *
 * @example
 * ```typescript
 * const service = new TaskService();
 *
 * const task = service.create({
 *   title: 'My task',
 *   status: 'todo'
 * });
 *
 * const found = service.getById(task.id);
 * service.update(task.id, { status: 'done' });
 * service.delete(task.id);
 * ```
 */
export class TaskService {
  /** Collection de tâches en mémoire */
  private tasks: Map<string, ITask> = new Map();

  /**
   * Récupère toutes les tâches
   *
   * @returns Tableau de toutes les tâches
   *
   * @example
   * ```typescript
   * const allTasks = service.getAll();
   * console.log(`Total tasks: ${allTasks.length}`);
   * ```
   */
  getAll(): ITask[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Récupère une tâche par son ID
   *
   * @param id - L'identifiant unique de la tâche
   * @returns La tâche trouvée
   * @throws {NotFoundError} Si la tâche n'existe pas
   *
   * @example
   * ```typescript
   * try {
   *   const task = service.getById('550e8400-e29b-41d4-a716-446655440000');
   *   console.log(task.title);
   * } catch (err) {
   *   if (err instanceof NotFoundError) {
   *     console.error('Task not found');
   *   }
   * }
   * ```
   */
  getById(id: string): ITask {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundError('Task', id);
    }
    return task;
  }

  /**
   * Crée une nouvelle tâche
   *
   * @param input - Les données de la tâche à créer
   * @returns La tâche créée avec son ID généré
   * @throws {ConflictError} Si une tâche avec le même titre existe déjà
   *
   * @example
   * ```typescript
   * const task = service.create({
   *   title: 'New task',
   *   description: 'Task description',
   *   status: 'todo'
   * });
   * console.log(`Created task with ID: ${task.id}`);
   * ```
   */
  create(input: CreateTaskInput): ITask {
    // Vérifier si une tâche avec le même titre existe déjà
    const existingTask = Array.from(this.tasks.values()).find(
      (t) => t.title.toLowerCase() === input.title.toLowerCase()
    );

    if (existingTask) {
      throw new ConflictError('Task with this title already exists', {
        title: input.title,
        existingId: existingTask.id,
      });
    }

    const now = new Date();
    const task: ITask = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: input.status ?? 'todo',
      createdAt: now,
      updatedAt: now,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Met à jour une tâche existante
   *
   * Seuls les champs fournis dans `input` seront mis à jour.
   *
   * @param id - L'identifiant de la tâche à mettre à jour
   * @param input - Les champs à mettre à jour
   * @returns La tâche mise à jour
   * @throws {NotFoundError} Si la tâche n'existe pas
   *
   * @example
   * ```typescript
   * const updated = service.update('task-id', {
   *   status: 'done'
   * });
   * console.log(`Task status: ${updated.status}`);
   * ```
   */
  update(id: string, input: UpdateTaskInput): ITask {
    const task = this.getById(id); // Throws NotFoundError si n'existe pas

    // Mettre à jour les champs fournis
    const updatedTask: ITask = {
      ...task,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  /**
   * Supprime une tâche
   *
   * Cette opération est idempotente : appeler delete sur un ID inexistant
   * ne génère pas d'erreur.
   *
   * @param id - L'identifiant de la tâche à supprimer
   * @returns `true` si la tâche a été supprimée, `false` si elle n'existait pas
   *
   * @example
   * ```typescript
   * const deleted = service.delete('task-id');
   * if (deleted) {
   *   console.log('Task deleted successfully');
   * }
   * ```
   */
  delete(id: string): boolean {
    return this.tasks.delete(id);
  }

  /**
   * Supprime toutes les tâches
   *
   * ⚠️ Utiliser avec précaution (principalement pour les tests)
   *
   * @example
   * ```typescript
   * service.clear();
   * console.log(`Tasks count: ${service.getAll().length}`); // 0
   * ```
   */
  clear(): void {
    this.tasks.clear();
  }

  /**
   * Compte le nombre de tâches
   *
   * @returns Le nombre total de tâches
   */
  count(): number {
    return this.tasks.size;
  }
}
