#!/usr/bin/env node

/**
 * Advanced Crawler Worker Thread
 * Handles multi-model training and data mining operations
 */

import { parentPort, workerData } from 'worker_threads';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock ML training classes (in real implementation, these would be actual ML libraries)
class MockTextAnalysisModel {
  constructor(config) {
    this.config = config;
    this.isTrained = false;
  }

  async train(data) {
    console.log(`🤖 Training text analysis model with ${data.length} samples...`);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate training time
    this.isTrained = true;
    return {
      accuracy: 0.87,
      loss: 0.23,
      epochs: 10
    };
  }

  async predict(text) {
    if (!this.isTrained) throw new Error('Model not trained');
    // Mock prediction
    return {
      category: 'component',
      confidence: 0.85,
      features: ['input', 'validation', 'ui']
    };
  }
}

class MockSchemaGenerationModel {
  constructor(config) {
    this.config = config;
    this.isTrained = false;
  }

  async train(data) {
    console.log(`🔧 Training schema generation model with ${data.length} samples...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.isTrained = true;
    return {
      accuracy: 0.82,
      loss: 0.31,
      epochs: 15
    };
  }

  async generate(componentType, requirements) {
    if (!this.isTrained) throw new Error('Model not trained');
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        type: { type: 'string', enum: [componentType] },
        properties: {
          type: 'object',
          properties: requirements.reduce((acc, req) => {
            acc[req] = { type: 'string' };
            return acc;
          }, {})
        }
      },
      required: ['id', 'name', 'type']
    };
  }
}

class MockCodeGenerationModel {
  constructor(config) {
    this.config = config;
    this.isTrained = false;
  }

  async train(data) {
    console.log(`💻 Training code generation model with ${data.length} samples...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
    this.isTrained = true;
    return {
      accuracy: 0.79,
      loss: 0.35,
      epochs: 12
    };
  }

  async generate(schema) {
    if (!this.isTrained) throw new Error('Model not trained');
    return `import React, { useState } from 'react';

const GeneratedComponent = ({ ${Object.keys(schema.properties).join(', ')} }) => {
  const [state, setState] = useState({});

  return (
    <div className="generated-component">
      <h3>{name || 'Generated Component'}</h3>
      {/* Generated component content */}
    </div>
  );
};

export default GeneratedComponent;`;
  }
}

class MockQualityAssessmentModel {
  constructor(config) {
    this.config = config;
    this.isTrained = false;
  }

