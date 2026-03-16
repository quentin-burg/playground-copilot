/**
 * Classes d'erreur custom pour l'application
 *
 * @module errors
 */

/**
 * Classe de base pour toutes les erreurs de l'application
 *
 * Permet de distinguer les erreurs opérationnelles (attendues)
 * des erreurs de programmation (bugs).
 */
export abstract class AppError extends Error {
  /** Code de statut HTTP associé à l'erreur */
  abstract readonly statusCode: number;

  /** Indique si l'erreur est opérationnelle (peut être exposée au client) */
  abstract readonly isOperational: boolean;

  /**
   * @param message - Message d'erreur
   * @param context - Contexte additionnel pour le logging
   */
  constructor(
    message: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreur lancée quand une ressource n'est pas trouvée (404)
 *
 * @example
 * ```typescript
 * throw new NotFoundError('Task', 'task-123');
 * ```
 */
export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly isOperational = true;

  /**
   * @param resource - Type de ressource (Task, User, etc.)
   * @param id - Identifiant de la ressource
   */
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`, { resource, id });
  }
}

/**
 * Erreur lancée quand les données de validation échouent (400)
 *
 * @example
 * ```typescript
 * throw new ValidationError('Invalid task data', {
 *   title: ['Title must be at least 3 characters']
 * });
 * ```
 */
export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly isOperational = true;

  /**
   * @param message - Message d'erreur général
   * @param fields - Détails des champs invalides
   */
  constructor(
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message, { fields });
  }
}

/**
 * Erreur lancée en cas de conflit (409)
 *
 * Par exemple, tentative de créer une ressource qui existe déjà.
 *
 * @example
 * ```typescript
 * throw new ConflictError('Task with this title already exists', {
 *   title: 'Existing task'
 * });
 * ```
 */
export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly isOperational = true;

  /**
   * @param message - Message d'erreur
   * @param context - Contexte du conflit
   */
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
  }
}

/**
 * Erreur interne du serveur (500)
 *
 * Ne doit PAS exposer les détails au client.
 *
 * @example
 * ```typescript
 * throw new InternalError('Database connection failed', dbError);
 * ```
 */
export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly isOperational = false;

  /**
   * @param message - Message d'erreur (sera loggé mais pas exposé)
   * @param originalError - Erreur originale si disponible
   */
  constructor(message: string, public readonly originalError?: Error) {
    super(message, { originalStack: originalError?.stack });
  }
}
