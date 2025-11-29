import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Send, Sparkles, FileText, Image as ImageIcon, Code, Search, X } from 'lucide-react';
import { Button } from './Button';
import { VoiceButton, type VoiceButtonState } from './VoiceButton';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

export interface VoiceConfig {
  /** Enable voice input */
  enabled?: boolean;
  /** Wake word for hands-free activation */
  wakeWord?: string;
  /** Enable wake word detection */
  wakeWordEnabled?: boolean;
  /** Enable text-to-speech for responses */
  ttsEnabled?: boolean;
  /** TTS voice ID */
  ttsVoiceId?: string;
  /** TTS speaking rate */
  ttsRate?: number;
  /** TTS pitch */
  ttsPitch?: number;
  /** Language for speech recognition */
  language?: string;
  /** Auto-stop silence timeout in seconds */
  silenceTimeout?: number;
  /** Callback when wake word is detected */
  onWakeWordDetected?: (wakeWord: string) => void;
  /** Callback when voice input is received */
  onVoiceInput?: (transcript: string) => void;
  /** Callback when TTS starts speaking */
  onSpeakStart?: () => void;
  /** Callback when TTS stops speaking */
  onSpeakEnd?: () => void;
}

export interface PromptInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: (value: string, context?: string) => void;
  loading?: boolean;
  showExamples?: boolean;
  maxLength?: number;
  aiModel?: string;
  onModelChange?: (model: string) => void;
  supportedModels?: string[];
  /** Enable codebase context integration */
  enableCodebaseContext?: boolean;
  /** Callback when codebase context is requested */
  onCodebaseContextRequest?: (query: string) => Promise<{ context: string; files: string[] } | null>;
  /** Voice configuration */
  voiceConfig?: VoiceConfig;
  /** Last AI response (for TTS) */
  lastResponse?: string;
}

