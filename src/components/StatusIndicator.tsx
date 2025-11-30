/**
 * StatusIndicator - Animated status indicator component
 * 
 * Features:
 * - Animated status icons using anime.js
 * - Multiple status states (success, loading, error, warning, idle)
 * - Style guide driven styling
 * - Service status monitoring
 * 
 * @module components/StatusIndicator
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { 
  CheckCircleOutlined, 
  LoadingOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined, 
  MinusCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Tooltip, Badge } from 'antd';
import anime from 'animejs';
import './StatusIndicator.css';

/**
 * Status configuration with icons, colors, and animations
 */
const STATUS_CONFIG = {
  success: {
    icon: CheckCircleOutlined,
    color: '#52c41a',
    backgroundColor: 'rgba(82, 196, 26, 0.1)',
    animation: {
      scale: [0.8, 1.1, 1],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutElastic(1, .5)',
    },
    message: 'Operation completed successfully',
    badgeStatus: 'success',
  },
  loading: {
    icon: LoadingOutlined,
    color: '#1890ff',
    backgroundColor: 'rgba(24, 144, 255, 0.1)',
    animation: {
      rotate: 360,
      duration: 1000,
      loop: true,
      easing: 'linear',
    },
    message: 'Processing...',
    badgeStatus: 'processing',
  },
  error: {
    icon: CloseCircleOutlined,
    color: '#ff4d4f',
    backgroundColor: 'rgba(255, 77, 79, 0.1)',
    animation: {
      translateX: [-5, 5, -5, 5, 0],
      duration: 400,
      easing: 'easeInOutQuad',
    },
    message: 'Operation failed',
    badgeStatus: 'error',
  },
  warning: {
    icon: ExclamationCircleOutlined,
    color: '#faad14',
    backgroundColor: 'rgba(250, 173, 20, 0.1)',
    animation: {
      scale: [1, 1.1, 1],
      duration: 600,
      loop: 3,
      easing: 'easeInOutQuad',
    },
    message: 'Warning: Action may be required',
    badgeStatus: 'warning',
  },
  idle: {
    icon: MinusCircleOutlined,
    color: '#8c8c8c',
    backgroundColor: 'rgba(140, 140, 140, 0.1)',
    animation: null,
    message: 'Idle',
    badgeStatus: 'default',
  },
  syncing: {
    icon: SyncOutlined,
    color: '#722ed1',
    backgroundColor: 'rgba(114, 46, 209, 0.1)',
    animation: {
      rotate: 360,
      duration: 1500,
      loop: true,
      easing: 'linear',
    },
    message: 'Syncing...',
    badgeStatus: 'processing',
  },
};

/**
 * Status type
 */
export type StatusType = 'success' | 'loading' | 'error' | 'warning' | 'idle' | 'syncing';

/**
 * StatusIndicator Props
 */
export interface StatusIndicatorProps {
  /** Current status */
  status: StatusType;
  /** Service name */
  serviceName?: string;
  /** Custom message */
  message?: string;
  /** Show badge dot */
  showBadge?: boolean;
  /** Size of the indicator */
  size?: 'small' | 'default' | 'large';
  /** Show tooltip */
  showTooltip?: boolean;
  /** Custom icon */
  customIcon?: React.ReactNode;
  /** On click handler */
  onClick?: () => void;
  /** Additional className */
  className?: string;
  /** Inline style */
  style?: React.CSSProperties;
}

