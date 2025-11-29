/**
 * useTextToSpeech Hook
 * 
 * React hook for text-to-speech functionality using Web Speech API
 * Features:
 * - Multiple voice selection
 * - Speed, pitch, and volume controls
 * - Pause/resume support
 * - Queue management for multiple utterances
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface TTSVoiceOption {
  voiceId: string;
  name: string;
  lang: string;
  isDefault: boolean;
  localService: boolean;
}

export interface TextToSpeechConfig {
  /** Voice ID or name to use */
  voiceId?: string;
  /** Speaking rate (0.1 to 10, default: 1) */
  rate?: number;
  /** Pitch (0 to 2, default: 1) */
  pitch?: number;
  /** Volume (0 to 1, default: 1) */
  volume?: number;
  /** Language (default: "en-US") */
  language?: string;
  /** Callback when speech starts */
  onStart?: () => void;
  /** Callback when speech ends */
  onEnd?: () => void;
  /** Callback when speech is paused */
  onPause?: () => void;
  /** Callback when speech is resumed */
  onResume?: () => void;
  /** Callback on error */
  onError?: (error: string) => void;
  /** Callback during speech with word/sentence progress */
  onProgress?: (charIndex: number, charLength: number) => void;
}

export interface TextToSpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: TTSVoiceOption[];
  selectedVoice: TTSVoiceOption | null;
  error: string | null;
  queueLength: number;
}

export interface TextToSpeechActions {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voiceId: string) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  clearQueue: () => void;
  addToQueue: (text: string) => void;
}

export type UseTextToSpeechReturn = TextToSpeechState & TextToSpeechActions & {
  rate: number;
  pitch: number;
  volume: number;
};

export function useTextToSpeech(config: TextToSpeechConfig = {}): UseTextToSpeechReturn {
  const {
    voiceId,
    rate: initialRate = 1,
    pitch: initialPitch = 1,
    volume: initialVolume = 1,
    language = 'en-US',
    onStart,
    onEnd,
    onPause,
    onResume,
    onError,
    onProgress,
  } = config;

  // State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoiceOption | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRateState] = useState(initialRate);
  const [pitch, setPitchState] = useState(initialPitch);
  const [volume, setVolumeState] = useState(initialVolume);
  const [queueLength, setQueueLength] = useState(0);

  // Refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const queueRef = useRef<string[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const voiceOptions: TTSVoiceOption[] = availableVoices.map((voice) => ({
          voiceId: voice.voiceURI,
          name: voice.name,
          lang: voice.lang,
          isDefault: voice.default,
          localService: voice.localService,
        }));
        
        setVoices(voiceOptions);
        
        // Set initial voice
        if (voiceId) {
          const voice = voiceOptions.find(v => v.voiceId === voiceId || v.name === voiceId);
          if (voice) {
            setSelectedVoice(voice);
          }
        } else if (!selectedVoice) {
          // Default to English voice or first available
          const defaultVoice = voiceOptions.find(v => v.isDefault && v.lang.startsWith('en')) ||
                              voiceOptions.find(v => v.lang.startsWith(language)) ||
                              voiceOptions.find(v => v.lang.startsWith('en')) ||
                              voiceOptions[0];
          if (defaultVoice) {
            setSelectedVoice(defaultVoice);
          }
        }
      };

      // Load voices immediately
      loadVoices();
      
      // Also listen for voices changed event
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        window.speechSynthesis.cancel();
      };
    } else {
      setError('Text-to-speech is not supported in this browser');
    }
  }, [voiceId, language, selectedVoice]);

  // Process queue
  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0 && !isSpeaking) {
      const nextText = queueRef.current.shift();
      setQueueLength(queueRef.current.length);
      if (nextText) {
        speak(nextText);
      }
    }
  }, [isSpeaking]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !isSupported) {
      setError('Speech synthesis not available');
      onError?.('Speech synthesis not available');
      return;
    }

    // Cancel any current speech
    synthRef.current.cancel();
    
    setError(null);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set voice
    if (selectedVoice) {
      const nativeVoice = window.speechSynthesis.getVoices().find(
        v => v.voiceURI === selectedVoice.voiceId || v.name === selectedVoice.name
      );
      if (nativeVoice) {
        utterance.voice = nativeVoice;
      }
    }

    // Set properties
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = language;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      onStart?.();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
      
      // Process queue
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      onPause?.();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      onResume?.();
    };

    utterance.onerror = (event) => {
      const errorMessage = `Speech synthesis error: ${event.error}`;
      setError(errorMessage);
      setIsSpeaking(false);
      setIsPaused(false);
      onError?.(errorMessage);
      
      // Process queue even on error
      setTimeout(() => {
        processQueue();
      }, 100);
    };

    utterance.onboundary = (event) => {
      onProgress?.(event.charIndex, event.charLength || 0);
    };

    // Speak
    synthRef.current.speak(utterance);
  }, [
    isSupported, 
    selectedVoice, 
    rate, 
    pitch, 
    volume, 
    language, 
    onStart, 
    onEnd, 
    onPause, 
    onResume, 
    onError, 
    onProgress,
    processQueue,
  ]);

  // Pause speech
  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking && !isPaused) {
      synthRef.current.pause();
    }
  }, [isSpeaking, isPaused]);

  // Resume speech
  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
    }
  }, [isPaused]);

  // Stop speech
  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  // Set voice
  const setVoice = useCallback((newVoiceId: string) => {
    const voice = voices.find(v => v.voiceId === newVoiceId || v.name === newVoiceId);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);

  // Set rate
  const setRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.1, Math.min(10, newRate));
    setRateState(clampedRate);
  }, []);

  // Set pitch
  const setPitch = useCallback((newPitch: number) => {
    const clampedPitch = Math.max(0, Math.min(2, newPitch));
    setPitchState(clampedPitch);
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    setQueueLength(0);
  }, []);

  // Add to queue
  const addToQueue = useCallback((text: string) => {
    queueRef.current.push(text);
    setQueueLength(queueRef.current.length);
    
    // Start processing if not speaking
    if (!isSpeaking) {
      processQueue();
    }
  }, [isSpeaking, processQueue]);

  return {
    // State
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    selectedVoice,
    error,
    queueLength,
    rate,
    pitch,
    volume,
    
    // Actions
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    clearQueue,
    addToQueue,
  };
}

export default useTextToSpeech;
