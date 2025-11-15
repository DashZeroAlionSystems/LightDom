/**
 * FeedbackCard Component
 * 
 * Collapsible card for displaying step-by-step feedback from DeepSeek
 * Fast to collapse/expand with clean design
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeedbackStatus = 'pending' | 'processing' | 'success' | 'error' | 'warning';

export interface FeedbackCardProps {
  id: string;
  step: number;
  title: string;
  content: string;
  status: FeedbackStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
  schema?: any;
  defaultExpanded?: boolean;
  onReview?: (id: string, approved: boolean) => void;
}

const statusConfig: Record<FeedbackStatus, { icon: React.ComponentType<any>; color: string; bg: string; border: string }> = {
  pending: {
    icon: Clock,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  },
  processing: {
    icon: Loader,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  }
};

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  id,
  step,
  title,
  content,
  status,
  timestamp,
  metadata,
  schema,
  defaultExpanded = false,
  onReview
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'rounded-lg border-2 transition-all duration-200',
        config.border,
        config.bg,
        'hover:shadow-md'
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className={cn('flex items-center justify-center w-8 h-8 rounded-full', config.bg)}>
            <span className="text-sm font-semibold">{step}</span>
          </div>
          
          <Icon className={cn('h-5 w-5', config.color, status === 'processing' && 'animate-spin')} />
          
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500">{timestamp.toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metadata?.duration && (
            <span className="text-xs text-gray-500">{metadata.duration}ms</span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
          {/* Main Content */}
          <div className="mt-3">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{content}</div>
            </div>
          </div>

          {/* Schema Display */}
          {schema && (
            <div className="bg-white rounded p-3 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Generated Schema</h4>
              <pre className="text-xs overflow-x-auto bg-gray-50 p-2 rounded">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
          )}

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <div className="bg-white rounded p-3 border border-gray-200">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Metadata</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metadata).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="font-medium text-gray-600">{key}:</span>{' '}
                    <span className="text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Actions */}
          {onReview && status === 'success' && (
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onReview(id, true)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => onReview(id, false)}
                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackCard;
