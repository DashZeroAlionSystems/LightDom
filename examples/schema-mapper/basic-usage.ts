/**
 * Schema Component Mapper Example
 * Demonstrates how to use SchemaComponentMapper for intelligent component selection
 */

import SchemaComponentMapper from '../../src/schema/SchemaComponentMapper';

async function main() {
  console.log('🎨 Schema Component Mapper Example\n');

  // 1. Initialize mapper
  console.log('1. Initializing Schema Component Mapper...');
  const mapper = new SchemaComponentMapper();
  await mapper.initialize();
  console.log('✅ Mapper initialized\n');

  // 2. Show available schemas
  console.log('2. Available component schemas:');
  const schemas = mapper.getAllSchemas();
  schemas.forEach((schema, index) => {
    console.log(`   ${index + 1}. ${schema.name} (${schema['@type']})`);
    console.log(`      Type: ${schema['lightdom:componentType']}`);
    console.log(`      Use cases: ${schema['lightdom:useCase'].join(', ')}`);
    console.log('');
  });

  // 3. Show statistics
  const stats = mapper.getStatistics();
  console.log('📊 Statistics:');
  console.log(`   Total schemas: ${stats.totalSchemas}`);
  console.log(`   By type:`, stats.byType);
  console.log(`   By category:`, stats.byCategory);
  console.log('');

  // 4. Example use case selections
  console.log('4. Testing component selection with various use cases:\n');

  const useCases = [
    'I need a dashboard with analytics charts and metrics',
    'Product card for an ecommerce website',
    'Data table with sorting and filtering capabilities',
    'Chart to visualize sales data',
    'Simple button to submit a form',
    'Article page with author information',
  ];

  for (const useCase of useCases) {
    console.log(`   📝 Use Case: "${useCase}"`);
    
    const match = await mapper.selectComponent(useCase);
    
    if (match) {
      console.log(`   ✅ Best Match: ${match.schema.name}`);
      console.log(`      Score: ${match.score}`);
      console.log(`      React Component: ${match.schema['lightdom:reactComponent']}`);
      console.log(`      Reasons: ${match.reasons.join(', ')}`);
    } else {
      console.log(`   ❌ No match found`);
    }
    console.log('');
  }

  // 5. Filter by type
  console.log('5. Components by type:');
  const atoms = mapper.getComponentsByType('atom');
  const organisms = mapper.getComponentsByType('organism');
  const pages = mapper.getComponentsByType('page');

  console.log(`   Atoms (${atoms.length}):`, atoms.map(s => s.name).join(', '));
  console.log(`   Organisms (${organisms.length}):`, organisms.map(s => s.name).join(', '));
  console.log(`   Pages (${pages.length}):`, pages.map(s => s.name).join(', '));
  console.log('');

  // 6. Add custom schema
  console.log('6. Adding custom schema...');
  const customSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': 'lightdom:video-player',
    name: 'Video Player',
    description: 'Responsive video player with controls',
    'lightdom:componentType': 'organism' as const,
    'lightdom:reactComponent': 'VideoPlayer',
    'lightdom:props': [
      {
        name: 'src',
        type: 'string' as const,
        required: true,
        description: 'Video source URL',
      },
      {
        name: 'autoplay',
        type: 'boolean' as const,
        required: false,
        default: false,
        description: 'Auto-play video',
      },
    ],
    'lightdom:linkedSchemas': [],
    'lightdom:useCase': ['video', 'media', 'player'],
    'lightdom:semanticMeaning': 'Plays video content with controls',
    'lightdom:priority': 7,
    'lightdom:category': 'organism',
  };

  await mapper.saveSchema(customSchema);
  console.log('✅ Custom schema added: Video Player\n');

  // 7. Test custom schema selection
  console.log('7. Testing custom schema selection:');
  const videoMatch = await mapper.selectComponent('I need a video player for my website');
  
  if (videoMatch) {
    console.log(`   ✅ Selected: ${videoMatch.schema.name}`);
    console.log(`      Score: ${videoMatch.score}`);
    console.log(`      Props:`, videoMatch.schema['lightdom:props'].map(p => p.name).join(', '));
  }
  console.log('');

  // 8. Get component by ID
  console.log('8. Retrieving specific component:');
  const dashboard = mapper.getComponentById('lightdom:dashboard-page');
  if (dashboard) {
    console.log(`   📄 ${dashboard.name}`);
    console.log(`      Description: ${dashboard.description}`);
    console.log(`      Props: ${dashboard['lightdom:props'].length}`);
    console.log(`      Linked schemas: ${dashboard['lightdom:linkedSchemas'].length}`);
  }
  console.log('');

  console.log('✨ Example complete!\n');
}

// Run the example
main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
