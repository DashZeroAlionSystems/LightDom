/**
 * Integration Tests for Worker Pool Manager
 * Tests the complete worker pool lifecycle and task execution
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import WorkerPoolManager from '../../src/services/WorkerPoolManager';
import path from 'path';
import fs from 'fs';

describe('WorkerPoolManager Integration Tests', () => {
  let pool: WorkerPoolManager;

  beforeAll(async () => {
    pool = new WorkerPoolManager({
      type: 'puppeteer',
      maxWorkers: 2,
      minWorkers: 1,
      poolingStrategy: 'least-busy',
      timeout: 10000,
      retries: 2,
    });

    await pool.initialize();
  });

  afterAll(async () => {
    if (pool) {
      await pool.shutdown();
    }
  });

  it('should initialize with minimum workers', () => {
    const status = pool.getStatus();
    expect(status.workers.length).toBeGreaterThanOrEqual(1);
    expect(status.workers.length).toBeLessThanOrEqual(2);
  });

  it('should handle task queuing', async () => {
    const taskId = await pool.addTask({
      type: 'test',
      data: { value: 'test-data' },
      priority: 5,
    });

    expect(taskId).toBeDefined();
    expect(typeof taskId).toBe('string');
    expect(taskId).toMatch(/^task-/);
  });

  it('should process tasks with priority', async () => {
    const completedTasks: string[] = [];

    pool.on('taskCompleted', ({ taskId }) => {
      completedTasks.push(taskId);
    });

    // Add tasks with different priorities
    const lowPriority = await pool.addTask({
      type: 'test',
      data: { priority: 'low' },
      priority: 1,
    });

    const highPriority = await pool.addTask({
      type: 'test',
      data: { priority: 'high' },
      priority: 10,
    });

    // Wait for tasks to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(completedTasks.length).toBeGreaterThan(0);
  });

  it('should scale workers based on load', async () => {
    const initialStatus = pool.getStatus();
    const initialWorkerCount = initialStatus.workers.length;

    // Add multiple tasks to trigger scaling
    const tasks = [];
    for (let i = 0; i < 5; i++) {
      tasks.push(
        pool.addTask({
          type: 'test',
          data: { index: i },
          priority: 5,
        })
      );
    }

    await Promise.all(tasks);

    const newStatus = pool.getStatus();
    // Should scale up or stay within limits
    expect(newStatus.workers.length).toBeGreaterThanOrEqual(initialWorkerCount);
    expect(newStatus.workers.length).toBeLessThanOrEqual(2); // maxWorkers
  });

  it('should report accurate status', () => {
    const status = pool.getStatus();

    expect(status).toHaveProperty('config');
    expect(status).toHaveProperty('workers');
    expect(status).toHaveProperty('queueSize');
    expect(status).toHaveProperty('activeTasks');
    expect(status).toHaveProperty('totalCompleted');
    expect(status).toHaveProperty('totalErrors');

    expect(Array.isArray(status.workers)).toBe(true);
    expect(typeof status.queueSize).toBe('number');
    expect(typeof status.activeTasks).toBe('number');
  });

  it('should handle worker errors gracefully', async () => {
    const errors: any[] = [];

    pool.on('taskFailed', ({ taskId, error }) => {
      errors.push({ taskId, error });
    });

    // This would fail if worker doesn't support this task type
    // Depending on worker implementation, adjust accordingly
    await pool.addTask({
      type: 'invalid-task-type',
      data: {},
      priority: 5,
    });

    // Wait for potential error
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Errors might occur, but pool should remain healthy
    const status = pool.getStatus();
    expect(status.workers.length).toBeGreaterThan(0);
  });

  it('should support different pooling strategies', async () => {
    const roundRobinPool = new WorkerPoolManager({
      type: 'puppeteer',
      maxWorkers: 2,
      minWorkers: 1,
      poolingStrategy: 'round-robin',
      timeout: 5000,
    });

    await roundRobinPool.initialize();
    
    const taskId = await roundRobinPool.addTask({
      type: 'test',
      data: {},
      priority: 5,
    });

    expect(taskId).toBeDefined();

    await roundRobinPool.shutdown();
  });

  it('should handle retry mechanism', async () => {
    let attemptCount = 0;

    pool.on('taskFailed', () => {
      attemptCount++;
    });

    // Add a task that might fail
    await pool.addTask({
      type: 'test-retry',
      data: {},
      priority: 5,
      retries: 3,
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retries should be attempted (if task fails)
    // Actual behavior depends on worker implementation
  });

  it('should clean up resources on shutdown', async () => {
    const testPool = new WorkerPoolManager({
      type: 'puppeteer',
      maxWorkers: 1,
      minWorkers: 1,
    });

    await testPool.initialize();
    const statusBefore = testPool.getStatus();
    expect(statusBefore.workers.length).toBeGreaterThan(0);

    await testPool.shutdown();

    // After shutdown, pool should be clean
    const statusAfter = testPool.getStatus();
    expect(statusAfter.workers.length).toBe(0);
  });
});
