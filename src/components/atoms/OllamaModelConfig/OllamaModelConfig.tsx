import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { useState, useCallback } from 'react';
import type { OllamaModelConfigProps, OllamaModelSettings } from './OllamaModelConfig.types';

/**
 * Style variants for the OllamaModelConfig component
 */
const configVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-surface border-outline p-4',
        compact: 'bg-surface-container border-outline/50 p-3',
        detailed: 'bg-surface-variant border-outline p-6',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const labelVariants = cva(
  'block font-medium mb-1',
  {
    variants: {
      size: {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const inputVariants = cva(
  'w-full rounded-md border border-outline/50 bg-surface-container px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors',
  {
    variants: {
      size: {
        sm: 'text-xs py-1.5',
        md: 'text-sm py-2',
        lg: 'text-base py-2.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

/**
 * Default configuration values
 */
const defaultConfig: OllamaModelSettings = {
  model: 'lightdom-deepseek',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  numCtx: 16384,
  numPredict: -1,
  repeatPenalty: 1.1,
  stop: ['<|im_end|>', '</s>'],
  systemPrompt: 'You are LightDom AI, an expert assistant for the LightDom platform.',
};

/**
 * OllamaModelConfig Component
 * 
 * A component for configuring Ollama model settings based on Modelfile parameters.
 * Provides UI controls for temperature, context size, and other model parameters.
 */
export const OllamaModelConfig: React.FC<OllamaModelConfigProps> = ({
  model = defaultConfig.model,
  temperature = defaultConfig.temperature,
  topP = defaultConfig.topP,
  topK = defaultConfig.topK,
  numCtx = defaultConfig.numCtx,
  numPredict = defaultConfig.numPredict,
  repeatPenalty = defaultConfig.repeatPenalty,
  stop = defaultConfig.stop,
  systemPrompt = defaultConfig.systemPrompt,
  loading = false,
  disabled = false,
  showAdvanced = false,
  size = 'md',
  variant = 'default',
  onChange,
  onCreate,
  className,
}) => {
  const [config, setConfig] = useState<OllamaModelSettings>({
    model,
    temperature,
    topP,
    topK,
    numCtx,
    numPredict,
    repeatPenalty,
    stop,
    systemPrompt,
  });
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);

  const handleChange = useCallback((field: keyof OllamaModelSettings, value: any) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onChange?.(newConfig);
  }, [config, onChange]);

  const handleCreateModel = useCallback(() => {
    const modelfile = generateModelfile(config);
    onCreate?.(config.model, modelfile);
  }, [config, onCreate]);

  return (
    <div className={cn(configVariants({ variant, size }), className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-on-surface">Ollama Model Configuration</h3>
            <p className="text-xs text-on-surface-variant">Configure Modelfile parameters</p>
          </div>
        </div>
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        )}
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className={cn(labelVariants({ size }), 'text-on-surface')}>
          Model Name
        </label>
        <input
          type="text"
          value={config.model}
          onChange={(e) => handleChange('model', e.target.value)}
          disabled={disabled}
          className={cn(inputVariants({ size }), disabled && 'opacity-50 cursor-not-allowed')}
          placeholder="lightdom-deepseek"
        />
        <p className="text-xs text-on-surface-variant mt-1">
          Custom model name for your Modelfile configuration
        </p>
      </div>

      {/* Basic Parameters */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Temperature */}
        <div>
          <label className={cn(labelVariants({ size }), 'text-on-surface')}>
            Temperature
            <span className="ml-2 text-xs text-on-surface-variant font-normal">
              ({config.temperature.toFixed(1)})
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>Precise</span>
            <span>Creative</span>
          </div>
        </div>

        {/* Context Size */}
        <div>
          <label className={cn(labelVariants({ size }), 'text-on-surface')}>
            Context Size
          </label>
          <select
            value={config.numCtx}
            onChange={(e) => handleChange('numCtx', parseInt(e.target.value))}
            disabled={disabled}
            className={cn(inputVariants({ size }), disabled && 'opacity-50 cursor-not-allowed')}
          >
            <option value={2048}>2K tokens</option>
            <option value={4096}>4K tokens</option>
            <option value={8192}>8K tokens</option>
            <option value={16384}>16K tokens</option>
            <option value={32768}>32K tokens</option>
          </select>
        </div>
      </div>

      {/* System Prompt */}
      <div className="mb-4">
        <label className={cn(labelVariants({ size }), 'text-on-surface')}>
          System Prompt
        </label>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => handleChange('systemPrompt', e.target.value)}
          disabled={disabled}
          rows={3}
          className={cn(
            inputVariants({ size }),
            'resize-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          placeholder="Define the AI's personality and capabilities..."
        />
      </div>

      {/* Advanced Toggle */}
      <button
        type="button"
        onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-4"
      >
        <svg
          className={cn(
            'w-4 h-4 transition-transform',
            isAdvancedOpen && 'rotate-90'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Parameters
      </button>

      {/* Advanced Parameters */}
      {isAdvancedOpen && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-surface-container rounded-lg">
          {/* Top-P */}
          <div>
            <label className={cn(labelVariants({ size }), 'text-on-surface')}>
              Top-P (Nucleus Sampling)
              <span className="ml-2 text-xs text-on-surface-variant font-normal">
                ({config.topP.toFixed(2)})
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.topP}
              onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Top-K */}
          <div>
            <label className={cn(labelVariants({ size }), 'text-on-surface')}>
              Top-K
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.topK}
              onChange={(e) => handleChange('topK', parseInt(e.target.value))}
              disabled={disabled}
              className={cn(inputVariants({ size }), disabled && 'opacity-50 cursor-not-allowed')}
            />
          </div>

          {/* Repeat Penalty */}
          <div>
            <label className={cn(labelVariants({ size }), 'text-on-surface')}>
              Repeat Penalty
              <span className="ml-2 text-xs text-on-surface-variant font-normal">
                ({config.repeatPenalty.toFixed(1)})
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.repeatPenalty}
              onChange={(e) => handleChange('repeatPenalty', parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Max Tokens */}
          <div>
            <label className={cn(labelVariants({ size }), 'text-on-surface')}>
              Max Tokens
            </label>
            <input
              type="number"
              min="-1"
              max="128000"
              value={config.numPredict}
              onChange={(e) => handleChange('numPredict', parseInt(e.target.value))}
              disabled={disabled}
              className={cn(inputVariants({ size }), disabled && 'opacity-50 cursor-not-allowed')}
            />
            <p className="text-xs text-on-surface-variant mt-1">
              -1 for unlimited
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-outline/50">
        <button
          type="button"
          onClick={() => setConfig(defaultConfig)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleCreateModel}
          disabled={disabled || loading}
          className="px-4 py-2 text-sm font-medium text-on-primary bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-on-primary" />
              Creating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Model
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Generate Modelfile content from settings
 */
function generateModelfile(config: OllamaModelSettings): string {
  const lines: string[] = [
    '# LightDom Custom Modelfile',
    '# Generated from OllamaModelConfig component',
    '',
    'FROM deepseek-r1:14b',
    '',
    '# Generation Parameters',
    `PARAMETER temperature ${config.temperature}`,
    `PARAMETER top_p ${config.topP}`,
    `PARAMETER top_k ${config.topK}`,
    `PARAMETER repeat_penalty ${config.repeatPenalty}`,
    '',
    '# Context Parameters',
    `PARAMETER num_ctx ${config.numCtx}`,
    `PARAMETER num_predict ${config.numPredict}`,
    '',
    '# Stop Sequences',
    ...config.stop.map(s => `PARAMETER stop "${s}"`),
    '',
    '# System Prompt',
    `SYSTEM """${config.systemPrompt}"""`,
  ];

  return lines.join('\n');
}

OllamaModelConfig.displayName = 'OllamaModelConfig';
