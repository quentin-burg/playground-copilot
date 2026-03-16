/**
 * Tests unitaires pour les schémas de validation Zod
 *
 * @group unit
 */

import { describe, it, expect } from 'vitest';
import {
  taskSchema,
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from '../../src/api/schemas/task.schema.js';

describe('Task Schemas', () => {
  describe('taskSchema', () => {
    it('should accept valid complete task', () => {
      // Arrange
      const validTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Valid Task',
        description: 'Valid description',
        status: 'todo' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = taskSchema.safeParse(validTask);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toMatchObject(validTask);
      }
    });

    it('should accept task without description', () => {
      // Arrange
      const taskWithoutDesc = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task without description',
        status: 'in_progress' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = taskSchema.safeParse(taskWithoutDesc);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject task with invalid UUID', () => {
      // Arrange
      const invalidTask = {
        id: 'not-a-uuid',
        title: 'Task',
        status: 'todo',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = taskSchema.safeParse(invalidTask);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain('id');
      }
    });

    it('should reject task with invalid status', () => {
      // Arrange
      const invalidTask = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Task',
        status: 'invalid_status',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Act
      const result = taskSchema.safeParse(invalidTask);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('createTaskSchema', () => {
    it('should accept valid create input', () => {
      // Arrange
      const validInput = {
        title: 'New Task',
        description: 'Task description',
        status: 'todo' as const,
      };

      // Act
      const result = createTaskSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('New Task');
        expect(result.data.status).toBe('todo');
      }
    });

    it('should apply default status when not provided', () => {
      // Arrange
      const inputWithoutStatus = {
        title: 'Task without status',
      };

      // Act
      const result = createTaskSchema.safeParse(inputWithoutStatus);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('todo');
      }
    });

    it('should trim whitespace from title', () => {
      // Arrange
      const inputWithSpaces = {
        title: '  Spaced Title  ',
        status: 'todo' as const,
      };

      // Act
      const result = createTaskSchema.safeParse(inputWithSpaces);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Spaced Title');
      }
    });

    it('should reject title shorter than 3 characters', () => {
      // Arrange
      const invalidInput = {
        title: 'Ab',
        status: 'todo' as const,
      };

      // Act
      const result = createTaskSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const titleError = result.error.issues.find((issue) =>
          issue.path.includes('title')
        );
        expect(titleError?.message).toContain('at least 3 characters');
      }
    });

    it('should reject title longer than 200 characters', () => {
      // Arrange
      const invalidInput = {
        title: 'a'.repeat(201),
        status: 'todo' as const,
      };

      // Act
      const result = createTaskSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const titleError = result.error.issues.find((issue) =>
          issue.path.includes('title')
        );
        expect(titleError?.message).toContain('not exceed 200 characters');
      }
    });

    it('should reject description longer than 1000 characters', () => {
      // Arrange
      const invalidInput = {
        title: 'Valid Title',
        description: 'a'.repeat(1001),
        status: 'todo' as const,
      };

      // Act
      const result = createTaskSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('updateTaskSchema', () => {
    it('should accept partial update', () => {
      // Arrange
      const partialUpdate = {
        status: 'done' as const,
      };

      // Act
      const result = updateTaskSchema.safeParse(partialUpdate);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('done');
        expect(result.data.title).toBeUndefined();
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should accept empty object (no fields to update)', () => {
      // Arrange
      const emptyUpdate = {};

      // Act
      const result = updateTaskSchema.safeParse(emptyUpdate);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should validate title length when provided', () => {
      // Arrange
      const invalidUpdate = {
        title: 'ab', // Too short
      };

      // Act
      const result = updateTaskSchema.safeParse(invalidUpdate);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('taskIdSchema', () => {
    it('should accept valid UUID', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const result = taskIdSchema.safeParse(validUuid);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it('should reject invalid UUID format', () => {
      // Arrange
      const invalidUuids = [
        'not-a-uuid',
        '123',
        'task-123',
        '550e8400-e29b-41d4-a716', // Incomplete
      ];

      // Act & Assert
      for (const invalidUuid of invalidUuids) {
        const result = taskIdSchema.safeParse(invalidUuid);
        expect(result.success).toBe(false);
      }
    });
  });
});
