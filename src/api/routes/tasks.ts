/**
 * Routes API pour la gestion des tâches
 *
 * @module routes
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TaskService } from '../services/task.service.js';
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from '../schemas/task.schema.js';
import { ValidationError } from '../../utils/errors.js';
import type { CreateTaskInput, UpdateTaskInput } from '../../models/task.model.js';

/**
 * Instance du service de gestion des tâches (singleton)
 */
const taskService = new TaskService();

/**
 * Type pour les paramètres de route avec ID
 */
interface TaskParams {
  id: string;
}

/**
 * Enregistre toutes les routes de gestion des tâches
 *
 * @param app - Instance Fastify
 *
 * @example
 * ```typescript
 * import Fastify from 'fastify';
 * import { registerTaskRoutes } from './routes/tasks';
 *
 * const app = Fastify();
 * registerTaskRoutes(app);
 * ```
 */
export function registerTaskRoutes(app: FastifyInstance): void {
  /**
   * GET /api/v1/tasks
   *
   * Liste toutes les tâches
   *
   * @returns 200 - Liste des tâches
   */
  app.get('/api/v1/tasks', async (_request: FastifyRequest, reply: FastifyReply) => {
    const tasks = taskService.getAll();
    return reply.code(200).send({
      data: tasks,
      metadata: {
        total: tasks.length,
      },
    });
  });

  /**
   * GET /api/v1/tasks/:id
   *
   * Récupère une tâche par son ID
   *
   * @param id - UUID de la tâche
   * @returns 200 - Tâche trouvée
   * @returns 404 - Tâche non trouvée
   * @returns 400 - ID invalide
   */
  app.get<{ Params: TaskParams }>(
    '/api/v1/tasks/:id',
    async (request: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
      // Valider l'ID
      const idValidation = taskIdSchema.safeParse(request.params.id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid task ID', {
          id: idValidation.error.errors.map((e) => e.message),
        });
      }

      const task = taskService.getById(request.params.id);
      return reply.code(200).send({ data: task });
    }
  );

  /**
   * POST /api/v1/tasks
   *
   * Crée une nouvelle tâche
   *
   * @body title - Titre de la tâche (3-200 caractères)
   * @body description - Description optionnelle (max 1000 caractères)
   * @body status - Statut initial (default: 'todo')
   * @returns 201 - Tâche créée
   * @returns 400 - Données invalides
   * @returns 409 - Tâche avec ce titre existe déjà
   */
  app.post<{ Body: CreateTaskInput }>(
    '/api/v1/tasks',
    async (request: FastifyRequest<{ Body: CreateTaskInput }>, reply: FastifyReply) => {
      // Valider les données
      const validation = createTaskSchema.safeParse(request.body);
      if (!validation.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const error of validation.error.errors) {
          const field = error.path.join('.');
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field]!.push(error.message);
        }

        throw new ValidationError('Validation failed', fieldErrors);
      }

      const task = taskService.create(validation.data);
      return reply.code(201).send({ data: task });
    }
  );

  /**
   * PUT /api/v1/tasks/:id
   *
   * Met à jour une tâche existante
   *
   * @param id - UUID de la tâche
   * @body title - Nouveau titre (optionnel)
   * @body description - Nouvelle description (optionnel)
   * @body status - Nouveau statut (optionnel)
   * @returns 200 - Tâche mise à jour
   * @returns 400 - Données invalides
   * @returns 404 - Tâche non trouvée
   */
  app.put<{ Params: TaskParams; Body: UpdateTaskInput }>(
    '/api/v1/tasks/:id',
    async (
      request: FastifyRequest<{ Params: TaskParams; Body: UpdateTaskInput }>,
      reply: FastifyReply
    ) => {
      // Valider l'ID
      const idValidation = taskIdSchema.safeParse(request.params.id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid task ID', {
          id: idValidation.error.errors.map((e) => e.message),
        });
      }

      // Valider les données de mise à jour
      const validation = updateTaskSchema.safeParse(request.body);
      if (!validation.success) {
        const fieldErrors: Record<string, string[]> = {};
        for (const error of validation.error.errors) {
          const field = error.path.join('.');
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field]!.push(error.message);
        }

        throw new ValidationError('Validation failed', fieldErrors);
      }

      const task = taskService.update(request.params.id, validation.data);
      return reply.code(200).send({ data: task });
    }
  );

  /**
   * DELETE /api/v1/tasks/:id
   *
   * Supprime une tâche
   *
   * Cette opération est idempotente : supprimer une tâche inexistante
   * retourne également 204.
   *
   * @param id - UUID de la tâche
   * @returns 204 - Tâche supprimée (ou inexistante)
   * @returns 400 - ID invalide
   */
  app.delete<{ Params: TaskParams }>(
    '/api/v1/tasks/:id',
    async (request: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
      // Valider l'ID
      const idValidation = taskIdSchema.safeParse(request.params.id);
      if (!idValidation.success) {
        throw new ValidationError('Invalid task ID', {
          id: idValidation.error.errors.map((e) => e.message),
        });
      }

      taskService.delete(request.params.id);
      return reply.code(204).send();
    }
  );
}

/**
 * Récupère l'instance du service de tâches (pour les tests)
 *
 * @internal
 */
export function getTaskService(): TaskService {
  return taskService;
}
