/**
 * LightDom Framework - Main Entry Point
 * Exports all framework components and provides unified interface
 */

// Core Framework Components
export { lightDomFramework, FrameworkConfig, URLQueueItem, OptimizationPerks, SimulationResult } from './LightDomFramework';
export { urlQueueManager, QueueConfig, QueueMetrics } from './URLQueueManager';
export { simulationEngine, SimulationConfig, SimulationResult as SimResult, SimulationRecommendation } from './SimulationEngine';
export { apiGateway, APIGatewayConfig, APIResponse, WebhookPayload } from './APIGateway';
export { frameworkRunner, RunnerConfig, FrameworkStatus } from './FrameworkRunner';
export { deploymentSystem, DeploymentConfig, DeploymentStatus } from './DeploymentSystem';

// Enhanced Services
export { headlessBrowserService, BrowserConfig, OptimizationResult as BrowserOptimizationResult, PerformanceMetrics } from './HeadlessBrowserService';
export { workersService, WorkerConfig, WorkerTask, WorkerMetrics } from './Workers';
export { lightDomCoinSimulation, CoinSimulationConfig, TokenTransaction, StakingPool, NetworkMetrics, GovernanceProposal } from './LightDomCoinSimulation';
export { workflowSimulation, SimulationConfig as WorkflowSimulationConfig, SimulationResult as WorkflowSimulationResult } from './WorkflowSimulation';

// Storage and Mining Services
export { storageNodeManager, StorageNode, MiningTarget, MiningMetadata, NodePerformance, NodeConfiguration, StorageMetrics, MiningActivity } from './StorageNodeManager';
export { webAddressMiner, MiningJob, MiningResults, Optimization, PerformanceMetrics as MiningPerformanceMetrics, MiningConfig, MiningStats } from './WebAddressMiner';
export { storageOptimizer, StorageOptimization, OptimizationDetails, StoragePolicy, CleanupStrategy, CleanupCondition } from './StorageOptimizer';

// Automation and Workflow Services
export { cursorAPIIntegration, CursorProject, CursorWorkflow, WorkflowTrigger, WorkflowAction, AutomationRule, AutomationCondition, AutomationAction, WorkflowExecution, N8NWorkflow, N8NNode, N8NConnections, N8NWorkflowSettings } from './CursorAPIIntegration';
export { n8nWorkflowManager, N8NConfig, N8NExecution, WorkflowTemplate, WorkflowVariable } from './N8NWorkflowManager';
export { automationOrchestrator, AutomationConfig, AlertThresholds, AutomationRuleConfig, ConditionConfig, ActionConfig, AutomationEvent, AutomationStats } from './AutomationOrchestrator';

// UI Components
export { default as MonitoringDashboard } from './MonitoringDashboard';

// Test Suite
export { WorkflowTestSuite } from './test-workflows';

// Re-export core engine components
export { spaceOptimizationEngine, OptimizationResult, MetaverseAsset, HarvesterStats } from '../core/SpaceOptimizationEngine';
export { advancedNodeManager, NodeConfig, StorageAllocation, OptimizationTask } from '../core/AdvancedNodeManager';

// Framework initialization function
export const initializeLightDomFramework = async (config?: Partial<RunnerConfig>) => {
  if (config) {
    frameworkRunner.updateConfig(config);
  }
  
  await frameworkRunner.start();
  return frameworkRunner;
};

// Quick start function
export const quickStart = async () => {
  console.log('🚀 Starting LightDom Framework with default configuration...');
  
  const runner = await initializeLightDomFramework({
    framework: {
      enableSimulation: true,
      simulationInterval: 60000,
      maxConcurrentOptimizations: 10
    },
    simulation: {
      enabled: true,
      interval: 60000,
      enableNetworkOptimization: true,
      enableTokenOptimization: true
    },
    api: {
      port: 3000,
      enableCORS: true,
      enableRateLimit: true,
      enableSwagger: true
    },
    enableLogging: true,
    enableMetrics: true,
    autoStart: true
  });
  
  console.log('✅ LightDom Framework started successfully!');
  console.log('📊 Dashboard: http://localhost:3000');
  console.log('📚 API Docs: http://localhost:3000/api/v1/docs');
  
  return runner;
};

// Default export
export default {
  lightDomFramework,
  urlQueueManager,
  simulationEngine,
  apiGateway,
  frameworkRunner,
  deploymentSystem,
  initializeLightDomFramework,
  quickStart
};
