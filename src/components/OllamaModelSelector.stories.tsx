/**
 * Storybook Stories for Ollama Model Selector
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import OllamaModelSelector from './OllamaModelSelector';
import axios from 'axios';

// Mock axios
const mockAxios = {
  get: async (url: string) => {
    console.log('Mock GET:', url);
    
    if (url.includes('/api/ollama/models')) {
      return {
        data: {
          models: [
            { name: 'llama2:7b', size: '3.8GB' },
            { name: 'phi:2.7b', size: '1.6GB' }
          ]
        }
      };
    }
    
    if (url.includes('/api/system/specs')) {
      return {
        data: {
          totalRAM: 8,
          availableRAM: 4,
          cpu: 'Intel Core i5-8250U',
          benchmark: {
            cpuScore: 65,
            ramScore: 50,
            overallScore: 58
          }
        }
      };
    }
    
    return { data: {} };
  },
  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data);
    
    if (url.includes('/api/ollama/pull')) {
      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 5000));
      return { data: { success: true } };
    }
    
    return { data: { success: true } };
  }
};

Object.assign(axios, mockAxios);

const meta: Meta<typeof OllamaModelSelector> = {
  title: 'AI/OllamaModelSelector',
  component: OllamaModelSelector,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Ollama Model Selector

Complete UI for selecting, downloading, and managing Ollama AI models with intelligent recommendations based on system specifications.

## Features

### System Benchmarking
- Automatic RAM detection
- CPU identification
- Performance scoring
- Compatibility checking

### Intelligent Recommendations
- Models highlighted based on system specs
- Score calculation considers:
  - RAM compatibility (40%)
  - Performance metrics (30%)
  - Size efficiency (20%)
  - Popularity (10%)

### Model Management
- Download models directly from UI
- Progress tracking
- Mark downloaded models
- Quick selection for use

### Filtering & Search
- Search by name, description, use case
- Filter by size (≤2GB, ≤4GB, ≤8GB)
- Automatic sorting by recommendation score

### Model Details
- Comprehensive specifications
- Performance metrics (speed, quality, efficiency)
- Use case tags
- RAM requirements
- Compatibility alerts

## Recommendation Levels

- **Highly Recommended** (80-100): Best match for your system
- **Recommended** (60-79): Good compatibility
- **Compatible** (40-59): Will work but may be slow
- **Not Recommended** (0-39): May have issues

## Models Included

### Lightweight (≤2GB)
- **phi:2.7b** (1.6GB) - Microsoft Phi-2, excellent for limited RAM
- **orca-mini:3b** (1.9GB) - Very lightweight, good for testing

### Standard (≤4GB)
- **llama2:7b** (3.8GB) - Meta's Llama 2, balanced performance
- **mistral:7b** (4.1GB) - Excellent quality for size
- **deepseek-coder:6.7b** (3.8GB) - Specialized for code
- **codellama:7b** (3.8GB) - Meta's code generation model
- **neural-chat:7b** (4.1GB) - Conversational AI
- **starling-lm:7b** (4.1GB) - RLHF trained
- **vicuna:7b** (3.8GB) - Chat optimized

### Large (>4GB)
- **llama2:13b** (7.3GB) - Higher quality, needs more RAM

## Usage

\`\`\`tsx
import OllamaModelSelector from './components/OllamaModelSelector';

function App() {
  const handleModelSelect = (model) => {
    console.log('Selected model:', model);
    // Use the model for inference
  };

  const systemSpecs = {
    totalRAM: 8,
    availableRAM: 4,
    cpu: 'Intel Core i5',
    benchmark: {
      cpuScore: 65,
      ramScore: 50,
      overallScore: 58
    }
  };

  return (
    <OllamaModelSelector
      onModelSelect={handleModelSelect}
      systemSpecs={systemSpecs}
    />
  );
}
\`\`\`

## API Requirements

### GET /api/ollama/models
Returns list of downloaded models

### POST /api/ollama/pull
Downloads a model by name

### GET /api/system/specs
Returns system specifications and benchmark scores
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof OllamaModelSelector>;

/**
 * Default view with 4GB system
 */
export const Default: Story = {
  args: {
    systemSpecs: {
      totalRAM: 8,
      availableRAM: 4,
      cpu: 'Intel Core i5-8250U',
      benchmark: {
        cpuScore: 65,
        ramScore: 50,
        overallScore: 58
      }
    }
  },
};

/**
 * High-end system with 16GB RAM
 */
export const HighEndSystem: Story = {
  args: {
    systemSpecs: {
      totalRAM: 16,
      availableRAM: 12,
      cpu: 'AMD Ryzen 9 5900X',
      gpu: 'NVIDIA RTX 3080',
      benchmark: {
        cpuScore: 95,
        ramScore: 90,
        overallScore: 93
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'High-end system can run all models with excellent recommendations for larger models.',
      },
    },
  },
};

/**
 * Low-end system with 2GB RAM
 */
export const LowEndSystem: Story = {
  args: {
    systemSpecs: {
      totalRAM: 4,
      availableRAM: 2,
      cpu: 'Intel Celeron N3350',
      benchmark: {
        cpuScore: 30,
        ramScore: 25,
        overallScore: 28
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Low-end system highlights only lightweight models (Phi-2, Orca-Mini).',
      },
    },
  },
};

/**
 * With model selection callback
 */
export const WithCallback: Story = {
  args: {
    onModelSelect: (model) => {
      console.log('Model selected:', model);
      alert(`Selected: ${model.name}\nSize: ${model.size}\nUse for: ${model.useCase.join(', ')}`);
    },
    systemSpecs: {
      totalRAM: 8,
      availableRAM: 4,
      cpu: 'Intel Core i5',
      benchmark: {
        cpuScore: 65,
        ramScore: 50,
        overallScore: 58
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the onModelSelect callback when a model is chosen.',
      },
    },
  },
};

/**
 * Without system specs (auto-detect mode)
 */
export const AutoDetect: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Component will automatically detect system specs via API.',
      },
    },
  },
};