  async train(data) {
    console.log(`🔍 Training quality assessment model with ${data.length} samples...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.isTrained = true;
    return {
      accuracy: 0.91,
      loss: 0.18,
      epochs: 8
    };
  }

  async assess(code) {
    if (!this.isTrained) throw new Error('Model not trained');
    return {
      score: 0.85,
      issues: [],
      suggestions: ['Add error handling', 'Improve accessibility']
    };
  }
}

// Advanced Crawler Worker
class AdvancedCrawlerWorker {
  constructor(workerId) {
    this.workerId = workerId;
    this.activeSessions = new Map();
    this.browser = null;
    this.isRunning = false;
    this.models = new Map();
  }

  async initialize() {
    console.log(`🚀 Initializing crawler worker ${this.workerId}...`);

    // Launch browser instance for this worker
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    this.isRunning = true;
    console.log(`✅ Crawler worker ${this.workerId} initialized`);
  }

  async startSession(sessionId, config, operationId) {
    console.log(`▶️  Worker ${this.workerId} starting session ${sessionId}`);

    const session = {
      sessionId,
      operationId,
      config,
      status: 'running',
      startTime: new Date(),
      stats: {
        urlsProcessed: 0,
        dataExtracted: 0,
        errors: 0,
        successRate: 0
      },
      currentTask: null,
      isPaused: false,
      isStopped: false
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Determine task type and execute
      const result = await this.executeTask(session);

      session.status = 'completed';
      session.endTime = new Date();
      session.result = result;

      parentPort.postMessage({
        type: 'session-completed',
        sessionId,
        result: {
          urlsProcessed: session.stats.urlsProcessed,
          dataExtracted: session.stats.dataExtracted,
          successRate: session.stats.successRate,
          errors: session.stats.errors
        }
      });

    } catch (error) {
      console.error(`❌ Session ${sessionId} failed:`, error);
      session.status = 'failed';
      session.error = error.message;

      parentPort.postMessage({
        type: 'session-error',
        sessionId,
        error: error.message
      });
    }

    this.activeSessions.delete(sessionId);
  }

  async executeTask(session) {
    const { config } = session;

    switch (config.modelAssignment.modelType) {
      case 'tutorial_mining':
        return await this.executeTutorialMining(session);

      case 'task_breakdown':
        return await this.executeTaskBreakdown(session);

      case 'component_generation':
        return await this.executeComponentGeneration(session);

      case 'workflow_creation':
        return await this.executeWorkflowCreation(session);

      case 'schema_mapping':
        return await this.executeSchemaMapping(session);

      case 'prompt_analysis':
        return await this.executePromptAnalysis(session);

      case 'agile_methodology':
        return await this.executeAgileMethodology(session);

      default:
        throw new Error(`Unknown task type: ${config.modelAssignment.modelType}`);
    }
  }

  async executeTutorialMining(session) {
    console.log(`📚 Mining tutorials for session ${session.sessionId}`);

    const { config } = session;
    const results = [];

    // Define tutorial sources to mine
    const tutorialSources = [
      {
        url: 'https://react.dev/learn',
        type: 'official_docs',
        selectors: {
          title: 'h1',
          content: '.prose',
          codeExamples: 'pre code',
          navigation: 'nav a'
        }
      },
      {
        url: 'https://chakra-ui.com/docs/getting-started',
        type: 'component_library',
        selectors: {
          title: 'h1',
          content: '.prose',
          components: '.component-example',
          codeExamples: 'pre'
        }
      },
      {
        url: 'https://material-ui.com/getting-started/installation/',
        type: 'ui_framework',
        selectors: {
          title: 'h1',
          content: '.MuiTypography-root',
          examples: '.demo-container',
          codeExamples: 'pre'
        }
      }
    ];

    for (const source of tutorialSources) {
      if (session.isStopped) break;

      while (session.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (session.isStopped) break;
      }

      try {
        const page = await this.browser.newPage();

        // Set user agent and viewport
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });

        console.log(`🌐 Navigating to ${source.url}`);
        await page.goto(source.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Extract tutorial content
        const tutorialData = await page.evaluate((selectors, sourceType) => {
          const getTextContent = (selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : '';
          };

          const getMultipleElements = (selector) => {
            return Array.from(document.querySelectorAll(selector))
              .map(el => el.textContent.trim())
              .filter(text => text.length > 0);
          };

          return {
            title: getTextContent(selectors.title),
            content: getTextContent(selectors.content),
            codeExamples: getMultipleElements(selectors.codeExamples),
            navigationItems: getMultipleElements(selectors.navigation || 'a'),
            url: window.location.href,
            sourceType,
            extractedAt: new Date().toISOString()
          };
        }, source.selectors, source.type);

        // Analyze content for task breakdown patterns
        const taskPatterns = this.analyzeTutorialForTasks(tutorialData);

        // Store results
        results.push({
          ...tutorialData,
          taskPatterns,
          qualityScore: this.assessTutorialQuality(tutorialData),
          wordCount: tutorialData.content.split(/\s+/).length,
          codeExampleCount: tutorialData.codeExamples.length
        });

        await page.close();

        session.stats.urlsProcessed++;
        session.stats.dataExtracted += tutorialData.codeExamples.length;

        // Send progress update
        parentPort.postMessage({
          type: 'progress-update',
          sessionId: session.sessionId,
          data: session.stats
        });

        // Respect rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Failed to mine ${source.url}:`, error);
        session.stats.errors++;
      }
    }

    // Calculate success rate
    session.stats.successRate = session.stats.urlsProcessed > 0 ?
      (session.stats.urlsProcessed - session.stats.errors) / session.stats.urlsProcessed : 0;