/**
 * StatusIndicator Component
 * 
 * Animated status indicator with anime.js animations
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'idle',
  serviceName,
  message,
  showBadge = false,
  size = 'default',
  showTooltip = true,
  customIcon,
  onClick,
  className = '',
  style = {},
}) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const IconComponent = config.icon;
  const displayMessage = message || config.message;
  
  // Size configurations
  const sizeConfig = {
    small: { fontSize: 14, padding: '4px 8px' },
    default: { fontSize: 18, padding: '8px 12px' },
    large: { fontSize: 24, padding: '12px 16px' },
  };
  
  /**
   * Run animation
   */
  const runAnimation = useCallback(() => {
    if (!iconRef.current || !config.animation) return;
    
    // Stop previous animation
    if (animationRef.current) {
      animationRef.current.pause();
      anime.remove(iconRef.current);
    }
    
    setIsAnimating(true);
    
    animationRef.current = anime({
      targets: iconRef.current,
      ...config.animation,
      complete: () => {
        if (!config.animation?.loop) {
          setIsAnimating(false);
        }
      },
    });
  }, [config.animation]);
  
  /**
   * Effect to handle animation on status change
   */
  useEffect(() => {
    runAnimation();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [status, runAnimation]);
  
  /**
   * Render icon
   */
  const renderIcon = () => {
    if (customIcon) {
      return (
        <span 
          ref={iconRef}
          className="status-icon-wrapper"
          style={{ color: config.color }}
        >
          {customIcon}
        </span>
      );
    }
    
    return (
      <span 
        ref={iconRef}
        className="status-icon-wrapper"
        style={{ 
          color: config.color,
          fontSize: sizeConfig[size].fontSize,
        }}
      >
        <IconComponent />
      </span>
    );
  };
  
  /**
   * Render content
   */
  const renderContent = () => (
    <div 
      className={`status-indicator status-${status} ${className}`}
      style={{
        backgroundColor: config.backgroundColor,
        padding: sizeConfig[size].padding,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {showBadge ? (
        <Badge status={config.badgeStatus as any} dot>
          {renderIcon()}
        </Badge>
      ) : (
        renderIcon()
      )}
      
      {serviceName && (
        <span className="status-service-name">{serviceName}</span>
      )}
      
      {displayMessage && size !== 'small' && (
        <span className="status-message">{displayMessage}</span>
      )}
    </div>
  );
  
  if (showTooltip) {
    return (
      <Tooltip 
        title={`${serviceName ? `${serviceName}: ` : ''}${displayMessage}`}
        placement="top"
      >
        {renderContent()}
      </Tooltip>
    );
  }
  
  return renderContent();
};

/**
 * ServiceStatusGrid - Display multiple service statuses
 */
export interface ServiceStatus {
  id: string;
  name: string;
  status: StatusType;
  message?: string;
  lastUpdated?: Date;
}

export interface ServiceStatusGridProps {
  services: ServiceStatus[];
  onServiceClick?: (service: ServiceStatus) => void;
  columns?: number;
}

export const ServiceStatusGrid: React.FC<ServiceStatusGridProps> = ({
  services,
  onServiceClick,
  columns = 3,
}) => {
  return (
    <div 
      className="service-status-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '12px',
      }}
    >
      {services.map(service => (
        <StatusIndicator
          key={service.id}
          status={service.status}
          serviceName={service.name}
          message={service.message}
          showBadge
          onClick={onServiceClick ? () => onServiceClick(service) : undefined}
        />
      ))}
    </div>
  );
};

/**
 * StatusIndicatorWithWorkflow - Status indicator connected to n8n workflow
 */
export interface StatusIndicatorWithWorkflowProps extends StatusIndicatorProps {
  workflowId?: string;
  onStatusChange?: (newStatus: StatusType, details?: any) => void;
  pollingInterval?: number;
  apiEndpoint?: string;
}

export const StatusIndicatorWithWorkflow: React.FC<StatusIndicatorWithWorkflowProps> = ({
  workflowId,
  onStatusChange,
  pollingInterval = 5000,
  apiEndpoint = '/api/linked-schema/status-indicator',
  status: initialStatus = 'idle',
  ...props
}) => {
  const [status, setStatus] = useState<StatusType>(initialStatus);
  const [details, setDetails] = useState<any>(null);
  
  useEffect(() => {
    if (!workflowId) return;
    
    const checkStatus = async () => {
      try {
        const response = await fetch(`${apiEndpoint}?workflowId=${workflowId}`);
        const data = await response.json();
        
        if (data.status !== status) {
          setStatus(data.status);
          setDetails(data.details);
          onStatusChange?.(data.status, data.details);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setStatus('error');
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, pollingInterval);
    
    return () => clearInterval(interval);
  }, [workflowId, pollingInterval, apiEndpoint, status, onStatusChange]);
  
  return (
    <StatusIndicator
      {...props}
      status={status}
      message={details?.message || props.message}
    />
  );
};

export default StatusIndicator;
