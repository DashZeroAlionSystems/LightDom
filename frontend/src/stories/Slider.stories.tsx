/**
 * Slider Component Stories
 * 
 * Range slider component for selecting numeric values.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Inline Slider component for Storybook
const Slider: React.FC<{
  label?: string;
  helperText?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  marks?: Array<{ value: number; label?: string }>;
  className?: string;
}> = ({
  label,
  helperText,
  showValue = false,
  formatValue = (v) => String(v),
  size = 'md',
  min = 0,
  max = 100,
  step = 1,
  value = 50,
  onChange,
  disabled = false,
  marks,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  const sizeConfig = {
    sm: { track: 'h-1', thumb: 'h-3 w-3' },
    md: { track: 'h-1.5', thumb: 'h-4 w-4' },
    lg: { track: 'h-2', thumb: 'h-5 w-5' },
  };

  const config = sizeConfig[size];

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {showValue && (
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {formatValue(localValue)}
            </span>
          )}
        </div>
      )}

      <div className="relative pt-6 pb-2">
        {/* Value tooltip */}
        {isFocused && (
          <div
            className="absolute top-0 transform -translate-x-1/2 -translate-y-full mb-2 transition-opacity"
            style={{ left: `${percentage}%` }}
          >
            <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              {formatValue(localValue)}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600" />
            </div>
          </div>
        )}

        {/* Track */}
        <div className={`relative ${config.track} bg-gray-200 dark:bg-gray-700 rounded-full`}>
          {/* Filled track */}
          <div
            className={`absolute ${config.track} bg-blue-600 rounded-full transition-all`}
            style={{ width: `${percentage}%` }}
          />

          {/* Marks */}
          {marks?.map((mark) => {
            const markPercentage = ((mark.value - min) / (max - min)) * 100;
            return (
              <div
                key={mark.value}
                className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                style={{ left: `${markPercentage}%` }}
              >
                <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
              </div>
            );
          })}
        </div>

        {/* Input range (invisible, handles interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        {/* Thumb */}
        <div
          className={`
            absolute top-1/2 ${config.thumb}
            bg-blue-600 rounded-full shadow-lg
            transform -translate-y-1/2 -translate-x-1/2
            pointer-events-none transition-all
            ${isFocused ? 'ring-4 ring-blue-600/20' : ''}
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Mark labels */}
      {marks && (
        <div className="relative mt-2">
          {marks.map((mark) => {
            const markPercentage = ((mark.value - min) / (max - min)) * 100;
            return (
              <div
                key={mark.value}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${markPercentage}%` }}
              >
                {mark.label && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {mark.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
};

const meta: Meta<typeof Slider> = {
  title: 'DESIGN SYSTEM/Atoms/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## Slider Component

Range input control for selecting numeric values within a defined range.

### Design System Rules
- **Touch Target**: Minimum 44x44px for thumb interaction
- **Track Height**: Varies by size (4px/6px/8px)
- **Thumb Size**: Clearly visible, with focus ring
- **Value Display**: Show on hover/focus or always with showValue
- **Marks**: Optional tick marks for discrete values

### Accessibility
- Supports keyboard navigation (arrow keys)
- Clear focus states
- Value announced to screen readers
- Proper ARIA attributes

### When to Use
- Volume/brightness controls
- Price range filters
- Timeline scrubbing
- Configuration settings
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

// Default
export const Default: Story = {
  args: {
    label: 'Volume',
    showValue: true,
    value: 50,
  },
};

// Size variants
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-8 max-w-md">
      <Slider label="Small" size="sm" value={30} showValue />
      <Slider label="Medium (default)" size="md" value={50} showValue />
      <Slider label="Large" size="lg" value={70} showValue />
    </div>
  ),
};

// With marks
export const WithMarks: Story = {
  render: function SliderWithMarks() {
    const [value, setValue] = useState(50);
    
    return (
      <div className="max-w-md">
        <Slider
          label="Temperature"
          value={value}
          onChange={setValue}
          min={0}
          max={100}
          showValue
          formatValue={(v) => `${v}°C`}
          marks={[
            { value: 0, label: '0°C' },
            { value: 25, label: '25°C' },
            { value: 50, label: '50°C' },
            { value: 75, label: '75°C' },
            { value: 100, label: '100°C' },
          ]}
        />
      </div>
    );
  },
};

