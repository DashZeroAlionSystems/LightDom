/**
 * OllamaModelConfig Component Types
 * 
 * Types for configuring and displaying Ollama model settings
 * based on Modelfile configuration options.
 */

export interface OllamaModelConfigProps {
  /** Current model name */
  model?: string;
  /** Temperature setting (0.0-2.0) */
  temperature?: number;
  /** Top-p sampling (0.0-1.0) */
  topP?: number;
  /** Top-k sampling (1-100) */
  topK?: number;
  /** Context window size */
  numCtx?: number;
  /** Maximum tokens to predict */
  numPredict?: number;
  /** Repeat penalty (0.0-2.0) */
  repeatPenalty?: number;
  /** Stop sequences */
  stop?: string[];
  /** System prompt */
  systemPrompt?: string;
  /** Whether the component is in loading state */
  loading?: boolean;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Whether to show advanced options */
  showAdvanced?: boolean;
  /** Component size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Component style variant */
  variant?: 'default' | 'compact' | 'detailed';
  /** Callback when settings change */
  onChange?: (config: OllamaModelSettings) => void;
  /** Callback when model is created */
  onCreate?: (modelName: string, modelfile: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export interface OllamaModelSettings {
  model: string;
  temperature: number;
  topP: number;
  topK: number;
  numCtx: number;
  numPredict: number;
  repeatPenalty: number;
  stop: string[];
  systemPrompt: string;
}

export interface ModelfileParameter {
  name: string;
  value: string | number | boolean;
  description: string;
  min?: number;
  max?: number;
  type: 'number' | 'string' | 'boolean' | 'array';
}

export interface OllamaModelStatus {
  connected: boolean;
  modelLoaded: boolean;
  modelName?: string;
  version?: string;
  lastError?: string;
}
