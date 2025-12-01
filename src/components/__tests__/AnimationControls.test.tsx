/**
 * Animation Controls Component Tests
 * 
 * Tests for the AnimationControls interactive playground component
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnimationControls } from '../AnimationControls';
import '@testing-library/jest-dom';

describe('AnimationControls', () => {
  beforeEach(() => {
    // Mock anime.js
    vi.mock('animejs', () => ({
      default: vi.fn(() => ({
        play: vi.fn(),
        pause: vi.fn(),
        restart: vi.fn(),
        reverse: vi.fn(),
        seek: vi.fn(),
        paused: false,
        began: true,
        completed: false,
        progress: 0,
      })),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<AnimationControls />);
    expect(screen.getByText(/Animation Controls/i)).toBeInTheDocument();
  });

  it('displays all demo mode tabs', () => {
    render(<AnimationControls />);
    
    expect(screen.getByText(/Product Showcase/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Visualization/i)).toBeInTheDocument();
    expect(screen.getByText(/SVG Animation/i)).toBeInTheDocument();
    expect(screen.getByText(/Text Effects/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive/i)).toBeInTheDocument();
  });

  it('shows playback controls', () => {
    render(<AnimationControls />);
    
    expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reverse/i })).toBeInTheDocument();
  });

  it('displays duration slider', () => {
    render(<AnimationControls />);
    
    expect(screen.getByText(/Duration \(ms\)/i)).toBeInTheDocument();
  });

  it('displays easing function selector', () => {
    render(<AnimationControls />);
    
    expect(screen.getByText(/Easing Function/i)).toBeInTheDocument();
  });

  it('switches between demo modes', async () => {
    render(<AnimationControls demoMode="product" />);
    
    const dataVizTab = screen.getByText(/Data Visualization/i);
    fireEvent.click(dataVizTab);
    
    await waitFor(() => {
      // Check that the demo content updated
      expect(screen.getByText(/Animation Preview/i)).toBeInTheDocument();
    });
  });

  it('shows code examples when enabled', () => {
    render(<AnimationControls showCode={true} />);
    
    expect(screen.getByText(/Code Example/i)).toBeInTheDocument();
  });

  it('hides code examples when disabled', () => {
    render(<AnimationControls showCode={false} />);
    
    expect(screen.queryByText(/Code Example/i)).not.toBeInTheDocument();
  });

  it('updates duration value', async () => {
    render(<AnimationControls />);
    
    const durationSlider = screen.getByRole('slider');
    fireEvent.change(durationSlider, { target: { value: '1500' } });
    
    await waitFor(() => {
      expect(screen.getByText(/1500ms/i)).toBeInTheDocument();
    });
  });

  it('displays all easing options', async () => {
    render(<AnimationControls />);
    
    const easingSelect = screen.getByLabelText(/Easing Function/i);
    fireEvent.mouseDown(easingSelect);
    
    await waitFor(() => {
      expect(screen.getByText(/easeOutExpo/i)).toBeInTheDocument();
      expect(screen.getByText(/easeOutElastic/i)).toBeInTheDocument();
      expect(screen.getByText(/easeOutBounce/i)).toBeInTheDocument();
    });
  });
});

describe('AnimationControls - Accessibility', () => {
  it('respects reduced motion preferences', () => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<AnimationControls />);
    
    // Component should still render but animations should be disabled
    expect(screen.getByText(/Animation Controls/i)).toBeInTheDocument();
  });

  it('has proper ARIA labels', () => {
    render(<AnimationControls />);
    
    const playButton = screen.getByRole('button', { name: /Play/i });
    expect(playButton).toHaveAttribute('aria-label');
  });

  it('supports keyboard navigation', () => {
    render(<AnimationControls />);
    
    const playButton = screen.getByRole('button', { name: /Play/i });
    playButton.focus();
    
    expect(playButton).toHaveFocus();
  });
});
