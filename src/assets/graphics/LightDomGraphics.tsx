/**
 * LightDom Custom Graphics
 * Exodus-style SVG graphics for landing page
 * Mining, blockchain, and optimization themed illustrations
 */

import React from 'react';

// Logo Graphic - Lightning bolt with blockchain nodes
export const LightDomLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 48, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 48 48" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="logoGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Lightning Bolt */}
    <path 
      d="M24 8L14 20L20 20L16 32L26 20L20 20L24 8Z" 
      fill="url(#logoGradient)"
      filter="url(#logoGlow)"
    />
    
    {/* Blockchain Nodes */}
    <circle cx="12" cy="12" r="2" fill="#0ea5e9" opacity="0.8"/>
    <circle cx="36" cy="12" r="2" fill="#8b5cf6" opacity="0.8"/>
    <circle cx="12" cy="36" r="2" fill="#10b981" opacity="0.8"/>
    <circle cx="36" cy="36" r="2" fill="#f59e0b" opacity="0.8"/>
    
    {/* Connection Lines */}
    <line x1="12" y1="12" x2="24" y2="8" stroke="#0ea5e9" strokeWidth="1" opacity="0.4"/>
    <line x1="36" y1="12" x2="24" y2="8" stroke="#8b5cf6" strokeWidth="1" opacity="0.4"/>
    <line x1="12" y1="36" x2="16" y2="32" stroke="#10b981" strokeWidth="1" opacity="0.4"/>
    <line x1="36" y1="36" x2="26" y2="20" stroke="#f59e0b" strokeWidth="1" opacity="0.4"/>
  </svg>
);

