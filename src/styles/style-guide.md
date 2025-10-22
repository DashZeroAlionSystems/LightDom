# LightDom Space-Bridge Platform - Comprehensive Style Guide

## 🎨 **Design System Overview**

The LightDom Space-Bridge platform uses a modern, accessible, and user-friendly design system built on the latest UI trends and best practices. This comprehensive style guide ensures consistency across all components and provides a foundation for creating beautiful, functional interfaces.

## 🎯 **Design Principles**

### **1. Modern & Futuristic**
- Clean, minimalist design with subtle gradients and shadows
- Glassmorphism effects for depth and visual interest
- Smooth animations and micro-interactions
- Cutting-edge visual elements that reflect blockchain technology

### **2. Accessible & Inclusive**
- WCAG 2.1 AA compliance for all components
- High contrast ratios for text and backgrounds
- Keyboard navigation support
- Screen reader compatibility
- Responsive design for all devices

### **3. User-Friendly**
- Intuitive navigation and information architecture
- Clear visual hierarchy and typography
- Consistent interaction patterns
- Helpful feedback and loading states
- Error prevention and recovery

### **4. Performance-Focused**
- Optimized animations and transitions
- Efficient CSS with minimal bundle size
- GPU-accelerated animations where appropriate
- Reduced motion support for accessibility

## 🌈 **Color System**

### **Primary Colors**
```css
--color-primary: #0ea5e9;        /* Main brand color */
--color-primary-hover: #0284c7;  /* Hover state */
--color-primary-active: #0369a1;  /* Active state */
--color-primary-light: #e0f2fe;  /* Light variant */
--color-primary-dark: #075985;    /* Dark variant */
```

### **Secondary Colors**
```css
--color-secondary: #a855f7;       /* Purple accent */
--color-secondary-hover: #9333ea;
--color-secondary-active: #7c3aed;
--color-secondary-light: #f3e8ff;
--color-secondary-dark: #6b21a8;
```

### **Accent Colors**
```css
--color-accent: #ec4899;          /* Pink accent */
--color-accent-hover: #db2777;
--color-accent-active: #be185d;
--color-accent-light: #fce7f3;
--color-accent-dark: #9d174d;
```

### **Semantic Colors**
```css
--color-success: #22c55e;         /* Success states */
--color-warning: #f59e0b;         /* Warning states */
--color-error: #ef4444;           /* Error states */
```

### **Neutral Colors**
```css
--color-background: #ffffff;      /* Main background */
--color-surface: #f8fafc;         /* Card backgrounds */
--color-surface-elevated: #ffffff; /* Elevated surfaces */
--color-border: #e2e8f0;          /* Borders */
--color-text: #0f172a;            /* Primary text */
--color-text-secondary: #475569;  /* Secondary text */
--color-text-tertiary: #94a3b8;   /* Tertiary text */
```

### **Dark Mode Colors**
```css
--color-background: #0a0a0a;      /* Dark background */
--color-surface: #111111;         /* Dark surfaces */
--color-surface-elevated: #1a1a1a; /* Dark elevated */
--color-border: #262626;          /* Dark borders */
--color-text: #ffffff;            /* Dark text */
--color-text-secondary: #a3a3a3;  /* Dark secondary */
--color-text-tertiary: #737373;    /* Dark tertiary */
```

## 📝 **Typography**

