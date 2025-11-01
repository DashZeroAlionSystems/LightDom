/**
 * Service Orchestration Example
 * Demonstrates dynamic service creation and dependency management
 */

import SchemaServiceFactory from '../../src/services/SchemaServiceFactory';
import ServiceLinker from '../../src/services/ServiceLinker';

async function main() {
  console.log('🔧 Service Orchestration Example\n');

  // 1. Initialize Service Factory
  console.log('1. Initializing Service Factory...');
  const factory = new SchemaServiceFactory();
  await factory.initialize();
  console.log('✅ Service Factory initialized\n');

  // 2. Show available service schemas
  console.log('2. Available service schemas:');
  const schemas = factory.getAllSchemas();
  schemas.forEach((schema, index) => {
    console.log(`   ${index + 1}. ${schema.name}`);
    console.log(`      ID: ${schema['@id']}`);
    console.log(`      Type: ${schema['lightdom:serviceType']}`);
    console.log(`      Priority: ${schema['lightdom:priority']}`);
    console.log(`      Auto-start: ${schema['lightdom:autoStart']}`);
    console.log(`      Linked services: ${schema['lightdom:linkedServices'].join(', ') || 'None'}`);
    console.log('');
  });

  // 3. Initialize Service Linker
  console.log('3. Initializing Service Linker...');
  const linker = new ServiceLinker(factory);
  await linker.initialize();
  console.log('✅ Service Linker initialized\n');

  // 4. Show dependency graph
  console.log('4. Dependency graph:');
  const graph = linker.buildDependencyGraph();
  console.log(`   Nodes: ${graph.nodes.size}`);
  console.log(`   Edges: ${graph.edges.length}`);
  console.log(`   Dependency order:`, graph.dependencyOrder.map(id => {
    const schema = factory.getSchema(id);
    return schema ? schema.name : id;
  }));
  console.log('');

  // 5. Validate dependencies
  console.log('5. Validating dependency graph...');
  try {
    linker.validateDependencyGraph();
    console.log('✅ No circular dependencies detected\n');
  } catch (error) {
    console.error('❌ Circular dependency detected:', error);
  }

  // 6. Get linker statistics
  const linkerStats = linker.getStatistics();
  console.log('📊 Linker Statistics:');
  console.log(`   Total links: ${linkerStats.totalLinks}`);
  console.log(`   By type:`, linkerStats.byType);
  console.log(`   Max dependency depth: ${linkerStats.maxDependencyDepth}`);
  console.log('');

  // 7. Start services in dependency order
  console.log('7. Starting services in dependency order...');
  await linker.startServicesInOrder();
  console.log('✅ Services started\n');

  // 8. Check service health
  console.log('8. Checking service health:');
  const runningServices = factory.getRunningServices();
  
  for (const service of runningServices) {
    const health = linker.getServiceHealth(service.id);
    console.log(`   ${service.schema.name}:`);
    console.log(`      Status: ${service.status}`);
    console.log(`      Healthy: ${health.healthy ? '✅' : '❌'}`);
    console.log(`      Dependencies: ${health.dependencies.length}`);
    
    if (health.dependencies.length > 0) {
      health.dependencies.forEach(dep => {
        console.log(`         - ${dep.id}: ${dep.healthy ? '✅' : '❌'} (${dep.status})`);
      });
    }
    console.log('');
  }

  // 9. Get factory statistics
  const factoryStats = factory.getStatistics();
  console.log('📈 Factory Statistics:');
  console.log(`   Total schemas: ${factoryStats.totalSchemas}`);
  console.log(`   Total services: ${factoryStats.totalServices}`);
  console.log(`   Running services: ${factoryStats.runningServices}`);
  console.log(`   By type:`, factoryStats.byType);
  console.log(`   By status:`, factoryStats.byStatus);
  console.log('');

  // 10. Visualize graph
  console.log('10. Service graph visualization data:');
  const viz = linker.getGraphVisualization();
  console.log(`   Nodes (${viz.nodes.length}):`);
  viz.nodes.forEach(node => {
    console.log(`      - ${node.label} (${node.type}) [${node.status || 'not created'}]`);
  });
  console.log(`   Edges (${viz.edges.length}):`);
  viz.edges.forEach(edge => {
    const fromNode = viz.nodes.find(n => n.id === edge.from);
    const toNode = viz.nodes.find(n => n.id === edge.to);
    console.log(`      - ${fromNode?.label} → ${toNode?.label} (${edge.label})`);
  });
  console.log('');

  // 11. Test service operations
  console.log('11. Testing service operations:');
  
  // Check if a service can start
  const canStart = linker.canStartService('lightdom:crawler-service');
  console.log(`   Can start crawler service: ${canStart.canStart ? '✅' : '❌'}`);
  if (!canStart.canStart && canStart.reasons.length > 0) {
    console.log(`   Reasons: ${canStart.reasons.join(', ')}`);
  }
  console.log('');

  // 12. Cleanup
  console.log('12. Shutting down services...');
  await linker.stopServicesInOrder();
  console.log('✅ Services stopped in reverse dependency order\n');

  await factory.shutdown();
  console.log('✅ Factory shutdown complete\n');

  console.log('✨ Example complete!\n');
  process.exit(0);
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
