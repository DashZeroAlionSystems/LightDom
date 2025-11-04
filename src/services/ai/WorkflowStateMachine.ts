/**
 * Workflow State Machine with Schema Linking
 * 
 * Manages workflow states and transitions using linked schemas
 * Enables DeepSeek to simulate and execute complex workflow plans
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';

export interface WorkflowState {
  id: string;
  name: string;
  type: 'initial' | 'processing' | 'decision' | 'final' | 'error';
  description: string;
  schema: SchemaLink;
  allowedTransitions: string[];
  actions: StateAction[];
  conditions: StateCondition[];
}

export interface SchemaLink {
  id: string;
  schemaType: string;
  properties: Record<string, any>;
  linkedSchemas: {
    schemaId: string;
    relationship: 'parent' | 'child' | 'sibling' | 'reference';
    config: Record<string, any>;
  }[];
  validationRules: ValidationRule[];
}

export interface StateAction {
  id: string;
  type: 'data_collection' | 'training' | 'analysis' | 'notification' | 'custom';
  serviceId: string;
  config: Record<string, any>;
  schemaMapping: Record<string, string>;
}

export interface StateCondition {
  id: string;
  type: 'metric_threshold' | 'time_based' | 'data_availability' | 'custom';
  expression: string;
  schemaPath: string;
  value: any;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  config: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  currentState: string;
  stateHistory: StateTransition[];
  context: Record<string, any>;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: string;
  endTime?: string;
}

export interface StateTransition {
  from: string;
  to: string;
  timestamp: string;
  trigger: string;
  data: Record<string, any>;
  schemaSnapshot: SchemaLink;
}

export interface SimulationPlan {
  id: string;
  name: string;
  description: string;
  steps: SimulationStep[];
  expectedOutcome: string;
  estimatedDuration: number;
  requiredResources: string[];
  risks: string[];
  generated_by: 'deepseek' | 'manual';
}

export interface SimulationStep {
  stepNumber: number;
  state: string;
  action: string;
  expectedData: Record<string, any>;
  schemaConfig: SchemaLink;
  duration: number;
  dependencies: number[];
}

export class WorkflowStateMachine extends EventEmitter {
  private dbPool: Pool;
  private states: Map<string, WorkflowState> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor(dbPool: Pool) {
    super();
    this.dbPool = dbPool;
  }

  /**
   * Initialize state machine with workflow definition
   */
  async initialize(workflowId: string): Promise<void> {
    const result = await this.dbPool.query(
      'SELECT * FROM workflow_configs WHERE id = $1',
      [workflowId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const workflow = result.rows[0];
    
    // Build state machine from workflow steps
    await this.buildStateMachine(workflow);
  }

  /**
   * Build state machine from workflow configuration
   */
  private async buildStateMachine(workflow: any): Promise<void> {
    const steps = workflow.steps;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Determine state type
      let stateType: WorkflowState['type'] = 'processing';
      if (i === 0) stateType = 'initial';
      if (i === steps.length - 1) stateType = 'final';
      if (step.type === 'validation') stateType = 'decision';

      // Get linked schemas for this step
      const linkedSchemas = await this.getLinkedSchemas(step.id);

      const state: WorkflowState = {
        id: step.id,
        name: step.name,
        type: stateType,
        description: step.config?.description || '',
        schema: {
          id: `schema-${step.id}`,
          schemaType: step.type,
          properties: step.config || {},
          linkedSchemas,
          validationRules: step.config?.validation || [],
        },
        allowedTransitions: this.determineTransitions(i, steps),
        actions: this.extractActions(step),
        conditions: step.config?.conditions || [],
      };

      this.states.set(state.id, state);
    }
  }

  /**
   * Get linked schemas from database
   */
  private async getLinkedSchemas(stepId: string): Promise<SchemaLink['linkedSchemas']> {
    const result = await this.dbPool.query(`
      SELECT * FROM schema_relationships
      WHERE from_schema = $1 OR to_schema = $1
    `, [stepId]);

    return result.rows.map(row => ({
      schemaId: row.from_schema === stepId ? row.to_schema : row.from_schema,
      relationship: row.relationship_type,
      config: row.config || {},
    }));
  }

  /**
   * Determine allowed transitions
   */
  private determineTransitions(index: number, steps: any[]): string[] {
    const transitions: string[] = [];
    
    // Can transition to next step
    if (index < steps.length - 1) {
      transitions.push(steps[index + 1].id);
    }

    // Can transition to error state
    transitions.push('error');

    return transitions;
  }

  /**
   * Extract actions from step configuration
   */
  private extractActions(step: any): StateAction[] {
    const actions: StateAction[] = [];

    if (step.serviceId) {
      actions.push({
        id: `action-${step.id}`,
        type: step.type,
        serviceId: step.serviceId,
        config: step.config || {},
        schemaMapping: step.config?.schemaMapping || {},
      });
    }

    return actions;
  }

  /**
   * Start workflow execution
   */
  async startExecution(workflowId: string, context: Record<string, any> = {}): Promise<string> {
    const executionId = `exec-${Date.now()}`;
    
    const initialState = Array.from(this.states.values()).find(s => s.type === 'initial');
    if (!initialState) {
      throw new Error('No initial state found');
    }

    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      currentState: initialState.id,
      stateHistory: [],
      context,
      status: 'running',
      startTime: new Date().toISOString(),
    };

    this.executions.set(executionId, execution);
    this.emit('execution:started', execution);

    // Execute initial state
    await this.executeState(executionId, initialState);

    return executionId;
  }

  /**
   * Execute a state
   */
  private async executeState(executionId: string, state: WorkflowState): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    this.emit('state:enter', { executionId, state });

    // Execute all actions in state
    for (const action of state.actions) {
      await this.executeAction(execution, action);
    }

    // Check conditions for transition
    const nextState = await this.evaluateTransition(execution, state);
    
    if (nextState) {
      await this.transition(executionId, nextState);
    } else if (state.type === 'final') {
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      this.emit('execution:completed', execution);
    }
  }

  /**
   * Execute an action
   */
  private async executeAction(execution: WorkflowExecution, action: StateAction): Promise<void> {
    this.emit('action:execute', { execution, action });

    // Map schema data to action parameters
    const mappedData = this.mapSchemaData(execution.context, action.schemaMapping);

    // Store action result in context
    execution.context[`action_${action.id}_result`] = {
      executed: true,
      timestamp: new Date().toISOString(),
      data: mappedData,
    };
  }

  /**
   * Map schema data using schema mapping
   */
  private mapSchemaData(context: Record<string, any>, mapping: Record<string, string>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      // Simple path resolution (e.g., "workflow.data.samples")
      const value = this.resolvePath(context, sourcePath);
      result[targetKey] = value;
    }

    return result;
  }

  /**
   * Resolve a path in context object
   */
  private resolvePath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate conditions and determine next state
   */
  private async evaluateTransition(execution: WorkflowExecution, currentState: WorkflowState): Promise<string | null> {
    // If no conditions, transition to first allowed state
    if (currentState.conditions.length === 0 && currentState.allowedTransitions.length > 0) {
      return currentState.allowedTransitions[0];
    }

    // Evaluate conditions
    for (const condition of currentState.conditions) {
      if (await this.evaluateCondition(execution, condition)) {
        return currentState.allowedTransitions[0];
      }
    }

    return null;
  }

  /**
   * Evaluate a single condition
   */
  private async evaluateCondition(execution: WorkflowExecution, condition: StateCondition): Promise<boolean> {
    const value = this.resolvePath(execution.context, condition.schemaPath);

    switch (condition.type) {
      case 'metric_threshold':
        return this.compareValues(value, condition.expression, condition.value);
      case 'data_availability':
        return value !== undefined && value !== null;
      default:
        return true;
    }
  }

  /**
   * Compare values based on expression
   */
  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case '>': return actual > expected;
      case '>=': return actual >= expected;
      case '<': return actual < expected;
      case '<=': return actual <= expected;
      case '==': return actual == expected;
      case '===': return actual === expected;
      case '!=': return actual != expected;
      default: return false;
    }
  }

  /**
   * Transition to new state
   */
  private async transition(executionId: string, nextStateId: string): Promise<void> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const currentState = this.states.get(execution.currentState);
    const nextState = this.states.get(nextStateId);

    if (!nextState) {
      throw new Error(`State ${nextStateId} not found`);
    }

    // Record transition
    const transition: StateTransition = {
      from: execution.currentState,
      to: nextStateId,
      timestamp: new Date().toISOString(),
      trigger: 'condition_met',
      data: execution.context,
      schemaSnapshot: currentState!.schema,
    };

    execution.stateHistory.push(transition);
    execution.currentState = nextStateId;

    this.emit('state:transition', transition);

    // Execute next state
    await this.executeState(executionId, nextState);
  }

  /**
   * Generate simulation plan using DeepSeek
   */
  async generateSimulationPlan(
    workflowId: string,
    requirements: string
  ): Promise<SimulationPlan> {
    // This would call DeepSeek to analyze the workflow and generate a plan
    const workflow = await this.dbPool.query(
      'SELECT * FROM workflow_configs WHERE id = $1',
      [workflowId]
    );

    if (workflow.rows.length === 0) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const steps = workflow.rows[0].steps;
    const simulationSteps: SimulationStep[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const linkedSchemas = await this.getLinkedSchemas(step.id);

      simulationSteps.push({
        stepNumber: i + 1,
        state: step.id,
        action: step.name,
        expectedData: step.config?.expectedOutput || {},
        schemaConfig: {
          id: `schema-${step.id}`,
          schemaType: step.type,
          properties: step.config || {},
          linkedSchemas,
          validationRules: [],
        },
        duration: step.config?.estimatedDuration || 60,
        dependencies: i > 0 ? [i] : [],
      });
    }

    const plan: SimulationPlan = {
      id: `sim-${Date.now()}`,
      name: `Simulation Plan for ${workflow.rows[0].name}`,
      description: `Generated simulation plan based on requirements: ${requirements}`,
      steps: simulationSteps,
      expectedOutcome: 'Successful workflow completion with all data collected and processed',
      estimatedDuration: simulationSteps.reduce((sum, s) => sum + s.duration, 0),
      requiredResources: ['database', 'neural_network', 'data_crawler'],
      risks: [
        'Insufficient training data',
        'Network connectivity issues',
        'API rate limiting',
      ],
      generated_by: 'deepseek',
    };

    // Store simulation plan
    await this.dbPool.query(`
      INSERT INTO workflow_simulations (id, workflow_id, plan, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [plan.id, workflowId, JSON.stringify(plan)]);

    return plan;
  }

  /**
   * Get execution status
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Get all states
   */
  getStates(): WorkflowState[] {
    return Array.from(this.states.values());
  }
}

export default WorkflowStateMachine;
