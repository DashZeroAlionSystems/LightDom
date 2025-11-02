import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  Trash2, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react';
import { Button } from './Button';
import { StatusIndicator } from './StatusIndicator';
import { ProgressIndicator } from './ProgressIndicator';
import { Badge } from './Badge';

export interface WorkflowItemData {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'paused' | 'stopped' | 'completed' | 'error' | 'idle';
  currentStep?: number;
  totalSteps?: number;
  progress?: number;
  lastRun?: string;
  nextRun?: string;
  successRate?: number;
  avgDuration?: string;
  executionCount?: number;
  isScheduled?: boolean;
}

export interface WorkflowListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  workflow: WorkflowItemData;
  onPlay?: (id: string) => void;
  onPause?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showQuickStats?: boolean;
  isImplemented?: boolean;
}

export const WorkflowListItem = React.forwardRef<HTMLDivElement, WorkflowListItemProps>(
  ({ 
    workflow, 
    onPlay, 
    onPause, 
    onStop, 
    onDelete, 
    onEdit,
    showQuickStats = false,
    isImplemented = true,
    className, 
    ...props 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const canPlay = workflow.status === 'stopped' || workflow.status === 'paused' || workflow.status === 'idle';
    const canPause = workflow.status === 'running';
    const canStop = workflow.status === 'running' || workflow.status === 'paused';

    return (
      <div
        ref={ref}
        className={cn(
          'group rounded-2xl border border-outline bg-surface-container transition-all duration-200',
          'hover:shadow-level-1 hover:bg-surface-container-high',
          !isImplemented && 'opacity-60 pointer-events-none grayscale',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-4 p-4">
          {/* Gear icon for edit - left corner */}
          <button
            onClick={() => onEdit?.(workflow.id)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
              'hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface',
              !isImplemented && 'pointer-events-none opacity-50'
            )}
            title="Edit workflow"
            disabled={!isImplemented}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header with name and status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-on-surface truncate">
                  {workflow.name}
                </h3>
                {workflow.description && (
                  <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
                    {workflow.description}
                  </p>
                )}
              </div>
              <StatusIndicator 
                status={workflow.status} 
                size="sm"
                pulse={workflow.status === 'running'}
              />
            </div>

            {/* Progress bar */}
            {workflow.status === 'running' && workflow.currentStep && workflow.totalSteps && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>Step {workflow.currentStep} of {workflow.totalSteps}</span>
                  <span>{Math.round((workflow.currentStep / workflow.totalSteps) * 100)}%</span>
                </div>
                <ProgressIndicator 
                  value={workflow.currentStep} 
                  max={workflow.totalSteps}
                  size="sm"
                  animated={true}
                />
              </div>
            )}

            {/* Metadata badges */}
            <div className="flex flex-wrap items-center gap-2">
              {workflow.isScheduled && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Scheduled
                </Badge>
              )}
              {workflow.lastRun && (
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {workflow.lastRun}
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {canPlay && (
                <Button
                  variant="filled"
                  size="sm"
                  onClick={() => onPlay?.(workflow.id)}
                  disabled={!isImplemented}
                  className="gap-1"
                >
                  <PlayCircle className="h-4 w-4" />
                  Play
                </Button>
              )}
              {canPause && (
                <Button
                  variant="filled-tonal"
                  size="sm"
                  onClick={() => onPause?.(workflow.id)}
                  disabled={!isImplemented}
                  className="gap-1"
                >
                  <PauseCircle className="h-4 w-4" />
                  Pause
                </Button>
              )}
              {canStop && (
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => onStop?.(workflow.id)}
                  disabled={!isImplemented}
                  className="gap-1"
                >
                  <StopCircle className="h-4 w-4" />
                  Stop
                </Button>
              )}
              {workflow.status === 'stopped' && (
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => onDelete?.(workflow.id)}
                  disabled={!isImplemented}
                  className="gap-1 text-error hover:bg-error-container/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable quick stats */}
        {showQuickStats && (
          <div className="border-t border-outline-variant">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-between px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-highest transition-colors"
            >
              <span className="font-medium flex items-center gap-2">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                Quick Stats
              </span>
            </button>
            
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 space-y-2 bg-surface-container-highest/50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {workflow.lastRun && (
                    <div>
                      <span className="text-on-surface-variant">Last Run:</span>
                      <p className="text-on-surface font-medium">{workflow.lastRun}</p>
                    </div>
                  )}
                  {workflow.successRate !== undefined && (
                    <div>
                      <span className="text-on-surface-variant">Success Rate:</span>
                      <p className="text-on-surface font-medium">{workflow.successRate}%</p>
                    </div>
                  )}
                  {workflow.avgDuration && (
                    <div>
                      <span className="text-on-surface-variant">Avg Duration:</span>
                      <p className="text-on-surface font-medium">{workflow.avgDuration}</p>
                    </div>
                  )}
                  {workflow.executionCount !== undefined && (
                    <div>
                      <span className="text-on-surface-variant">Executions:</span>
                      <p className="text-on-surface font-medium">{workflow.executionCount}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

WorkflowListItem.displayName = 'WorkflowListItem';

export interface WorkflowListProps extends React.HTMLAttributes<HTMLDivElement> {
  workflows: WorkflowItemData[];
  onPlay?: (id: string) => void;
  onPause?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showQuickStats?: boolean;
  emptyMessage?: string;
}

export const WorkflowList = React.forwardRef<HTMLDivElement, WorkflowListProps>(
  ({ 
    workflows, 
    onPlay, 
    onPause, 
    onStop, 
    onDelete, 
    onEdit,
    showQuickStats = true,
    emptyMessage = 'No workflows yet. Create your first workflow to get started.',
    className, 
    ...props 
  }, ref) => {
    if (workflows.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline p-12 text-center',
            className
          )}
          {...props}
        >
          <p className="text-on-surface-variant text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {workflows.map((workflow) => (
          <WorkflowListItem
            key={workflow.id}
            workflow={workflow}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
            onDelete={onDelete}
            onEdit={onEdit}
            showQuickStats={showQuickStats}
          />
        ))}
      </div>
    );
  }
);

WorkflowList.displayName = 'WorkflowList';

export default WorkflowList;
