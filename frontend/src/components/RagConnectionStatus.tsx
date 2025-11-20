/**
 * RAG Connection Status Indicator Component
 * 
 * Displays real-time connection status and health of the RAG service
 */

import React from 'react';
import { AlertCircle, CheckCircle, RefreshCw, WifiOff, Loader2 } from 'lucide-react';
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
  const {
    statusMessage,
    statusColor,
    isAvailable,
    healthStatus,
    reconnect,
    isReconnecting,
  } = useRagConnectionStatus();

  const handleReconnect = async () => {
    if (onReconnect) {
      onReconnect();
    }
    await reconnect();
  };

  const getIcon = () => {
    if (isReconnecting) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    switch (statusColor) {
      case 'green':
        return <CheckCircle className="w-4 h-4" />;
      case 'yellow':
        return <AlertCircle className="w-4 h-4" />;
      case 'red':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin" />;
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
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${getColorClasses()} ${className}`}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="text-sm font-medium">{statusMessage}</span>
      </div>

      {!isAvailable && (
        <button
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="ml-2 inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-white hover:bg-gray-50 border border-current transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Retry connection"
        >
          <RefreshCw className={`w-3 h-3 ${isReconnecting ? 'animate-spin' : ''}`} />
          Retry
        </button>
      )}

      {showDetails && healthStatus && (
        <div className="ml-4 text-xs opacity-75">
          {healthStatus.components && (
            <div className="flex gap-2">
              {Object.entries(healthStatus.components).map(([name, component]) => (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 ${
                    component.status === 'healthy' ? 'text-green-600' :
                    component.status === 'degraded' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}
                  title={component.error || undefined}
                >
                  {name}: {component.status}
                </span>
              ))}
            </div>
          )}
          {healthStatus.circuitBreaker && healthStatus.circuitBreaker.state !== 'closed' && (
            <div className="mt-1 text-red-600">
              Circuit breaker: {healthStatus.circuitBreaker.state} 
              {healthStatus.circuitBreaker.failures > 0 && ` (${healthStatus.circuitBreaker.failures} failures)`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RagConnectionStatus;
