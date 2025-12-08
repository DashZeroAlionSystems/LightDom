/**
 * Storybook Stories for ModelParameterForm Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import ModelParameterForm from '../../components/ollama/ModelParameterForm';

const meta: Meta<typeof ModelParameterForm> = {
  title: 'Ollama/ModelParameterForm',
  component: ModelParameterForm,
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
# Model Parameter Form

A comprehensive form for adjusting Ollama model inference parameters.

## Features

### Parameter Categories
- **Sampling Parameters**: temperature, top_p, top_k, repeat_penalty
- **Mirostat Sampling**: Advanced adaptive sampling controls
- **Generation Settings**: max tokens, context window, seed
- **Performance Settings**: CPU threads, GPU layers, batch size
- **Advanced Parameters**: tail-free sampling, typical sampling, penalties

### Quick Presets
- **Creative**: High creativity for storytelling (temp: 1.2)
- **Balanced**: Default settings for general use (temp: 0.8)
- **Precise**: Low randomness for factual content (temp: 0.3)
- **Deterministic**: Minimal randomness (temp: 0)
- **Code**: Optimized for code generation (temp: 0.2)

### Interactive Controls
- Sliders with value input for precise control
- Visual markers showing recommended ranges
- Modified parameter indicators
- Dependency-aware visibility (e.g., Mirostat eta only when Mirostat enabled)

### Export Options
- View current configuration as JSON
- Copy to clipboard for API calls
- Reset to defaults

## Parameters Reference

### Sampling Parameters
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| temperature | 0-2 | 0.8 | Controls randomness |
| top_p | 0-1 | 0.9 | Nucleus sampling threshold |
| top_k | 0-100 | 40 | Top-k sampling |
| repeat_penalty | 0.5-2 | 1.1 | Penalizes repetition |

### Generation Settings
| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| num_predict | -1-4096 | 128 | Max tokens to generate |
| num_ctx | 128-131072 | 2048 | Context window size |
| seed | -1-max | -1 | Random seed |

## Usage

\`\`\`tsx
import { ModelParameterForm } from './components/ollama';

function App() {
  return (
    <ModelParameterForm
      initialValues={{ temperature: 0.7, top_p: 0.9 }}
      onChange={(params) => console.log('Changed:', params)}
      onSave={(params) => console.log('Saved:', params)}
      showPresets={true}
    />
  );
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModelParameterForm>;

/**
 * Default form with all parameters
 */
export const Default: Story = {
  args: {
    onSave: (params) => console.log('Saved:', params),
    onChange: (params) => console.log('Changed:', params),
  },
};

/**
 * Form with custom initial values
 */
export const WithInitialValues: Story = {
  args: {
    initialValues: {
      temperature: 0.5,
      top_p: 0.85,
      top_k: 30,
      repeat_penalty: 1.15,
      num_predict: 256,
      num_ctx: 4096,
    },
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Form pre-filled with custom parameter values.',
      },
    },
  },
};

/**
 * Compact view with essential parameters only
 */
export const Compact: Story = {
  args: {
    compact: true,
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact view showing only essential parameters (temperature, top_p, max tokens, context).',
      },
    },
  },
};

/**
 * Without presets
 */
export const NoPresets: Story = {
  args: {
    showPresets: false,
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Form without the quick presets section.',
      },
    },
  },
};

/**
 * Only sampling parameters
 */
export const SamplingOnly: Story = {
  args: {
    categories: ['sampling'],
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows only sampling parameters (temperature, top_p, top_k, etc.).',
      },
    },
  },
};

/**
 * Generation and performance settings
 */
export const GenerationAndPerformance: Story = {
  args: {
    categories: ['generation', 'performance'],
    showPresets: false,
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows generation and performance categories only.',
      },
    },
  },
};

/**
 * All categories including advanced
 */
export const AllCategories: Story = {
  args: {
    categories: ['sampling', 'mirostat', 'generation', 'performance', 'advanced'],
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows all parameter categories including advanced settings.',
      },
    },
  },
};

/**
 * Read-only mode
 */
export const ReadOnly: Story = {
  args: {
    initialValues: {
      temperature: 0.7,
      top_p: 0.9,
      num_predict: 256,
    },
    readOnly: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Read-only mode for viewing configurations without editing.',
      },
    },
  },
};

/**
 * Creative writing preset
 */
export const CreativePreset: Story = {
  args: {
    initialValues: {
      temperature: 1.2,
      top_p: 0.95,
      top_k: 50,
      repeat_penalty: 1.05,
      num_predict: 1024,
    },
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured with Creative preset values for storytelling.',
      },
    },
  },
};

/**
 * Code generation preset
 */
export const CodePreset: Story = {
  args: {
    initialValues: {
      temperature: 0.2,
      top_p: 0.8,
      top_k: 30,
      repeat_penalty: 1.15,
      num_ctx: 8192,
      num_predict: 512,
    },
    categories: ['sampling', 'generation'],
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pre-configured for code generation with larger context window.',
      },
    },
  },
};

/**
 * With Mirostat enabled
 */
export const WithMirostat: Story = {
  args: {
    initialValues: {
      mirostat: 2,
      mirostat_eta: 0.1,
      mirostat_tau: 5.0,
    },
    categories: ['sampling', 'mirostat'],
    onSave: (params) => console.log('Saved:', params),
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows Mirostat v2 enabled with its dependent parameters visible.',
      },
    },
  },
};

/**
 * Interactive with all callbacks
 */
export const Interactive: Story = {
  args: {
    onSave: (params) => {
      console.log('=== SAVED ===');
      console.log(JSON.stringify(params, null, 2));
      alert('Parameters saved! Check console for values.');
    },
    onChange: (params) => {
      console.log('Parameters changed');
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive form with save callback showing alert.',
      },
    },
  },
};
