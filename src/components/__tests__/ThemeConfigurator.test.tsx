/**
 * Theme Configurator Component Tests
 * 
 * Tests for the ThemeConfigurator component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeConfigurator } from '../ThemeConfigurator';
import '@testing-library/jest-dom';

describe('ThemeConfigurator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ThemeConfigurator />);
    expect(screen.getByText(/Theme Configurator/i)).toBeInTheDocument();
  });

  it('displays theme preset selector', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByText(/Theme Preset/i)).toBeInTheDocument();
  });

  it('shows all theme presets', async () => {
    render(<ThemeConfigurator />);
    
    const presetSelect = screen.getByLabelText(/Theme Preset/i);
    fireEvent.mouseDown(presetSelect);
    
    await waitFor(() => {
      expect(screen.getByText(/Light/i)).toBeInTheDocument();
      expect(screen.getByText(/Dark/i)).toBeInTheDocument();
      expect(screen.getByText(/Ocean/i)).toBeInTheDocument();
      expect(screen.getByText(/Sunset/i)).toBeInTheDocument();
      expect(screen.getByText(/Forest/i)).toBeInTheDocument();
    });
  });

  it('displays color pickers', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByText(/Primary/i)).toBeInTheDocument();
    expect(screen.getByText(/Secondary/i)).toBeInTheDocument();
    expect(screen.getByText(/Accent/i)).toBeInTheDocument();
  });

  it('has export button', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByRole('button', { name: /Export Theme/i })).toBeInTheDocument();
  });

  it('has import button', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByRole('button', { name: /Import Theme/i })).toBeInTheDocument();
  });

  it('shows live preview', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByText(/Live Preview/i)).toBeInTheDocument();
  });

  it('switches between demo and code view', async () => {
    render(<ThemeConfigurator />);
    
    const codeButton = screen.getByRole('button', { name: /Code/i });
    fireEvent.click(codeButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Theme Configuration/i)).toBeInTheDocument();
    });
  });

  it('calls onThemeChange callback when theme changes', async () => {
    const onThemeChange = vi.fn();
    render(<ThemeConfigurator onThemeChange={onThemeChange} />);
    
    const presetSelect = screen.getByLabelText(/Theme Preset/i);
    fireEvent.mouseDown(presetSelect);
    
    await waitFor(() => {
      const oceanOption = screen.getByText(/Ocean/i);
      fireEvent.click(oceanOption);
    });
    
    await waitFor(() => {
      expect(onThemeChange).toHaveBeenCalled();
    });
  });

  it('displays usage guide tabs', () => {
    render(<ThemeConfigurator />);
    
    expect(screen.getByText(/How to Use/i)).toBeInTheDocument();
  });
});

describe('ThemeConfigurator - Color Customization', () => {
  it('allows color customization', async () => {
    render(<ThemeConfigurator />);
    
    const colorInputs = screen.getAllByDisplayValue(/#[0-9a-fA-F]{6}/);
    expect(colorInputs.length).toBeGreaterThan(0);
  });

  it('updates preview when color changes', async () => {
    const onThemeChange = vi.fn();
    render(<ThemeConfigurator onThemeChange={onThemeChange} />);
    
    const primaryColorInput = screen.getAllByDisplayValue(/#[0-9a-fA-F]{6}/)[0];
    fireEvent.change(primaryColorInput, { target: { value: '#ff0000' } });
    
    await waitFor(() => {
      expect(onThemeChange).toHaveBeenCalled();
    });
  });
});

describe('ThemeConfigurator - Export/Import', () => {
  it('exports theme as JSON', async () => {
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn();
    
    render(<ThemeConfigurator />);
    
    const exportButton = screen.getByRole('button', { name: /Export Theme/i });
    fireEvent.click(exportButton);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
