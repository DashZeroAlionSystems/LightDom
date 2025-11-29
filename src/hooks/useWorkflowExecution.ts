/**
 * useWorkflowExecution Hook
 * React hook for managing workflow execution and monitoring
 */

import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  error?: string;
  results?: Record<string, any>;
}

export const useWorkflowExecution = () => {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);

  const executeWorkflow = useCallback(async (workflowId: string) => {
    try {
      setIsExecuting(true);
      const response = await axios.post(`${API_URL}/workflows/${workflowId}/execute`);
      
      const execution: WorkflowExecution = response.data;
      setCurrentExecution(execution);
      setExecutions((prev) => [execution, ...prev]);
      
      return execution;
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const getExecutionStatus = useCallback(async (executionId: string) => {
    try {
      const response = await axios.get(`${API_URL}/workflows/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }, []);

  const getWorkflowExecutions = useCallback(async (workflowId: string) => {
    try {
      const response = await axios.get(`${API_URL}/workflows/${workflowId}/executions`);
      setExecutions(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to get workflow executions:', error);
      throw error;
    }
  }, []);

  return {
    executions,
    isExecuting,
    currentExecution,
    executeWorkflow,
    getExecutionStatus,
    getWorkflowExecutions,
  };
};

export default useWorkflowExecution;