    return {
      tutorialsMined: results.length,
      totalCodeExamples: results.reduce((sum, t) => sum + t.codeExampleCount, 0),
      taskPatternsFound: results.reduce((sum, t) => sum + t.taskPatterns.length, 0),
      tutorials: results
    };
  }

  analyzeTutorialForTasks(tutorialData) {
    const patterns = [];
    const content = tutorialData.content.toLowerCase();

    // Look for task breakdown indicators
    const taskIndicators = [
      'first', 'then', 'next', 'after', 'finally',
      'step 1', 'step 2', 'step 3',
      '1.', '2.', '3.',
      'create', 'build', 'implement', 'add', 'configure'
    ];

    const sentences = tutorialData.content.split(/[.!?]+/).filter(s => s.trim().length > 10);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const hasTaskIndicator = taskIndicators.some(indicator => lowerSentence.includes(indicator));

      if (hasTaskIndicator) {
        // Extract task information
        const task = {
          description: sentence.trim(),
          type: this.categorizeTask(sentence),
          complexity: this.assessTaskComplexity(sentence),
          dependencies: this.extractDependencies(sentence, patterns),
          estimatedHours: this.estimateTaskDuration(sentence)
        };

        patterns.push(task);
      }
    }

    return patterns;
  }

  categorizeTask(sentence) {
    const lower = sentence.toLowerCase();

    if (lower.includes('install') || lower.includes('setup') || lower.includes('configure')) {
      return 'setup';
    } else if (lower.includes('create') || lower.includes('build') || lower.includes('implement')) {
      return 'implementation';
    } else if (lower.includes('test') || lower.includes('verify') || lower.includes('check')) {
      return 'testing';
    } else if (lower.includes('design') || lower.includes('plan') || lower.includes('structure')) {
      return 'design';
    } else {
      return 'general';
    }
  }

  assessTaskComplexity(sentence) {
    const complexityIndicators = {
      simple: ['simple', 'easy', 'basic', 'quick', 'straightforward'],
      medium: ['moderate', 'intermediate', 'some', 'fairly'],
      complex: ['complex', 'difficult', 'advanced', 'complicated', 'sophisticated']
    };

    const lower = sentence.toLowerCase();

    if (complexityIndicators.complex.some(word => lower.includes(word))) return 'complex';
    if (complexityIndicators.simple.some(word => lower.includes(word))) return 'simple';
    return 'medium';
  }

  extractDependencies(sentence, existingTasks) {
    // Simple dependency extraction - look for references to previous tasks
    const dependencies = [];
    const lower = sentence.toLowerCase();

    if (lower.includes('after') || lower.includes('once') || lower.includes('before')) {
      // Look for task references in existing tasks
      for (const task of existingTasks) {
        if (lower.includes(task.description.toLowerCase().split(' ')[0])) {
          dependencies.push(task);
        }
      }
    }

    return dependencies;
  }

  estimateTaskDuration(sentence) {
    // Simple duration estimation based on keywords
    const lower = sentence.toLowerCase();

    if (lower.includes('quick') || lower.includes('simple') || lower.includes('easy')) {
      return 0.5; // 30 minutes
    } else if (lower.includes('complex') || lower.includes('difficult') || lower.includes('thorough')) {
      return 4; // 4 hours
    } else if (lower.includes('comprehensive') || lower.includes('complete')) {
      return 8; // 8 hours
    } else {
      return 2; // 2 hours default
    }
  }

  assessTutorialQuality(tutorialData) {
    let score = 0.5; // Base score

    // Content quality factors
    if (tutorialData.title) score += 0.1;
    if (tutorialData.content.length > 500) score += 0.1;
    if (tutorialData.codeExamples.length > 0) score += 0.15;
    if (tutorialData.codeExamples.length > 3) score += 0.1;

    // Task breakdown quality
    const taskPatterns = this.analyzeTutorialForTasks(tutorialData);
    if (taskPatterns.length > 0) score += 0.1;
    if (taskPatterns.length > 3) score += 0.1;

    return Math.min(1.0, score);
  }

  async executeTaskBreakdown(session) {
    console.log(`📋 Executing agile task breakdown for session ${session.sessionId}`);

    const { config } = session;
    const prompt = config.modelAssignment.taskConfig?.prompt || 'Create a dashboard component';

    // Load relevant templates and methodologies
    const templates = [
      {
        methodology: 'agile',
        rules: {
          maxTaskSize: 4,
          minTasks: 3,
          maxTasks: 12,
          taskTypes: ['research', 'design', 'implementation', 'testing', 'documentation']
        }
      }
    ];

    // Apply agile methodology
    const breakdown = {
      methodology: 'agile',
      prompt: prompt,
      tasks: [],
      totalEstimatedHours: 0,
      sprintDuration: 1
    };

    // Generate tasks using agile principles
    const taskTemplates = [
      {
        title: 'Requirements Analysis',
        description: `Analyze requirements for: ${prompt}`,
        type: 'research',
        estimatedHours: 2,
        dependencies: []
      },
      {
        title: 'Technical Design',
        description: 'Design technical architecture and component structure',
        type: 'design',
        estimatedHours: 3,
        dependencies: ['Requirements Analysis']
      },
      {
        title: 'Implementation',
        description: 'Implement the designed solution',
        type: 'implementation',
        estimatedHours: 6,
        dependencies: ['Technical Design']
      },
      {
        title: 'Testing & Validation',
        description: 'Test and validate the implementation',
        type: 'testing',
        estimatedHours: 2,
        dependencies: ['Implementation']
      },
      {
        title: 'Documentation',
        description: 'Create documentation and usage examples',
        type: 'documentation',
        estimatedHours: 1,
        dependencies: ['Testing & Validation']
      }
    ];

    breakdown.tasks = taskTemplates;
    breakdown.totalEstimatedHours = taskTemplates.reduce((sum, task) => sum + task.estimatedHours, 0);
    breakdown.sprintDuration = Math.ceil(breakdown.totalEstimatedHours / 8); // 8-hour work days

    session.stats.dataExtracted = breakdown.tasks.length;

    return breakdown;
  }

  async executeComponentGeneration(session) {
    console.log(`🔧 Executing component generation for session ${session.sessionId}`);

    const { config } = session;

    // Initialize or get cached models
    const textModel = this.getOrCreateModel('text-analysis', config);
    const schemaModel = this.getOrCreateModel('schema-generation', config);
    const codeModel = this.getOrCreateModel('code-generation', config);
    const qualityModel = this.getOrCreateModel('quality-assessment', config);

    // Training data (in real implementation, this would come from database)
    const trainingData = [
      { text: 'Create a button component', category: 'input', requirements: ['clickable', 'accessible'] },
      { text: 'Build a form input field', category: 'input', requirements: ['validation', 'label'] },
      { text: 'Design a card component', category: 'display', requirements: ['header', 'content', 'actions'] }
    ];

    // Train models
    await textModel.train(trainingData);
    await schemaModel.train(trainingData);
    await codeModel.train(trainingData);
    await qualityModel.train(trainingData);

    // Generate component
    const componentSpec = await textModel.predict('Create a dashboard widget for displaying metrics');
    const schema = await schemaModel.generate(componentSpec.category, componentSpec.features);
    const code = await codeModel.generate(schema);
    const quality = await qualityModel.assess(code);

    return {
      componentSpec,
      schema,
      code,
      quality,
      generatedAt: new Date().toISOString()
    };
  }

  async executeWorkflowCreation(session) {
    console.log(`🔄 Executing workflow creation for session ${session.sessionId}`);

    const { config } = session;

    // Generate workflow from prompt
    const prompt = config.modelAssignment.taskConfig?.prompt || 'Create a user onboarding workflow';

    const workflow = {
      name: `Generated Workflow: ${prompt.substring(0, 30)}...`,
      description: `Automatically generated workflow from prompt: ${prompt}`,
      steps: [],
      triggers: ['manual', 'scheduled'],
      dataFlow: {},
      errorHandling: {
        retryAttempts: 3,
        fallbackStrategies: ['skip', 'notify', 'rollback']
      }
    };

    // Generate workflow steps based on prompt analysis
    const steps = [
      {
        id: 'analyze-requirements',
        name: 'Analyze Requirements',
        type: 'analysis',
        inputs: ['prompt'],
        outputs: ['requirements', 'constraints']
      },
      {
        id: 'design-solution',
        name: 'Design Solution',
        type: 'design',
        inputs: ['requirements', 'constraints'],
        outputs: ['architecture', 'components']
      },
      {
        id: 'implement-solution',
        name: 'Implement Solution',
        type: 'implementation',
        inputs: ['architecture', 'components'],
        outputs: ['code', 'tests']
      },
      {
        id: 'validate-solution',
        name: 'Validate Solution',
        type: 'validation',
        inputs: ['code', 'tests'],
        outputs: ['validation_report', 'quality_score']
      }
    ];

    workflow.steps = steps;

    // Define data flow
    workflow.dataFlow = {
      'analyze-requirements.requirements': 'design-solution.requirements',
      'design-solution.architecture': 'implement-solution.architecture',
      'implement-solution.code': 'validate-solution.code'
    };

    return workflow;
  }

  async executeSchemaMapping(session) {
    console.log(`🔗 Executing schema mapping for session ${session.sessionId}`);

    const { config } = session;

    // Generate schema mappings
    const mappings = {
      componentToAttribute: {},
      attributeToComponent: {},
      relationshipMappings: [],
      compatibilityMatrix: {}
    };

    // Example mappings
    mappings.componentToAttribute = {
      'Button': ['onClick', 'disabled', 'variant', 'size'],
      'Input': ['value', 'placeholder', 'required', 'validation'],
      'Card': ['title', 'content', 'actions', 'variant']
    };

    mappings.attributeToComponent = {
      'onClick': ['Button', 'Link', 'MenuItem'],
      'value': ['Input', 'Select', 'Textarea'],
      'required': ['Input', 'Select', 'Checkbox'],
      'validation': ['Input', 'Form', 'Field']
    };

    // Generate compatibility scores
    mappings.compatibilityMatrix = {
      'Button-onClick': 1.0,
      'Input-value': 1.0,
      'Card-title': 0.9,
      'Button-value': 0.1 // Low compatibility
    };

    return mappings;
  }

  async executePromptAnalysis(session) {
    console.log(`🔍 Executing prompt analysis for session ${session.sessionId}`);

    const { config } = session;
    const prompt = config.modelAssignment.taskConfig?.prompt || 'Create a dashboard';

    const analysis = {
      prompt: prompt,
      category: this.categorizePrompt(prompt),
      complexity: this.assessPromptComplexity(prompt),
      keywords: this.extractPromptKeywords(prompt),
      intent: this.detectPromptIntent(prompt),
      suggestedActions: this.generateSuggestedActions(prompt),
      estimatedComplexity: this.estimatePromptComplexity(prompt)
    };

    return analysis;
  }

  async executeAgileMethodology(session) {
    console.log(`📊 Executing agile methodology mining for session ${session.sessionId}`);

    // Mine agile practices from tutorials and documentation
    const agilePatterns = {
      userStories: [
        'As a [user], I want [feature] so that [benefit]',
        'Given [context], when [action], then [outcome]'
      ],
      taskBreakdown: {
        epic: 'Large feature or initiative',
        story: 'User-facing functionality (2-5 days)',
        task: 'Technical implementation (1-2 days)',
        subtask: 'Specific work item (1-4 hours)'
      },
      ceremonies: [
        'Sprint Planning', 'Daily Standup', 'Sprint Review', 'Sprint Retrospective'
      ],
      artifacts: [
        'Product Backlog', 'Sprint Backlog', 'Increment', 'Definition of Done'
      ]
    };

    return agilePatterns;
  }

  getOrCreateModel(modelType, config) {
    if (!this.models.has(modelType)) {
      let modelClass;

      switch (modelType) {
        case 'text-analysis':
          modelClass = MockTextAnalysisModel;
          break;
        case 'schema-generation':
          modelClass = MockSchemaGenerationModel;
          break;
        case 'code-generation':
          modelClass = MockCodeGenerationModel;
          break;
        case 'quality-assessment':
          modelClass = MockQualityAssessmentModel;
          break;
        default:
          throw new Error(`Unknown model type: ${modelType}`);
      }

      this.models.set(modelType, new modelClass(config));
    }

    return this.models.get(modelType);
  }

  // Helper methods for prompt analysis
  categorizePrompt(prompt) {
    const lower = prompt.toLowerCase();

    if (lower.includes('dashboard') || lower.includes('component') || lower.includes('ui')) {
      return 'ui_development';
    } else if (lower.includes('api') || lower.includes('endpoint') || lower.includes('backend')) {
      return 'api_development';
    } else if (lower.includes('workflow') || lower.includes('automation') || lower.includes('process')) {
      return 'workflow_automation';
    } else if (lower.includes('data') || lower.includes('analytics') || lower.includes('report')) {
      return 'data_analysis';
    } else {
      return 'general_development';
    }
  }

  assessPromptComplexity(prompt) {
    const indicators = {
      simple: ['simple', 'basic', 'easy', 'quick', 'straightforward'],
      medium: ['moderate', 'intermediate', 'some', 'fairly', 'reasonable'],
      complex: ['complex', 'difficult', 'advanced', 'sophisticated', 'comprehensive']
    };

    const lower = prompt.toLowerCase();
    let score = 1; // Base complexity

    if (indicators.complex.some(word => lower.includes(word))) score = 3;
    else if (indicators.medium.some(word => lower.includes(word))) score = 2;
    else if (indicators.simple.some(word => lower.includes(word))) score = 1;

    // Length-based complexity
    if (prompt.length > 500) score += 0.5;
    if (prompt.split(' ').length > 50) score += 0.5;

    return {
      level: score >= 2.5 ? 'complex' : score >= 1.5 ? 'medium' : 'simple',
      score: Math.min(3, score)
    };
  }

  extractPromptKeywords(prompt) {
    const words = prompt.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);

    return words
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  detectPromptIntent(prompt) {
    const lower = prompt.toLowerCase();

    if (lower.startsWith('create') || lower.startsWith('build') || lower.startsWith('implement')) {
      return 'creation';
    } else if (lower.startsWith('analyze') || lower.startsWith('review') || lower.startsWith('examine')) {
      return 'analysis';
    } else if (lower.startsWith('optimize') || lower.startsWith('improve') || lower.startsWith('enhance')) {
      return 'optimization';
    } else if (lower.includes('how to') || lower.includes('guide') || lower.includes('tutorial')) {
      return 'learning';
    } else {
      return 'general';
    }
  }

  generateSuggestedActions(prompt) {
    const actions = [];
    const lower = prompt.toLowerCase();

    if (lower.includes('dashboard')) {
      actions.push('Create dashboard layout', 'Add data visualization components', 'Implement filtering and search');
    }

    if (lower.includes('component')) {
      actions.push('Design component interface', 'Implement component logic', 'Add accessibility features');
    }

    if (lower.includes('workflow')) {
      actions.push('Define workflow steps', 'Create data flow diagram', 'Implement error handling');
    }

    if (lower.includes('api')) {
      actions.push('Design API endpoints', 'Implement data validation', 'Add authentication');
    }

    return actions.slice(0, 5); // Limit to 5 suggestions
  }

  estimatePromptComplexity(prompt) {
    const factors = {
      length: prompt.length > 200 ? 1 : 0,
      technicalTerms: (prompt.match(/\b(api|database|algorithm|framework|library|component)\b/gi) || []).length,
      requirements: (prompt.match(/\b(must|should|required|needs?|wants?)\b/gi) || []).length,
      specificity: prompt.includes('specific') || prompt.includes('exactly') ? 1 : 0
    };

    const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);

    return {
      score: totalScore,
      level: totalScore > 3 ? 'high' : totalScore > 1 ? 'medium' : 'low',
      factors
    };
  }

  async pauseSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isPaused = true;
      session.status = 'paused';
      console.log(`⏸️  Session ${sessionId} paused`);
    }
  }

  async resumeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isPaused = false;
      session.status = 'running';
      console.log(`▶️  Session ${sessionId} resumed`);
    }
  }

  async stopSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isStopped = true;
      session.status = 'stopped';
      console.log(`🛑 Session ${sessionId} stopped`);
    }
  }

  async cleanup() {
    console.log(`🧹 Cleaning up worker ${this.workerId}...`);

    // Close all active sessions
    for (const [sessionId, session] of this.activeSessions) {
      await this.stopSession(sessionId);
    }

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    this.isRunning = false;
    console.log(`✅ Worker ${this.workerId} cleaned up`);
  }
}

