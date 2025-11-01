/**
 * Complete Integration Example
 * Demonstrates all systems working together
 */

import WorkerPoolManager from '../../src/services/WorkerPoolManager';
import SchemaComponentMapper from '../../src/schema/SchemaComponentMapper';
import NeuralComponentBuilder from '../../src/schema/NeuralComponentBuilder';
import SchemaServiceFactory from '../../src/services/SchemaServiceFactory';
import ServiceLinker from '../../src/services/ServiceLinker';

async function main() {
  console.log('🌟 Complete Integration Example\n');
  console.log('This example demonstrates all systems working together:\n');

  // ========== Part 1: Service Infrastructure ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 1: Service Infrastructure');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1.1 Initializing Service Factory...');
  const factory = new SchemaServiceFactory();
  await factory.initialize();
  console.log('✅ Service Factory ready\n');

  console.log('1.2 Initializing Service Linker...');
  const linker = new ServiceLinker(factory);
  await linker.initialize();
  console.log('✅ Service Linker ready\n');

  console.log('1.3 Starting services in dependency order...');
  await linker.startServicesInOrder();
  
  const runningServices = factory.getRunningServices();
  console.log(`✅ Started ${runningServices.length} services:`);
  runningServices.forEach(service => {
    console.log(`   - ${service.schema.name} (${service.schema['lightdom:serviceType']})`);
  });
  console.log('');

  // ========== Part 2: Component Generation ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 2: AI-Powered Component Generation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('2.1 Initializing Schema Component Mapper...');
  const mapper = new SchemaComponentMapper();
  await mapper.initialize();
  console.log('✅ Schema Mapper ready\n');

  console.log('2.2 Initializing Neural Component Builder...');
  const builder = new NeuralComponentBuilder(mapper);
  await builder.initialize();
  console.log('✅ Neural Builder ready\n');

  console.log('2.3 Generating component from use case...');
  const useCase = 'I need a dashboard page with analytics charts and data tables';
  console.log(`   Use case: "${useCase}"\n`);

  const component = await builder.generateComponent({
    useCase,
    context: {
      framework: 'react',
      style: 'functional',
      typescript: true,
      testingLibrary: 'vitest',
    },
    constraints: {
      accessibility: true,
      responsive: true,
    },
  });

  console.log('✅ Component generated successfully!');
  console.log(`   Name: ${component.schema.name}`);
  console.log(`   React Component: ${component.schema['lightdom:reactComponent']}`);
  console.log(`   Code length: ${component.code.length} characters`);
  console.log(`   Tests included: ${component.tests ? 'Yes' : 'No'}`);
  console.log(`   Styles included: ${component.styles ? 'Yes' : 'No'}`);
  console.log(`   Documentation: ${component.documentation ? 'Yes' : 'No'}`);
  console.log(`   Dependencies: ${component.dependencies.join(', ')}`);
  console.log(`   Linked components: ${component.linkedComponents.length}`);
  console.log('');

  // Show a snippet of generated code
  console.log('   Code snippet:');
  const codeLines = component.code.split('\n');
  codeLines.slice(0, 15).forEach(line => {
    console.log(`      ${line}`);
  });
  console.log(`      ... (${codeLines.length - 15} more lines)\n`);

  // Validate the generated component
  const validation = await builder.validateComponent(component);
  console.log('   Validation:');
  console.log(`      Valid: ${validation.valid ? '✅' : '❌'}`);
  if (validation.errors.length > 0) {
    console.log(`      Errors: ${validation.errors.join(', ')}`);
  }
  if (validation.warnings.length > 0) {
    console.log(`      Warnings: ${validation.warnings.join(', ')}`);
  }
  console.log('');

  // ========== Part 3: Worker Pool Task Processing ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 3: Worker Pool Task Processing');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('3.1 Initializing Worker Pool...');
  const pool = new WorkerPoolManager({
    type: 'puppeteer',
    maxWorkers: 3,
    minWorkers: 1,
    poolingStrategy: 'least-busy',
    timeout: 30000,
  });
  
  await pool.initialize();
  console.log('✅ Worker Pool ready\n');

  console.log('3.2 Adding tasks to worker pool...');
  const tasks = [
    { url: 'https://example.com', priority: 8 },
    { url: 'https://github.com', priority: 5 },
    { url: 'https://npmjs.com', priority: 3 },
  ];

  let completedCount = 0;
  pool.on('taskCompleted', ({ taskId }) => {
    completedCount++;
    console.log(`   ✅ Task completed: ${taskId} (${completedCount}/${tasks.length})`);
  });

  for (const task of tasks) {
    const taskId = await pool.addTask({
      type: 'crawl',
      data: { url: task.url },
      priority: task.priority,
    });
    console.log(`   📝 Added task: ${taskId} (Priority: ${task.priority})`);
  }

  console.log('\n3.3 Monitoring pool status...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const poolStatus = pool.getStatus();
  console.log(`   Active workers: ${poolStatus.workers.length}`);
  console.log(`   Queue size: ${poolStatus.queueSize}`);
  console.log(`   Active tasks: ${poolStatus.activeTasks}`);
  console.log(`   Completed: ${poolStatus.totalCompleted}`);
  console.log('');

  // ========== Part 4: System Health Check ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 4: System Health Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('4.1 Service health status:');
  for (const service of runningServices) {
    const health = linker.getServiceHealth(service.id);
    const icon = health.healthy ? '✅' : '⚠️';
    console.log(`   ${icon} ${service.schema.name}`);
    console.log(`      Status: ${service.status}`);
    console.log(`      Dependencies: ${health.dependencies.length}`);
  }
  console.log('');

  console.log('4.2 Component mapper statistics:');
  const mapperStats = mapper.getStatistics();
  console.log(`   Total schemas: ${mapperStats.totalSchemas}`);
  console.log(`   By type:`, mapperStats.byType);
  console.log('');

  console.log('4.3 Service factory statistics:');
  const factoryStats = factory.getStatistics();
  console.log(`   Running services: ${factoryStats.runningServices}`);
  console.log(`   By type:`, factoryStats.byType);
  console.log('');

  // ========== Part 5: Cleanup ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PART 5: System Cleanup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('5.1 Shutting down worker pool...');
  await pool.shutdown();
  console.log('✅ Worker pool stopped\n');

  console.log('5.2 Stopping services in reverse dependency order...');
  await linker.stopServicesInOrder();
  console.log('✅ Services stopped\n');

  console.log('5.3 Shutting down service factory...');
  await factory.shutdown();
  console.log('✅ Factory shutdown complete\n');

  // ========== Final Summary ==========
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('✨ Complete integration example finished successfully!\n');
  console.log('Systems demonstrated:');
  console.log('  ✅ Service Factory - Dynamic service creation');
  console.log('  ✅ Service Linker - Dependency management');
  console.log('  ✅ Schema Mapper - Intelligent component selection');
  console.log('  ✅ Neural Builder - AI-powered code generation');
  console.log('  ✅ Worker Pool - Efficient task processing');
  console.log('');
  console.log('All systems integrated and working together! 🎉\n');

  process.exit(0);
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
