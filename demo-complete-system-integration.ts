/**
 * Complete System Integration Demo
 * 
 * Demonstrates the integration of all implemented systems:
 * - Component Hierarchy
 * - Schema & Knowledge Graph Generation
 * - Storybook Generation
 * - Template System
 * - Plugin Manager
 * - Design Library Indexer
 * - Self-Organizing Styleguide
 * - Container Orchestration
 */

import { ComponentHierarchyService } from './src/services/hierarchy/ComponentHierarchyService';
import { SchemaKnowledgeGraphGenerator } from './src/services/schema/SchemaKnowledgeGraphGenerator';
import { EnhancedStorybookGenerator } from './src/services/storybook/EnhancedStorybookGenerator';
import { TaskTemplateDocumentationSystem } from './src/services/templates/TaskTemplateDocumentationSystem';
import { PluginManager, SimpleEventBus, SimpleComponentRegistry, SimpleLogger } from './src/services/plugins/PluginManager';
import { DesignLibraryIndexer } from './src/services/design-library/DesignLibraryIndexer';
import { SelfOrganizingStyleguideGenerator } from './src/services/styleguide/SelfOrganizingStyleguideGenerator';
import { ContainerServiceOrchestrator } from './src/services/container/ContainerServiceOrchestrator';

async function completeSystemDemo() {
  console.log('🚀 Starting Complete System Integration Demo...\n');

  // ============================================================
  // 1. Component Hierarchy System
  // ============================================================
  console.log('📊 STEP 1: Component Hierarchy System');
  console.log('─'.repeat(60));

  const hierarchyService = new ComponentHierarchyService();

  const hierarchy = hierarchyService.createHierarchy('design-system', {
    id: 'root',
    name: 'DesignSystem',
    type: 'organism',
    level: 0,
    parent: null,
    children: [],
    metadata: {
      description: 'Root design system',
      tags: ['core'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Add atomic components
  hierarchyService.addNode('design-system', {
    id: 'button-atom',
    name: 'Button',
    type: 'atom',
    level: 1,
    parent: 'root',
    children: [],
    metadata: {
      description: 'Basic button component',
      tags: ['interactive', 'form'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  hierarchyService.addNode('design-system', {
    id: 'input-atom',
    name: 'Input',
    type: 'atom',
    level: 1,
    parent: 'root',
    children: [],
    metadata: {
      description: 'Basic input component',
      tags: ['interactive', 'form'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const viz = hierarchyService.generateVisualization('design-system');
  console.log('✅ Hierarchy created with visualization:');
  console.log(viz.mermaid);
  console.log();

  // ============================================================
  // 2. Schema & Knowledge Graph Generation
  // ============================================================
  console.log('🔗 STEP 2: Schema & Knowledge Graph Generation');
  console.log('─'.repeat(60));

  const schemaGenerator = new SchemaKnowledgeGraphGenerator();

  schemaGenerator.addSchema({
    name: 'User',
    tableName: 'users',
    description: 'User account',
    fields: [
      {
        name: 'email',
        type: 'string',
        required: true,
        unique: true,
      },
      {
        name: 'name',
        type: 'string',
        required: true,
      },
    ],
    timestamps: true,
    softDelete: true,
  });

  const migration = schemaGenerator.generateMigrationSQL('User');
  const tsInterface = schemaGenerator.generateTypeScriptInterface('User');
  const graph = schemaGenerator.getKnowledgeGraph();

  console.log('✅ Schema generated:');
  console.log('- Migration SQL created');
  console.log('- TypeScript interface created');
  console.log(`- Knowledge graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
  console.log();

  // ============================================================
  // 3. Storybook Generation
  // ============================================================
  console.log('📖 STEP 3: Storybook Story Generation');
  console.log('─'.repeat(60));

  const storybookGen = new EnhancedStorybookGenerator();
  await storybookGen.initialize();

  await storybookGen.generateComponent({
    name: 'Card',
    props: {
      title: 'string',
      description: 'string',
    },
  });

  const story = await storybookGen.generateStory({
    componentName: 'Card',
    componentPath: '../components/generated/Card',
    atomicLevel: 'molecule',
    props: {
      title: 'Sample Card',
      description: 'This is a card component',
    },
  });

  console.log('✅ Storybook story generated:');
  console.log(`- Component: ${story.metadata.componentName}`);
  console.log(`- Stories: ${story.metadata.storiesCount}`);
  console.log();

  // ============================================================
  // 4. Template System
  // ============================================================
  console.log('📝 STEP 4: Task Template System');
  console.log('─'.repeat(60));

  const templateSystem = new TaskTemplateDocumentationSystem();
  await templateSystem.initialize();

  const template = await templateSystem.createTemplate({
    name: 'CRUD API Template',
    description: 'Generate complete CRUD API',
    category: 'api',
    parts: [],
    variables: {
      modelName: {
        name: 'modelName',
        type: 'string',
        description: 'Name of the model',
        required: true,
      },
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: ['api', 'crud'],
      complexity: 'moderate',
      estimatedTime: '30 minutes',
    },
  });

  console.log('✅ Template created:');
  console.log(`- Name: ${template.name}`);
  console.log(`- Complexity: ${template.metadata.complexity}`);
  console.log();

  // ============================================================
  // 5. Plugin System
  // ============================================================
  console.log('🔌 STEP 5: DOM Rendering Plugin System');
  console.log('─'.repeat(60));

  const pluginContext = {
    domRenderer: {} as any,
    eventBus: new SimpleEventBus(),
    componentRegistry: new SimpleComponentRegistry(),
    logger: new SimpleLogger(),
  };

  const pluginManager = new PluginManager(pluginContext);

  await pluginManager.registerPlugin({
    manifest: {
      name: 'example-plugin',
      version: '1.0.0',
      description: 'Example plugin',
      main: 'index.js',
    },
    onLoad: async (ctx) => {
      ctx.logger.log('Plugin loaded!');
    },
  });

  await pluginManager.loadPlugin('example-plugin');

  console.log('✅ Plugin system initialized:');
  console.log(`- Loaded plugins: ${pluginManager.getLoadedPlugins().length}`);
  console.log();

  // ============================================================
  // 6. Design Library Indexing
  // ============================================================
  console.log('📚 STEP 6: Design Library Indexing');
  console.log('─'.repeat(60));

  const libraryIndexer = new DesignLibraryIndexer();

  const library = await libraryIndexer.indexLibrary({
    name: 'material-ui',
    source: 'npm',
    framework: 'react',
  });

  console.log('✅ Design library indexed:');
  console.log(`- Library: ${library.name}`);
  console.log(`- Components: ${library.metadata.totalComponents}`);
  console.log();

  // ============================================================
  // 7. Self-Organizing Styleguide
  // ============================================================
  console.log('🎨 STEP 7: Self-Organizing Styleguide');
  console.log('─'.repeat(60));

  const styleguideGen = new SelfOrganizingStyleguideGenerator();

  const styleguide = await styleguideGen.generateFromComponents(
    [
      { name: 'Button', type: 'atom' },
      { name: 'Card', type: 'molecule' },
    ],
    {
      name: 'My Design System',
      version: '1.0.0',
      description: 'A comprehensive design system',
      framework: 'react',
      designSystem: 'custom',
    }
  );

  console.log('✅ Styleguide generated:');
  console.log(`- Tokens: ${styleguide.metadata.totalTokens}`);
  console.log(`- Rules: ${styleguide.metadata.totalRules}`);
  console.log(`- Components: ${styleguide.metadata.totalComponents}`);
  console.log();

  // ============================================================
  // 8. Container Orchestration
  // ============================================================
  console.log('🐳 STEP 8: Container Service Orchestration');
  console.log('─'.repeat(60));

  const containerOrch = new ContainerServiceOrchestrator();

  const reactContainer = containerOrch.createReactRenderingContainer({
    name: 'react-app',
    port: 3000,
    environment: 'development',
  });

  const apiContainer = containerOrch.createExpressAPIContainer({
    name: 'api-server',
    port: 3001,
    databaseUrl: 'postgresql://localhost/mydb',
  });

  const dockerCompose = containerOrch.generateDockerCompose([
    reactContainer.id,
    apiContainer.id,
  ]);

  console.log('✅ Containers created:');
  console.log(`- React app container: ${reactContainer.name}`);
  console.log(`- API server container: ${apiContainer.name}`);
  console.log('- Docker Compose configuration generated');
  console.log();

  // ============================================================
  // Summary
  // ============================================================
  console.log('✨ DEMO COMPLETE - Summary');
  console.log('='.repeat(60));
  console.log('All systems successfully integrated:');
  console.log('✅ Component Hierarchy - Atomic design with visualization');
  console.log('✅ Schema Generator - CRUD APIs and knowledge graphs');
  console.log('✅ Storybook Generator - Automated story creation');
  console.log('✅ Template System - Reusable task templates');
  console.log('✅ Plugin Manager - Extensible rendering system');
  console.log('✅ Library Indexer - Cross-library component analysis');
  console.log('✅ Styleguide Generator - Auto-organized design tokens');
  console.log('✅ Container Orchestration - Service mesh configuration');
  console.log('\n🎉 Ready for production use!');
}

// Run the demo
if (require.main === module) {
  completeSystemDemo().catch(console.error);
}

export { completeSystemDemo };
