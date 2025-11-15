import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedInfographicReport, ReportTemplates } from './AnimatedInfographicReport';
import { DollarSign, Users, TrendingUp, ShoppingCart, Activity, TrendingDown } from 'lucide-react';

const meta: Meta<typeof AnimatedInfographicReport> = {
  title: 'Components/Reports/Animated Infographic Report',
  component: AnimatedInfographicReport,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Beautiful animated report templates with smooth transitions. Perfect for data visualization and professional presentations.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnimatedInfographicReport>;

const sampleChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [65, 59, 80, 81, 56, 95],
    },
  ],
};

export const SalesReport: Story = {
  args: {
    title: 'Sales Performance Report',
    subtitle: 'Monthly Overview',
    dateRange: 'January 1 - January 31, 2024',
    metrics: [
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
    ],
    chartData: sampleChartData,
  },
};

export const AnalyticsReport: Story = {
  args: {
    title: 'Website Analytics',
    subtitle: 'Performance Metrics',
    dateRange: 'Last 30 Days',
    metrics: [
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
        label: 'Avg. Session Duration',
        value: 324,
        previousValue: 298,
        format: 'number',
        icon: Activity,
        trend: 'up',
      },
    ],
    chartData: sampleChartData,
  },
};

export const WithoutChart: Story = {
  args: {
    title: 'Quarterly Business Report',
    subtitle: 'Q4 2023 Performance',
    dateRange: 'October 1 - December 31, 2023',
    metrics: [
      {
        label: 'Revenue Growth',
        value: 28.5,
        previousValue: 22.1,
        format: 'percentage',
        icon: TrendingUp,
        trend: 'up',
      },
      {
        label: 'Customer Satisfaction',
        value: 94,
        previousValue: 91,
        format: 'percentage',
        icon: Users,
        trend: 'up',
      },
      {
        label: 'Market Share',
        value: 15.2,
        previousValue: 14.8,
        format: 'percentage',
        icon: TrendingUp,
        trend: 'up',
      },
      {
        label: 'Operating Margin',
        value: 32.1,
        previousValue: 29.5,
        format: 'percentage',
        icon: DollarSign,
        trend: 'up',
      },
    ],
  },
};

export const MixedTrends: Story = {
  args: {
    title: 'Mixed Performance Report',
    subtitle: 'Various Metrics',
    dateRange: 'Current Month',
    metrics: [
      {
        label: 'Revenue',
        value: 85000,
        previousValue: 92000,
        format: 'currency',
        icon: DollarSign,
        trend: 'down',
      },
      {
        label: 'New Users',
        value: 456,
        previousValue: 445,
        format: 'number',
        icon: Users,
        trend: 'up',
      },
      {
        label: 'Churn Rate',
        value: 5.2,
        previousValue: 6.8,
        format: 'percentage',
        icon: TrendingDown,
        trend: 'down',
      },
      {
        label: 'Support Tickets',
        value: 234,
        previousValue: 189,
        format: 'number',
        icon: Activity,
        trend: 'up',
      },
    ],
    chartData: sampleChartData,
  },
};

export const MinimalReport: Story = {
  args: {
    title: 'Simple Report',
    metrics: [
      {
        label: 'Total Users',
        value: 1250,
        format: 'number',
        icon: Users,
      },
      {
        label: 'Revenue',
        value: 45000,
        format: 'currency',
        icon: DollarSign,
      },
    ],
  },
};

export const LargeNumbers: Story = {
  args: {
    title: 'Enterprise Metrics',
    subtitle: 'Annual Performance',
    dateRange: 'Fiscal Year 2023',
    metrics: [
      {
        label: 'Total Revenue',
        value: 12500000,
        previousValue: 9800000,
        format: 'currency',
        icon: DollarSign,
        trend: 'up',
      },
      {
        label: 'Global Users',
        value: 2450000,
        previousValue: 1980000,
        format: 'number',
        icon: Users,
        trend: 'up',
      },
      {
        label: 'Market Cap',
        value: 850000000,
        previousValue: 720000000,
        format: 'currency',
        icon: TrendingUp,
        trend: 'up',
      },
      {
        label: 'Transactions',
        value: 15600000,
        previousValue: 12300000,
        format: 'number',
        icon: ShoppingCart,
        trend: 'up',
      },
    ],
    chartData: sampleChartData,
  },
};

export const WithCustomColors: Story = {
  args: {
    title: 'Custom Styled Report',
    subtitle: 'Branded Design',
    dateRange: 'This Month',
    metrics: [
      {
        label: 'Primary Metric',
        value: 12345,
        previousValue: 10000,
        format: 'number',
        icon: TrendingUp,
        trend: 'up',
      },
      {
        label: 'Secondary Metric',
        value: 67.8,
        previousValue: 65.2,
        format: 'percentage',
        icon: Activity,
        trend: 'up',
      },
    ],
    chartData: sampleChartData,
    className: 'custom-report-theme',
  },
};

export const InteractiveReport: Story = {
  render: () => {
    const handleExport = () => {
      alert('Export functionality triggered');
    };

    const handleShare = () => {
      alert('Share functionality triggered');
    };

    return (
      <AnimatedInfographicReport
        title="Interactive Report"
        subtitle="With Export and Share Options"
        dateRange="Live Data"
        metrics={[
          {
            label: 'Active Users',
            value: 8542,
            previousValue: 7820,
            format: 'number',
            icon: Users,
            trend: 'up',
          },
          {
            label: 'Revenue Today',
            value: 23400,
            previousValue: 21200,
            format: 'currency',
            icon: DollarSign,
            trend: 'up',
          },
        ]}
        chartData={sampleChartData}
        onExport={handleExport}
        onShare={handleShare}
      />
    );
  },
};
