/**
 * Data Visualization Components
 * Beautiful, animated charts for LightDom metrics
 * Uses SVG and CSS for smooth animations
 */

import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  timestamp: number | string;
  value: number;
  label?: string;
}

export interface ChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  showValues?: boolean;
  animated?: boolean;
}

export interface LineChartProps {
  data: TimeSeriesPoint[];
  height?: number;
  className?: string;
  color?: string;
  showGrid?: boolean;
  animated?: boolean;
}

// =============================================================================
// STAT CARD
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export function StatCard({ title, value, change, icon, color = 'blue', subtitle }: StatCardProps) {
  const getTrendIcon = () => {
    if (change === undefined || change === 0) return <Minus className="w-4 h-4" />;
    return change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-gray-400';
    return change > 0 ? 'text-green-400' : 'text-red-400';
  };

  const colors = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  return (
    <div
      className={`
        bg-gradient-to-br ${colors[color as keyof typeof colors] || colors.blue}
        backdrop-blur-xl border rounded-lg p-6
        hover:scale-105 transition-all duration-300
        cursor-pointer
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {icon && (
          <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-2 text-sm ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{Math.abs(change).toFixed(2)}%</span>
          <span className="text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BAR CHART
// =============================================================================

export function BarChart({ data, height = 300, className = '', showValues = true, animated = true }: ChartProps) {
  const [animatedValues, setAnimatedValues] = useState(data.map(() => 0));

  useEffect(() => {
    if (!animated) {
      setAnimatedValues(data.map(d => d.value));
      return;
    }

    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedValues(
        data.map(d => d.value * easeOutCubic(progress))
      );

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(data.map(d => d.value));
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [data, animated]);

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`bg-background-secondary/50 backdrop-blur-xl rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-end justify-between gap-4" style={{ height }}>
        {data.map((item, index) => {
          const heightPercentage = (animatedValues[index] / maxValue) * 100;
          const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`;

          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                {showValues && (
                  <div className="text-sm font-semibold text-white mb-2">
                    {animatedValues[index].toFixed(0)}
                  </div>
                )}

                <div
                  className="w-full rounded-t-lg transition-all duration-300 relative group"
                  style={{
                    height: `${heightPercentage}%`,
                    backgroundColor: color,
                    minHeight: heightPercentage > 0 ? '4px' : '0px',
                  }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-50 transition-opacity"
                    style={{
                      boxShadow: `0 0 20px ${color}`,
                    }}
                  />
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center mt-2">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// LINE CHART
// =============================================================================

export function LineChart({
  data,
  height = 300,
  className = '',
  color = '#6C7BFF',
  showGrid = true,
  animated = true,
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (animated && svgRef.current) {
      const path = svgRef.current.querySelector('path');
      if (path) {
        const length = path.getTotalLength();
        setPathLength(length);
      }
    }
  }, [data, animated]);

  const width = 800;
  const padding = 40;

  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue;

  // Generate path
  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - minValue) / valueRange) * (height - padding * 2);
    return { x, y };
  });

  const pathData = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <div className={`bg-background-secondary/50 backdrop-blur-xl rounded-lg p-6 border border-gray-800 ${className}`}>
      <svg ref={svgRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        {showGrid && (
          <g className="opacity-20">
            {[0, 1, 2, 3, 4].map(i => {
              const y = padding + (i / 4) * (height - padding * 2);
              return (
                <line
                  key={`grid-${i}`}
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#fff"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}

        {/* Area under line */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill={`url(#gradient-${color.replace('#', '')})`}
          opacity="0.2"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animated ? {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
            animation: 'drawLine 1.5s ease-out forwards',
          } : undefined}
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill={color}
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill={color}
              opacity="0.3"
              className="opacity-0 hover:opacity-100 transition-opacity"
            />
          </g>
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// =============================================================================
// DONUT CHART
// =============================================================================

export function DonutChart({ data, height = 300, className = '', showValues = true }: ChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = height / 2;
  const centerY = height / 2;
  const radius = height / 2 - 40;
  const innerRadius = radius * 0.6;

  let currentAngle = -90;

  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle = endAngle;

    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

    const x3 = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
    const y3 = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
    const x4 = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y4 = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    const color = item.color || `hsl(${(index * 360) / data.length}, 70%, 60%)`;

    return {
      path: pathData,
      color,
      label: item.label,
      value: item.value,
      percentage,
    };
  });

  return (
    <div className={`bg-background-secondary/50 backdrop-blur-xl rounded-lg p-6 border border-gray-800 ${className}`}>
      <div className="flex items-center gap-8">
        <svg width={height} height={height} viewBox={`0 0 ${height} ${height}`}>
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />
            </g>
          ))}

          {/* Center text */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold fill-white"
          >
            {total.toFixed(0)}
          </text>
          <text
            x={centerX}
            y={centerY + 20}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-sm fill-gray-400"
          >
            Total
          </text>
        </svg>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-gray-300">{segment.label}</span>
              </div>

              {showValues && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{segment.value.toFixed(0)}</span>
                  <span className="text-xs text-gray-500">({segment.percentage.toFixed(1)}%)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PROGRESS RING
// =============================================================================

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
}

export function ProgressRing({
  value,
  max,
  size = 120,
  strokeWidth = 10,
  color = '#6C7BFF',
  label,
  showValue = true,
}: ProgressRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1E2438"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />

        {/* Value text */}
        {showValue && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xl font-bold fill-white transform rotate-90"
            style={{ transformOrigin: `${center}px ${center}px` }}
          >
            {percentage.toFixed(0)}%
          </text>
        )}
      </svg>

      {label && <div className="text-sm text-gray-400">{label}</div>}
    </div>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Add animation keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes drawLine {
      to {
        stroke-dashoffset: 0;
      }
    }
  `;
  document.head.appendChild(style);
}
