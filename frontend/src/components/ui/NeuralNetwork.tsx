import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Progress } from './Progress';

const modelCardVariants = cva(
  [
    'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
    'transition-all duration-medium-2 ease-emphasized',
    'hover:border-primary hover:shadow-level-2'
  ],
  {
    variants: {
      status: {
        training: 'border-blue-500/50 bg-blue-50/5',
        completed: 'border-green-500/50 bg-green-50/5',
        failed: 'border-red-500/50 bg-red-50/5',
        idle: 'border-outline-variant'
      }
    },
    defaultVariants: {
      status: 'idle'
    }
  }
);

export interface ModelCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modelCardVariants> {
  modelName: string;
  modelType: string;
  accuracy?: number;
  loss?: number;
  epochs?: number;
  trainingProgress?: number;
  lastUpdated?: string;
  status?: 'training' | 'completed' | 'failed' | 'idle';
}

const ModelCard = React.forwardRef<HTMLDivElement, ModelCardProps>(
  ({
    modelName,
    modelType,
    accuracy,
    loss,
    epochs,
    trainingProgress,
    lastUpdated,
    status = 'idle',
    className,
    ...props
  }, ref) => {
    const getStatusColor = () => {
      switch (status) {
        case 'training': return 'text-blue-500';
        case 'completed': return 'text-green-500';
        case 'failed': return 'text-red-500';
        default: return 'text-on-surface-variant';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(modelCardVariants({ status }), className)}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="md3-title-large text-on-surface font-semibold">{modelName}</h3>
            <p className="md3-body-medium text-on-surface-variant">{modelType}</p>
          </div>
          <div className={cn('px-3 py-1 rounded-full text-xs font-medium', getStatusColor())}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {trainingProgress !== undefined && status === 'training' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="md3-label-medium text-on-surface-variant">Training Progress</span>
              <span className="md3-label-medium text-on-surface">{Math.round(trainingProgress)}%</span>
            </div>
            <Progress value={trainingProgress} size="sm" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          {accuracy !== undefined && (
            <div>
              <div className="md3-label-small text-on-surface-variant">Accuracy</div>
              <div className="md3-title-medium text-on-surface font-semibold">
                {(accuracy * 100).toFixed(1)}%
              </div>
            </div>
          )}
          {loss !== undefined && (
            <div>
              <div className="md3-label-small text-on-surface-variant">Loss</div>
              <div className="md3-title-medium text-on-surface font-semibold">
                {loss.toFixed(4)}
              </div>
            </div>
          )}
          {epochs !== undefined && (
            <div>
              <div className="md3-label-small text-on-surface-variant">Epochs</div>
              <div className="md3-title-medium text-on-surface font-semibold">
                {epochs}
              </div>
            </div>
          )}
          {lastUpdated && (
            <div>
              <div className="md3-label-small text-on-surface-variant">Last Updated</div>
              <div className="md3-body-medium text-on-surface">
                {new Date(lastUpdated).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ModelCard.displayName = 'ModelCard';

// Training Metrics Chart Component
const metricsChartVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      height: {
        sm: 'h-64',
        md: 'h-80',
        lg: 'h-96'
      }
    },
    defaultVariants: {
      height: 'md'
    }
  }
);

export interface MetricsChartProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricsChartVariants> {
  data: Array<{
    epoch: number;
    accuracy: number;
    loss: number;
    validationAccuracy?: number;
    validationLoss?: number;
  }>;
  title?: string;
  showValidation?: boolean;
}

const MetricsChart = React.forwardRef<HTMLDivElement, MetricsChartProps>(
  ({ data, title = 'Training Metrics', showValidation = true, height, className, ...props }, ref) => {
    const maxEpoch = Math.max(...data.map(d => d.epoch));
    const maxAccuracy = Math.max(...data.map(d => Math.max(d.accuracy, d.validationAccuracy || 0)));
    const maxLoss = Math.max(...data.map(d => Math.max(d.loss, d.validationLoss || 0)));

    return (
      <div
        ref={ref}
        className={cn(metricsChartVariants({ height }), className)}
        {...props}
      >
        <h3 className="md3-title-large text-on-surface font-semibold mb-6">{title}</h3>

        <div className="space-y-6">
          {/* Accuracy Chart */}
          <div>
            <h4 className="md3-title-small text-on-surface mb-3">Accuracy</h4>
            <div className="relative h-32">
              <svg className="w-full h-full" viewBox={`0 0 ${maxEpoch} 100`}>
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Training accuracy line */}
                <polyline
                  fill="none"
                  stroke="#1976d2"
                  strokeWidth="2"
                  points={data.map(d => `${d.epoch},${100 - (d.accuracy / maxAccuracy) * 80}`).join(' ')}
                />

                {/* Validation accuracy line */}
                {showValidation && (
                  <polyline
                    fill="none"
                    stroke="#388e3c"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points={data.map(d => d.validationAccuracy ? `${d.epoch},${100 - (d.validationAccuracy / maxAccuracy) * 80}` : '').filter(Boolean).join(' ')}
                  />
                )}
              </svg>
            </div>
          </div>

          {/* Loss Chart */}
          <div>
            <h4 className="md3-title-small text-on-surface mb-3">Loss</h4>
            <div className="relative h-32">
              <svg className="w-full h-full" viewBox={`0 0 ${maxEpoch} 100`}>
                <defs>
                  <pattern id="grid-loss" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-loss)" />

                {/* Training loss line */}
                <polyline
                  fill="none"
                  stroke="#d32f2f"
                  strokeWidth="2"
                  points={data.map(d => `${d.epoch},${(d.loss / maxLoss) * 80}`).join(' ')}
                />

                {/* Validation loss line */}
                {showValidation && (
                  <polyline
                    fill="none"
                    stroke="#f57c00"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    points={data.map(d => d.validationLoss ? `${d.epoch},${(d.validationLoss / maxLoss) * 80}` : '').filter(Boolean).join(' ')}
                  />
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-600"></div>
            <span className="md3-label-small text-on-surface">Training</span>
          </div>
          {showValidation && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-600 border-dashed border-t-2"></div>
              <span className="md3-label-small text-on-surface">Validation</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricsChart.displayName = 'MetricsChart';

// Neural Network Architecture Visualizer
const neuralNetworkVariants = cva(
  'relative rounded-3xl border border-outline-variant bg-surface-container-high p-6',
  {
    variants: {
      size: {
        sm: 'min-h-32',
        md: 'min-h-48',
        lg: 'min-h-64'
      }
    },
    defaultVariants: {
      size: 'md'
    }
  }
);

export interface NeuralNetworkVisualizerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neuralNetworkVariants> {
  layers: Array<{
    name: string;
    neurons: number;
    activation?: string;
  }>;
  connections?: boolean;
}

const NeuralNetworkVisualizer = React.forwardRef<HTMLDivElement, NeuralNetworkVisualizerProps>(
  ({ layers, connections = true, size, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(neuralNetworkVariants({ size }), className)}
        {...props}
      >
        <h3 className="md3-title-large text-on-surface font-semibold mb-6">Network Architecture</h3>

        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {layers.map((layer, index) => (
            <div key={index} className="flex flex-col items-center mx-2">
              {/* Layer visualization */}
              <div className="relative">
                {/* Neurons */}
                <div className="flex flex-col gap-1">
                  {Array.from({ length: Math.min(layer.neurons, 8) }).map((_, neuronIndex) => (
                    <div
                      key={neuronIndex}
                      className="w-3 h-3 rounded-full bg-primary border border-on-primary"
                    />
                  ))}
                  {layer.neurons > 8 && (
                    <div className="text-center">
                      <span className="md3-label-small text-on-surface-variant">...</span>
                    </div>
                  )}
                </div>

                {/* Connections to next layer */}
                {connections && index < layers.length - 1 && (
                  <svg
                    className="absolute top-0 left-full w-8 h-full -ml-1 pointer-events-none"
                    viewBox="0 0 32 100"
                  >
                    {Array.from({ length: Math.min(layer.neurons, 8) }).map((_, neuronIndex) => {
                      const y1 = (neuronIndex * 100) / Math.min(layer.neurons, 8) + 6;
                      return (
                        <line
                          key={neuronIndex}
                          x1="0"
                          y1={y1}
                          x2="32"
                          y2={y1}
                          stroke="currentColor"
                          strokeWidth="1"
                          opacity="0.3"
                        />
                      );
                    })}
                  </svg>
                )}
              </div>

              {/* Layer info */}
              <div className="text-center mt-3">
                <div className="md3-label-medium text-on-surface font-medium">{layer.name}</div>
                <div className="md3-body-small text-on-surface-variant">{layer.neurons} neurons</div>
                {layer.activation && (
                  <div className="md3-label-small text-primary">{layer.activation}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

NeuralNetworkVisualizer.displayName = 'NeuralNetworkVisualizer';

export { ModelCard, MetricsChart, NeuralNetworkVisualizer };
