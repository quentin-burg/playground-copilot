/**
 * Tests unitaires pour le TaskService
 *
 * @group unit
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskService } from '../../src/api/services/task.service.js';
import { NotFoundError, ConflictError } from '../../src/utils/errors.js';
import type { CreateTaskInput, UpdateTaskInput } from '../../src/models/task.model.js';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    service = new TaskService();
  });

  describe('getAll()', () => {
    it('should return empty array when no tasks exist', () => {
      const tasks = service.getAll();
      expect(tasks).toEqual([]);
      expect(tasks).toHaveLength(0);
    });

    it('should return all tasks', () => {
      // Arrange
      service.create({ title: 'Task 1', status: 'todo' });
      service.create({ title: 'Task 2', status: 'in_progress' });

      // Act
      const tasks = service.getAll();

      // Assert
      expect(tasks).toHaveLength(2);
      expect(tasks[0]?.title).toBe('Task 1');
      expect(tasks[1]?.title).toBe('Task 2');
    });
  });

  describe('getById()', () => {
    it('should return task when valid ID is provided', () => {
      // Arrange
      const created = service.create({ title: 'Test Task', status: 'todo' });

      // Act
      const found = service.getById(created.id);

      // Assert
      expect(found).toEqual(created);
      expect(found.title).toBe('Test Task');
    });

    it('should throw NotFoundError when task does not exist', () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      // Act & Assert
      expect(() => service.getById(nonExistentId)).toThrow(NotFoundError);
      expect(() => service.getById(nonExistentId)).toThrow(
        `Task with id ${nonExistentId} not found`
      );
    });
  });

  describe('create()', () => {
    it('should create task with valid data', () => {
      // Arrange
      const input: CreateTaskInput = {
        title: 'New Task',
        description: 'Task description',
        status: 'todo',
      };

      // Act
      const task = service.create(input);

      // Assert
      expect(task).toMatchObject({
        title: 'New Task',
        description: 'Task description',
        status: 'todo',
      });
      expect(task.id).toBeDefined();
      expect(task.id).toMatch(/^[0-9a-f-]{36}$/); // UUID format
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    it('should set default status to todo when not provided', () => {
      // Arrange
      const input: CreateTaskInput = {
        title: 'Task without status',
      };

      // Act
      const task = service.create(input);

      // Assert
      expect(task.status).toBe('todo');
    });

    it('should throw ConflictError when task with same title exists', () => {
      // Arrange
      service.create({ title: 'Existing Task', status: 'todo' });

      // Act & Assert
      expect(() =>
        service.create({ title: 'Existing Task', status: 'todo' })
      ).toThrow(ConflictError);
      expect(() =>
        service.create({ title: 'Existing Task', status: 'todo' })
      ).toThrow('Task with this title already exists');
    });

    it('should throw ConflictError for case-insensitive duplicate titles', () => {
      // Arrange
      service.create({ title: 'My Task', status: 'todo' });

      // Act & Assert
      expect(() =>
        service.create({ title: 'my task', status: 'todo' })
      ).toThrow(ConflictError);
    });
  });

  describe('update()', () => {
    it('should update task title', () => {
      // Arrange
      const task = service.create({ title: 'Original Title', status: 'todo' });
      const update: UpdateTaskInput = { title: 'Updated Title' };

      // Act
      const updated = service.update(task.id, update);

      // Assert
      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(task.id); // ID unchanged
      expect(updated.createdAt).toEqual(task.createdAt); // createdAt unchanged
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
        task.updatedAt.getTime()
      );
    });

    it('should update task status', () => {
      // Arrange
      const task = service.create({ title: 'Task', status: 'todo' });
      const update: UpdateTaskInput = { status: 'done' };

      // Act
      const updated = service.update(task.id, update);

      // Assert
      expect(updated.status).toBe('done');
    });

    it('should update only provided fields', () => {
      // Arrange
      const task = service.create({
        title: 'Original',
        description: 'Original desc',
        status: 'todo',
      });
      const update: UpdateTaskInput = { status: 'in_progress' };

      // Act
      const updated = service.update(task.id, update);

      // Assert
      expect(updated.status).toBe('in_progress');
      expect(updated.title).toBe('Original'); // Unchanged
      expect(updated.description).toBe('Original desc'); // Unchanged
    });

    it('should throw NotFoundError when updating non-existent task', () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';
      const update: UpdateTaskInput = { title: 'Updated' };

      // Act & Assert
      expect(() => service.update(nonExistentId, update)).toThrow(NotFoundError);
    });
  });

  describe('delete()', () => {
    it('should delete existing task', () => {
      // Arrange
      const task = service.create({ title: 'Task to delete', status: 'todo' });

      // Act
      const result = service.delete(task.id);

      // Assert
      expect(result).toBe(true);
      expect(() => service.getById(task.id)).toThrow(NotFoundError);
    });

    it('should be idempotent (return false for non-existent task)', () => {
      // Arrange
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440000';

      // Act
      const result = service.delete(nonExistentId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('clear()', () => {
    it('should remove all tasks', () => {
      // Arrange
      service.create({ title: 'Task 1', status: 'todo' });
      service.create({ title: 'Task 2', status: 'todo' });
      expect(service.count()).toBe(2);

      // Act
      service.clear();

      // Assert
      expect(service.count()).toBe(0);
      expect(service.getAll()).toHaveLength(0);
    });
  });

  describe('count()', () => {
    it('should return 0 when no tasks exist', () => {
      expect(service.count()).toBe(0);
    });

    it('should return correct count of tasks', () => {
      // Arrange
      service.create({ title: 'Task 1', status: 'todo' });
      service.create({ title: 'Task 2', status: 'todo' });
      service.create({ title: 'Task 3', status: 'todo' });

      // Act & Assert
      expect(service.count()).toBe(3);
    });

    it('should decrement count after deletion', () => {
      // Arrange
      const task = service.create({ title: 'Task', status: 'todo' });
      expect(service.count()).toBe(1);

      // Act
      service.delete(task.id);

      // Assert
      expect(service.count()).toBe(0);
    });
  });
});
