/**
 * useVoiceRecording Hook
 * 
 * React hook for voice recording and speech-to-text functionality
 * Features:
 * - Wake word detection ("Hello DeepSeek")
 * - Speech recognition using Web Speech API
 * - Audio recording and playback
 * - Privacy-focused: only listens when activated
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Speech recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface VoiceRecordingConfig {
  /** Wake word to listen for (default: "hello deepseek") */
  wakeWord?: string;
  /** Language for speech recognition (default: "en-US") */
  language?: string;
  /** Whether to enable continuous listening (default: false) */
  continuous?: boolean;
  /** Whether to return interim results (default: true) */
  interimResults?: boolean;
  /** Silence timeout in seconds (default: 3) */
  silenceTimeout?: number;
  /** Maximum recording duration in seconds (default: 60) */
  maxDuration?: number;
  /** Callback when transcript is received */
  onTranscript?: (transcript: string, isFinal: boolean, confidence: number) => void;
  /** Callback when wake word is detected */
  onWakeWordDetected?: (wakeWord: string) => void;
  /** Callback when recording starts */
  onRecordingStart?: () => void;
  /** Callback when recording stops */
  onRecordingStop?: (transcript: string) => void;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

export interface VoiceRecordingState {
  isRecording: boolean;
  isListeningForWakeWord: boolean;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: string | null;
  isSupported: boolean;
  audioLevel: number;
}

export interface VoiceRecordingActions {
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  startWakeWordDetection: () => void;
  stopWakeWordDetection: () => void;
  clearTranscript: () => void;
  reset: () => void;
}

export type UseVoiceRecordingReturn = VoiceRecordingState & VoiceRecordingActions;

const DEFAULT_WAKE_WORDS = [
  'hello deepseek',
  'hey deepseek',
  'hi deepseek',
  'deepseek',
];

