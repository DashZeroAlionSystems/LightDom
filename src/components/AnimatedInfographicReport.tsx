/**
 * Animated Infographic Report
 * 
 * Beautiful animated report templates with smooth transitions
 * Perfect for data visualization and professional presentations
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  Download,
  Share2,
  Maximize2,
} from 'lucide-react';
import anime from 'animejs';
import { cn } from '@/lib/utils';
import { numberCounterAnimation } from '@/utils/animations';

interface ReportMetric {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
}

interface AnimatedInfographicReportProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  metrics: ReportMetric[];
  chartData?: any;
  className?: string;
  onExport?: () => void;
  onShare?: () => void;
}

export const AnimatedInfographicReport: React.FC<AnimatedInfographicReportProps> = ({
  title,
  subtitle,
  dateRange,
  metrics,
  chartData,
  className,
  onExport,
  onShare,
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true });

  useEffect(() => {
    if (isHeaderInView && headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 800,
        easing: 'easeOutExpo',
      });
    }
  }, [isHeaderInView]);

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-[#0A0E27] via-[#151A31] to-[#1E2438] p-8',
      className
    )}>
      {/* Header */}
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex items-start justify-between">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-4xl font-bold bg-gradient-to-r from-[#5865F2] to-[#7C5CFF] bg-clip-text text-transparent mb-2"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-lg text-[#B9BBBE]"
              >
                {subtitle}
              </motion.p>
            )}
            {dateRange && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-sm text-[#72767D] mt-1"
              >
                {dateRange}
              </motion.p>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex gap-2"
          >
            {onExport && (
              <ActionButton
                icon={Download}
                label="Export"
                onClick={onExport}
              />
            )}
            {onShare && (
              <ActionButton
                icon={Share2}
                label="Share"
                onClick={onShare}
              />
            )}
            <ActionButton
              icon={Maximize2}
              label="Fullscreen"
              onClick={() => {}}
            />
          </motion.div>
        </div>
      </motion.header>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {metrics.map((metric, index) => (
          <AnimatedMetricCard
            key={index}
            metric={metric}
            index={index}
          />
        ))}
      </div>

      {/* Chart Section */}
      {chartData && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <AnimatedChartCard chartData={chartData} />
        </motion.div>
      )}
    </div>
  );
};

// Animated Metric Card
const AnimatedMetricCard: React.FC<{ metric: ReportMetric; index: number }> = ({
  metric,
  index,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated && cardRef.current) {
      // Animate card entrance
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 800,
        delay: index * 100,
        easing: 'easeOutExpo',
      });

      // Animate number counter
      if (valueRef.current) {
        setTimeout(() => {
          numberCounterAnimation(valueRef.current!, 0, metric.value, 2000);
        }, index * 100 + 400);
      }

      setHasAnimated(true);
    }
  }, [isInView, hasAnimated, index, metric.value]);

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (!metric.previousValue) return null;
    const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100;
    return change;
  };

  const change = calculateChange();
  const Icon = metric.icon || TrendingUp;

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400 }}
      className="relative bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-2xl p-6 border border-[#2E3349] hover:border-[#5865F2] transition-colors overflow-hidden group"
    >
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      />

      {/* Icon */}
      <div className="relative mb-4">
        <motion.div
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] flex items-center justify-center"
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Label */}
      <div className="relative mb-2">
        <p className="text-sm text-[#B9BBBE] font-medium">{metric.label}</p>
      </div>

      {/* Value */}
      <div className="relative mb-3">
        <div
          ref={valueRef}
          className="text-3xl font-bold text-white"
        >
          {formatValue(metric.value, metric.format)}
        </div>
      </div>

      {/* Change Indicator */}
      {change !== null && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 + 0.6 }}
          className={cn(
            'relative flex items-center gap-1 text-sm',
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-[#72767D]'
          )}
        >
          {change > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : change < 0 ? (
            <TrendingDown className="w-4 h-4" />
          ) : null}
          <span className="font-semibold">{Math.abs(change).toFixed(1)}%</span>
          <span className="text-[#72767D]">vs previous</span>
        </motion.div>
      )}

      {/* Sparkline Animation */}
      <svg
        className="absolute bottom-0 right-0 w-32 h-16 opacity-20"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
      >
        <motion.path
          d={generateSparklinePath()}
          fill="none"
          stroke="url(#sparkline-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: index * 0.1 + 0.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5865F2" />
            <stop offset="100%" stopColor="#7C5CFF" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

