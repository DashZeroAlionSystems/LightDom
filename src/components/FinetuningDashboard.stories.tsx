import type { Meta, StoryObj } from '@storybook/react';
import { FinetuningDashboard } from './FinetuningDashboard';

/**
 * FinetuningDashboard - DeepSeek Finetuning Pipeline UI
 * 
 * Comprehensive dashboard for managing the 4-phase DeepSeek finetuning pipeline:
 * - **Phase 1: Data Infrastructure** - Training data collection, quality scoring, tool-use generation
 * - **Phase 2: Training Setup** - QLoRA configuration, training script generation
 * - **Phase 3: Integration** - Model versioning, A/B testing framework
 * - **Phase 4: Production** - Deployment management, continuous training
 */
const meta: Meta<typeof FinetuningDashboard> = {
  title: 'AI/FinetuningDashboard',
  component: FinetuningDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# DeepSeek Finetuning Dashboard

A comprehensive UI for managing the 4-phase DeepSeek model finetuning pipeline.

## Features

### Phase 1: Data Infrastructure
- Generate tool-use training examples
- Score training data quality
- Create train/validation dataset splits

### Phase 2: Local Training Setup
- Configure QLoRA parameters (rank, alpha, epochs, batch size)
- Generate Python training scripts
- Download training artifacts

### Phase 3: Integration
- Register trained model versions
- Create and monitor A/B tests
- Compare model performance

### Phase 4: Production
- Deploy models to production
- Monitor deployment health
- Manage continuous training pipeline

## API Endpoints

The dashboard connects to these API endpoints:
- \`GET /api/finetuning/status\` - Get pipeline status
- \`POST /api/finetuning/phase1/*\` - Phase 1 actions
- \`POST /api/finetuning/phase2/*\` - Phase 2 actions
- \`POST /api/finetuning/phase3/*\` - Phase 3 actions
- \`POST /api/finetuning/phase4/*\` - Phase 4 actions
- \`POST /api/finetuning/continuous/*\` - Continuous training
        `
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    apiBaseUrl: {
      control: 'text',
      description: 'Base URL for the finetuning API endpoints',
      table: {
        defaultValue: { summary: '/api/finetuning' }
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view showing Phase 1: Data Infrastructure
 */
export const Default: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  }
};

/**
 * Demo mode with mocked API responses
 * Shows the dashboard with simulated data for testing
 */
export const DemoMode: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    docs: {
      description: {
        story: 'Dashboard in demo mode with simulated data. Click through phases to see the full workflow.'
      }
    }
  }
};

/**
 * Phase 1 Focus - Data Infrastructure
 * Shows training data collection and quality scoring
 */
export const Phase1DataInfrastructure: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    docs: {
      description: {
        story: `
Phase 1 focuses on training data infrastructure:
- **Tool Example Generation**: Create examples for mining, schema, workflow, and error handling
- **Quality Scoring**: Evaluate data completeness, format, length, and tool usage
- **Dataset Splitting**: Create train/validation splits with configurable ratios
        `
      }
    }
  }
};

/**
 * Phase 2 Focus - Training Setup
 * Shows QLoRA configuration and script generation
 */
export const Phase2TrainingSetup: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    docs: {
      description: {
        story: `
Phase 2 focuses on local training setup:
- **QLoRA Configuration**: Set rank, alpha, dropout, target modules
- **Training Parameters**: Epochs, batch size, learning rate, optimizer
- **Script Generation**: Generate Python training scripts with dependencies
        `
      }
    }
  }
};

/**
 * Phase 3 Focus - Integration
 * Shows model versioning and A/B testing
 */
export const Phase3Integration: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    docs: {
      description: {
        story: `
Phase 3 focuses on model integration:
- **Version Control**: Register, track, and promote model versions
- **A/B Testing**: Compare models with traffic splitting
- **Performance Metrics**: Track accuracy, latency, and success rates
        `
      }
    }
  }
};

/**
 * Phase 4 Focus - Production
 * Shows deployment and continuous training
 */
export const Phase4Production: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    docs: {
      description: {
        story: `
Phase 4 focuses on production deployment:
- **Deployment**: Deploy models with health checks
- **Monitoring**: Track deployment health and performance
- **Continuous Training**: Add examples and trigger retraining
        `
      }
    }
  }
};

/**
 * Mobile Responsive View
 * Shows the dashboard on smaller screens
 */
export const MobileView: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Dashboard optimized for mobile devices with stacked layout.'
      }
    }
  }
};

/**
 * Dark Mode
 * Shows the dashboard with dark theme
 */
export const DarkMode: Story = {
  args: {
    apiBaseUrl: '/api/finetuning'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    docs: {
      description: {
        story: 'Dashboard with dark theme support.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div className="dark bg-gray-900 min-h-screen">
        <Story />
      </div>
    )
  ]
};
