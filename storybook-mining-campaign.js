/**
 * Storybook Design System Mining Campaign Configuration
 * 
 * Connects neural network to crawler for intelligent Storybook/design system mining:
 * - Discovers Storybook instances across the web
 * - Mines patterns and differences in design systems
 * - Neural network learns what makes good vs bad components
 * - Auto-generates atom components with Storybook stories
 * - Takes screenshots and mines UX patterns
 * - Trains on similarities/differences for better detection
 */

import { NeuralCrawlerOrchestrator } from './services/neural-crawler-orchestrator.js';
import { StorybookMiningService } from './services/storybook-mining-service.js';
import { StorybookDiscoveryService } from './services/storybook-discovery-service.js';
import { StorybookSeederService } from './services/storybook-seeder-service.js';
import { NeuralNetworkInstanceManager } from './services/NeuralNetworkInstanceManager.js';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorybookMiningCampaign {
  constructor(config = {}) {
    this.config = {
      // Campaign Settings
      campaignName: config.campaignName || 'storybook-design-system-mining',
      outputDir: config.outputDir || path.join(__dirname, 'mined-components'),
      
      // Neural Network Configuration
      neuralConfig: {
        modelType: 'design-system-classifier',
        architecture: 'cnn-lstm', // Hybrid for pattern + sequence recognition
        objectives: [
          'component-quality-detection',
          'design-pattern-similarity',
          'ux-effectiveness-scoring',
          'storybook-detection'
        ],
        learningRate: 0.001,
        batchSize: 32,
        epochs: 50,
      },
      
      // Crawler Configuration
      crawlerConfig: {
        maxConcurrency: 10,
        intelligentPrioritization: true,
        adaptiveDepth: true,
        respectRobotsTxt: true,
        userAgent: 'LightDom-StorybookMiner/1.0',
      },
      
      // Mining Targets
      miningTargets: {
        storybooks: true,
        styleGuides: true,
        componentLibraries: true,
        designSystems: true,
        patterns: ['components', 'tokens', 'animations', 'interactions'],
      },
      
      // Auto-generation Rules
      autoGeneration: {
        enabled: true,
        requiresScreenshot: true, // RULE: Must take screenshots of all components
        requiresUXMining: true,   // RULE: Mine UX patterns from stories and tests
        atomicComponentsOnly: true,
        storybookIntegration: true,
        outputPath: path.join(__dirname, 'src/components/atoms/mined'),
        storiesPath: path.join(__dirname, 'src/stories/atoms/mined'),
      },
      
      // Pattern Analysis
      patternAnalysis: {
        mineSimilarities: true,
        mineDifferences: true,
        identifyBestPractices: true,
        identifyAntiPatterns: true,
        compareAcrossLibraries: true,
      },
      
      // Quality Metrics
      qualityMetrics: {
        accessibilityScore: true,
        performanceScore: true,
        designConsistency: true,
        documentationQuality: true,
        testCoverage: true,
      },
      
      ...config
    };
    
    // Initialize database connection
    this.db = config.db || new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lightdom',
      max: 20
    });
    
    // Services
    this.neuralOrchestrator = null;
    this.storybookMining = null;
    this.discoveryService = null;
    this.seederService = null;
    this.neuralManager = null;
    this.campaignActive = false;
  }

  /**
   * Initialize the campaign system
   */
  async initialize() {
    console.log('🚀 Initializing Storybook Mining Campaign System...');
    console.log(`📋 Campaign: ${this.config.campaignName}`);
    
    try {
      // Ensure directories exist
      await fs.mkdir(this.config.outputDir, { recursive: true });
      await fs.mkdir(this.config.autoGeneration.outputPath, { recursive: true });
      await fs.mkdir(this.config.autoGeneration.storiesPath, { recursive: true });
      
      // Initialize database tables
      await this.initializeDatabase();
      
      // Initialize neural network manager
      console.log('🧠 Initializing neural network instance...');
      this.neuralManager = new NeuralNetworkInstanceManager(this.db);
      await this.neuralManager.initialize();
      
      // Create dedicated neural network for Storybook mining
      const neuralInstance = await this.neuralManager.createInstance({
        clientId: 'storybook-mining-campaign',
        modelType: this.config.neuralConfig.modelType,
        modelArchitecture: this.config.neuralConfig.architecture,
        objectives: this.config.neuralConfig.objectives,
      });
      
      this.neuralInstanceId = neuralInstance.id;
      console.log(`✅ Neural network instance created: ${this.neuralInstanceId}`);
      
      // Initialize neural crawler orchestrator
      console.log('🕷️ Initializing neural crawler orchestrator...');
      this.neuralOrchestrator = new NeuralCrawlerOrchestrator({
        db: this.db,
        ...this.config.crawlerConfig,
        neuralInstanceId: this.neuralInstanceId,
      });
      await this.neuralOrchestrator.initialize();
      
      // Initialize Storybook mining service
      console.log('📚 Initializing Storybook mining service...');
      this.storybookMining = new StorybookMiningService({
        db: this.db,
        outputDir: this.config.outputDir,
      });
      await this.storybookMining.initialize();
      
      // Initialize discovery service
      console.log('🔍 Initializing discovery service...');
      this.discoveryService = new StorybookDiscoveryService({
        db: this.db,
      });
      await this.discoveryService.initialize();
      
      // Initialize seeder service
      console.log('🌱 Initializing URL seeder service...');
      this.seederService = new StorybookSeederService({
        db: this.db,
      });
      await this.seederService.initialize();
      
      // Connect neural network to crawler decisions
      this.connectNeuralToCrawler();
      
      // Setup event handlers
      this.setupEventHandlers();
      
      console.log('✅ Campaign system initialized successfully');
      
      return {
        success: true,
        neuralInstanceId: this.neuralInstanceId,
        services: {
          neuralOrchestrator: 'initialized',
          storybookMining: 'initialized',
          discoveryService: 'initialized',
          seederService: 'initialized',
        }
      };
    } catch (error) {
      console.error('❌ Failed to initialize campaign system:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables for campaign tracking
   */
  async initializeDatabase() {
    const schema = `
      -- Campaign tracking
      CREATE TABLE IF NOT EXISTS mining_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(50) DEFAULT 'active',
        config JSONB DEFAULT '{}',
        neural_instance_id UUID,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metrics JSONB DEFAULT '{}'
      );

      -- Pattern analysis results
      CREATE TABLE IF NOT EXISTS design_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES mining_campaigns(id),
        pattern_type VARCHAR(100),
        pattern_name VARCHAR(255),
        frequency INTEGER DEFAULT 0,
        quality_score FLOAT,
        is_best_practice BOOLEAN DEFAULT false,
        is_anti_pattern BOOLEAN DEFAULT false,
        similarities JSONB DEFAULT '[]',
        differences JSONB DEFAULT '[]',
        examples JSONB DEFAULT '[]',
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Component generation tracking
      CREATE TABLE IF NOT EXISTS generated_components (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES mining_campaigns(id),
        component_name VARCHAR(255) NOT NULL,
        component_type VARCHAR(100),
        source_urls TEXT[],
        file_path TEXT,
        story_path TEXT,
        screenshot_path TEXT,
        ux_patterns JSONB DEFAULT '{}',
        quality_metrics JSONB DEFAULT '{}',
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Neural network training data
      CREATE TABLE IF NOT EXISTS neural_training_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES mining_campaigns(id),
        data_type VARCHAR(100),
        input_features JSONB,
        output_labels JSONB,
        source_url TEXT,
        quality_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- UX pattern mining
      CREATE TABLE IF NOT EXISTS ux_patterns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID REFERENCES mining_campaigns(id),
        pattern_category VARCHAR(100),
        pattern_description TEXT,
        effectiveness_score FLOAT,
        usage_frequency INTEGER DEFAULT 0,
        source_storybooks TEXT[],
        examples JSONB DEFAULT '[]',
        discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON mining_campaigns(status);
      CREATE INDEX IF NOT EXISTS idx_patterns_campaign ON design_patterns(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_patterns_quality ON design_patterns(quality_score);
      CREATE INDEX IF NOT EXISTS idx_generated_campaign ON generated_components(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_training_campaign ON neural_training_data(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_ux_patterns_campaign ON ux_patterns(campaign_id);
    `;

    await this.db.query(schema);
  }

  /**
   * Connect neural network to make intelligent crawling decisions
   */
  connectNeuralToCrawler() {
    console.log('🔌 Connecting neural network to crawler...');
    
    // Neural network informs crawling priorities
    this.neuralOrchestrator.on('url-discovered', async (url, metadata) => {
      // Ask neural network if this URL is worth crawling
      const prediction = await this.neuralManager.predict(this.neuralInstanceId, {
        url,
        metadata,
        historyData: await this.getCrawlHistory(url),
      });
      
      // Neural network predicts: isStorybook, designSystemQuality, crawlPriority
      if (prediction.isStorybook && prediction.designSystemQuality > 0.7) {
        console.log(`🎯 Neural network prioritizing: ${url} (quality: ${prediction.designSystemQuality})`);
        await this.queueForCrawling(url, prediction.crawlPriority);
      }
    });
    
    // Feed crawl results back to neural network for learning
    this.storybookMining.on('component-extracted', async (component) => {
      await this.addTrainingData({
        type: 'component-quality',
        input: component.features,
        output: component.qualityScore,
        sourceUrl: component.sourceUrl,
      });
    });
    
    // Train on pattern similarities/differences
    this.on('patterns-analyzed', async (analysis) => {
      await this.addTrainingData({
        type: 'pattern-analysis',
        input: analysis.features,
        output: {
          isBestPractice: analysis.isBestPractice,
          effectivenessScore: analysis.effectivenessScore,
        },
        sourceUrl: analysis.sourceUrls,
      });
      
      // Retrain if we have enough new data
      await this.checkAndRetrain();
    });
  }

  /**
   * Setup event handlers for the campaign
   */
  setupEventHandlers() {
    // Handle component mining completion
    this.storybookMining.on('mining-complete', async (data) => {
      console.log(`✅ Mining complete: ${data.url}`);
      
      // Analyze patterns
      const patterns = await this.analyzePatterns(data.components);
      
      // Generate atom components with Storybook stories
      if (this.config.autoGeneration.enabled) {
        for (const component of data.components) {
          await this.generateAtomComponent(component, patterns);
        }
      }
      
      // Update campaign metrics
      await this.updateMetrics({
        componentsMined: data.components.length,
        patternsDiscovered: patterns.length,
      });
    });
    
    // Handle discovery of new Storybooks
    this.discoveryService.on('storybook-discovered', async (storybookUrl) => {
      console.log(`📚 New Storybook discovered: ${storybookUrl}`);
      
      // Queue for mining
      await this.queueForMining(storybookUrl);
    });
  }

  /**
   * Start the mining campaign
   */
  async start() {
    console.log('\n🎯 Starting Storybook Mining Campaign...\n');
    
    if (this.campaignActive) {
      throw new Error('Campaign is already running');
    }
    
    this.campaignActive = true;
    
    // Record campaign start
    const result = await this.db.query(`
      INSERT INTO mining_campaigns (name, config, neural_instance_id, status)
      VALUES ($1, $2, $3, 'active')
      ON CONFLICT (name) DO UPDATE 
      SET status = 'active', last_active = CURRENT_TIMESTAMP
      RETURNING id
    `, [
      this.config.campaignName,
      JSON.stringify(this.config),
      this.neuralInstanceId,
    ]);
    
    this.campaignId = result.rows[0].id;
    
    // Seed initial URLs
    console.log('🌱 Seeding initial Storybook URLs...');
    await this.seederService.seedFromSources({
      github: true,
      npm: true,
      popular: true,
    });
    
    // Start discovery service
    console.log('🔍 Starting Storybook discovery...');
    await this.discoveryService.start();
    
    // Start mining discovered Storybooks
    console.log('⛏️ Starting mining operations...');
    this.startMiningLoop();
    
    console.log('\n✅ Campaign active! Mining in progress...\n');
    console.log('📊 Metrics will be updated in real-time');
    console.log('🧠 Neural network is learning from each discovery\n');
    
    return {
      success: true,
      campaignId: this.campaignId,
      neuralInstanceId: this.neuralInstanceId,
    };
  }

  /**
   * Main mining loop
   */
  async startMiningLoop() {
    while (this.campaignActive) {
      try {
        // Get next URL from queue (neural network prioritized)
        const url = await this.getNextMiningTarget();
        
        if (url) {
          console.log(`⛏️ Mining: ${url}`);
          
          // Mine the Storybook
          const result = await this.storybookMining.mineWebsite(url, {
            extractComponents: true,
            extractPatterns: true,
            extractUX: this.config.autoGeneration.requiresUXMining,
            takeScreenshots: this.config.autoGeneration.requiresScreenshot,
          });
          
          console.log(`✅ Mined ${result.components.length} components from ${url}`);
        } else {
          // No URLs in queue, wait a bit
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error('❌ Mining error:', error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Generate atom component with Storybook story (REQUIRED)
   */
  async generateAtomComponent(component, patterns) {
    console.log(`🔨 Generating component: ${component.name}`);
    
    try {
      // RULE: Take screenshot
      let screenshot = null;
      if (this.config.autoGeneration.requiresScreenshot) {
        screenshot = await this.takeComponentScreenshot(component);
      }
      
      // RULE: Mine UX patterns from stories and tests
      let uxPatterns = {};
      if (this.config.autoGeneration.requiresUXMining) {
        uxPatterns = await this.mineUXPatterns(component);
      }
      
      // Generate React component
      const componentCode = this.generateReactComponent(component, patterns);
      const componentPath = path.join(
        this.config.autoGeneration.outputPath,
        `${component.name}.tsx`
      );
      
      // Generate Storybook story
      const storyCode = this.generateStorybookStory(component, uxPatterns);
      const storyPath = path.join(
        this.config.autoGeneration.storiesPath,
        `${component.name}.stories.tsx`
      );
      
      // Write files
      await fs.writeFile(componentPath, componentCode, 'utf-8');
      await fs.writeFile(storyPath, storyCode, 'utf-8');
      
      // Record generation
      await this.db.query(`
        INSERT INTO generated_components (
          campaign_id, component_name, component_type, source_urls,
          file_path, story_path, screenshot_path, ux_patterns, quality_metrics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        this.campaignId,
        component.name,
        component.type,
        [component.sourceUrl],
        componentPath,
        storyPath,
        screenshot,
        JSON.stringify(uxPatterns),
        JSON.stringify(component.qualityMetrics || {}),
      ]);
      
      console.log(`✅ Generated: ${componentPath}`);
      console.log(`✅ Story: ${storyPath}`);
      if (screenshot) {
        console.log(`📸 Screenshot: ${screenshot}`);
      }
      
      return { componentPath, storyPath, screenshot, uxPatterns };
    } catch (error) {
      console.error(`❌ Failed to generate component ${component.name}:`, error.message);
      throw error;
    }
  }

  /**
   * Analyze patterns (similarities and differences)
   */
  async analyzePatterns(components) {
    console.log('🔍 Analyzing design patterns...');
    
    const patterns = [];
    
    // Group components by type
    const grouped = components.reduce((acc, comp) => {
      if (!acc[comp.type]) acc[comp.type] = [];
      acc[comp.type].push(comp);
      return acc;
    }, {});
    
    // Analyze each group
    for (const [type, comps] of Object.entries(grouped)) {
      if (comps.length < 2) continue; // Need at least 2 to compare
      
      // Find similarities
      const similarities = this.findSimilarities(comps);
      
      // Find differences
      const differences = this.findDifferences(comps);
      
      // Determine if it's a best practice or anti-pattern
      const qualityScores = comps.map(c => c.qualityMetrics?.overall || 0);
      const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;
      
      const pattern = {
        type,
        similarities,
        differences,
        isBestPractice: avgQuality > 0.8,
        isAntiPattern: avgQuality < 0.4,
        examples: comps.map(c => ({ url: c.sourceUrl, quality: c.qualityMetrics })),
      };
      
      patterns.push(pattern);
      
      // Store in database
      await this.db.query(`
        INSERT INTO design_patterns (
          campaign_id, pattern_type, pattern_name, quality_score,
          is_best_practice, is_anti_pattern, similarities, differences, examples
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        this.campaignId,
        type,
        `${type}-pattern`,
        avgQuality,
        pattern.isBestPractice,
        pattern.isAntiPattern,
        JSON.stringify(similarities),
        JSON.stringify(differences),
        JSON.stringify(pattern.examples),
      ]);
    }
    
    // Emit for neural network training
    this.emit('patterns-analyzed', { patterns, features: this.extractPatternFeatures(patterns) });
    
    console.log(`✅ Analyzed ${patterns.length} patterns`);
    return patterns;
  }

  /**
   * Find similarities between components
   */
  findSimilarities(components) {
    // Look for common attributes, styles, patterns
    const commonStyles = {};
    const commonAttributes = {};
    const commonPatterns = [];
    
    // Analyze CSS properties
    components.forEach(comp => {
      if (comp.styles) {
        Object.entries(comp.styles).forEach(([prop, value]) => {
          if (!commonStyles[prop]) commonStyles[prop] = {};
          if (!commonStyles[prop][value]) commonStyles[prop][value] = 0;
          commonStyles[prop][value]++;
        });
      }
    });
    
    // Find properties that appear in >50% of components
    const similarities = [];
    Object.entries(commonStyles).forEach(([prop, values]) => {
      const maxCount = Math.max(...Object.values(values));
      if (maxCount / components.length > 0.5) {
        const commonValue = Object.entries(values).find(([v, c]) => c === maxCount)?.[0];
        similarities.push({ property: prop, value: commonValue, frequency: maxCount / components.length });
      }
    });
    
    return similarities;
  }

  /**
   * Find differences between components
   */
  findDifferences(components) {
    const differences = [];
    
    // Compare each component to others
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        // Find style differences
        const styleDiffs = this.compareStyles(comp1.styles, comp2.styles);
        if (styleDiffs.length > 0) {
          differences.push({
            component1: comp1.sourceUrl,
            component2: comp2.sourceUrl,
            differences: styleDiffs,
          });
        }
      }
    }
    
    return differences;
  }

  /**
   * Compare styles between two components
   */
  compareStyles(styles1, styles2) {
    const diffs = [];
    const allProps = new Set([...Object.keys(styles1 || {}), ...Object.keys(styles2 || {})]);
    
    allProps.forEach(prop => {
      const val1 = styles1?.[prop];
      const val2 = styles2?.[prop];
      
      if (val1 !== val2) {
        diffs.push({ property: prop, value1: val1, value2: val2 });
      }
    });
    
    return diffs;
  }

  /**
   * Take screenshot of component
   */
  async takeComponentScreenshot(component) {
    // Implementation would use puppeteer to capture component screenshot
    // For now, return a placeholder path
    const screenshotPath = path.join(
      this.config.outputDir,
      'screenshots',
      `${component.name}-${Date.now()}.png`
    );
    
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    
    // TODO: Actual screenshot implementation
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    
    return screenshotPath;
  }

  /**
   * Mine UX patterns from stories and tests
   */
  async mineUXPatterns(component) {
    // Extract UX patterns from component's Storybook stories and tests
    const uxPatterns = {
      interactions: [],
      userFlows: [],
      accessibility: {},
      responsiveness: [],
    };
    
    // Analyze component for UX patterns
    if (component.stories) {
      uxPatterns.interactions = component.stories
        .filter(s => s.play) // Has interaction test
        .map(s => ({
          name: s.name,
          steps: s.play.toString(), // Extract interaction steps
        }));
    }
    
    // Store UX patterns
    await this.db.query(`
      INSERT INTO ux_patterns (
        campaign_id, pattern_category, pattern_description,
        effectiveness_score, source_storybooks
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      this.campaignId,
      'interaction',
      JSON.stringify(uxPatterns.interactions),
      0.8, // Would be calculated based on quality metrics
      [component.sourceUrl],
    ]);
    
    return uxPatterns;
  }

  /**
   * Generate React component code
   */
  generateReactComponent(component, patterns) {
    // Generate TypeScript React component based on mined data
    return `import React from 'react';

/**
 * ${component.name}
 * 
 * Mined from: ${component.sourceUrl}
 * Quality Score: ${component.qualityMetrics?.overall || 'N/A'}
 * 
 * Pattern Analysis:
 * ${patterns.map(p => `- ${p.type}: ${p.isBestPractice ? 'Best Practice ✓' : ''}`).join('\n * ')}
 */

export interface ${component.name}Props {
  // TODO: Add props based on component analysis
  children?: React.ReactNode;
  className?: string;
}

export const ${component.name}: React.FC<${component.name}Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default ${component.name};
`;
  }

  /**
   * Generate Storybook story code
   */
  generateStorybookStory(component, uxPatterns) {
    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${component.name} } from './${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: 'Atoms/Mined/${component.name}',
  component: ${component.name},
  parameters: {
    docs: {
      description: {
        component: \`
# ${component.name}

**Mined from:** ${component.sourceUrl}

**Quality Score:** ${component.qualityMetrics?.overall || 'N/A'}

**UX Patterns:**
${Object.entries(uxPatterns).map(([key, value]) => `- ${key}: ${JSON.stringify(value, null, 2)}`).join('\n')}
        \`,
      },
    },
  },
  tags: ['autodocs', 'mined'],
};

export default meta;
type Story = StoryObj<typeof ${component.name}>;

export const Default: Story = {
  args: {},
};

// TODO: Add more stories based on UX patterns
`;
  }

  /**
   * Add training data for neural network
   */
  async addTrainingData(data) {
    await this.db.query(`
      INSERT INTO neural_training_data (
        campaign_id, data_type, input_features, output_labels, source_url
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      this.campaignId,
      data.type,
      JSON.stringify(data.input),
      JSON.stringify(data.output),
      Array.isArray(data.sourceUrl) ? data.sourceUrl[0] : data.sourceUrl,
    ]);
  }

  /**
   * Check if neural network needs retraining
   */
  async checkAndRetrain() {
    const result = await this.db.query(`
      SELECT COUNT(*) as count FROM neural_training_data
      WHERE campaign_id = $1 AND created_at > (
        SELECT COALESCE(MAX(last_active), '1970-01-01') FROM mining_campaigns WHERE id = $1
      )
    `, [this.campaignId]);
    
    const newSamples = parseInt(result.rows[0].count);
    
    if (newSamples >= this.config.neuralConfig.retrainingThreshold) {
      console.log(`🧠 Retraining neural network with ${newSamples} new samples...`);
      
      await this.neuralManager.trainInstance(this.neuralInstanceId);
      
      // Update campaign timestamp
      await this.db.query(`
        UPDATE mining_campaigns SET last_active = CURRENT_TIMESTAMP WHERE id = $1
      `, [this.campaignId]);
      
      console.log('✅ Neural network retrained');
    }
  }

  /**
   * Get campaign metrics
   */
  async getMetrics() {
    const [components, patterns, uxPatterns, trainingData] = await Promise.all([
      this.db.query('SELECT COUNT(*) as count FROM generated_components WHERE campaign_id = $1', [this.campaignId]),
      this.db.query('SELECT COUNT(*) as count FROM design_patterns WHERE campaign_id = $1', [this.campaignId]),
      this.db.query('SELECT COUNT(*) as count FROM ux_patterns WHERE campaign_id = $1', [this.campaignId]),
      this.db.query('SELECT COUNT(*) as count FROM neural_training_data WHERE campaign_id = $1', [this.campaignId]),
    ]);
    
    return {
      componentsGenerated: parseInt(components.rows[0].count),
      patternsDiscovered: parseInt(patterns.rows[0].count),
      uxPatternsFound: parseInt(uxPatterns.rows[0].count),
      trainingSamplesCollected: parseInt(trainingData.rows[0].count),
      neuralInstanceId: this.neuralInstanceId,
      campaignId: this.campaignId,
    };
  }

  /**
   * Stop the campaign
   */
  async stop() {
    console.log('🛑 Stopping campaign...');
    
    this.campaignActive = false;
    
    // Update status
    await this.db.query(`
      UPDATE mining_campaigns SET status = 'stopped' WHERE id = $1
    `, [this.campaignId]);
    
    // Stop services
    if (this.discoveryService) await this.discoveryService.stop();
    if (this.neuralOrchestrator) await this.neuralOrchestrator.stop();
    
    // Get final metrics
    const metrics = await this.getMetrics();
    
    console.log('\n📊 Final Campaign Metrics:');
    console.log(`   Components Generated: ${metrics.componentsGenerated}`);
    console.log(`   Patterns Discovered: ${metrics.patternsDiscovered}`);
    console.log(`   UX Patterns Found: ${metrics.uxPatternsFound}`);
    console.log(`   Training Samples: ${metrics.trainingSamplesCollected}`);
    console.log('\n✅ Campaign stopped\n');
    
    return metrics;
  }

  // Helper methods (implement as needed)
  async getCrawlHistory(url) { return {}; }
  async queueForCrawling(url, priority) { /* Implementation */ }
  async queueForMining(url) { /* Implementation */ }
  async getNextMiningTarget() { /* Implementation */ }
  async updateMetrics(data) { /* Implementation */ }
  extractPatternFeatures(patterns) { return {}; }
}

export default StorybookMiningCampaign;