export function useVoiceRecording(config: VoiceRecordingConfig = {}): UseVoiceRecordingReturn {
  const {
    wakeWord = 'hello deepseek',
    language = 'en-US',
    continuous = false,
    interimResults = true,
    silenceTimeout = 3,
    maxDuration = 60,
    onTranscript,
    onWakeWordDetected,
    onRecordingStart,
    onRecordingStop,
    onError,
  } = config;

  // State
  const [isRecording, setIsRecording] = useState(false);
  const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const maxDurationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Check for wake word in text
  const checkForWakeWord = useCallback((text: string): boolean => {
    const normalizedText = text.toLowerCase().trim();
    
    // Check configured wake word
    if (normalizedText.includes(wakeWord.toLowerCase())) {
      return true;
    }
    
    // Check default wake words
    return DEFAULT_WAKE_WORDS.some(word => normalizedText.includes(word));
  }, [wakeWord]);

  // Ref to hold the current stopRecording function to avoid circular deps
  const stopRecordingRef = useRef<() => void>(() => {});

  // Reset silence timer
  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      if (isRecording && !isListeningForWakeWord) {
        stopRecordingRef.current();
      }
    }, silenceTimeout * 1000);
  }, [isRecording, isListeningForWakeWord, silenceTimeout]);

  // Create speech recognition instance
  const createRecognition = useCallback((forWakeWord: boolean = false): SpeechRecognition | null => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = forWakeWord || continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setError(null);
      if (!forWakeWord) {
        setIsRecording(true);
        onRecordingStart?.();
        
        // Set max duration timer
        maxDurationTimerRef.current = setTimeout(() => {
          stopRecording();
        }, maxDuration * 1000);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimText = '';
      let resultConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const alternative = result[0];
        
        if (result.isFinal) {
          finalTranscript += alternative.transcript;
          resultConfidence = alternative.confidence;
        } else {
          interimText += alternative.transcript;
        }
      }

      // Update state
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
        setConfidence(resultConfidence);
        
        // Check for wake word when in wake word detection mode
        if (forWakeWord && checkForWakeWord(finalTranscript)) {
          const detectedWakeWord = DEFAULT_WAKE_WORDS.find(w => 
            finalTranscript.toLowerCase().includes(w)
          ) || wakeWord;
          
          onWakeWordDetected?.(detectedWakeWord);
          
          // Stop wake word detection and start recording after a short delay
          recognition.stop();
          setIsListeningForWakeWord(false);
          
          // Use setTimeout to ensure state has updated before starting recording
          setTimeout(() => {
            startRecording();
          }, 50);
        }
        
        onTranscript?.(finalTranscript, true, resultConfidence);
      }
      
      if (interimText) {
        setInterimTranscript(interimText);
        onTranscript?.(interimText, false, 0);
        
        // Check for wake word in interim results too
        if (forWakeWord && checkForWakeWord(interimText)) {
          const detectedWakeWord = DEFAULT_WAKE_WORDS.find(w => 
            interimText.toLowerCase().includes(w)
          ) || wakeWord;
          
          onWakeWordDetected?.(detectedWakeWord);
          recognition.stop();
          setIsListeningForWakeWord(false);
          
          // Use setTimeout to ensure state has updated before starting recording
          setTimeout(() => {
            startRecording();
          }, 50);
        }
      }

      // Reset silence timer on speech
      resetSilenceTimer();
    };

    recognition.onerror = (event: Event & { error: string }) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
      
      if (event.error === 'no-speech' && forWakeWord) {
        // Restart wake word detection
        setTimeout(() => {
          if (isListeningForWakeWord) {
            recognition.start();
          }
        }, 100);
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');
      
      if (forWakeWord && isListeningForWakeWord) {
        // Restart wake word detection
        setTimeout(() => {
          if (isListeningForWakeWord && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // Ignore - might already be started
            }
          }
        }, 100);
      } else if (!forWakeWord) {
        setIsRecording(false);
        
        // Clear timers
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        if (maxDurationTimerRef.current) {
          clearTimeout(maxDurationTimerRef.current);
        }
        
        onRecordingStop?.(transcript);
      }
    };

    recognition.onspeechend = () => {
      if (!forWakeWord && !continuous) {
        recognition.stop();
      }
    };

    return recognition;
  }, [
    language, 
    continuous, 
    interimResults, 
    silenceTimeout, 
    maxDuration,
    wakeWord, 
    checkForWakeWord,
    onTranscript, 
    onWakeWordDetected, 
    onRecordingStart, 
    onRecordingStop, 
    onError,
    resetSilenceTimer,
    isListeningForWakeWord,
    transcript,
  ]);

  // Start recording
  const startRecording = useCallback(() => {
    if (isRecording) return;
    
    // Clear previous transcript
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);

    const recognition = createRecognition(false);
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        setError('Failed to start speech recognition');
        onError?.('Failed to start speech recognition');
      }
    }
  }, [isRecording, createRecognition, onError]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimTranscript('');
    
    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
    }
  }, []);

  // Update the ref whenever stopRecording changes
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Start wake word detection
  const startWakeWordDetection = useCallback(() => {
    if (isListeningForWakeWord) return;
    
    setIsListeningForWakeWord(true);
    setError(null);

    const recognition = createRecognition(true);
    if (recognition) {
      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {
        setError('Failed to start wake word detection');
        setIsListeningForWakeWord(false);
        onError?.('Failed to start wake word detection');
      }
    }
  }, [isListeningForWakeWord, createRecognition, onError]);

  // Stop wake word detection
  const stopWakeWordDetection = useCallback(() => {
    setIsListeningForWakeWord(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
  }, []);

  // Reset everything
  const reset = useCallback(() => {
    stopRecording();
    stopWakeWordDetection();
    clearTranscript();
    setError(null);
    setAudioLevel(0);
  }, [stopRecording, stopWakeWordDetection, clearTranscript]);

  return {
    // State
    isRecording,
    isListeningForWakeWord,
    transcript,
    interimTranscript,
    confidence,
    error,
    isSupported,
    audioLevel,
    
    // Actions
    startRecording,
    stopRecording,
    toggleRecording,
    startWakeWordDetection,
    stopWakeWordDetection,
    clearTranscript,
    reset,
  };
}

export default useVoiceRecording;