// Custom formatting
export const CustomFormatting: Story = {
  render: () => (
    <div className="space-y-8 max-w-md">
      <Slider
        label="Price"
        value={500}
        min={0}
        max={1000}
        showValue
        formatValue={(v) => `$${v}`}
      />
      <Slider
        label="Percentage"
        value={75}
        min={0}
        max={100}
        showValue
        formatValue={(v) => `${v}%`}
      />
      <Slider
        label="Distance"
        value={5}
        min={0}
        max={50}
        showValue
        formatValue={(v) => `${v} km`}
      />
      <Slider
        label="Time"
        value={120}
        min={0}
        max={300}
        step={15}
        showValue
        formatValue={(v) => {
          const hours = Math.floor(v / 60);
          const mins = v % 60;
          return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        }}
      />
    </div>
  ),
};

// Disabled state
export const DisabledState: Story = {
  render: () => (
    <div className="max-w-md">
      <Slider
        label="Disabled Slider"
        value={60}
        disabled
        showValue
        helperText="This slider is disabled"
      />
    </div>
  ),
};

// Step values
export const StepValues: Story = {
  render: function StepSlider() {
    const [value, setValue] = useState(50);
    
    return (
      <div className="space-y-8 max-w-md">
        <Slider
          label="Step: 1 (default)"
          value={value}
          onChange={setValue}
          step={1}
          showValue
        />
        <Slider
          label="Step: 10"
          value={Math.round(value / 10) * 10}
          onChange={setValue}
          step={10}
          showValue
          marks={[
            { value: 0, label: '0' },
            { value: 50, label: '50' },
            { value: 100, label: '100' },
          ]}
        />
        <Slider
          label="Step: 25"
          value={Math.round(value / 25) * 25}
          onChange={setValue}
          step={25}
          showValue
          marks={[
            { value: 0, label: '0' },
            { value: 25, label: '25' },
            { value: 50, label: '50' },
            { value: 75, label: '75' },
            { value: 100, label: '100' },
          ]}
        />
      </div>
    );
  },
};

// Real-world examples
export const VolumeControl: Story = {
  render: function VolumeControlDemo() {
    const [volume, setVolume] = useState(75);
    const [muted, setMuted] = useState(false);
    
    return (
      <div className="max-w-sm p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            {muted || volume === 0 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : volume < 50 ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            <Slider
              value={muted ? 0 : volume}
              onChange={(v) => {
                setVolume(v);
                setMuted(false);
              }}
              min={0}
              max={100}
              size="sm"
            />
          </div>
          <span className="text-sm text-gray-500 w-10 text-right">
            {muted ? '0' : volume}%
          </span>
        </div>
      </div>
    );
  },
};

export const PriceRangeFilter: Story = {
  render: function PriceRangeDemo() {
    const [minPrice, setMinPrice] = useState(100);
    const [maxPrice, setMaxPrice] = useState(800);
    
    return (
      <div className="max-w-sm p-4 border rounded-lg">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Price Range</h3>
        
        <div className="space-y-6">
          <Slider
            label="Minimum Price"
            value={minPrice}
            onChange={(v) => setMinPrice(Math.min(v, maxPrice - 50))}
            min={0}
            max={1000}
            step={50}
            showValue
            formatValue={(v) => `$${v}`}
          />
          
          <Slider
            label="Maximum Price"
            value={maxPrice}
            onChange={(v) => setMaxPrice(Math.max(v, minPrice + 50))}
            min={0}
            max={1000}
            step={50}
            showValue
            formatValue={(v) => `$${v}`}
          />
          
          <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-500">Selected Range</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              ${minPrice} - ${maxPrice}
            </p>
          </div>
        </div>
      </div>
    );
  },
};

export const ImageSettings: Story = {
  render: function ImageSettingsDemo() {
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    
    return (
      <div className="max-w-md p-4 border rounded-lg">
        <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Image Adjustments</h3>
        
        {/* Preview */}
        <div className="mb-6 rounded-lg overflow-hidden bg-gray-200">
          <div
            className="w-full h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
            }}
          />
        </div>
        
        <div className="space-y-6">
          <Slider
            label="Brightness"
            value={brightness}
            onChange={setBrightness}
            min={0}
            max={200}
            showValue
            formatValue={(v) => `${v}%`}
          />
          
          <Slider
            label="Contrast"
            value={contrast}
            onChange={setContrast}
            min={0}
            max={200}
            showValue
            formatValue={(v) => `${v}%`}
          />
          
          <Slider
            label="Saturation"
            value={saturation}
            onChange={setSaturation}
            min={0}
            max={200}
            showValue
            formatValue={(v) => `${v}%`}
          />
          
          <button
            onClick={() => {
              setBrightness(100);
              setContrast(100);
              setSaturation(100);
            }}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          >
            Reset to Default
          </button>
        </div>
      </div>
    );
  },
};
