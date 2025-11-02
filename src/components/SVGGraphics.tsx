/**
 * SVG Graphics Library
 * Collection of custom SVG components for modern UI design
 */

import React from 'react';

// Animated Background Pattern
export const BackgroundPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    className={`absolute inset-0 w-full h-full ${className}`} 
    xmlns="http://www.w3.org/2000/svg"
    style={{ zIndex: -1 }}
  >
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#764ba2" stopOpacity="0.05" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#bgGrad)" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// Animated Dots Pattern
export const DotsPattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg 
    className={`absolute inset-0 w-full h-full ${className}`} 
    xmlns="http://www.w3.org/2000/svg"
    style={{ zIndex: -1 }}
  >
    <defs>
      <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="rgba(102, 126, 234, 0.2)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#dots)" />
  </svg>
);

// Performance Meter SVG
export const PerformanceMeter: React.FC<{ value: number; size?: number }> = ({ 
  value, 
  size = 200 
}) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <linearGradient id="meterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="12"
      />
      
      {/* Progress circle */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="url(#meterGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
        className="transition-all duration-1000"
      />
      
      {/* Center text */}
      <text
        x="100"
        y="100"
        textAnchor="middle"
        dy="0.3em"
        fontSize="36"
        fontWeight="bold"
        fill="url(#meterGrad)"
      >
        {value}%
      </text>
    </svg>
  );
};

// Blockchain Network Visualization
export const BlockchainNetwork: React.FC<{ animated?: boolean }> = ({ animated = true }) => (
  <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
    <defs>
      <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <filter id="blockGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Connection lines */}
    <g opacity="0.3">
      <line x1="80" y1="100" x2="200" y2="80" stroke="url(#blockGrad)" strokeWidth="2" />
      <line x1="200" y1="80" x2="320" y2="100" stroke="url(#blockGrad)" strokeWidth="2" />
      <line x1="80" y1="100" x2="200" y2="150" stroke="url(#blockGrad)" strokeWidth="2" />
      <line x1="200" y1="150" x2="320" y2="100" stroke="url(#blockGrad)" strokeWidth="2" />
      <line x1="80" y1="100" x2="200" y2="220" stroke="url(#blockGrad)" strokeWidth="2" />
      <line x1="200" y1="220" x2="320" y2="200" stroke="url(#blockGrad)" strokeWidth="2" />
    </g>
    
    {/* Blocks */}
    <g className={animated ? 'animate-pulse' : ''}>
      {/* Block 1 */}
      <rect x="50" y="70" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="80" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
      
      {/* Block 2 */}
      <rect x="170" y="50" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="200" y="85" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
      
      {/* Block 3 */}
      <rect x="290" y="70" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="320" y="105" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
      
      {/* Block 4 */}
      <rect x="170" y="120" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
      
      {/* Block 5 */}
      <rect x="170" y="190" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="200" y="225" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
      
      {/* Block 6 */}
      <rect x="290" y="170" width="60" height="60" rx="8" fill="url(#blockGrad)" filter="url(#blockGlow)" />
      <text x="320" y="205" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Block</text>
    </g>
  </svg>
);

// Data Flow Animation
export const DataFlow: React.FC = () => (
  <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
    <defs>
      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#667eea" stopOpacity="0" />
        <stop offset="50%" stopColor="#667eea" stopOpacity="1" />
        <stop offset="100%" stopColor="#764ba2" stopOpacity="0" />
      </linearGradient>
    </defs>
    
    {/* Flow paths */}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <path
          d={`M 0 ${60 + i * 40} Q 150 ${60 + i * 40}, 300 ${60 + i * 40}`}
          stroke="url(#flowGrad)"
          strokeWidth="3"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
        {/* Moving dots */}
        <circle
          r="4"
          fill="#667eea"
          className="animate-flow-dot"
          style={{ animationDelay: `${i * 0.3}s` }}
        >
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path={`M 0 ${60 + i * 40} Q 150 ${60 + i * 40}, 300 ${60 + i * 40}`}
          />
        </circle>
      </g>
    ))}
  </svg>
);

// Code Window Illustration
export const CodeWindow: React.FC = () => (
  <svg width="400" height="300" viewBox="0 0 400 300" fill="none">
    <defs>
      <linearGradient id="codeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    
    {/* Window */}
    <rect x="20" y="20" width="360" height="260" rx="12" fill="#1e293b" stroke="url(#codeGrad)" strokeWidth="2" />
    
    {/* Window header */}
    <rect x="20" y="20" width="360" height="40" rx="12" fill="#334155" />
    <circle cx="45" cy="40" r="6" fill="#ef4444" />
    <circle cx="65" cy="40" r="6" fill="#f59e0b" />
    <circle cx="85" cy="40" r="6" fill="#10b981" />
    
    {/* Code lines */}
    <g opacity="0.8">
      <rect x="40" y="80" width="120" height="8" rx="4" fill="#667eea" />
      <rect x="170" y="80" width="80" height="8" rx="4" fill="#764ba2" />
      
      <rect x="60" y="100" width="100" height="8" rx="4" fill="#667eea" opacity="0.6" />
      <rect x="170" y="100" width="140" height="8" rx="4" fill="#764ba2" opacity="0.6" />
      
      <rect x="60" y="120" width="140" height="8" rx="4" fill="#667eea" opacity="0.6" />
      
      <rect x="40" y="140" width="100" height="8" rx="4" fill="#764ba2" opacity="0.6" />
      
      <rect x="60" y="160" width="180" height="8" rx="4" fill="#667eea" opacity="0.6" />
      <rect x="250" y="160" width="60" height="8" rx="4" fill="#764ba2" opacity="0.6" />
      
      <rect x="60" y="180" width="120" height="8" rx="4" fill="#667eea" opacity="0.6" />
      
      <rect x="40" y="200" width="80" height="8" rx="4" fill="#764ba2" />
      
      <rect x="40" y="230" width="200" height="8" rx="4" fill="#10b981" className="animate-pulse" />
    </g>
  </svg>
);

