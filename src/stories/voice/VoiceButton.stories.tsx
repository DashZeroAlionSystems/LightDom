import type { Meta, StoryObj } from '@storybook/react';
import { VoiceButton, type VoiceButtonState } from '../../components/ui/VoiceButton';
import { useState } from 'react';

const meta: Meta<typeof VoiceButton> = {
  title: 'Components/Voice/VoiceButton',
  component: VoiceButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# VoiceButton Component

An interactive voice recording button with animated states.

## Features
- **Idle**: Standard microphone icon
- **Listening**: Pulsing animation for wake word detection
- **Recording**: Active recording with audio wave animation
- **Processing**: Spinning animation while waiting for response
- **Speaking**: Gentle pulse during TTS playback
- **Error**: Shake animation for error states

## Usage with DeepSeek

The VoiceButton integrates with the voice streaming service to enable:
- Wake word detection ("Hey DeepSeek", "Hello DeepSeek")
- Push-to-talk voice input
- Visual feedback during voice interactions
        `,
      },
    },
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'listening', 'recording', 'processing', 'speaking', 'error'],
      description: 'Current state of the voice button',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    showStatus: {
      control: 'boolean',
      description: 'Whether to show status text below the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VoiceButton>;

// Default idle state
export const Idle: Story = {
  args: {
    state: 'idle',
    size: 'md',
    showStatus: true,
  },
};

// Listening for wake word
export const Listening: Story = {
  args: {
    state: 'listening',
    size: 'md',
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Pulsing animation when listening for the wake word "Hey DeepSeek"',
      },
    },
  },
};

// Actively recording
export const Recording: Story = {
  args: {
    state: 'recording',
    size: 'md',
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Active recording state with audio wave animation',
      },
    },
  },
};

// Processing voice input
export const Processing: Story = {
  args: {
    state: 'processing',
    size: 'md',
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Spinning animation while DeepSeek processes the voice input',
      },
    },
  },
};

// Speaking (TTS output)
export const Speaking: Story = {
  args: {
    state: 'speaking',
    size: 'md',
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Gentle pulse animation during text-to-speech playback',
      },
    },
  },
};

// Error state
export const Error: Story = {
  args: {
    state: 'error',
    size: 'md',
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state with shake animation',
      },
    },
  },
};

// Size variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <VoiceButton state="idle" size="sm" showStatus />
      <VoiceButton state="idle" size="md" showStatus />
      <VoiceButton state="idle" size="lg" showStatus />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Available size variants: small, medium, and large',
      },
    },
  },
};

// All states overview
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6">
      <VoiceButton state="idle" showStatus />
      <VoiceButton state="listening" showStatus />
      <VoiceButton state="recording" showStatus />
      <VoiceButton state="processing" showStatus />
      <VoiceButton state="speaking" showStatus />
      <VoiceButton state="error" showStatus />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all available states',
      },
    },
  },
};

// Interactive demo
export const Interactive: Story = {
  render: function InteractiveDemo() {
    const states: VoiceButtonState[] = ['idle', 'listening', 'recording', 'processing', 'speaking', 'idle'];
    const [stateIndex, setStateIndex] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    const simulateConversation = () => {
      if (isRunning) return;
      setIsRunning(true);
      setStateIndex(0);
      
      const delays = [0, 1500, 1000, 2000, 3000, 4000];
      
      delays.forEach((delay, index) => {
        setTimeout(() => {
          setStateIndex(index);
          if (index === delays.length - 1) {
            setIsRunning(false);
          }
        }, delay);
      });
    };

    return (
      <div className="flex flex-col items-center gap-6">
        <VoiceButton 
          state={states[stateIndex]} 
          size="lg" 
          showStatus 
          onClick={simulateConversation}
        />
        <p className="text-sm text-on-surface-variant">
          {isRunning ? 'Simulating voice conversation...' : 'Click to simulate a voice interaction'}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo that simulates a full voice conversation flow',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    state: 'idle',
    size: 'md',
    disabled: true,
    showStatus: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state for when voice input is not available',
      },
    },
  },
};
