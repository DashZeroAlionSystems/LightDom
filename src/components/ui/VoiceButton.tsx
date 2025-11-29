/**
 * VoiceButton Component
 * 
 * Interactive microphone button with anime.js animations
 * Features:
 * - Morphing icon states (idle, listening, recording, processing)
 * - Pulsing animation when listening for wake word
 * - Audio wave animation when recording
 * - Loading animation when processing
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import anime from 'animejs';

export type VoiceButtonState = 'idle' | 'listening' | 'recording' | 'processing' | 'speaking' | 'error';

export interface VoiceButtonProps {
  /** Current state of the voice button */
  state: VoiceButtonState;
  /** Callback when button is clicked */
  onClick?: () => void;
  /** Size of the button */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Tooltip text */
  title?: string;
  /** Whether to show status text */
  showStatus?: boolean;
}

const STATUS_LABELS: Record<VoiceButtonState, string> = {
  idle: 'Click to speak',
  listening: 'Listening for "Hey DeepSeek"...',
  recording: 'Recording...',
  processing: 'Processing...',
  speaking: 'Speaking...',
  error: 'Error - Click to retry',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const ICON_SIZES = {
  sm: 16,
  md: 20,
  lg: 24,
};

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  state = 'idle',
  onClick,
  size = 'md',
  disabled = false,
  className,
  title,
  showStatus = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const wavesRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<anime.AnimeInstance | null>(null);
  
  const [prevState, setPrevState] = useState<VoiceButtonState>(state);

  // Cleanup animation on state change
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
    
    if (state !== prevState) {
      animateStateChange(prevState, state);
      setPrevState(state);
    }
    
    // Start continuous animation for active states
    startContinuousAnimation(state);
    
    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [state, prevState]);

  // Animate state change
  const animateStateChange = (from: VoiceButtonState, to: VoiceButtonState) => {
    if (!buttonRef.current) return;

    // Button scale animation
    anime({
      targets: buttonRef.current,
      scale: [1, 1.1, 1],
      duration: 300,
      easing: 'easeOutElastic(1, 0.5)',
    });

    // Icon morph animation
    if (svgRef.current) {
      const icon = svgRef.current.querySelector('.mic-icon');
      if (icon) {
        anime({
          targets: icon,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 200,
          easing: 'easeOutQuad',
        });
      }
    }
  };

  // Start continuous animation based on state
  const startContinuousAnimation = (currentState: VoiceButtonState) => {
    if (!buttonRef.current) return;

    switch (currentState) {
      case 'listening':
        // Gentle pulsing animation for wake word listening
        animationRef.current = anime({
          targets: buttonRef.current,
          boxShadow: [
            '0 0 0 0 rgba(88, 101, 242, 0.4)',
            '0 0 0 12px rgba(88, 101, 242, 0)',
          ],
          duration: 1500,
          easing: 'easeOutQuad',
          loop: true,
        });
        break;

      case 'recording':
        // Active recording - faster pulse with color change
        animationRef.current = anime({
          targets: buttonRef.current,
          boxShadow: [
            '0 0 0 0 rgba(237, 66, 69, 0.6)',
            '0 0 0 16px rgba(237, 66, 69, 0)',
          ],
          duration: 800,
          easing: 'easeOutQuad',
          loop: true,
        });
        
        // Animate audio waves
        if (wavesRef.current) {
          const waves = wavesRef.current.querySelectorAll('.wave-bar');
          anime({
            targets: waves,
            scaleY: () => anime.random(0.3, 1),
            duration: 150,
            easing: 'easeInOutSine',
            loop: true,
            direction: 'alternate',
            delay: anime.stagger(50),
          });
        }
        break;

      case 'processing':
        // Spinning/thinking animation
        if (svgRef.current) {
          const icon = svgRef.current.querySelector('.mic-icon');
          animationRef.current = anime({
            targets: icon,
            rotate: 360,
            duration: 1000,
            easing: 'linear',
            loop: true,
          });
        }
        break;

      case 'speaking':
        // Subtle pulse when AI is speaking
        animationRef.current = anime({
          targets: buttonRef.current,
          boxShadow: [
            '0 0 0 0 rgba(59, 165, 92, 0.4)',
            '0 0 0 8px rgba(59, 165, 92, 0)',
          ],
          duration: 1000,
          easing: 'easeOutQuad',
          loop: true,
        });
        break;

      case 'error':
        // Error shake animation
        anime({
          targets: buttonRef.current,
          translateX: [-4, 4, -4, 4, 0],
          duration: 400,
          easing: 'easeInOutSine',
        });
        break;

      default:
        // Idle - no continuous animation
        break;
    }
  };

  // Get button colors based on state
  const getButtonColors = () => {
    switch (state) {
      case 'listening':
        return 'bg-primary hover:bg-primary/90 text-on-primary';
      case 'recording':
        return 'bg-error hover:bg-error/90 text-on-error animate-pulse';
      case 'processing':
        return 'bg-secondary-container text-on-secondary-container';
      case 'speaking':
        return 'bg-success hover:bg-success/90 text-white';
      case 'error':
        return 'bg-error-container text-on-error-container';
      default:
        return 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface';
    }
  };

  // Render the appropriate icon
  const renderIcon = () => {
    const iconSize = ICON_SIZES[size];
    
    switch (state) {
      case 'listening':
        return (
          <svg 
            ref={svgRef}
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="mic-icon"
          >
            {/* Microphone with waves */}
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
            {/* Sound waves */}
            <path d="M8 8a4 4 0 0 1 8 0" opacity="0.5" />
            <path d="M5 6a8 8 0 0 1 14 0" opacity="0.3" />
          </svg>
        );

      case 'recording':
        return (
          <div className="relative flex items-center justify-center">
            <svg 
              ref={svgRef}
              width={iconSize} 
              height={iconSize} 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="mic-icon"
            >
              {/* Filled microphone */}
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
            </svg>
            {/* Audio wave bars */}
            <div 
              ref={wavesRef}
              className="absolute -right-1 flex gap-0.5 items-end h-3"
            >
              <div className="wave-bar w-0.5 h-full bg-current rounded-full" />
              <div className="wave-bar w-0.5 h-2/3 bg-current rounded-full" />
              <div className="wave-bar w-0.5 h-full bg-current rounded-full" />
            </div>
          </div>
        );

      case 'processing':
        return (
          <svg 
            ref={svgRef}
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="mic-icon"
          >
            {/* Loading spinner */}
            <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        );

      case 'speaking':
        return (
          <svg 
            ref={svgRef}
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="mic-icon"
          >
            {/* Speaker icon */}
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        );

      case 'error':
        return (
          <svg 
            ref={svgRef}
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="mic-icon"
          >
            {/* Microphone with X */}
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <svg 
            ref={svgRef}
            width={iconSize} 
            height={iconSize} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="mic-icon"
          >
            {/* Standard microphone */}
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        );
    }
  };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        title={title || STATUS_LABELS[state]}
        className={cn(
          SIZE_CLASSES[size],
          'relative rounded-full flex items-center justify-center',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          getButtonColors(),
          className
        )}
        aria-label={STATUS_LABELS[state]}
        role="button"
      >
        {renderIcon()}
      </button>
      
      {showStatus && (
        <span className={cn(
          'text-xs text-on-surface-variant',
          state === 'error' && 'text-error'
        )}>
          {STATUS_LABELS[state]}
        </span>
      )}
    </div>
  );
};

VoiceButton.displayName = 'VoiceButton';

export default VoiceButton;
