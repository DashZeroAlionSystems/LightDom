/**
 * Infographic Components
 * 
 * Reusable React components for creating beautiful, data-driven infographics
 * that protect proprietary information while displaying compelling results
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Circle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// Types and Interfaces
// =====================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  changeLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<any>;
  format?: 'number' | 'percentage' | 'currency' | 'custom';
  className?: string;
  showSparkline?: boolean;
  sparklineData?: number[];
}

interface InfographicHeaderProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  logo?: string;
  actions?: React.ReactNode;
  className?: string;
}

interface ProgressGaugeProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  showValue?: boolean;
  className?: string;
}

interface ComparisonCardProps {
  beforeLabel: string;
  beforeValue: string | number;
  afterLabel: string;
  afterValue: string | number;
  improvement?: number;
  metric?: string;
  className?: string;
}

interface TimelineStepProps {
  stepNumber: number;
  title: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  icon?: React.ComponentType<any>;
}

interface TrendChartProps {
  data: number[];
  labels?: string[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  showAxes?: boolean;
  animate?: boolean;
  className?: string;
}

// =====================================================
// Metric Card Component
// =====================================================

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  trend,
  icon: Icon,
  format = 'number',
  className,
  showSparkline = false,
  sparklineData = []
}) => {
  // Format value based on type
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'number':
        return val.toLocaleString();
      default:
        return String(val);
    }
  };

  // Determine trend icon and color
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return 'text-gray-400';
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-400';
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6",
      "border border-[#2E3349] hover:border-[#5865F2] transition-all duration-300",
      "hover:shadow-glow",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-[#B9BBBE]">{title}</h3>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="text-3xl font-bold text-white mb-1">
          {formatValue(value)}
        </div>
        
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm", getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change)}%</span>
            {changeLabel && <span className="text-gray-400">{changeLabel}</span>}
          </div>
        )}
      </div>

      {showSparkline && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <MiniSparkline data={sparklineData} color={trend === 'up' ? '#3BA55C' : '#ED4245'} />
        </div>
      )}
    </div>
  );
};

// =====================================================
// Infographic Header Component
// =====================================================

export const InfographicHeader: React.FC<InfographicHeaderProps> = ({
  title,
  subtitle,
  dateRange,
  logo,
  actions,
  className
}) => {
  return (
    <div className={cn(
      "bg-gradient-to-r from-[#0A0E27] via-[#151A31] to-[#1E2438] rounded-t-lg p-6",
      "border-b border-[#2E3349]",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {logo && (
            <img src={logo} alt="Logo" className="w-12 h-12 rounded-lg" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            {subtitle && (
              <p className="text-sm text-[#B9BBBE]">{subtitle}</p>
            )}
            {dateRange && (
              <p className="text-xs text-[#72767D] mt-1">{dateRange}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Progress Gauge Component
// =====================================================

export const ProgressGauge: React.FC<ProgressGaugeProps> = ({
  value,
  max = 100,
  label,
  size = 'md',
  color = 'blue',
  showValue = true,
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const colorClasses = {
    blue: 'from-[#5865F2] to-[#6C7BFF]',
    purple: 'from-[#7C5CFF] to-[#9D7CFF]',
    green: 'from-[#3BA55C] to-[#4BC46A]',
    orange: 'from-[#FAA61A] to-[#FFC700]',
    red: 'from-[#ED4245] to-[#FF6B6B]'
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Background circle */}
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="#2E3349"
          strokeWidth="8"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="url(#gauge-gradient)"
          strokeWidth="8"
          strokeDasharray={`${percentage * 2.83} 283`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn("stop-color", colorClasses[color])} />
            <stop offset="100%" className={cn("stop-color", colorClasses[color])} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center value */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(percentage)}%</span>
          {label && <span className="text-xs text-[#B9BBBE] mt-1">{label}</span>}
        </div>
      )}
    </div>
  );
};

// =====================================================
// Comparison Card Component
// =====================================================

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  beforeLabel,
  beforeValue,
  afterLabel,
  afterValue,
  improvement,
  metric,
  className
}) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-lg p-6 border border-[#2E3349]",
      className
    )}>
      <div className="grid grid-cols-2 gap-6">
        {/* Before */}
        <div className="text-center">
          <div className="text-xs text-[#72767D] uppercase mb-2">{beforeLabel}</div>
          <div className="text-2xl font-bold text-white mb-1">{beforeValue}</div>
          {metric && <div className="text-xs text-[#B9BBBE]">{metric}</div>}
        </div>

        {/* Divider with arrow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-full w-px bg-gradient-to-b from-[#5865F2] to-[#7C5CFF]" />
          <div className="absolute bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] rounded-full p-2">
            <ArrowUp className="w-4 h-4 text-white transform rotate-90" />
          </div>
        </div>

        {/* After */}
        <div className="text-center">
          <div className="text-xs text-[#72767D] uppercase mb-2">{afterLabel}</div>
          <div className="text-2xl font-bold text-white mb-1">{afterValue}</div>
          {metric && <div className="text-xs text-[#B9BBBE]">{metric}</div>}
        </div>
      </div>

      {/* Improvement indicator */}
      {improvement !== undefined && (
        <div className="mt-4 pt-4 border-t border-[#2E3349] text-center">
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full",
            improvement > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          )}>
            {improvement > 0 ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span className="font-semibold">{Math.abs(improvement)}% Improvement</span>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// Timeline Step Component
// =====================================================

export const TimelineStep: React.FC<TimelineStepProps> = ({
  stepNumber,
  title,
  description,
  completed = false,
  active = false,
  icon: Icon
}) => {
  return (
    <div className={cn(
      "flex items-start gap-4 relative",
      active && "opacity-100",
      !active && !completed && "opacity-50"
    )}>
      {/* Step indicator */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        "border-2 transition-all duration-300",
        completed && "bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] border-[#5865F2]",
        active && !completed && "bg-[#1E2438] border-[#5865F2]",
        !active && !completed && "bg-[#0A0E27] border-[#2E3349]"
      )}>
        {completed ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : Icon ? (
          <Icon className={cn("w-5 h-5", active ? "text-[#5865F2]" : "text-[#72767D]")} />
        ) : (
          <span className={cn("text-sm font-bold", active ? "text-[#5865F2]" : "text-[#72767D]")}>
            {stepNumber}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <h3 className={cn(
          "font-semibold mb-1",
          completed || active ? "text-white" : "text-[#B9BBBE]"
        )}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[#72767D]">{description}</p>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Mini Sparkline Component (Helper)
// =====================================================

const MiniSparkline: React.FC<{ data: number[]; color?: string }> = ({ 
  data, 
  color = '#5865F2' 
}) => {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

// =====================================================
// Export all components
// =====================================================

export default {
  MetricCard,
  InfographicHeader,
  ProgressGauge,
  ComparisonCard,
  TimelineStep
};
