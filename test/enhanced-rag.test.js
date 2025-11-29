/**
 * Integration Test for Enhanced RAG System
 * Tests the full flow of RAG with DeepSeek tools
 */

import { createEnhancedRagService } from '../services/rag/enhanced-rag-service.js';
import { Pool } from 'pg';

// Mock database for testing
class MockDB {
  async query() {
    return { rows: [], rowCount: 0 };
  }
  
  async end() {}
}

describe('Enhanced RAG Service', () => {
  let ragService;
  let mockDB;

  beforeEach(() => {
    mockDB = new MockDB();
  });

  afterEach(async () => {
    if (ragService) {
      await ragService.healthCheck().catch(() => {});
    }
  });

  test('should create service instance', () => {
    expect(() => {
      ragService = createEnhancedRagService({
        db: mockDB,
        logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
      });
    }).not.toThrow();
  });

  test('should have all required methods', () => {
    ragService = createEnhancedRagService({
      db: mockDB,
      logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
    });

    expect(ragService.chatWithTools).toBeDefined();
    expect(ragService.executeTool).toBeDefined();
    expect(ragService.executeCommand).toBeDefined();
    expect(ragService.getConversation).toBeDefined();
    expect(ragService.clearConversation).toBeDefined();
    expect(ragService.listConversations).toBeDefined();
    expect(ragService.indexCodebase).toBeDefined();
    expect(ragService.healthCheck).toBeDefined();
    expect(ragService.tools).toBeDefined();
  });

  test('should execute system info tool', async () => {
    ragService = createEnhancedRagService({
      db: mockDB,
      logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
    });

    const result = await ragService.executeTool('system.getInfo', {}, 'test-session');
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.platform).toBeDefined();
    expect(result.nodeVersion).toBeDefined();
  });

  test('should manage conversations', () => {
    ragService = createEnhancedRagService({
      db: mockDB,
      logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
    });

    // List should be empty initially
    const conversations = ragService.listConversations();
    expect(Array.isArray(conversations)).toBe(true);

    // Get non-existent conversation
    const conv = ragService.getConversation('test-id');
    expect(conv).toBeNull();

    // Clear non-existent conversation should not throw
    expect(() => {
      ragService.clearConversation('test-id');
    }).not.toThrow();
  });

  test('should have tools available', () => {
    ragService = createEnhancedRagService({
      db: mockDB,
      logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
    });

    expect(ragService.tools).toBeDefined();
    expect(ragService.tools.git).toBeDefined();
    expect(ragService.tools.file).toBeDefined();
    expect(ragService.tools.project).toBeDefined();
    expect(ragService.tools.system).toBeDefined();
  });

  test('should validate tool names', async () => {
    ragService = createEnhancedRagService({
      db: mockDB,
      logger: { log: () => {}, error: () => {}, info: () => {}, warn: () => {} }
    });

    const result = await ragService.executeTool('invalid.tool', {}, 'test-session');
    
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

describe('DeepSeek Tools', () => {
  test('should execute safe commands', async () => {
    const { executeCommand } = await import('../services/rag/deepseek-tools.js');
    
    const result = await executeCommand('node --version');
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.stdout).toContain('v');
  });

  test('should reject unsafe commands', async () => {
    const { executeCommand } = await import('../services/rag/deepseek-tools.js');
    
    const result = await executeCommand('rm -rf /');
    expect(result).toBeDefined();
    expect(result.success).toBe(false);
    expect(result.error).toContain('not allowed');
  });

  test('git tools should be available', async () => {
    const { gitTools } = await import('../services/rag/deepseek-tools.js');
    
    expect(gitTools.status).toBeDefined();
    expect(gitTools.createBranch).toBeDefined();
    expect(gitTools.commit).toBeDefined();
    expect(gitTools.push).toBeDefined();
  });

  test('file tools should be available', async () => {
    const { fileTools } = await import('../services/rag/deepseek-tools.js');
    
    expect(fileTools.read).toBeDefined();
    expect(fileTools.write).toBeDefined();
    expect(fileTools.list).toBeDefined();
    expect(fileTools.mkdir).toBeDefined();
  });

  test('project tools should be available', async () => {
    const { projectTools } = await import('../services/rag/deepseek-tools.js');
    
    expect(projectTools.installDependencies).toBeDefined();
    expect(projectTools.runScript).toBeDefined();
    expect(projectTools.start).toBeDefined();
    expect(projectTools.build).toBeDefined();
    expect(projectTools.test).toBeDefined();
    expect(projectTools.getInfo).toBeDefined();
  });
});

describe('Prompt Templates', () => {
  test('should have all system prompts', async () => {
    const { systemPrompts } = await import('../services/rag/prompt-templates.js');
    
    expect(systemPrompts.assistant).toBeDefined();
    expect(systemPrompts.codebaseExpert).toBeDefined();
    expect(systemPrompts.developer).toBeDefined();
    expect(systemPrompts.gitWorkflow).toBeDefined();
    expect(systemPrompts.debugging).toBeDefined();
    expect(systemPrompts.codeReview).toBeDefined();
    expect(systemPrompts.architecture).toBeDefined();
  });

  test('should build prompt correctly', async () => {
    const { buildPrompt } = await import('../services/rag/prompt-templates.js');
    
    const prompt = buildPrompt('assistant', null, {
      additionalContext: 'Test context'
    });
    
    expect(prompt).toContain('DeepSeek');
    expect(prompt).toContain('Test context');
  });

  test('should have task prompts', async () => {
    const { taskPrompts } = await import('../services/rag/prompt-templates.js');
    
    expect(taskPrompts.codeGeneration).toBeDefined();
    expect(taskPrompts.bugFix).toBeDefined();
    expect(taskPrompts.refactoring).toBeDefined();
    expect(taskPrompts.testing).toBeDefined();
    expect(taskPrompts.documentation).toBeDefined();
  });

  test('should format responses', async () => {
    const { responseFormatters } = await import('../services/rag/prompt-templates.js');
    
    const codeBlock = responseFormatters.codeBlock('console.log("test")', 'javascript');
    expect(codeBlock).toContain('```javascript');
    expect(codeBlock).toContain('console.log');
    
    const result = responseFormatters.result(true, { test: 'data' });
    expect(result).toContain('✅');
    expect(result).toContain('Success');
  });
});
