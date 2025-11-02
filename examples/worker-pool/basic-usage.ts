/**
 * Worker Pool Example
 * Demonstrates how to use WorkerPoolManager for efficient task processing
 */

import WorkerPoolManager from '../../src/services/WorkerPoolManager';

async function main() {
  console.log('🚀 Worker Pool Example\n');

  // 1. Create and initialize worker pool
  console.log('1. Initializing worker pool...');
  const pool = new WorkerPoolManager({
    type: 'puppeteer',
    maxWorkers: 4,
    minWorkers: 2,
    poolingStrategy: 'least-busy',
    timeout: 30000,
    retries: 2,
  });

  await pool.initialize();
  console.log('✅ Worker pool initialized\n');

  // 2. Setup event listeners
  console.log('2. Setting up event listeners...');
  pool.on('workerCreated', (workerId) => {
    console.log(`   📦 Worker created: ${workerId}`);
  });

  pool.on('taskCompleted', ({ taskId, result }) => {
    console.log(`   ✅ Task completed: ${taskId}`);
  });

  pool.on('taskFailed', ({ taskId, error }) => {
    console.error(`   ❌ Task failed: ${taskId}`, error);
  });

  pool.on('workerError', ({ workerId, error }) => {
    console.error(`   ⚠️  Worker error: ${workerId}`, error);
  });

  // 3. Add tasks with different priorities
  console.log('\n3. Adding tasks to the pool...');
  
  const urls = [
    'https://example.com',
    'https://github.com',
    'https://npmjs.com',
    'https://nodejs.org',
    'https://developer.mozilla.org',
  ];

  const taskIds = [];
  for (let i = 0; i < urls.length; i++) {
    const taskId = await pool.addTask({
      type: 'crawl',
      data: { 
        url: urls[i],
        options: { screenshot: true }
      },
      priority: Math.floor(Math.random() * 10), // Random priority 0-9
    });
    
    taskIds.push(taskId);
    console.log(`   📝 Added task: ${taskId} (URL: ${urls[i]})`);
  }

  // 4. Monitor pool status
  console.log('\n4. Monitoring pool status...');
  const interval = setInterval(() => {
    const status = pool.getStatus();
    console.log(`   📊 Status:`, {
      workers: status.workers.length,
      queueSize: status.queueSize,
      activeTasks: status.activeTasks,
      completed: status.totalCompleted,
      errors: status.totalErrors,
    });

    // Stop monitoring when queue is empty
    if (status.queueSize === 0 && status.activeTasks === 0) {
      clearInterval(interval);
      console.log('\n   ✨ All tasks processed!\n');
      cleanup();
    }
  }, 2000);

  // 5. Cleanup function
  async function cleanup() {
    console.log('5. Shutting down worker pool...');
    await pool.shutdown();
    console.log('✅ Worker pool shutdown complete\n');
    
    // Final statistics
    const finalStatus = pool.getStatus();
    console.log('📈 Final Statistics:');
    console.log(`   Total tasks completed: ${finalStatus.totalCompleted}`);
    console.log(`   Total errors: ${finalStatus.totalErrors}`);
    console.log(`   Workers created: ${finalStatus.workers.length}`);
    
    process.exit(0);
  }

  // Handle Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Interrupted! Cleaning up...');
    clearInterval(interval);
    await cleanup();
  });
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
