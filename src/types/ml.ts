/**
 * TypeScript types for LightDom ML/AI features
 */

export interface DOMAnalysisResult {
  optimizationScores: { [key: string]: number };
  confidence: number;
  recommendedOptimizations: OptimizationSuggestion[];
  timestamp: number;
}

export interface OptimizationSuggestion {
  type: 'css' | 'javascript' | 'dom' | 'performance' | 'accessibility' | 'seo';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialSavings: string;
  implementation?: string;
}

export interface PerformancePrediction {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
  confidence: number;
}

export interface AnomalyDetectionResult {
  isAnomaly: boolean;
  anomalyScore: number;
  anomalyType: 'normal' | 'warning' | 'critical';
  description?: string;
  recommendations?: string[];
}

export interface PatternRecognitionResult {
  patternType: string;
  confidence: number;
  suggestions: string[];
  relatedOptimizations?: OptimizationSuggestion[];
}

export interface MLModelMetadata {
  name: string;
  version: string;
  lastTrained: number;
  accuracy: number;
  trainingSize: number;
  modelType: 'cnn' | 'lstm' | 'autoencoder' | 'dense';
}

export interface TrainingDataPoint {
  type: 'dom_analysis' | 'performance' | 'anomaly' | 'pattern';
  features: number[];
  labels?: number[];
  sequence?: number[][];
  metrics?: number[];
  patternLabels?: number[];
  timestamp: number;
  source: string;
}

export interface ReinforcementLearningState {
  domDepth: number;
  elementCount: number;
  cssRules: number;
  jsSize: number;
  currentOptimizations: string[];
  performanceMetrics: PerformancePrediction;
}

export interface ReinforcementLearningAction {
  name: string;
  type: 'css' | 'js' | 'dom' | 'performance';
  description: string;
  expectedReward: number;
}

export interface MLConfiguration {
  enableRealTimeProcessing: boolean;
  modelUpdateInterval: number;
  trainingBatchSize: number;
  anomalyThreshold: number;
  cacheEnabled: boolean;
  cacheSize: number;
}

export interface ComputerVisionAnalysis {
  layoutQuality: number;
  visualComplexity: number;
  accessibilityScore: number;
  responsiveDesignScore: number;
  detectedIssues: string[];
  suggestions: string[];
}

export interface RealTimeMLProcessing {
  isEnabled: boolean;
  processingInterval: number;
  batchSize: number;
  models: {
    domAnalysis: boolean;
    performancePrediction: boolean;
    anomalyDetection: boolean;
    patternRecognition: boolean;
  };
  caching: {
    enabled: boolean;
    maxCacheSize: number;
    cacheExpiration: number;
  };
}

export interface TrainingPipelineConfig {
  dataCollection: {
    enabled: boolean;
    sources: string[];
    samplingRate: number;
  };
  preprocessing: {
    normalization: boolean;
    featureSelection: boolean;
    outlierRemoval: boolean;
  };
  training: {
    epochs: number;
    batchSize: number;
    validationSplit: number;
    earlyStopping: boolean;
  };
  continuousLearning: {
    enabled: boolean;
    updateInterval: number;
    minDataPoints: number;
  };
}

export interface MLServiceStatus {
  modelsLoaded: boolean;
  trainingInProgress: boolean;
  lastTrainingTime: number;
  activePredictions: number;
  cacheHitRate: number;
  memoryUsage: number;
  errorRate: number;
}