// Mining Animation Graphic - Rotating cube with particles
export const MiningAnimation: React.FC<{ size?: number; className?: string }> = ({ 
  size = 120, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 120 120" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" />
        <stop offset="50%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <radialGradient id="particleGradient">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="1"/>
        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
      </radialGradient>
    </defs>
    
    {/* Central Mining Cube */}
    <g className="mining-cube">
      {/* Cube faces */}
      <path d="M60 30L80 40L80 60L60 70L40 60L40 40Z" fill="url(#cubeGradient)" opacity="0.9"/>
      <path d="M60 30L80 40L80 60L60 70L40 60L40 40Z" fill="none" stroke="#0ea5e9" strokeWidth="2"/>
      
      {/* Inner detail */}
      <path d="M60 40L70 45L70 55L60 60L50 55L50 45Z" fill="#0a0a0a" opacity="0.5"/>
      <text x="60" y="53" textAnchor="middle" fill="#0ea5e9" fontSize="8" fontWeight="bold">DSH</text>
    </g>
    
    {/* Orbiting Particles */}
    <g className="particles">
      <circle cx="30" cy="30" r="3" fill="url(#particleGradient)" className="particle-1"/>
      <circle cx="90" cy="30" r="3" fill="url(#particleGradient)" className="particle-2"/>
      <circle cx="30" cy="90" r="3" fill="url(#particleGradient)" className="particle-3"/>
      <circle cx="90" cy="90" r="3" fill="url(#particleGradient)" className="particle-4"/>
      <circle cx="20" cy="60" r="2" fill="#10b981" className="particle-5"/>
      <circle cx="100" cy="60" r="2" fill="#10b981" className="particle-6"/>
    </g>
    
    {/* Connection Lines */}
    <g className="connections" opacity="0.3">
      <line x1="30" y1="30" x2="60" y2="50" stroke="#0ea5e9" strokeWidth="1"/>
      <line x1="90" y1="30" x2="60" y2="50" stroke="#8b5cf6" strokeWidth="1"/>
      <line x1="30" y1="90" x2="60" y2="50" stroke="#10b981" strokeWidth="1"/>
      <line x1="90" y1="90" x2="60" y2="50" stroke="#f59e0b" strokeWidth="1"/>
    </g>
  </svg>
);

// DOM Optimization Graphic
export const DOMOptimizationGraphic: React.FC<{ size?: number; className?: string }> = ({ 
  size = 100, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="domGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#06b6d4" />
      </linearGradient>
    </defs>
    
    {/* DOM Tree Structure */}
    <g className="dom-tree">
      {/* Root Node */}
      <rect x="40" y="10" width="20" height="15" rx="2" fill="url(#domGradient)"/>
      <text x="50" y="20" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">DOM</text>
      
      {/* Branch Lines */}
      <line x1="50" y1="25" x2="30" y2="40" stroke="#10b981" strokeWidth="2"/>
      <line x1="50" y1="25" x2="70" y2="40" stroke="#10b981" strokeWidth="2"/>
      <line x1="30" y1="50" x2="20" y2="65" stroke="#06b6d4" strokeWidth="1"/>
      <line x1="30" y1="50" x2="40" y2="65" stroke="#06b6d4" strokeWidth="1"/>
      <line x1="70" y1="50" x2="60" y2="65" stroke="#06b6d4" strokeWidth="1"/>
      <line x1="70" y1="50" x2="80" y2="65" stroke="#06b6d4" strokeWidth="1"/>
      
      {/* Child Nodes */}
      <rect x="20" y="40" width="20" height="10" rx="2" fill="#10b981" opacity="0.8"/>
      <text x="30" y="47" textAnchor="middle" fill="white" fontSize="5">HTML</text>
      
      <rect x="60" y="40" width="20" height="10" rx="2" fill="#8b5cf6" opacity="0.8"/>
      <text x="70" y="47" textAnchor="middle" fill="white" fontSize="5">CSS</text>
      
      {/* Leaf Nodes */}
      <rect x="15" y="65" width="10" height="8" rx="1" fill="#06b6d4" opacity="0.6"/>
      <rect x="35" y="65" width="10" height="8" rx="1" fill="#06b6d4" opacity="0.6"/>
      <rect x="55" y="65" width="10" height="8" rx="1" fill="#f59e0b" opacity="0.6"/>
      <rect x="75" y="65" width="10" height="8" rx="1" fill="#f59e0b" opacity="0.6"/>
      
      {/* Optimization Arrows */}
      <g className="optimization-arrows">
        <path d="M85 20L95 15L95 25Z" fill="#10b981" opacity="0.8"/>
        <path d="M5 80L15 75L15 85Z" fill="#06b6d4" opacity="0.8"/>
      </g>
    </g>
  </svg>
);

// Blockchain Network Graphic
export const BlockchainNetworkGraphic: React.FC<{ size?: number; className?: string }> = ({ 
  size = 100, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="blockchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    
    {/* Blockchain Network */}
    <g className="blockchain-network">
      {/* Central Block */}
      <rect x="40" y="40" width="20" height="20" rx="3" fill="url(#blockchainGradient)"/>
      <text x="50" y="52" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">GEN</text>
      
      {/* Connected Blocks */}
      <rect x="15" y="20" width="15" height="15" rx="2" fill="#8b5cf6" opacity="0.8"/>
      <text x="22" y="29" textAnchor="middle" fill="white" fontSize="5">B1</text>
      
      <rect x="70" y="20" width="15" height="15" rx="2" fill="#ec4899" opacity="0.8"/>
      <text x="77" y="29" textAnchor="middle" fill="white" fontSize="5">B2</text>
      
      <rect x="15" y="65" width="15" height="15" rx="2" fill="#10b981" opacity="0.8"/>
      <text x="22" y="74" textAnchor="middle" fill="white" fontSize="5">B3</text>
      
      <rect x="70" y="65" width="15" height="15" rx="2" fill="#f59e0b" opacity="0.8"/>
      <text x="77" y="74" textAnchor="middle" fill="white" fontSize="5">B4</text>
      
      {/* Connection Lines */}
      <g className="blockchain-connections" opacity="0.6">
        <line x1="30" y1="27" x2="40" y2="45" stroke="#8b5cf6" strokeWidth="2"/>
        <line x1="70" y1="27" x2="60" y2="45" stroke="#ec4899" strokeWidth="2"/>
        <line x1="30" y1="72" x2="40" y2="55" stroke="#10b981" strokeWidth="2"/>
        <line x1="70" y1="72" x2="60" y2="55" stroke="#f59e0b" strokeWidth="2"/>
        
        {/* Chain Links */}
        <path d="M35 35L40 40L45 35" stroke="#8b5cf6" strokeWidth="1" fill="none"/>
        <path d="M55 35L60 40L65 35" stroke="#ec4899" strokeWidth="1" fill="none"/>
        <path d="M35 60L40 55L45 60" stroke="#10b981" strokeWidth="1" fill="none"/>
        <path d="M55 60L60 55L65 60" stroke="#f59e0b" strokeWidth="1" fill="none"/>
      </g>
      
      {/* Mining Particles */}
      <g className="mining-particles">
        <circle cx="50" cy="10" r="2" fill="#f59e0b" opacity="0.6">
          <animate attributeName="cy" from="10" to="40" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="10" cy="50" r="2" fill="#10b981" opacity="0.6">
          <animate attributeName="cx" from="10" to="40" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="90" cy="50" r="2" fill="#8b5cf6" opacity="0.6">
          <animate attributeName="cx" from="90" to="60" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
      </g>
    </g>
  </svg>
);

// SEO Analysis Graphic
export const SEOAnalysisGraphic: React.FC<{ size?: number; className?: string }> = ({ 
  size = 100, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="seoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    
    {/* SEO Analysis Chart */}
    <g className="seo-analysis">
      {/* Chart Background */}
      <rect x="10" y="20" width="80" height="60" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
      
      {/* Chart Bars */}
      <rect x="20" y="60" width="8" height="15" fill="#22d3ee" opacity="0.8"/>
      <rect x="32" y="50" width="8" height="25" fill="#3b82f6" opacity="0.8"/>
      <rect x="44" y="40" width="8" height="35" fill="#10b981" opacity="0.8"/>
      <rect x="56" y="45" width="8" height="30" fill="#f59e0b" opacity="0.8"/>
      <rect x="68" y="55" width="8" height="20" fill="#ef4444" opacity="0.8"/>
      
      {/* Trend Line */}
      <path d="M24 65L36 55L48 45L60 50L72 60" 
            stroke="url(#seoGradient)" 
            strokeWidth="2" 
            fill="none"
            className="trend-line"/>
      
      {/* Data Points */}
      <circle cx="24" cy="65" r="2" fill="#22d3ee"/>
      <circle cx="36" cy="55" r="2" fill="#3b82f6"/>
      <circle cx="48" cy="45" r="2" fill="#10b981"/>
      <circle cx="60" cy="50" r="2" fill="#f59e0b"/>
      <circle cx="72" cy="60" r="2" fill="#ef4444"/>
      
      {/* SEO Labels */}
      <text x="50" y="15" textAnchor="middle" fill="#22d3ee" fontSize="8" fontWeight="bold">SEO SCORE</text>
      <text x="50" y="95" textAnchor="middle" fill="#666" fontSize="6">194 Features</text>
    </g>
  </svg>
);

// Metaverse NFT Graphic
export const MetaverseNFTGraphic: React.FC<{ size?: number; className?: string }> = ({ 
  size = 100, 
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="nftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="50%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="nftGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* NFT Card */}
    <g className="nft-card">
      {/* Card Frame */}
      <rect x="20" y="15" width="60" height="70" rx="8" 
            fill="url(#nftGradient)" 
            filter="url(#nftGlow)"
            opacity="0.9"/>
      
      {/* Inner Frame */}
      <rect x="25" y="20" width="50" height="60" rx="6" 
            fill="#0a0a0a" 
            opacity="0.8"/>
      
      {/* NFT Content - Crystal */}
      <g className="nft-crystal">
        <path d="M50 30L40 40L40 55L50 65L60 55L60 40Z" 
              fill="url(#nftGradient)" 
              opacity="0.7"/>
        <path d="M50 35L45 40L45 52L50 57L55 52L55 40Z" 
              fill="#0a0a0a" 
              opacity="0.5"/>
        
        {/* Crystal Sparkle */}
        <path d="M50 40L52 42L50 44L48 42Z" fill="#f59e0b" opacity="0.9">
          <animate attributeName="opacity" from="0.9" to="0.3" dur="1.5s" repeatCount="indefinite"/>
        </path>
      </g>
      
      {/* Rarity Badge */}
      <circle cx="70" cy="25" r="8" fill="#ef4444" opacity="0.9"/>
      <text x="70" y="28" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">EPIC</text>
      
      {/* NFT Label */}
      <text x="50" y="78" textAnchor="middle" fill="#f59e0b" fontSize="6" fontWeight="bold">CRYSTAL</text>
    </g>
  </svg>
);

// Performance Meter Graphic
export const PerformanceMeterGraphic: React.FC<{ 
  size?: number; 
  value?: number; 
  className?: string 
}> = ({ 
  size = 80, 
  value = 85, 
  className = '' 
}) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 80 80" 
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      
      {/* Background Circle */}
      <circle 
        cx="40" 
        cy="40" 
        r={radius} 
        stroke="#333" 
        strokeWidth="6" 
        fill="none"
      />
      
      {/* Progress Circle */}
      <circle 
        cx="40" 
        cy="40" 
        r={radius} 
        stroke="url(#meterGradient)" 
        strokeWidth="6" 
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        className="progress-circle"
      />
      
      {/* Center Text */}
      <text x="40" y="40" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
        {value}%
      </text>
      <text x="40" y="52" textAnchor="middle" fill="#666" fontSize="6">
        SCORE
      </text>
    </svg>
  );
};

// Floating Particles Background
export const FloatingParticlesGraphic: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 400 400" 
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="particleGradient1">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="particleGradient2">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/>
      </radialGradient>
      <radialGradient id="particleGradient3">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
      </radialGradient>
    </defs>
    
    {/* Animated Particles */}
    <g className="floating-particles">
      <circle cx="50" cy="50" r="20" fill="url(#particleGradient1)" className="particle-1">
        <animate attributeName="cy" from="50" to="350" dur="8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.8" to="0" dur="8s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="150" cy="100" r="15" fill="url(#particleGradient2)" className="particle-2">
        <animate attributeName="cy" from="100" to="400" dur="10s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.6" to="0" dur="10s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="250" cy="80" r="25" fill="url(#particleGradient3)" className="particle-3">
        <animate attributeName="cy" from="80" to="400" dur="12s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.4" to="0" dur="12s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="350" cy="120" r="18" fill="url(#particleGradient1)" className="particle-4">
        <animate attributeName="cy" from="120" to="400" dur="9s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.7" to="0" dur="9s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="100" cy="200" r="12" fill="url(#particleGradient2)" className="particle-5">
        <animate attributeName="cy" from="200" to="450" dur="11s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.5" to="0" dur="11s" repeatCount="indefinite"/>
      </circle>
      
      <circle cx="300" cy="150" r="22" fill="url(#particleGradient3)" className="particle-6">
        <animate attributeName="cy" from="150" to="400" dur="13s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.6" to="0" dur="13s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
);

export default {
  LightDomLogo,
  MiningAnimation,
  DOMOptimizationGraphic,
  BlockchainNetworkGraphic,
  SEOAnalysisGraphic,
  MetaverseNFTGraphic,
  PerformanceMeterGraphic,
  FloatingParticlesGraphic,
};