### **Font Families**
- **Primary**: Inter (system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
- **Monospace**: JetBrains Mono (Fira Code, Monaco, Consolas, monospace)
- **Display**: Cal Sans (Inter, system-ui, sans-serif)

### **Font Sizes**
```css
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### **Font Weights**
```css
--font-thin: 100;
--font-extralight: 200;
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
--font-black: 900;
```

### **Line Heights**
```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## 📏 **Spacing System**

### **Spacing Scale**
```css
--spacing-0: 0px;
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
--spacing-32: 8rem;      /* 128px */
```

## 🔲 **Border Radius**

### **Radius Scale**
```css
--radius-none: 0px;
--radius-sm: 0.125rem;   /* 2px */
--radius-base: 0.25rem;  /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-3xl: 1.5rem;   /* 24px */
--radius-full: 9999px;   /* Fully rounded */
```

## 🌟 **Shadows**

### **Shadow Scale**
```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### **Colored Shadows**
```css
--shadow-primary: 0 4px 14px 0 rgb(14 165 233 / 0.15);
--shadow-secondary: 0 4px 14px 0 rgb(168 85 247 / 0.15);
--shadow-accent: 0 4px 14px 0 rgb(236 72 153 / 0.15);
--shadow-success: 0 4px 14px 0 rgb(34 197 94 / 0.15);
--shadow-warning: 0 4px 14px 0 rgb(245 158 11 / 0.15);
--shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.15);
```

## ⚡ **Animations**

### **Duration**
```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### **Easing Functions**
```css
--easing-linear: linear;
--easing-ease: ease;
--easing-ease-in: ease-in;
--easing-ease-out: ease-out;
--easing-ease-in-out: ease-in-out;
--easing-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--easing-snappy: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

### **Animation Classes**
- `animate-fadeIn` - Fade in animation
- `animate-slideInUp` - Slide in from bottom
- `animate-slideInDown` - Slide in from top
- `animate-slideInLeft` - Slide in from left
- `animate-slideInRight` - Slide in from right
- `animate-scaleIn` - Scale in animation
- `animate-bounce` - Bounce animation
- `animate-pulse` - Pulse animation
- `animate-spin` - Spin animation
- `animate-gradient` - Gradient animation

## 📱 **Responsive Design**

### **Breakpoints**
```css
--breakpoint-xs: 320px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### **Mobile-First Approach**
- Design for mobile devices first
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized for thumb navigation

## 🎭 **Component Guidelines**

### **Buttons**
- **Primary**: Main actions, high emphasis
- **Secondary**: Secondary actions, medium emphasis
- **Accent**: Special actions, brand emphasis
- **Ghost**: Subtle actions, low emphasis
- **Outline**: Alternative actions, medium emphasis

### **Cards**
- **Default**: Standard content containers
- **Elevated**: Important content with shadow
- **Outlined**: Subtle content with border
- **Filled**: Background content
- **Gradient**: Special content with gradient

### **Inputs**
- Clear labels and helper text
- Validation states (success, warning, error)
- Consistent sizing and spacing
- Focus states with ring indicators
- Placeholder text for guidance

### **Modals**
- Centered positioning
- Backdrop blur effect
- Smooth animations
- Keyboard navigation
- Escape key to close

### **Tooltips**
- Contextual help and information
- Consistent positioning
- Accessible implementation
- Smooth animations
- Clear typography

## 🌙 **Dark Mode**

### **Implementation**
- CSS custom properties for dynamic theming
- Automatic system preference detection
- Manual toggle option
- Smooth transitions between modes
- Consistent contrast ratios

### **Dark Mode Colors**
- Dark backgrounds with subtle gradients
- High contrast text for readability
- Muted accent colors for reduced eye strain
- Consistent shadow and border treatments

## ♿ **Accessibility**

### **WCAG 2.1 AA Compliance**
- Color contrast ratios of 4.5:1 or higher
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alternative text for images

### **Implementation**
- Semantic HTML elements
- ARIA labels and descriptions
- Focus management
- Reduced motion support
- High contrast mode support

## 🚀 **Performance**

### **Optimization**
- CSS custom properties for efficient theming
- GPU-accelerated animations
- Minimal bundle size
- Efficient selectors
- Reduced motion support

### **Best Practices**
- Use `transform` and `opacity` for animations
- Avoid animating layout properties
- Implement `will-change` sparingly
- Use `contain` for layout optimization
- Minimize repaints and reflows

## 📚 **Usage Examples**

