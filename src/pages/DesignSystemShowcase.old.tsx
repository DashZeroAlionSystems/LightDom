/**
 * Design System Showcase
 * Demonstrates proper usage of the Unified Design System
 * 
 * This component shows all the design system components working together
 * with proper styling, spacing, and theming.
 * 
 * @version 2.0.0
 * @date 2025-10-28
 */

import React from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Plus, ArrowRight, Download, Upload, Settings } from 'lucide-react';

const DesignSystemShowcase: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hero Section */}
      <div className="bg-gradient-hero border-b border-outline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-display-md font-heading text-on-background mb-4">
            LightDom Design System
          </h1>
          <p className="text-title-lg text-on-surface-variant max-w-3xl">
            A comprehensive Material Design 3 implementation with Tailwind CSS integration,
            providing consistent, beautiful, and accessible UI components.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Buttons Section */}
        <section className="mb-16">
          <h2 className="text-headline-lg font-heading text-on-background mb-2">
            Buttons
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Material Design 3 button variants with proper states and accessibility
          </p>
          
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>
                Different button styles for various use cases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="filled" size="md">
                  <Plus className="w-4 h-4" />
                  Filled Button
                </Button>
                
                <Button variant="filled-tonal" size="md">
                  <Download className="w-4 h-4" />
                  Filled Tonal
                </Button>
                
                <Button variant="outlined" size="md">
                  <Upload className="w-4 h-4" />
                  Outlined
                </Button>
                
                <Button variant="text" size="md">
                  Text Button
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button variant="elevated" size="md">
                  <Settings className="w-4 h-4" />
                  Elevated
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
              <CardDescription>
                Small, medium, and large button sizes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="filled" size="sm">
                  Small
                </Button>
                
                <Button variant="filled" size="md">
                  Medium
                </Button>
                
                <Button variant="filled" size="lg">
                  Large
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="mb-16">
          <h2 className="text-headline-lg font-heading text-on-background mb-2">
            Cards
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Container components with different elevation levels and styles
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Filled Card */}
            <Card variant="filled">
              <CardHeader>
                <CardTitle>Filled Card</CardTitle>
                <CardDescription>
                  Filled variant with solid background
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-md text-on-surface-variant">
                  This card uses the filled variant with a solid background color
                  from the surface container palette.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="text" size="sm">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>
                  Elevated with shadow effects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-md text-on-surface-variant">
                  This card uses elevation with shadow levels that respond to
                  hover interactions.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="text" size="sm">
                  Learn More
                </Button>
              </CardFooter>
            </Card>

            {/* Outlined Card */}
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Outlined Card</CardTitle>
                <CardDescription>
                  Outlined with border stroke
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-md text-on-surface-variant">
                  This card uses an outline border for subtle emphasis without
                  elevation.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="text" size="sm">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-headline-lg font-heading text-on-background mb-2">
            Typography
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Material Design 3 type scale for hierarchical text styling
          </p>
          
          <Card variant="elevated">
            <CardContent>
              <div className="space-y-6">
                {/* Display */}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2">DISPLAY</p>
                  <h1 className="text-display-lg text-on-surface">Display Large</h1>
                  <h1 className="text-display-md text-on-surface">Display Medium</h1>
                  <h1 className="text-display-sm text-on-surface">Display Small</h1>
                </div>

                {/* Headline */}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2">HEADLINE</p>
                  <h2 className="text-headline-lg text-on-surface">Headline Large</h2>
                  <h2 className="text-headline-md text-on-surface">Headline Medium</h2>
                  <h2 className="text-headline-sm text-on-surface">Headline Small</h2>
                </div>

                {/* Title */}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2">TITLE</p>
                  <h3 className="text-title-lg text-on-surface">Title Large</h3>
                  <h3 className="text-title-md text-on-surface">Title Medium</h3>
                  <h3 className="text-title-sm text-on-surface">Title Small</h3>
                </div>

                {/* Body */}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2">BODY</p>
                  <p className="text-body-lg text-on-surface">Body Large - Regular text content</p>
                  <p className="text-body-md text-on-surface">Body Medium - Regular text content</p>
                  <p className="text-body-sm text-on-surface">Body Small - Regular text content</p>
                </div>

                {/* Label */}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2">LABEL</p>
                  <p className="text-label-lg text-on-surface">Label Large</p>
                  <p className="text-label-md text-on-surface">Label Medium</p>
                  <p className="text-label-sm text-on-surface">Label Small</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="text-headline-lg font-heading text-on-background mb-2">
            Color Palette
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Material Design 3 color system with semantic meaning
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Colors */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
                <CardDescription>Main brand color palette</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
                    <div key={weight} className="text-center">
                      <div 
                        className={`w-full h-12 rounded-md mb-1 bg-primary-${weight}`}
                        style={{ backgroundColor: `var(--color-primary-${weight}, currentColor)` }}
                      />
                      <span className="text-label-sm text-on-surface-variant">{weight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Semantic Colors</CardTitle>
                <CardDescription>Status and feedback colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-success" />
                    <div>
                      <p className="text-body-md text-on-surface">Success</p>
                      <p className="text-body-sm text-on-surface-variant">#3BA55C</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-warning" />
                    <div>
                      <p className="text-body-md text-on-surface">Warning</p>
                      <p className="text-body-sm text-on-surface-variant">#FAA61A</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-error" />
                    <div>
                      <p className="text-body-md text-on-surface">Error</p>
                      <p className="text-body-sm text-on-surface-variant">#ED4245</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-info" />
                    <div>
                      <p className="text-body-md text-on-surface">Info</p>
                      <p className="text-body-sm text-on-surface-variant">#5865F2</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Spacing System */}
        <section className="mb-16">
          <h2 className="text-headline-lg font-heading text-on-background mb-2">
            Spacing System
          </h2>
          <p className="text-body-lg text-on-surface-variant mb-6">
            Consistent spacing scale based on 4px base unit
          </p>
          
          <Card variant="elevated">
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 6, 8, 12, 16, 24].map(space => (
                  <div key={space} className="flex items-center gap-4">
                    <span className="text-label-md text-on-surface-variant w-16">
                      {space * 4}px
                    </span>
                    <div 
                      className="bg-primary-500 h-8 rounded"
                      style={{ width: `${space * 4}px` }}
                    />
                    <span className="text-body-sm text-on-surface-variant">
                      p-{space} / m-{space}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </div>
    </div>
  );
};

export default DesignSystemShowcase;
