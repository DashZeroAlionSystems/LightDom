/**
 * Workflow Simulation Dashboard
 * Complete user workflow simulation and testing interface
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  BarChart3,
  Users,
  Database,
  Brain,
  Shield,
  Zap,
  Globe,
  Settings,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  Download,
  Upload,
  Code,
  Link,
  HardDrive,
  Cpu,
  Network,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'client' | 'cursor' | 'blockchain' | 'integration';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration: number;
  dependencies: string[];
  result?: any;
  error?: string;
}

interface WorkflowSimulation {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  totalDuration: number;
  status: 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
}

const WorkflowSimulationDashboard: React.FC = () => {
  const [simulations, setSimulations] = useState<WorkflowSimulation[]>([]);
  const [currentSimulation, setCurrentSimulation] = useState<WorkflowSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [simulationStats, setSimulationStats] = useState<any>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    loadSimulations();
  }, []);

  // Auto-refresh when simulation is running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        loadSimulations();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const loadSimulations = async () => {
    try {
      const response = await fetch('/api/workflow/simulations');
      const data = await response.json();
      if (data.success) {
        setSimulations(data.data.simulations);
        if (data.data.currentSimulation) {
          setCurrentSimulation(data.data.currentSimulation);
          setIsRunning(data.data.currentSimulation.status === 'running');
        }
      }
    } catch (error) {
      console.error('Error loading simulations:', error);
    }
  };

  const startSimulation = async () => {
    try {
      const response = await fetch('/api/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSimulation(data.data.simulation);
        setIsRunning(true);
        loadSimulations();
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      const response = await fetch('/api/workflow/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setIsRunning(false);
        loadSimulations();
      }
    } catch (error) {
      console.error('Error stopping simulation:', error);
    }
  };

  const resetSimulation = async () => {
    try {
      const response = await fetch('/api/workflow/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setCurrentSimulation(null);
        setIsRunning(false);
        loadSimulations();
      }
    } catch (error) {
      console.error('Error resetting simulation:', error);
    }
  };

  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (type: string) => {
    const icons = {
      client: <Users size={16} />,
      cursor: <Brain size={16} />,
      blockchain: <Shield size={16} />,
      integration: <Link size={16} />,
    };
    return icons[type as keyof typeof icons] || <Activity size={16} />;
  };

  const getStepStatusColor = (status: string) => {
    const colors = {
      pending: 'text-gray-400',
      in_progress: 'text-blue-400',
      completed: 'text-green-400',
      failed: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStepStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock size={16} />,
      in_progress: <RefreshCw size={16} className='animate-spin' />,
      completed: <CheckCircle size={16} />,
      failed: <XCircle size={16} />,
    };
    return icons[status as keyof typeof colors] || <Clock size={16} />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      client: 'bg-blue-500',
      cursor: 'bg-purple-500',
      blockchain: 'bg-green-500',
      integration: 'bg-orange-500',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressPercentage = (simulation: WorkflowSimulation) => {
    if (!simulation) return 0;
    const completedSteps = simulation.steps.filter(step => step.status === 'completed').length;
    return (completedSteps / simulation.steps.length) * 100;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6'>
      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2'>
            Workflow Simulation Dashboard
          </h1>
          <p className='text-slate-300 text-lg'>Complete user workflow simulation and testing</p>
        </div>

        {/* Controls */}
        <div className='flex justify-center gap-4 mb-8'>
          <button
            onClick={startSimulation}
            disabled={isRunning}
            className='px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
          >
            <Play size={20} />
            Start Simulation
          </button>

          <button
            onClick={stopSimulation}
            disabled={!isRunning}
            className='px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
          >
            <Pause size={20} />
            Stop Simulation
          </button>

          <button
            onClick={resetSimulation}
            className='px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2'
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>

        {/* Current Simulation */}
        {currentSimulation && (
          <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-8'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-xl font-bold'>Current Simulation</h3>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}
                ></div>
                <span className='text-sm'>{isRunning ? 'Running' : 'Stopped'}</span>
              </div>
            </div>

            <div className='mb-4'>
              <div className='flex justify-between text-sm mb-2'>
                <span>Progress</span>
                <span>{Math.round(getProgressPercentage(currentSimulation))}%</span>
              </div>
              <div className='w-full bg-slate-700 rounded-full h-2'>
                <div
                  className='bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300'
                  style={{ width: `${getProgressPercentage(currentSimulation)}%` }}
                ></div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-slate-400'>Duration:</span>
                <span className='ml-2 font-mono'>
                  {formatDuration(currentSimulation.totalDuration)}
                </span>
              </div>
              <div>
                <span className='text-slate-400'>Steps:</span>
                <span className='ml-2 font-mono'>
                  {currentSimulation.steps.filter(s => s.status === 'completed').length} /{' '}
                  {currentSimulation.steps.length}
                </span>
              </div>
              <div>
                <span className='text-slate-400'>Status:</span>
                <span className='ml-2 font-mono'>{currentSimulation.status}</span>
              </div>
              <div>
                <span className='text-slate-400'>Created:</span>
                <span className='ml-2 font-mono'>
                  {new Date(currentSimulation.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Steps */}
        {currentSimulation && (
          <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 mb-8'>
            <h3 className='text-xl font-bold mb-4'>Simulation Steps</h3>

            <div className='space-y-3'>
              {currentSimulation.steps.map((step, index) => (
                <div key={step.id} className='bg-slate-700/50 rounded-lg p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`w-8 h-8 rounded-full ${getTypeColor(step.type)} flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {index + 1}
                      </div>
                      <div className='flex items-center gap-2'>
                        {getStepIcon(step.type)}
                        <span className='font-semibold'>{step.name}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {getStepStatusIcon(step.status)}
                      <span className={`text-sm ${getStepStatusColor(step.status)}`}>
                        {step.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className='text-sm text-slate-400 mb-2'>{step.description}</div>

                  <div className='flex justify-between items-center text-xs'>
                    <span>Duration: {formatDuration(step.duration)}</span>
                    <button
                      onClick={() => toggleStepExpansion(step.id)}
                      className='text-blue-400 hover:text-blue-300 flex items-center gap-1'
                    >
                      {expandedSteps.has(step.id) ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                      {expandedSteps.has(step.id) ? 'Hide' : 'Show'} Details
                    </button>
                  </div>

                  {expandedSteps.has(step.id) && (
                    <div className='mt-4 pt-4 border-t border-slate-600'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <span className='text-slate-400'>Type:</span>
                          <span className='ml-2 font-mono'>{step.type}</span>
                        </div>
                        <div>
                          <span className='text-slate-400'>Dependencies:</span>
                          <span className='ml-2 font-mono'>{step.dependencies.length}</span>
                        </div>
                      </div>

                      {step.result && (
                        <div className='mt-4'>
                          <span className='text-slate-400 text-sm'>Result:</span>
                          <pre className='bg-slate-800 rounded p-2 mt-1 text-xs overflow-x-auto'>
                            {JSON.stringify(step.result, null, 2)}
                          </pre>
                        </div>
                      )}

                      {step.error && (
                        <div className='mt-4'>
                          <span className='text-red-400 text-sm'>Error:</span>
                          <div className='bg-red-900/20 border border-red-500/20 rounded p-2 mt-1 text-xs text-red-300'>
                            {step.error}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulation History */}
        <div className='bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700'>
          <h3 className='text-xl font-bold mb-4'>Simulation History</h3>

          {simulations.length === 0 ? (
            <div className='text-center text-slate-400 py-8'>
              <Activity size={48} className='mx-auto mb-4 opacity-50' />
              <p>No simulations yet</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {simulations.map(simulation => (
                <div key={simulation.id} className='bg-slate-700/50 rounded-lg p-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <div>
                      <div className='font-semibold'>{simulation.name}</div>
                      <div className='text-sm text-slate-400'>{simulation.description}</div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          simulation.status === 'completed'
                            ? 'bg-green-400'
                            : simulation.status === 'failed'
                              ? 'bg-red-400'
                              : simulation.status === 'running'
                                ? 'bg-blue-400 animate-pulse'
                                : 'bg-gray-400'
                        }`}
                      ></div>
                      <span className='text-sm'>{simulation.status}</span>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <span className='text-slate-400'>Duration:</span>
                      <span className='ml-2 font-mono'>
                        {formatDuration(simulation.totalDuration)}
                      </span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Steps:</span>
                      <span className='ml-2 font-mono'>
                        {simulation.steps.filter(s => s.status === 'completed').length} /{' '}
                        {simulation.steps.length}
                      </span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Created:</span>
                      <span className='ml-2 font-mono'>
                        {new Date(simulation.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className='text-slate-400'>Completed:</span>
                      <span className='ml-2 font-mono'>
                        {simulation.completedAt
                          ? new Date(simulation.completedAt).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowSimulationDashboard;