// Server Racks Illustration
export const ServerRacks: React.FC = () => (
  <svg width="300" height="200" viewBox="0 0 300 200" fill="none">
    <defs>
      <linearGradient id="rackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    
    {/* Server Rack 1 */}
    <g>
      <rect x="40" y="40" width="60" height="140" rx="4" fill="#1e293b" stroke="url(#rackGrad)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="45" y={50 + i * 22} width="50" height="18" rx="2" fill="#334155" />
          <circle cx="55" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
          <circle cx="65" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.1}s` }} />
        </g>
      ))}
    </g>
    
    {/* Server Rack 2 */}
    <g>
      <rect x="120" y="40" width="60" height="140" rx="4" fill="#1e293b" stroke="url(#rackGrad)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="125" y={50 + i * 22} width="50" height="18" rx="2" fill="#334155" />
          <circle cx="135" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
          <circle cx="145" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.4}s` }} />
        </g>
      ))}
    </g>
    
    {/* Server Rack 3 */}
    <g>
      <rect x="200" y="40" width="60" height="140" rx="4" fill="#1e293b" stroke="url(#rackGrad)" strokeWidth="2" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x="205" y={50 + i * 22} width="50" height="18" rx="2" fill="#334155" />
          <circle cx="215" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.6}s` }} />
          <circle cx="225" cy={59 + i * 22} r="2" fill="#10b981" className="animate-pulse" style={{ animationDelay: `${i * 0.2 + 0.7}s` }} />
        </g>
      ))}
    </g>
  </svg>
);

// Rocket Launch Illustration
export const RocketLaunch: React.FC = () => (
  <svg width="200" height="250" viewBox="0 0 200 250" fill="none">
    <defs>
      <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
      <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#ef4444" />
      </linearGradient>
    </defs>
    
    {/* Rocket body */}
    <path
      d="M 100 20 L 120 80 L 120 150 L 100 180 L 80 150 L 80 80 Z"
      fill="url(#rocketGrad)"
      className="animate-bounce-slow"
    />
    
    {/* Rocket window */}
    <circle cx="100" cy="60" r="15" fill="#1e293b" />
    <circle cx="100" cy="60" r="12" fill="#60a5fa" opacity="0.5" />
    
    {/* Rocket fins */}
    <path d="M 80 120 L 60 160 L 80 150 Z" fill="#334155" />
    <path d="M 120 120 L 140 160 L 120 150 Z" fill="#334155" />
    
    {/* Flames */}
    <g className="animate-flicker">
      <path
        d="M 85 180 Q 80 200, 85 220 L 95 200 Z"
        fill="url(#flameGrad)"
        opacity="0.8"
      />
      <path
        d="M 100 180 Q 100 210, 100 230 L 100 200 Z"
        fill="url(#flameGrad)"
      />
      <path
        d="M 115 180 Q 120 200, 115 220 L 105 200 Z"
        fill="url(#flameGrad)"
        opacity="0.8"
      />
    </g>
    
    {/* Stars */}
    {[...Array(8)].map((_, i) => {
      const x = 20 + Math.random() * 160;
      const y = 20 + Math.random() * 80;
      return (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="2"
          fill="#fff"
          className="animate-twinkle"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      );
    })}
  </svg>
);

// Shield with Checkmark
export const SecurityShield: React.FC = () => (
  <svg width="200" height="220" viewBox="0 0 200 220" fill="none">
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#667eea" />
        <stop offset="100%" stopColor="#764ba2" />
      </linearGradient>
    </defs>
    
    {/* Shield outline */}
    <path
      d="M 100 20 L 160 45 L 160 110 Q 160 160 100 200 Q 40 160 40 110 L 40 45 Z"
      fill="url(#shieldGrad)"
      opacity="0.1"
    />
    
    {/* Shield border */}
    <path
      d="M 100 30 L 150 50 L 150 110 Q 150 150 100 185 Q 50 150 50 110 L 50 50 Z"
      stroke="url(#shieldGrad)"
      strokeWidth="3"
      fill="none"
    />
    
    {/* Checkmark */}
    <path
      d="M 70 100 L 90 120 L 130 80"
      stroke="url(#shieldGrad)"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      className="animate-draw-check"
    />
  </svg>
);

export default {
  BackgroundPattern,
  DotsPattern,
  PerformanceMeter,
  BlockchainNetwork,
  DataFlow,
  CodeWindow,
  ServerRacks,
  RocketLaunch,
  SecurityShield
};
