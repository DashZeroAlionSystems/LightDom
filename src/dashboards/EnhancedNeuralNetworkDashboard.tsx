import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Brain,
  Settings,
  Sliders,
  Play,
  Pause,
  Square,
  RotateCcw,
  Edit3,
  Save,
  Plus,
  Minus,
  Eye,
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  Layers,
  Cpu,
  Network,
  FileText,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RefreshCw,
  Lightbulb,
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  Gauge,
  Thermometer,
  Crosshair,
  Wrench,
  Cog,
  Palette,
  Code,
  GitBranch,
  Workflow
} from 'lucide-react';

// Enhanced Neural Network Dashboard Types
interface DatasetConfig {
  id: string;
  name: string;
  description: string;
  type: 'supervised' | 'unsupervised' | 'reinforcement';
  size: number;
  features: string[];
  labels?: string[];
  quality: number; // 0-1
  preprocessing: {
    normalization: boolean;
    standardization: boolean;
    encoding: 'one-hot' | 'label' | 'ordinal' | 'none';
    outlierRemoval: boolean;
    featureSelection: boolean;
  };
  validation: {
    trainSplit: number;
    valSplit: number;
    testSplit: number;
    crossValidation: boolean;
    folds: number;
  };
  augmentation: {
    enabled: boolean;
    techniques: string[];
    intensity: number;
  };
}

interface ModelArchitecture {
  id: string;
  name: string;
  type: 'mlp' | 'cnn' | 'rnn' | 'transformer' | 'autoencoder';
  layers: LayerConfig[];
  optimizer: 'adam' | 'sgd' | 'rmsprop' | 'adamw';
  lossFunction: string;
  metrics: string[];
  hyperparameters: Record<string, any>;
}

interface LayerConfig {
  id: string;
  type: 'dense' | 'conv2d' | 'lstm' | 'attention' | 'dropout' | 'batch_norm';
  config: Record<string, any>;
  activation?: string;
  trainable: boolean;
}

interface TrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  decay: number;
  momentum: number;
  earlyStopping: {
    enabled: boolean;
    patience: number;
    minDelta: number;
  };
  callbacks: {
    modelCheckpoint: boolean;
    tensorBoard: boolean;
    lrScheduler: boolean;
  };
  distributed: {
    enabled: boolean;
    workers: number;
    strategy: string;
  };
}

