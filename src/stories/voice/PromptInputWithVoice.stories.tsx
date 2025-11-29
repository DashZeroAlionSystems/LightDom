import type { Meta, StoryObj } from '@storybook/react';
import PromptInput from '../../components/ui/PromptInput';
import { useState } from 'react';

const meta: Meta<typeof PromptInput> = {
  title: 'Components/Voice/PromptInputWithVoice',
  component: PromptInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# PromptInput with Voice Integration

The enhanced PromptInput component with integrated voice capabilities.

## Voice Features
- **Push-to-talk**: Click the microphone to start/stop recording
- **Wake word**: Say "Hey DeepSeek" or "Hello DeepSeek" to activate
- **Text-to-speech**: AI responses are read aloud (configurable)
- **Visual feedback**: Animated microphone states

## Privacy
- Voice is only recorded when explicitly activated
- Wake word detection runs locally in the browser
- Recordings can be auto-deleted after processing

## Configuration
Configure voice behavior through the \`voiceConfig\` prop:
\`\`\`tsx
<PromptInput
  voiceConfig={{
    enabled: true,
    wakeWord: 'hello deepseek',
    wakeWordEnabled: true,
    ttsEnabled: true,
    language: 'en-US',
    silenceTimeout: 3,
  }}
/>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] p-4 bg-background">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PromptInput>;

// Default with voice enabled
export const Default: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      wakeWord: 'hello deepseek',
      wakeWordEnabled: true,
      ttsEnabled: true,
    },
    placeholder: 'Type or click the mic to speak...',
  },
};

// Voice disabled
export const VoiceDisabled: Story = {
  args: {
    voiceConfig: {
      enabled: false,
    },
    placeholder: 'Voice input disabled, type your message...',
  },
  parameters: {
    docs: {
      description: {
        story: 'PromptInput with voice features disabled',
      },
    },
  },
};

// Push-to-talk only (no wake word)
export const PushToTalkOnly: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      wakeWordEnabled: false,
      ttsEnabled: true,
    },
    placeholder: 'Click the mic to speak (no wake word)...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Voice input without wake word detection - requires clicking the button',
      },
    },
  },
};

// TTS disabled
export const NoTextToSpeech: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      wakeWordEnabled: true,
      ttsEnabled: false,
    },
    placeholder: 'Voice input enabled, text-to-speech disabled...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Voice input enabled but responses are not read aloud',
      },
    },
  },
};

// Custom wake word
export const CustomWakeWord: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      wakeWord: 'hey assistant',
      wakeWordEnabled: true,
      ttsEnabled: true,
    },
    placeholder: 'Say "hey assistant" or click the mic...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Using a custom wake word for voice activation',
      },
    },
  },
};

// Different language
export const SpanishLanguage: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      wakeWord: 'hola deepseek',
      language: 'es-ES',
      ttsEnabled: true,
    },
    placeholder: 'Di "hola deepseek" o haz clic en el micrófono...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Voice input configured for Spanish language',
      },
    },
  },
};

// Interactive demo with response
export const InteractiveDemo: Story = {
  render: function InteractivePrompt() {
    const [lastResponse, setLastResponse] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

    const handleSend = (value: string) => {
      setLoading(true);
      setMessages(prev => [...prev, { role: 'user', content: value }]);
      
      // Simulate AI response
      setTimeout(() => {
        const response = `I received your message: "${value}". This is a demo response that would be spoken aloud if TTS is enabled.`;
        setLastResponse(response);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        setLoading(false);
      }, 2000);
    };

    return (
      <div className="space-y-4">
        {/* Messages display */}
        <div className="max-h-[300px] overflow-y-auto space-y-2 p-4 bg-surface-container rounded-lg">
          {messages.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4">
              Start a conversation using text or voice
            </p>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary-container text-on-primary-container ml-8' 
                  : 'bg-secondary-container text-on-secondary-container mr-8'
              }`}>
                <p className="text-xs font-medium mb-1">
                  {msg.role === 'user' ? 'You' : 'DeepSeek'}
                </p>
                <p>{msg.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Prompt input */}
        <PromptInput
          onSend={handleSend}
          loading={loading}
          lastResponse={lastResponse}
          voiceConfig={{
            enabled: true,
            wakeWord: 'hello deepseek',
            wakeWordEnabled: true,
            ttsEnabled: true,
            onVoiceInput: (transcript) => {
              console.log('Voice input:', transcript);
            },
            onWakeWordDetected: (word) => {
              console.log('Wake word detected:', word);
            },
          }}
          placeholder="Type or speak your message..."
          showExamples={false}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Full interactive demo with message history and TTS responses',
      },
    },
  },
};

// Slow TTS speed
export const SlowSpeech: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      ttsEnabled: true,
      ttsRate: 0.75,
    },
    placeholder: 'Responses will be spoken slowly...',
  },
  parameters: {
    docs: {
      description: {
        story: 'TTS configured with slower speaking rate',
      },
    },
  },
};

// Fast TTS speed
export const FastSpeech: Story = {
  args: {
    voiceConfig: {
      enabled: true,
      ttsEnabled: true,
      ttsRate: 1.5,
    },
    placeholder: 'Responses will be spoken quickly...',
  },
  parameters: {
    docs: {
      description: {
        story: 'TTS configured with faster speaking rate',
      },
    },
  },
};
