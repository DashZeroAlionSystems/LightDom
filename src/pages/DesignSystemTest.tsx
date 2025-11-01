/**
 * Design System Test Page
 * Demonstrates all Material Design 3 components and styles
 */

import React from 'react';

export default function DesignSystemTest() {
  return (
    <div className="min-h-screen bg-surface p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="md3-display-large text-on-surface mb-8">
          LightDom Design System
        </h1>
        
        <p className="md3-body-large text-on-surface-variant mb-12">
          Material Design 3 Components & Styles
        </p>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Typography Scale</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="md3-display-large text-on-surface">Display Large</h3>
              <p className="md3-label-small text-on-surface-variant">57px / 64px line height</p>
            </div>
            
            <div>
              <h3 className="md3-display-medium text-on-surface">Display Medium</h3>
              <p className="md3-label-small text-on-surface-variant">45px / 52px line height</p>
            </div>
            
            <div>
              <h3 className="md3-headline-large text-on-surface">Headline Large</h3>
              <p className="md3-label-small text-on-surface-variant">32px / 40px line height</p>
            </div>
            
            <div>
              <h3 className="md3-headline-medium text-on-surface">Headline Medium</h3>
              <p className="md3-label-small text-on-surface-variant">28px / 36px line height</p>
            </div>
            
            <div>
              <p className="md3-body-large text-on-surface">Body Large - Regular paragraph text for reading</p>
              <p className="md3-label-small text-on-surface-variant">16px / 24px line height</p>
            </div>
            
            <div>
              <p className="md3-body-medium text-on-surface">Body Medium - Standard paragraph text</p>
              <p className="md3-label-small text-on-surface-variant">14px / 20px line height</p>
            </div>
            
            <div>
              <p className="md3-label-large text-on-surface">Label Large - For buttons and prominent labels</p>
              <p className="md3-label-small text-on-surface-variant">14px / 20px line height</p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Buttons</h2>
          
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="md3-button md3-button-filled">
              Filled Button
            </button>
            
            <button className="md3-button md3-button-outlined">
              Outlined Button
            </button>
            
            <button className="md3-button md3-button-text">
              Text Button
            </button>
            
            <button className="md3-button md3-button-elevated">
              Elevated Button
            </button>
            
            <button className="md3-button md3-button-tonal">
              Tonal Button
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <button className="md3-button md3-button-filled" disabled>
              Disabled Filled
            </button>
            
            <button className="md3-button md3-button-outlined" disabled>
              Disabled Outlined
            </button>
            
            <button className="md3-button md3-button-text" disabled>
              Disabled Text
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Cards & Elevation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md3-card md3-elevation-0 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 0</h3>
              <p className="md3-body-medium text-on-surface-variant">
                No shadow - flat surface
              </p>
            </div>
            
            <div className="md3-card md3-elevation-1 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 1</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Subtle shadow - cards at rest
              </p>
            </div>
            
            <div className="md3-card md3-elevation-2 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 2</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Raised surface - hover state
              </p>
            </div>
            
            <div className="md3-card md3-elevation-3 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 3</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Floating elements - FABs
              </p>
            </div>
            
            <div className="md3-card md3-elevation-4 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 4</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Modal dialogs
              </p>
            </div>
            
            <div className="md3-card md3-elevation-5 p-6">
              <h3 className="md3-title-large text-on-surface mb-2">Elevation 5</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Navigation drawers
              </p>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Form Inputs</h2>
          
          <div className="max-w-md space-y-4">
            <div>
              <label className="md3-label-medium text-on-surface block mb-2">
                Text Input
              </label>
              <input 
                type="text" 
                className="md3-input w-full"
                placeholder="Enter text..."
              />
            </div>
            
            <div>
              <label className="md3-label-medium text-on-surface block mb-2">
                Input with Error
              </label>
              <input 
                type="text" 
                className="md3-input md3-input-error w-full"
                placeholder="Invalid input"
              />
              <p className="md3-label-small text-error-500 mt-1">
                This field is required
              </p>
            </div>
            
            <div>
              <label className="md3-label-medium text-on-surface block mb-2">
                Disabled Input
              </label>
              <input 
                type="text" 
                className="md3-input w-full"
                placeholder="Disabled"
                disabled
              />
            </div>
            
            <div>
              <label className="md3-label-medium text-on-surface block mb-2">
                Textarea
              </label>
              <textarea 
                className="md3-input w-full"
                rows={4}
                placeholder="Enter message..."
              />
            </div>
          </div>
        </section>

        {/* Color System */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Color System</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Primary Colors */}
            <div>
              <div className="bg-primary-600 text-white p-4 rounded-md mb-2">
                <p className="md3-label-large">Primary</p>
                <p className="md3-label-small opacity-80">#7c3aed</p>
              </div>
              <div className="bg-primary-100 text-primary-900 p-4 rounded-md">
                <p className="md3-label-large">Primary Light</p>
              </div>
            </div>
            
            {/* Secondary Colors */}
            <div>
              <div className="bg-secondary-600 text-white p-4 rounded-md mb-2">
                <p className="md3-label-large">Secondary</p>
                <p className="md3-label-small opacity-80">#0891b2</p>
              </div>
              <div className="bg-secondary-100 text-secondary-900 p-4 rounded-md">
                <p className="md3-label-large">Secondary Light</p>
              </div>
            </div>
            
            {/* Tertiary Colors */}
            <div>
              <div className="bg-tertiary-600 text-white p-4 rounded-md mb-2">
                <p className="md3-label-large">Tertiary</p>
                <p className="md3-label-small opacity-80">#ea580c</p>
              </div>
              <div className="bg-tertiary-100 text-tertiary-900 p-4 rounded-md">
                <p className="md3-label-large">Tertiary Light</p>
              </div>
            </div>
            
            {/* Error Colors */}
            <div>
              <div className="bg-error-600 text-white p-4 rounded-md mb-2">
                <p className="md3-label-large">Error</p>
                <p className="md3-label-small opacity-80">#dc2626</p>
              </div>
              <div className="bg-error-100 text-error-900 p-4 rounded-md">
                <p className="md3-label-large">Error Light</p>
              </div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Motion & Animation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md3-card md3-elevation-1 p-6 hover:md3-elevation-3 transition-all duration-300 ease-emphasized">
              <h3 className="md3-title-large text-on-surface mb-2">Emphasized Easing</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Hover to see emphasized animation curve
              </p>
            </div>
            
            <div className="md3-card md3-elevation-1 p-6 md3-fade-in">
              <h3 className="md3-title-large text-on-surface mb-2">Fade In Animation</h3>
              <p className="md3-body-medium text-on-surface-variant">
                Appears with fade animation
              </p>
            </div>
          </div>
        </section>

        {/* Shape System */}
        <section className="mb-16">
          <h2 className="md3-headline-large text-on-surface mb-6">Shape System</h2>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div className="md3-card bg-primary-100 p-6 md3-rounded-xs">
              <p className="md3-label-small text-primary-900">XS - 4px</p>
            </div>
            
            <div className="md3-card bg-primary-100 p-6 md3-rounded-sm">
              <p className="md3-label-small text-primary-900">SM - 8px</p>
            </div>
            
            <div className="md3-card bg-primary-100 p-6 md3-rounded-md">
              <p className="md3-label-small text-primary-900">MD - 12px</p>
            </div>
            
            <div className="md3-card bg-primary-100 p-6 md3-rounded-lg">
              <p className="md3-label-small text-primary-900">LG - 16px</p>
            </div>
            
            <div className="md3-card bg-primary-100 p-6 md3-rounded-xl">
              <p className="md3-label-small text-primary-900">XL - 20px</p>
            </div>
            
            <div className="md3-card bg-primary-100 p-6 md3-rounded-xxl">
              <p className="md3-label-small text-primary-900">XXL - 28px</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-outline">
          <p className="md3-body-small text-on-surface-variant text-center">
            LightDom Design System - Material Design 3 Implementation
          </p>
          <p className="md3-label-small text-on-surface-variant text-center mt-2">
            January 2025
          </p>
        </footer>
      </div>
    </div>
  );
}