export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  ({ 
    onSend, 
    loading = false, 
    showExamples = true,
    maxLength = 2000,
    aiModel = 'deepseek-r1',
    onModelChange,
    supportedModels = ['deepseek-r1', 'gpt-4', 'claude-3'],
    className,
    placeholder = 'Describe your workflow... (e.g., "I want to mine data from tech blogs and analyze their SEO strategies")',
    voiceConfig = {},
    lastResponse,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState('');
    const [charCount, setCharCount] = React.useState(0);
    const [voiceState, setVoiceState] = useState<VoiceButtonState>('idle');
    
    // Voice configuration with defaults
    const {
      enabled: voiceEnabled = true,
      wakeWord = 'hello deepseek',
      wakeWordEnabled = true,
      ttsEnabled = true,
      ttsVoiceId,
      ttsRate = 1,
      ttsPitch = 1,
      language = 'en-US',
      silenceTimeout = 3,
      onWakeWordDetected,
      onVoiceInput,
      onSpeakStart,
      onSpeakEnd,
    } = voiceConfig;

    // Voice recording hook
    const voiceRecording = useVoiceRecording({
      wakeWord,
      language,
      silenceTimeout,
      onTranscript: (transcript, isFinal, confidence) => {
        if (isFinal && transcript.trim()) {
          setValue(prev => (prev + ' ' + transcript).trim());
          setCharCount(prev => Math.min(prev + transcript.length, maxLength));
          onVoiceInput?.(transcript);
        }
      },
      onWakeWordDetected: (detected) => {
        console.log('🎤 Wake word detected:', detected);
        setVoiceState('recording');
        onWakeWordDetected?.(detected);
      },
      onRecordingStart: () => {
        setVoiceState('recording');
      },
      onRecordingStop: (transcript) => {
        setVoiceState('idle');
        if (transcript.trim()) {
          // Auto-send after voice input ends
          const trimmedValue = (value + ' ' + transcript).trim();
          if (trimmedValue && !loading) {
            onSend?.(trimmedValue);
            setValue('');
            setCharCount(0);
          }
        }
      },
      onError: (error) => {
        console.error('Voice recording error:', error);
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 3000);
      },
    });

    // Text-to-speech hook
    const tts = useTextToSpeech({
      voiceId: ttsVoiceId,
      rate: ttsRate,
      pitch: ttsPitch,
      language,
      onStart: () => {
        setVoiceState('speaking');
        onSpeakStart?.();
      },
      onEnd: () => {
        setVoiceState('idle');
        onSpeakEnd?.();
      },
      onError: (error) => {
        console.error('TTS error:', error);
        setVoiceState('error');
        setTimeout(() => setVoiceState('idle'), 3000);
      },
    });

    // Speak the last response when it changes
    useEffect(() => {
      if (ttsEnabled && lastResponse && !loading) {
        tts.speak(lastResponse);
      }
    }, [lastResponse, ttsEnabled, loading]);

    // Handle voice button click
    const handleVoiceClick = useCallback(() => {
      if (!voiceRecording.isSupported) {
        console.error('Voice recording not supported');
        return;
      }

      if (voiceRecording.isRecording) {
        voiceRecording.stopRecording();
        setVoiceState('idle');
      } else if (voiceRecording.isListeningForWakeWord) {
        voiceRecording.stopWakeWordDetection();
        setVoiceState('idle');
      } else if (tts.isSpeaking) {
        tts.stop();
        setVoiceState('idle');
      } else {
        // Start recording directly (push-to-talk mode)
        voiceRecording.startRecording();
        setVoiceState('recording');
      }
    }, [voiceRecording, tts]);

    // Handle long press for wake word mode (optional)
    const handleVoiceLongPress = useCallback(() => {
      if (wakeWordEnabled && !voiceRecording.isListeningForWakeWord) {
        voiceRecording.startWakeWordDetection();
        setVoiceState('listening');
      }
    }, [wakeWordEnabled, voiceRecording]);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      if (newValue.length <= maxLength) {
        setValue(newValue);
        setCharCount(newValue.length);
      }
    };

    const handleSend = () => {
      if (value.trim() && !loading) {
        onSend?.(value);
        setValue('');
        setCharCount(0);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    };

    const examplePrompts = [
      'Create a data mining workflow for competitor analysis',
      'Build an SEO optimization pipeline with content generation',
      'Set up automated social media monitoring and reporting',
    ];

    return (
      <div className="w-full space-y-4">
        {/* Example prompts */}
        {showExamples && value.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-on-surface-variant font-medium">Example prompts:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, i) => (
                <button
                  key={i}
                  onClick={() => setValue(example)}
                  className="text-left text-xs rounded-full border border-outline px-3 py-1.5 hover:bg-surface-container-highest transition-colors text-on-surface-variant hover:text-on-surface"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main prompt box */}
        <div className="relative rounded-3xl border-2 border-outline bg-surface shadow-level-1 focus-within:border-primary focus-within:shadow-level-2 transition-all">
          <textarea
            ref={(node) => {
              textareaRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className={cn(
              'w-full resize-none bg-transparent px-6 py-4 text-base text-on-surface placeholder:text-on-surface-variant',
              'focus:outline-none min-h-[120px] max-h-[400px]',
              'overflow-y-auto',
              className
            )}
            {...props}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Model selector */}
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Sparkles className="h-4 w-4" />
                <select
                  value={aiModel}
                  onChange={(e) => onModelChange?.(e.target.value)}
                  className="bg-transparent border border-outline rounded-lg px-2 py-1 text-on-surface focus:outline-none focus:border-primary"
                  disabled={loading}
                >
                  {supportedModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attachment buttons (not implemented) */}
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                  title="Attach file (not implemented)"
                  disabled
                >
                  <FileText className="h-4 w-4" />
                </button>
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                  title="Attach image (not implemented)"
                  disabled
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Voice button */}
              {voiceEnabled && voiceRecording.isSupported && (
                <VoiceButton
                  state={voiceState}
                  onClick={handleVoiceClick}
                  size="sm"
                  disabled={loading}
                  title={
                    voiceState === 'idle' 
                      ? 'Click to speak (or say "Hey DeepSeek")' 
                      : voiceState === 'listening'
                      ? 'Listening for wake word...'
                      : voiceState === 'recording'
                      ? 'Recording... Click to stop'
                      : voiceState === 'speaking'
                      ? 'Speaking... Click to stop'
                      : 'Voice input'
                  }
                />
              )}
              
              {/* Interim transcript display */}
              {voiceRecording.interimTranscript && (
                <span className="text-xs text-on-surface-variant italic max-w-[150px] truncate">
                  {voiceRecording.interimTranscript}...
                </span>
              )}
              
              {/* Character count */}
              <span className={cn(
                'text-xs',
                charCount > maxLength * 0.9 ? 'text-warning' : 'text-on-surface-variant'
              )}>
                {charCount}/{maxLength}
              </span>

              {/* Send button */}
              <Button
                variant="filled"
                size="sm"
                onClick={handleSend}
                disabled={!value.trim() || loading}
                isLoading={loading}
                className="gap-2"
              >
                {loading ? 'Generating...' : 'Send'}
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard and voice hints */}
        <p className="text-xs text-on-surface-variant text-center">
          Press <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline text-xs">
            {typeof navigator !== 'undefined' && navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter
          </kbd> to send
          {voiceEnabled && voiceRecording.isSupported && (
            <span className="ml-2">
              • Say <span className="font-medium text-primary">"Hey DeepSeek"</span> for voice input
            </span>
          )}
        </p>
      </div>
    );
  }
);

PromptInput.displayName = 'PromptInput';

export default PromptInput;
