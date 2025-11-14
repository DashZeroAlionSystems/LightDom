/**
 * SEO Report Animated Demo
 * 
 * Beautiful animated SEO report for client presentations
 * Inspired by animejs.com with smooth transitions and interactive elements
 * 
 * Features:
 * - Animated metric cards with staggered entrance
 * - Interactive data visualization
 * - Smooth scroll animations
 * - Export and share capabilities
 * - Professional Material Design 3 styling
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import anime from 'animejs';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  MousePointerClick,
  Award,
  AlertCircle,
  CheckCircle,
  Download,
  Share2,
  ExternalLink,
  BarChart3,
  Activity,
  Globe,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SEOMetric {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  format?: 'number' | 'percentage' | 'time';
  color?: string;
}

interface SEOIssue {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  count: number;
}

interface SEOReportAnimatedDemoProps {
  clientName?: string;
  domain?: string;
  dateRange?: string;
  className?: string;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleMetrics: SEOMetric[] = [
  {
    label: 'Organic Traffic',
    value: 45230,
    previousValue: 38500,
    change: 17.5,
    trend: 'up',
    icon: TrendingUp,
    format: 'number',
    color: '#10b981',
  },
  {
    label: 'Search Ranking',
    value: 3.2,
    previousValue: 5.8,
    change: -44.8,
    trend: 'up',
    icon: Search,
    format: 'number',
    color: '#3b82f6',
  },
  {
    label: 'Page Views',
    value: 125800,
    previousValue: 98400,
    change: 27.8,
    trend: 'up',
    icon: Eye,
    format: 'number',
    color: '#8b5cf6',
  },
  {
    label: 'Click-Through Rate',
    value: 4.8,
    previousValue: 3.2,
    change: 50.0,
    trend: 'up',
    icon: MousePointerClick,
    format: 'percentage',
    color: '#f59e0b',
  },
  {
    label: 'Domain Authority',
    value: 68,
    previousValue: 62,
    change: 9.7,
    trend: 'up',
    icon: Award,
    format: 'number',
    color: '#ec4899',
  },
  {
    label: 'Page Load Time',
    value: 1.2,
    previousValue: 2.8,
    change: -57.1,
    trend: 'up',
    icon: Activity,
    format: 'time',
    color: '#14b8a6',
  },
];

const sampleIssues: SEOIssue[] = [
  {
    severity: 'critical',
    title: 'Missing Meta Descriptions',
    description: 'Pages without meta descriptions may have lower click-through rates',
    count: 3,
  },
  {
    severity: 'warning',
    title: 'Slow Page Load Times',
    description: 'Some pages take longer than 3 seconds to load',
    count: 7,
  },
  {
    severity: 'info',
    title: 'Missing Alt Text',
    description: 'Images without alt text reduce accessibility and SEO',
    count: 12,
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const SEOReportAnimatedDemo: React.FC<SEOReportAnimatedDemoProps> = ({
  clientName = 'Your Company',
  domain = 'example.com',
  dateRange = 'Last 30 Days',
  className = '',
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const isHeaderInView = useInView(headerRef, { once: true });
  const isMetricsInView = useInView(metricsRef, { once: true });

  // Animate header on mount
  useEffect(() => {
    if (isHeaderInView && headerRef.current) {
      anime({
        targets: headerRef.current.querySelectorAll('.header-animate'),
        opacity: [0, 1],
        translateY: [-30, 0],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutExpo',
      });
    }
  }, [isHeaderInView]);

  // Animate metrics cards
  useEffect(() => {
    if (isMetricsInView && metricsRef.current) {
      // Entrance animation
      anime({
        targets: metricsRef.current.querySelectorAll('.metric-card'),
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        delay: anime.stagger(80),
        duration: 600,
        easing: 'easeOutExpo',
      });

      // Animate numbers counting up
      sampleMetrics.forEach((metric, index) => {
        const obj = { value: 0 };
        anime({
          targets: obj,
          value: metric.value,
          round: metric.format === 'number' ? 1 : 10,
          duration: 1500,
          delay: index * 100,
          easing: 'easeOutExpo',
          update: () => {
            setAnimatedValues((prev) => ({
              ...prev,
              [metric.label]: obj.value,
            }));
          },
        });
      });
    }
  }, [isMetricsInView]);

  const formatValue = (value: number, format?: string): string => {
    if (format === 'percentage') return `${value.toFixed(1)}%`;
    if (format === 'time') return `${value.toFixed(1)}s`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'info': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default: return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'info': return CheckCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#151A31] to-[#1E2438] p-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="mb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <motion.div
                className="header-animate opacity-0 flex items-center gap-3 mb-4"
              >
                <Globe className="w-8 h-8 text-[#5865F2]" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-[#5865F2] via-[#7C5CFF] to-[#9F7AEA] bg-clip-text text-transparent">
                  SEO Performance Report
                </h1>
              </motion.div>
              <motion.p
                className="header-animate opacity-0 text-xl text-[#B9BBBE] mb-2"
              >
                {clientName} • {domain}
              </motion.p>
              <motion.p
                className="header-animate opacity-0 text-[#72767D]"
              >
                Report Period: {dateRange}
              </motion.p>
            </div>
            <div className="header-animate opacity-0 flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#2C2F38] hover:bg-[#36393F] text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share
              </motion.button>
            </div>
          </div>

          {/* Summary Card */}
          <motion.div
            className="header-animate opacity-0 bg-gradient-to-r from-[#5865F2]/10 to-[#7C5CFF]/10 border border-[#5865F2]/30 rounded-2xl p-6"
            whileHover={{ scale: 1.01 }}
          >
            <h3 className="text-xl font-semibold text-white mb-3">Executive Summary</h3>
            <p className="text-[#B9BBBE] text-lg leading-relaxed">
              Your website's SEO performance has shown <span className="text-green-400 font-semibold">significant improvement</span> across
              all key metrics. Organic traffic increased by <span className="text-green-400 font-semibold">17.5%</span>, with notable gains in
              search ranking and engagement metrics. Continue optimizing technical SEO and content strategy for sustained growth.
            </p>
          </motion.div>
        </div>

        {/* Key Metrics Grid */}
        <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {sampleMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const displayValue = animatedValues[metric.label] || 0;
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;
            
            return (
              <motion.div
                key={metric.label}
                className="metric-card opacity-0 bg-[#2C2F38] rounded-xl p-6 border border-[#40444B] hover:border-[#5865F2]/50 transition-all"
                whileHover={{ 
                  y: -8,
                  boxShadow: '0 20px 25px rgba(88, 101, 242, 0.2)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${metric.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: metric.color }} />
                  </div>
                  {metric.change !== undefined && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      metric.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {Math.abs(metric.change).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-[#B9BBBE] text-sm font-medium mb-2">
                  {metric.label}
                </h3>
                <div className="text-4xl font-bold text-white mb-2">
                  {formatValue(displayValue, metric.format)}
                </div>
                {metric.previousValue !== undefined && (
                  <p className="text-[#72767D] text-sm">
                    Previous: {formatValue(metric.previousValue, metric.format)}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Issues Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-[#5865F2]" />
            Optimization Opportunities
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {sampleIssues.map((issue, index) => {
                const Icon = getSeverityIcon(issue.severity);
                return (
                  <motion.div
                    key={issue.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`p-6 rounded-xl border ${getSeverityColor(issue.severity)}`}
                    whileHover={{ x: 8 }}
                  >
                    <div className="flex items-start gap-4">
                      <Icon className="w-6 h-6 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{issue.title}</h3>
                          <span className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium">
                            {issue.count} {issue.count === 1 ? 'issue' : 'issues'}
                          </span>
                        </div>
                        <p className="text-[#B9BBBE]">{issue.description}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-center text-[#72767D] text-sm"
        >
          <p>Report generated by LightDom SEO Platform • {new Date().toLocaleDateString()}</p>
          <p className="mt-2">Powered by Material Design 3 & Anime.js</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SEOReportAnimatedDemo;
