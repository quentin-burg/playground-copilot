/**
 * Serveur Fastify pour l'API Task Manager
 *
 * @module server
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import type { FastifyError, FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { registerTaskRoutes } from './routes/tasks.js';
import { AppError } from '../utils/errors.js';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Crée et configure une instance Fastify
 *
 * @param options - Options de configuration
 * @returns Instance Fastify configurée
 *
 * @example
 * ```typescript
 * const app = await createApp();
 * await app.listen({ port: 3000 });
 * ```
 */
export async function createApp(options?: { logger?: boolean }): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options?.logger ?? true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // CORS
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Routes statiques pour le frontend
  app.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const html = await readFile(join(__dirname, '../frontend/index.html'), 'utf-8');
      return reply.type('text/html').send(html);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to load frontend' });
    }
  });

  app.get('/app.js', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const js = await readFile(join(__dirname, '../frontend/app.js'), 'utf-8');
      return reply.type('application/javascript').send(js);
    } catch (err) {
      app.log.error(err);
      return reply.code(500).send({ error: 'Failed to load frontend script' });
    }
  });

  // Enregistrer les routes API
  registerTaskRoutes(app);

  // Error handler global
  app.setErrorHandler(
    (error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
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

      // Erreurs custom de l'application
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

        return reply.code(error.statusCode).send(response);
      }

      // Erreurs de validation Fastify
      if ('validation' in error && error.validation) {
        return reply.code(400).send({
          error: 'Validation failed',
          details: error.validation,
          requestId: request.id,
        });
      }

      // Erreur générique - ne pas exposer les détails
      return reply.code(500).send({
        error: 'Internal server error',
        requestId: request.id,
      });
    }
  );

  return app;
}

/**
 * Démarre le serveur
 *
 * @param port - Port d'écoute (default: 3000)
 * @param host - Host d'écoute (default: '0.0.0.0')
 */
export async function startServer(port: number = 3000, host: string = '0.0.0.0'): Promise<void> {
  const app = await createApp();

  try {
    await app.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
    console.log(`📋 API available at http://${host}:${port}/api/v1/tasks`);
    console.log(`🌐 Frontend available at http://${host}:${port}/`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Si ce fichier est exécuté directement, démarrer le serveur
if (import.meta.url === `file://${process.argv[1]}`) {
  const portEnv = process.env.PORT;
  const port = (portEnv !== undefined && portEnv !== '') ? parseInt(portEnv, 10) : 3000;
  await startServer(port);
}