### **Basic Button**
```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

### **Card with Gradient**
```tsx
<Card variant="gradient" padding="lg">
  <CardTitle>Space Mining Results</CardTitle>
  <CardContent>
    <p>Mined 1,250KB of digital space</p>
  </CardContent>
</Card>
```

### **Animated Counter**
```tsx
<AnimatedCounter
  value={1250}
  duration={1000}
  prefix="$"
  suffix="KB"
/>
```

### **Gradient Text**
```tsx
<GradientText gradient="rainbow" size="2xl">
  LightDom Platform
</GradientText>
```

## 🎨 **Customization**

### **Theme Override**
```css
:root {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  /* Override other variables */
}
```

### **Component Variants**
```tsx
<Button 
  variant="custom" 
  className="bg-gradient-to-r from-purple-500 to-pink-500"
>
  Custom Button
</Button>
```

## 🎯 **Process Indicators**

### **When to Use Each Indicator**

#### **1. Loading Skeleton** - Initial data load (>500ms expected)
**Use for:** Dashboard initial load, table data fetch, card content

```tsx
import { Skeleton } from 'antd';

<Skeleton active loading={loading} paragraph={{ rows: 4 }}>
  <ActualContent />
</Skeleton>
```

#### **2. Spinner** - Short operations (<2s expected)
**Use for:** Button actions, form submissions, quick API calls

```tsx
import { Spin } from 'antd';

<Spin spinning={processing}>
  <Content />
</Spin>

// Or inline
{isProcessing && <Spin />}
```

#### **3. Progress Bar** - Long operations with progress (>2s expected)
**Use for:** File uploads, batch operations, mining processes, optimization

```tsx
import { Progress } from 'antd';

<Progress 
  percent={progressPercent} 
  status={status}
  strokeColor={{
    '0%': '#108ee9',
    '100%': '#87d068',
  }}
/>
```

#### **4. Toast Notification** - Operation completion feedback
**Use for:** All user-initiated operations, success/error feedback

```tsx
import { notification } from 'antd';

// Success
notification.success({
  message: 'Operation Completed',
  description: 'Your optimization has finished successfully',
  placement: 'topRight',
  duration: 3
});

// Error
notification.error({
  message: 'Operation Failed',
  description: error.message,
  placement: 'topRight',
  duration: 5
});
```

#### **5. Status Badge** - Ongoing process state
**Use for:** Mining status, connection status, job status, server status

```tsx
import { Badge } from 'antd';

<Badge status="processing" text="Mining" />
<Badge status="success" text="Active" />
<Badge status="error" text="Failed" />
<Badge status="warning" text="Paused" />
```

### **Standard Implementation Pattern**

```tsx
import { useState } from 'react';
import { Skeleton, Spin, Progress, notification, Badge } from 'antd';

function DashboardWithIndicators() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'active' | 'error'>('idle');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const data = await fetchData();
      setData(data);
    } catch (error) {
      notification.error({
        message: 'Failed to Load Data',
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOperation = async () => {
    setProcessing(true);
    setProgress(0);
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await delay(200);
      }
      
      notification.success({
        message: 'Success',
        description: 'Operation completed successfully'
      });
      setStatus('active');
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message
      });
      setStatus('error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div className="p-6">
      {/* Status indicator */}
      <div className="mb-4">
        <Badge status={status === 'active' ? 'success' : 'default'} text="System Status" />
      </div>

      {/* Content with spinner overlay */}
      <Spin spinning={processing}>
        {/* Progress bar */}
        {progress > 0 && progress < 100 && (
          <Progress percent={progress} className="mb-4" />
        )}

        {/* Your content */}
        <button onClick={handleOperation}>Start Operation</button>
      </Spin>
    </div>
  );
}
```

## 🛡️ **Error Handling UI Patterns**

### **Error Boundary**

Wrap all route components in an error boundary:

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Something went wrong"
          subTitle={this.state.error?.message}
          extra={[
            <Button type="primary" onClick={() => this.setState({ hasError: false })}>
              Try Again
            </Button>,
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          ]}
        />
      );
    }

    return this.props.children;
  }
}

// Usage in main.tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### **API Error Display**

```tsx
// Pattern 1: Toast for operations
try {
  await performOperation();
  notification.success({ message: 'Success' });
} catch (error) {
  notification.error({
    message: 'Operation Failed',
    description: error.response?.data?.message || error.message
  });
}

