/**
 * RAG Connection Status Indicator Component
 *
 * Displays real-time connection status and health of the RAG service
 */

import { AlertCircle, CheckCircle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import React from 'react';
import { useRagConnectionStatus } from '../hooks/useRagChat';

interface RagConnectionStatusProps {
  className?: string;
  showDetails?: boolean;
  onReconnect?: () => void;
}

const RagConnectionStatus: React.FC<RagConnectionStatusProps> = ({
  className = '',
  showDetails = false,
  onReconnect,
}) => {
  const { statusMessage, statusColor, isAvailable, healthStatus, reconnect, isReconnecting } =
    useRagConnectionStatus();

  const handleReconnect = async () => {
    if (onReconnect) {
      onReconnect();
    }
    await reconnect();
  };

  const getComponentTint = (status?: string | null) => {
    if (!status) {
      return 'text-gray-500';
    }
    const normalized = status.toLowerCase();
    if (['healthy', 'ok', 'available'].includes(normalized)) {
      return 'text-green-600';
    }
    if (['disabled', 'not_configured'].includes(normalized)) {
      return 'text-gray-500';
    }
    if (['degraded', 'unknown'].includes(normalized)) {
      return 'text-yellow-600';
    }
    return 'text-red-600';
  };

  const componentSummaries = healthStatus
    ? [
        {
          name: 'LLM',
          status: healthStatus.llm?.status,
          detail:
            healthStatus.llm?.provider && healthStatus.llm?.model
              ? `${healthStatus.llm.provider} · ${healthStatus.llm.model}`
              : healthStatus.llm?.provider || healthStatus.llm?.model,
          error: healthStatus.llm?.error ?? undefined,
        },
        {
          name: 'Vector store',
          status: healthStatus.vectorStore?.status,
          error: healthStatus.vectorStore?.error ?? undefined,
        },
        {
          name: 'Docling',
          status: healthStatus.docling?.status,
          detail: healthStatus.docling?.endpoint,
          error: healthStatus.docling?.error ?? undefined,
        },
        {
          name: 'OCR',
          status: healthStatus.ocr?.status,
          detail: healthStatus.ocr?.endpoint,
          error: healthStatus.ocr?.error ?? undefined,
        },
        {
          name: 'Agent',
          status: healthStatus.agent?.status,
          detail: healthStatus.agent?.planningEnabled ? 'Planning enabled' : undefined,
        },
      ].filter(entry => entry.status)
    : [];

  const featureSummary = (() => {
    if (!healthStatus?.features) {
      return null;
    }

    const featureLabels: string[] = [];
    if (healthStatus.features.hybridSearch) featureLabels.push('Hybrid search');
    if (healthStatus.features.multimodal) featureLabels.push('Multimodal');
    if (healthStatus.features.versioning) featureLabels.push('Versioning');
    if (healthStatus.features.agentMode) featureLabels.push('Agent');
    if (healthStatus.features.docling) featureLabels.push('Docling');

    if (featureLabels.length === 0) {
      return null;
    }

    return `Features: ${featureLabels.join(' · ')}`;
  })();

  const getIcon = () => {
    if (isReconnecting) {
      return <Loader2 className='w-4 h-4 animate-spin' />;
    }

    switch (statusColor) {
      case 'green':
        return <CheckCircle className='w-4 h-4' />;
      case 'yellow':
        return <AlertCircle className='w-4 h-4' />;
      case 'red':
        return <WifiOff className='w-4 h-4' />;
      default:
        return <Loader2 className='w-4 h-4 animate-spin' />;
    }
  };

  const getColorClasses = () => {
    switch (statusColor) {
      case 'green':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'red':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${getColorClasses()} ${className}`}
    >
      <div className='flex items-center gap-2'>
        {getIcon()}
        <span className='text-sm font-medium'>{statusMessage}</span>
      </div>

      {!isAvailable && (
        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className='ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-white hover:bg-gray-50 border border-current transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          title='Retry connection'
        >
          <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
          Retry
        </button>
      )}

      {showDetails && healthStatus && (
        <div className='ml-4 text-xs opacity-75 space-y-1'>
          {componentSummaries.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {componentSummaries.map(summary => (
                <span
                  key={summary.name}
                  className={`inline-flex items-center gap-1 ${getComponentTint(summary.status)}`}
                  title={summary.error || undefined}
                >
                  {summary.name}: {summary.status}
                  {summary.detail && <span className='opacity-70'>({summary.detail})</span>}
                </span>
              ))}
            </div>
          )}
          {featureSummary && <div className='text-gray-600'>{featureSummary}</div>}
          {healthStatus.circuitBreaker && healthStatus.circuitBreaker.state !== 'closed' && (
            <div className='mt-1 text-red-600'>
              Circuit breaker: {healthStatus.circuitBreaker.state}
              {healthStatus.circuitBreaker.failures > 0 &&
                ` (${healthStatus.circuitBreaker.failures} failures)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RagConnectionStatus;