// Worker message handling
let worker = null;

parentPort.on('message', async (message) => {
  const { type, sessionId, config, operationId } = message;

  try {
    switch (type) {
      case 'initialize':
        worker = new AdvancedCrawlerWorker(message.workerId);
        await worker.initialize();
        parentPort.postMessage({ type: 'initialized', workerId: message.workerId });
        break;

      case 'start-session':
        if (!worker) {
          throw new Error('Worker not initialized');
        }
        await worker.startSession(sessionId, config, operationId);
        break;

      case 'pause-session':
        if (worker) {
          await worker.pauseSession(sessionId);
        }
        parentPort.postMessage({ type: 'session-paused', sessionId });
        break;

      case 'resume-session':
        if (worker) {
          await worker.resumeSession(sessionId);
        }
        parentPort.postMessage({ type: 'session-resumed', sessionId });
        break;

      case 'stop-session':
        if (worker) {
          await worker.stopSession(sessionId);
        }
        parentPort.postMessage({ type: 'session-stopped', sessionId });
        break;

      case 'shutdown':
        if (worker) {
          await worker.cleanup();
        }
        parentPort.postMessage({ type: 'shutdown-complete' });
        process.exit(0);
        break;

      default:
        console.warn(`Unknown message type: ${type}`);
    }
  } catch (error) {
    console.error('Worker message handling error:', error);
    parentPort.postMessage({
      type: 'error',
      sessionId,
      error: error.message
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (worker) {
    await worker.cleanup();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (worker) {
    await worker.cleanup();
  }
  process.exit(0);
});

console.log('🎯 Advanced Crawler Worker started and waiting for tasks...');