// Animated Chart Card
const AnimatedChartCard: React.FC<{ chartData: any }> = ({ chartData }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(chartRef, { once: true });

  useEffect(() => {
    if (isInView && chartRef.current) {
      anime({
        targets: chartRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 1000,
        easing: 'easeOutExpo',
      });
    }
  }, [isInView]);

  return (
    <motion.div
      ref={chartRef}
      className="bg-gradient-to-br from-[#151A31] to-[#1E2438] rounded-2xl p-8 border border-[#2E3349]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Performance Overview</h3>
        <div className="flex gap-2">
          <ChartTypeButton icon={BarChart3} active />
          <ChartTypeButton icon={PieChart} />
          <ChartTypeButton icon={Activity} />
        </div>
      </div>

      {/* Placeholder for actual chart */}
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-[#2E3349] rounded-xl">
        <p className="text-[#72767D]">Chart visualization area</p>
      </div>
    </motion.div>
  );
};

// Action Button Component
const ActionButton: React.FC<{
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
}> = ({ icon: Icon, label, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E2438] hover:bg-[#252B45] border border-[#2E3349] hover:border-[#5865F2] transition-colors"
    >
      <Icon className="w-4 h-4 text-[#B9BBBE]" />
      <span className="text-sm text-[#B9BBBE]">{label}</span>
    </motion.button>
  );
};

// Chart Type Button
const ChartTypeButton: React.FC<{
  icon: React.ComponentType<any>;
  active?: boolean;
}> = ({ icon: Icon, active }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'p-2 rounded-lg transition-colors',
        active
          ? 'bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] text-white'
          : 'bg-[#1E2438] text-[#B9BBBE] hover:bg-[#252B45]'
      )}
    >
      <Icon className="w-5 h-5" />
    </motion.button>
  );
};

// Generate random sparkline path for demo
const generateSparklinePath = () => {
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = (i / 19) * 100;
    const y = 25 + Math.random() * 20;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  });
  return points.join(' ');
};

// Pre-built report templates
export const ReportTemplates = {
  SalesReport: (data: any) => (
    <AnimatedInfographicReport
      title="Sales Performance Report"
      subtitle="Monthly Overview"
      dateRange="January 1 - January 31, 2024"
      metrics={[
        {
          label: 'Total Revenue',
          value: 125000,
          previousValue: 98000,
          format: 'currency',
          icon: DollarSign,
          trend: 'up',
        },
        {
          label: 'New Customers',
          value: 342,
          previousValue: 280,
          format: 'number',
          icon: Users,
          trend: 'up',
        },
        {
          label: 'Conversion Rate',
          value: 3.8,
          previousValue: 3.2,
          format: 'percentage',
          icon: TrendingUp,
          trend: 'up',
        },
        {
          label: 'Total Orders',
          value: 1247,
          previousValue: 1105,
          format: 'number',
          icon: ShoppingCart,
          trend: 'up',
        },
      ]}
      chartData={data}
    />
  ),
  
  AnalyticsReport: (data: any) => (
    <AnimatedInfographicReport
      title="Website Analytics"
      subtitle="Performance Metrics"
      dateRange="Last 30 Days"
      metrics={[
        {
          label: 'Page Views',
          value: 45231,
          previousValue: 38420,
          format: 'number',
          icon: Activity,
          trend: 'up',
        },
        {
          label: 'Unique Visitors',
          value: 12456,
          previousValue: 11200,
          format: 'number',
          icon: Users,
          trend: 'up',
        },
        {
          label: 'Bounce Rate',
          value: 42.3,
          previousValue: 45.8,
          format: 'percentage',
          icon: TrendingDown,
          trend: 'down',
        },
        {
          label: 'Avg. Session',
          value: 324,
          previousValue: 298,
          format: 'number',
          icon: Activity,
          trend: 'up',
        },
      ]}
      chartData={data}
    />
  ),
};

export default AnimatedInfographicReport;