// Pattern 2: Inline for forms
<Form.Item
  validateStatus={error ? 'error' : ''}
  help={error?.message}
>
  <Input />
</Form.Item>

// Pattern 3: Alert for page-level errors
import { Alert } from 'antd';

{error && (
  <Alert
    message="Error"
    description={error.message}
    type="error"
    closable
    onClose={() => setError(null)}
    showIcon
  />
)}
```

## 🔌 **Enterprise API Call Pattern**

### **API Client Setup**

Create a centralized API client with interceptors:

```typescript
// src/utils/apiClient.ts
import axios from 'axios';
import { notification } from 'antd';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add correlation ID for tracking
    config.headers['X-Correlation-ID'] = generateCorrelationId();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    
    // Log errors
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

### **API Call Pattern with Error Handling**

```typescript
import apiClient from '@/utils/apiClient';
import { notification } from 'antd';

export async function fetchData<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient.get<T>(endpoint, options);
    return response.data;
  } catch (error) {
    // User-friendly error message
    const message = error.response?.data?.message || 'Request failed';
    
    notification.error({
      message: 'Error',
      description: message
    });
    
    throw error;
  }
}

// Usage in components
const loadData = async () => {
  setLoading(true);
  try {
    const data = await fetchData<MyDataType>('/endpoint');
    setData(data);
  } catch (error) {
    // Error already handled by fetchData
  } finally {
    setLoading(false);
  }
};
```

## 🎨 **Design System Priorities**

### **Primary: Material Design 3 + Tailwind CSS**

**Use Material Design 3 (Ant Design) for:**
- Buttons, inputs, forms
- Cards and containers
- Navigation components
- Modal dialogs
- Tables and lists
- Notifications and alerts

**Use Tailwind CSS for:**
- Layout (flexbox, grid)
- Spacing and sizing
- Colors and backgrounds
- Typography utilities
- Responsive design
- Custom components

**Example combining both:**

```tsx
import { Card, Button } from 'antd';

<Card className="shadow-lg rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
  <h2 className="text-2xl font-bold mb-4">Dashboard Title</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <p className="text-gray-600 dark:text-gray-400">Content</p>
      <Button type="primary" className="mt-4">Action</Button>
    </div>
  </div>
</Card>
```

## 📱 **Component Templates**

### **Dashboard Template**

```tsx
import React from 'react';
import { Card, Typography, Button, Skeleton } from 'antd';
import { ArrowLeft } from 'lucide-react';

const { Title } = Typography;

interface DashboardTemplateProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  onBack?: () => void;
}

export const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  title,
  subtitle,
  actions,
  children,
  loading,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {onBack && (
                <Button
                  type="text"
                  icon={<ArrowLeft className="w-5 h-5" />}
                  onClick={onBack}
                  className="mr-4"
                />
              )}
              <div>
                <Title level={2} className="mb-0">{title}</Title>
                {subtitle && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div>{actions}</div>}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
```

## 📖 **Resources**

### **Design Tools**
- Figma design system
- Storybook component library
- Design tokens documentation
- Accessibility testing tools

### **Development**
- TypeScript definitions
- Component documentation
- Usage examples
- Testing guidelines

### **Libraries**
- Ant Design 5.27+ (Material Design 3)
- Tailwind CSS 4.1+
- Lucide React (Icons)
- React 19+

---

This comprehensive style guide ensures consistency, accessibility, and modern design practices across the entire LightDom Space-Bridge platform. All components follow these guidelines to create a cohesive, user-friendly experience.

**Last Updated:** 2025-10-22
**Version:** 2.0 (Added process indicators, error handling, and API patterns)