interface FineTuningSession {
  id: string;
  name: string;
  datasetId: string;
  modelId: string;
  status: 'idle' | 'preparing' | 'training' | 'validating' | 'completed' | 'failed';
  progress: number;
  currentEpoch: number;
  currentBatch: number;
  metrics: {
    train: {
      loss: number;
      accuracy: number;
      [key: string]: number;
    };
    val: {
      loss: number;
      accuracy: number;
      [key: string]: number;
    };
  };
  history: {
    epoch: number;
    trainLoss: number;
    trainAccuracy: number;
    valLoss: number;
    valAccuracy: number;
    learningRate: number;
    timestamp: Date;
  }[];
  predictions: any[];
  confusionMatrix?: number[][];
  featureImportance?: Record<string, number>;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

// Dataset Fine-Tuning Component
const DatasetFineTuner: React.FC<{
  dataset: DatasetConfig;
  onUpdate: (updates: Partial<DatasetConfig>) => void;
}> = ({ dataset, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'preprocessing' | 'validation' | 'augmentation'>('preprocessing');

  const tabs = [
    { id: 'preprocessing', name: 'Preprocessing', icon: Settings },
    { id: 'validation', name: 'Validation', icon: Target },
    { id: 'augmentation', name: 'Augmentation', icon: Zap }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Dataset Fine-Tuning: {dataset.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm rounded">
            Quality: {Math.round(dataset.quality * 100)}%
          </div>
          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
            {dataset.size.toLocaleString()} samples
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'preprocessing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dataset.preprocessing.normalization}
                  onChange={(e) => onUpdate({
                    preprocessing: { ...dataset.preprocessing, normalization: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Normalization (0-1 scaling)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dataset.preprocessing.standardization}
                  onChange={(e) => onUpdate({
                    preprocessing: { ...dataset.preprocessing, standardization: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Standardization (Z-score)</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dataset.preprocessing.outlierRemoval}
                  onChange={(e) => onUpdate({
                    preprocessing: { ...dataset.preprocessing, outlierRemoval: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Outlier Removal</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dataset.preprocessing.featureSelection}
                  onChange={(e) => onUpdate({
                    preprocessing: { ...dataset.preprocessing, featureSelection: e.target.checked }
                  })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Feature Selection</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categorical Encoding</label>
              <select
                value={dataset.preprocessing.encoding}
                onChange={(e) => onUpdate({
                  preprocessing: { ...dataset.preprocessing, encoding: e.target.value as any }
                })}
                className="w-full p-2 border rounded"
              >
                <option value="none">None</option>
                <option value="one-hot">One-Hot Encoding</option>
                <option value="label">Label Encoding</option>
                <option value="ordinal">Ordinal Encoding</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Features ({dataset.features.length})</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {dataset.features.map((feature, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Train Split (%)</label>
              <input
                type="number"
                value={dataset.validation.trainSplit}
                onChange={(e) => onUpdate({
                  validation: { ...dataset.validation, trainSplit: parseInt(e.target.value) }
                })}
                className="w-full p-2 border rounded"
                min="50"
                max="90"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Validation Split (%)</label>
              <input
                type="number"
                value={dataset.validation.valSplit}
                onChange={(e) => onUpdate({
                  validation: { ...dataset.validation, valSplit: parseInt(e.target.value) }
                })}
                className="w-full p-2 border rounded"
                min="5"
                max="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Test Split (%)</label>
              <input
                type="number"
                value={dataset.validation.testSplit}
                onChange={(e) => onUpdate({
                  validation: { ...dataset.validation, testSplit: parseInt(e.target.value) }
                })}
                className="w-full p-2 border rounded"
                min="5"
                max="30"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dataset.validation.crossValidation}
                onChange={(e) => onUpdate({
                  validation: { ...dataset.validation, crossValidation: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Enable Cross-Validation</span>
            </label>

            {dataset.validation.crossValidation && (
              <div>
                <label className="block text-sm font-medium mb-1">Folds</label>
                <input
                  type="number"
                  value={dataset.validation.folds}
                  onChange={(e) => onUpdate({
                    validation: { ...dataset.validation, folds: parseInt(e.target.value) }
                  })}
                  className="w-20 p-1 border rounded text-sm"
                  min="2"
                  max="10"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'augmentation' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={dataset.augmentation.enabled}
                onChange={(e) => onUpdate({
                  augmentation: { ...dataset.augmentation, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Enable Data Augmentation</span>
            </label>
          </div>

          {dataset.augmentation.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Augmentation Intensity (0-1)</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={dataset.augmentation.intensity}
                  onChange={(e) => onUpdate({
                    augmentation: { ...dataset.augmentation, intensity: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Current: {dataset.augmentation.intensity}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Augmentation Techniques</label>
                <div className="grid grid-cols-2 gap-2">
                  {['rotation', 'flip', 'zoom', 'noise', 'brightness', 'contrast', 'translation', 'scale'].map(technique => (
                    <label key={technique} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dataset.augmentation.techniques.includes(technique)}
                        onChange={(e) => {
                          const techniques = e.target.checked
                            ? [...dataset.augmentation.techniques, technique]
                            : dataset.augmentation.techniques.filter(t => t !== technique);
                          onUpdate({
                            augmentation: { ...dataset.augmentation, techniques }
                          });
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{technique}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Model Architecture Builder Component
const ModelArchitectureBuilder: React.FC<{
  model: ModelArchitecture;
  onUpdate: (updates: Partial<ModelArchitecture>) => void;
}> = ({ model, onUpdate }) => {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  const addLayer = (type: LayerConfig['type']) => {
    const newLayer: LayerConfig = {
      id: `layer-${Date.now()}`,
      type,
      config: getDefaultLayerConfig(type),
      activation: type === 'dense' ? 'relu' : undefined,
      trainable: true
    };

    onUpdate({
      layers: [...model.layers, newLayer]
    });
  };

  const removeLayer = (layerId: string) => {
    onUpdate({
      layers: model.layers.filter(l => l.id !== layerId)
    });
  };

  const updateLayer = (layerId: string, updates: Partial<LayerConfig>) => {
    onUpdate({
      layers: model.layers.map(l => l.id === layerId ? { ...l, ...updates } : l)
    });
  };

  const getDefaultLayerConfig = (type: LayerConfig['type']): Record<string, any> => {
    switch (type) {
      case 'dense':
        return { units: 64 };
      case 'conv2d':
        return { filters: 32, kernelSize: [3, 3], strides: [1, 1] };
      case 'lstm':
        return { units: 64, returnSequences: false };
      case 'attention':
        return { numHeads: 8, keyDim: 64 };
      case 'dropout':
        return { rate: 0.2 };
      case 'batch_norm':
        return { axis: -1, momentum: 0.99 };
      default:
        return {};
    }
  };

  const layerTypes = [
    { type: 'dense', name: 'Dense', icon: Layers },
    { type: 'conv2d', name: 'Conv2D', icon: Cpu },
    { type: 'lstm', name: 'LSTM', icon: Activity },
    { type: 'attention', name: 'Attention', icon: Target },
    { type: 'dropout', name: 'Dropout', icon: Minus },
    { type: 'batch_norm', name: 'Batch Norm', icon: BarChart3 }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Model Architecture: {model.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded">
            {model.type.toUpperCase()}
          </span>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded">
            {model.layers.length} layers
          </span>
        </div>
      </div>

      {/* Model Configuration */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Optimizer</label>
          <select
            value={model.optimizer}
            onChange={(e) => onUpdate({ optimizer: e.target.value as any })}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="adam">Adam</option>
            <option value="sgd">SGD</option>
            <option value="rmsprop">RMSprop</option>
            <option value="adamw">AdamW</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Loss Function</label>
          <input
            type="text"
            value={model.lossFunction}
            onChange={(e) => onUpdate({ lossFunction: e.target.value })}
            className="w-full p-2 border rounded text-sm"
            placeholder="mse, categorical_crossentropy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Metrics</label>
          <input
            type="text"
            value={model.metrics.join(', ')}
            onChange={(e) => onUpdate({ metrics: e.target.value.split(',').map(m => m.trim()) })}
            className="w-full p-2 border rounded text-sm"
            placeholder="accuracy, mae, mse"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Learning Rate</label>
          <input
            type="number"
            value={model.hyperparameters.learningRate || 0.001}
            onChange={(e) => onUpdate({
              hyperparameters: { ...model.hyperparameters, learningRate: parseFloat(e.target.value) }
            })}
            className="w-full p-2 border rounded text-sm"
            step="0.0001"
            min="0.0001"
            max="1"
          />
        </div>
      </div>

      {/* Layer Builder */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold">Network Layers</h4>
          <div className="flex gap-2">
            {layerTypes.map(layerType => (
              <button
                key={layerType.type}
                onClick={() => addLayer(layerType.type as LayerConfig['type'])}
                className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <layerType.icon className="h-3 w-3" />
                {layerType.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 min-h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
          {model.layers.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No layers added yet. Click on a layer type above to add your first layer.</p>
            </div>
          ) : (
            model.layers.map((layer, index) => (
              <div
                key={layer.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                  selectedLayer === layer.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
                onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                    {index + 1}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium capitalize">{layer.type}</span>
                </div>

                <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                  {layer.type === 'dense' && `Units: ${layer.config.units}`}
                  {layer.type === 'conv2d' && `Filters: ${layer.config.filters}, Kernel: ${layer.config.kernelSize.join('x')}`}
                  {layer.type === 'lstm' && `Units: ${layer.config.units}`}
                  {layer.type === 'dropout' && `Rate: ${layer.config.rate}`}
                  {layer.type === 'attention' && `Heads: ${layer.config.numHeads}`}
                  {layer.type === 'batch_norm' && `Momentum: ${layer.config.momentum}`}
                  {layer.activation && ` → ${layer.activation}`}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={layer.trainable}
                      onChange={(e) => updateLayer(layer.id, { trainable: e.target.checked })}
                      className="mr-1"
                    />
                    Trainable
                  </label>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Layer Configuration Panel */}
      {selectedLayer && (
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-3">Layer Configuration</h4>
          {(() => {
            const layer = model.layers.find(l => l.id === selectedLayer);
            if (!layer) return null;

            return (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {layer.type === 'dense' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Units</label>
                      <input
                        type="number"
                        value={layer.config.units}
                        onChange={(e) => updateLayer(layer.id, {
                          config: { ...layer.config, units: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border rounded text-sm"
                        min="1"
                        max="10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Activation</label>
                      <select
                        value={layer.activation || 'relu'}
                        onChange={(e) => updateLayer(layer.id, { activation: e.target.value })}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="relu">ReLU</option>
                        <option value="sigmoid">Sigmoid</option>
                        <option value="tanh">Tanh</option>
                        <option value="linear">Linear</option>
                      </select>
                    </div>
                  </>
                )}

                {layer.type === 'dropout' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Dropout Rate</label>
                    <input
                      type="number"
                      value={layer.config.rate}
                      onChange={(e) => updateLayer(layer.id, {
                        config: { ...layer.config, rate: parseFloat(e.target.value) }
                      })}
                      className="w-full p-2 border rounded text-sm"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                )}

                {layer.type === 'batch_norm' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Axis</label>
                      <input
                        type="number"
                        value={layer.config.axis}
                        onChange={(e) => updateLayer(layer.id, {
                          config: { ...layer.config, axis: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Momentum</label>
                      <input
                        type="number"
                        value={layer.config.momentum}
                        onChange={(e) => updateLayer(layer.id, {
                          config: { ...layer.config, momentum: parseFloat(e.target.value) }
                        })}
                        className="w-full p-2 border rounded text-sm"
                        min="0"
                        max="1"
                        step="0.01"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

// Training Configuration Component
const TrainingConfigTuner: React.FC<{
  config: TrainingConfig;
  onUpdate: (updates: Partial<TrainingConfig>) => void;
}> = ({ config, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-green-600" />
        Training Configuration
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Epochs</label>
          <input
            type="number"
            value={config.epochs}
            onChange={(e) => onUpdate({ epochs: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
            min="1"
            max="1000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Batch Size</label>
          <input
            type="number"
            value={config.batchSize}
            onChange={(e) => onUpdate({ batchSize: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
            min="1"
            max="1024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Learning Rate</label>
          <input
            type="number"
            value={config.learningRate}
            onChange={(e) => onUpdate({ learningRate: parseFloat(e.target.value) })}
            className="w-full p-2 border rounded"
            step="0.0001"
            min="0.0001"
            max="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Decay</label>
          <input
            type="number"
            value={config.decay}
            onChange={(e) => onUpdate({ decay: parseFloat(e.target.value) })}
            className="w-full p-2 border rounded"
            step="0.000001"
            min="0"
            max="0.1"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.earlyStopping.enabled}
              onChange={(e) => onUpdate({
                earlyStopping: { ...config.earlyStopping, enabled: e.target.checked }
              })}
              className="mr-2"
            />
            <span className="text-sm font-medium">Early Stopping</span>
          </label>
        </div>

        {config.earlyStopping.enabled && (
          <div className="grid grid-cols-2 gap-4 ml-6">
            <div>
              <label className="block text-sm font-medium mb-1">Patience</label>
              <input
                type="number"
                value={config.earlyStopping.patience}
                onChange={(e) => onUpdate({
                  earlyStopping: { ...config.earlyStopping, patience: parseInt(e.target.value) }
                })}
                className="w-full p-2 border rounded"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Min Delta</label>
              <input
                type="number"
                value={config.earlyStopping.minDelta}
                onChange={(e) => onUpdate({
                  earlyStopping: { ...config.earlyStopping, minDelta: parseFloat(e.target.value) }
                })}
                className="w-full p-2 border rounded"
                step="0.0001"
                min="0"
                max="1"
              />
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-3">Training Callbacks</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.callbacks.modelCheckpoint}
                onChange={(e) => onUpdate({
                  callbacks: { ...config.callbacks, modelCheckpoint: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">Model Checkpoint (save best weights)</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.callbacks.tensorBoard}
                onChange={(e) => onUpdate({
                  callbacks: { ...config.callbacks, tensorBoard: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">TensorBoard Logging</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.callbacks.lrScheduler}
                onChange={(e) => onUpdate({
                  callbacks: { ...config.callbacks, lrScheduler: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm">Learning Rate Scheduler</span>
            </label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-md font-semibold mb-3">Distributed Training</h4>
          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.distributed.enabled}
                onChange={(e) => onUpdate({
                  distributed: { ...config.distributed, enabled: e.target.checked }
                })}
                className="mr-2"
              />
              <span className="text-sm font-medium">Enable Distributed Training</span>
            </label>
          </div>

          {config.distributed.enabled && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="block text-sm font-medium mb-1">Workers</label>
                <input
                  type="number"
                  value={config.distributed.workers}
                  onChange={(e) => onUpdate({
                    distributed: { ...config.distributed, workers: parseInt(e.target.value) }
                  })}
                  className="w-full p-2 border rounded"
                  min="1"
                  max="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Strategy</label>
                <select
                  value={config.distributed.strategy}
                  onChange={(e) => onUpdate({
                    distributed: { ...config.distributed, strategy: e.target.value }
                  })}
                  className="w-full p-2 border rounded"
                >
                  <option value="mirrored">Mirrored Strategy</option>
                  <option value="multi_worker">Multi Worker</option>
                  <option value="parameter_server">Parameter Server</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Neural Network Dashboard
export const EnhancedNeuralNetworkDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'architecture' | 'training' | 'monitoring'>('datasets');
  const [datasets, setDatasets] = useState<DatasetConfig[]>([
    {
      id: 'seo-dataset',
      name: 'SEO Training Dataset',
      description: 'Comprehensive SEO metrics and ranking data',
      type: 'supervised',
      size: 50000,
      features: ['title_length', 'description_length', 'keyword_density', 'backlinks', 'domain_authority'],
      labels: ['seo_score', 'click_through_rate'],
      quality: 0.85,
      preprocessing: {
        normalization: true,
        standardization: false,
        encoding: 'one-hot',
        outlierRemoval: true,
        featureSelection: true
      },
      validation: {
        trainSplit: 70,
        valSplit: 15,
        testSplit: 15,
        crossValidation: true,
        folds: 5
      },
      augmentation: {
        enabled: false,
        techniques: [],
        intensity: 0.5
      }
    }
  ]);

  const [models, setModels] = useState<ModelArchitecture[]>([
    {
      id: 'seo-predictor',
      name: 'SEO Score Predictor',
      type: 'mlp',
      layers: [
        {
          id: 'input-layer',
          type: 'dense',
          config: { units: 128 },
          activation: 'relu',
          trainable: true
        },
        {
          id: 'hidden-layer-1',
          type: 'dense',
          config: { units: 64 },
          activation: 'relu',
          trainable: true
        },
        {
          id: 'dropout-layer',
          type: 'dropout',
          config: { rate: 0.2 },
          trainable: false
        },
        {
          id: 'output-layer',
          type: 'dense',
          config: { units: 1 },
          activation: 'linear',
          trainable: true
        }
      ],
      optimizer: 'adam',
      lossFunction: 'mse',
      metrics: ['mae', 'mse'],
      hyperparameters: {
        learningRate: 0.001,
        batchSize: 32,
        epochs: 100
      }
    }
  ]);

  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    decay: 0.0001,
    momentum: 0.9,
    earlyStopping: {
      enabled: true,
      patience: 10,
      minDelta: 0.001
    },
    callbacks: {
      modelCheckpoint: true,
      tensorBoard: true,
      lrScheduler: false
    },
    distributed: {
      enabled: false,
      workers: 2,
      strategy: 'mirrored'
    }
  });

  const [selectedDataset, setSelectedDataset] = useState<DatasetConfig | null>(datasets[0]);
  const [selectedModel, setSelectedModel] = useState<ModelArchitecture | null>(models[0]);

  const tabs = [
    { id: 'datasets', name: 'Dataset Tuning', icon: Database },
    { id: 'architecture', name: 'Model Architecture', icon: Brain },
    { id: 'training', name: 'Training Config', icon: Settings },
    { id: 'monitoring', name: 'Live Monitoring', icon: Activity }
  ];

  const updateDataset = (datasetId: string, updates: Partial<DatasetConfig>) => {
    setDatasets(prev => prev.map(d =>
      d.id === datasetId ? { ...d, ...updates } : d
    ));
    if (selectedDataset?.id === datasetId) {
      setSelectedDataset(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const updateModel = (modelId: string, updates: Partial<ModelArchitecture>) => {
    setModels(prev => prev.map(m =>
      m.id === modelId ? { ...m, ...updates } : m
    ));
    if (selectedModel?.id === modelId) {
      setSelectedModel(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Enhanced Neural Network Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Advanced fine-tuning tools for datasets, architectures, and training configurations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">
              {datasets.length} Datasets
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border">
            <Brain className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">
              {models.length} Models
            </span>
          </div>

          <Button className="bg-purple-600 hover:bg-purple-700">
            <Play className="h-4 w-4 mr-2" />
            Start Training
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'datasets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dataset Selection</h3>
              <select
                value={selectedDataset?.id || ''}
                onChange={(e) => {
                  const dataset = datasets.find(d => d.id === e.target.value);
                  setSelectedDataset(dataset || null);
                }}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select Dataset</option>
                {datasets.map(dataset => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.name} ({dataset.size.toLocaleString()} samples)
                  </option>
                ))}
              </select>
            </div>

            {selectedDataset && (
              <DatasetFineTuner
                dataset={selectedDataset}
                onUpdate={(updates) => updateDataset(selectedDataset.id, updates)}
              />
            )}
          </div>
        )}

        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Model Architecture Builder</h3>
              <select
                value={selectedModel?.id || ''}
                onChange={(e) => {
                  const model = models.find(m => m.id === e.target.value);
                  setSelectedModel(model || null);
                }}
                className="px-3 py-2 border rounded"
              >
                <option value="">Select Model</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.layers.length} layers)
                  </option>
                ))}
              </select>
            </div>

            {selectedModel && (
              <ModelArchitectureBuilder
                model={selectedModel}
                onUpdate={(updates) => updateModel(selectedModel.id, updates)}
              />
            )}
          </div>
        )}

        {activeTab === 'training' && (
          <TrainingConfigTuner
            config={trainingConfig}
            onUpdate={setTrainingConfig}
          />
        )}

        {activeTab === 'monitoring' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-green-600" />
              Live Training Monitoring
            </h3>

            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Training session not active. Configure your dataset, model, and training parameters, then start training.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the enhanced dashboard
export { DatasetFineTuner, ModelArchitectureBuilder, TrainingConfigTuner, EnhancedNeuralNetworkDashboard };
