#!/usr/bin/env node

/**
 * Style Guide Generator Demo
 * 
 * Demonstrates the complete workflow from URL to Storybook:
 * 1. Mine style guide from any URL
 * 2. Generate training data for DeepSeek fine-tuning
 * 3. Generate component library
 * 4. Create Storybook documentation
 * 
 * Usage:
 *   node demo-styleguide-generator.js <url>
 *   node demo-styleguide-generator.js https://material.io
 */

import { StyleGuideToStorybookOrchestrator } from './services/styleguide-to-storybook-orchestrator.js';
import { MaterialDesign3StyleGuideSchema, DefaultMaterialDesign3Values } from './schemas/material-design-3-styleguide-schema.js';

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║              LightDom Style Guide & Component Generator                    ║
║                                                                            ║
║  Automatically mine design systems, generate components, and create        ║
║  complete Storybook documentation from any URL                             ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  // Get URL from command line or use default
  const targetUrl = process.argv[2] || 'https://material.io';

  console.log(`\n📍 Target URL: ${targetUrl}\n`);

  // Initialize orchestrator
  const orchestrator = new StyleGuideToStorybookOrchestrator({
    outputDir: './output/styleguides',
    componentsDir: './src/components/generated',
    storiesDir: './src/stories/generated',
    trainingDataDir: './training-data/components'
  });

  // Listen to progress events
  orchestrator.on('progress', (progress) => {
    console.log(`   Progress: ${progress.completedSteps}/${progress.totalSteps} - ${progress.currentStep}`);
  });

  orchestrator.on('styleGuideMined', (styleGuide) => {
    console.log(`\n📊 Style Guide Statistics:`);
    console.log(`   Components: ${styleGuide.metadata.totalComponents}`);
    console.log(`   Design Tokens: ${styleGuide.metadata.totalTokens}`);
    console.log(`   Framework: ${styleGuide.framework?.name || 'Unknown'}`);
    console.log(`   Confidence: ${Math.round(styleGuide.metadata.confidence * 100)}%`);
  });

  try {
    await orchestrator.initialize();

    // Demo 1: Process a URL
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Demo 1: Complete Workflow (URL → Style Guide → Components → Storybook)`);
    console.log(`${'─'.repeat(80)}\n`);

    const workflow = await orchestrator.processUrl(targetUrl, {
      libraryName: 'MyDesignSystem',
      framework: 'react',
      generateTrainingData: true
    });

    console.log(`\n✅ Workflow Results:`);
    console.log(`   Duration: ${workflow.completedAt ? new Date(workflow.completedAt) - new Date(workflow.startedAt) : 'N/A'}ms`);
    console.log(`   Style Guide ID: ${workflow.steps.styleGuide.id}`);
    console.log(`   Components Generated: ${workflow.steps.componentLibrary.metadata.totalComponents}`);
    console.log(`   Storybook Stories: ${workflow.steps.storybook.metadata.totalStories}`);
    console.log(`   Training Examples: ${workflow.steps.trainingData?.length || 0}`);

    // Demo 2: Generate from Material Design 3 schema
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Demo 2: Generate from Material Design 3 Schema`);
    console.log(`${'─'.repeat(80)}\n`);

    const materialDesignStyleGuide = createMaterialDesignStyleGuide();
    
    const componentsWorkflow = await orchestrator.generateComponentsFromStyleGuide(
      './temp-md3-styleguide.json',
      {
        libraryName: 'MaterialDesign3Components',
        framework: 'react'
      }
    );

    console.log(`\n✅ Material Design 3 Components:`);
    console.log(`   Components: ${componentsWorkflow.steps.componentLibrary.metadata.totalComponents}`);
    console.log(`   Stories: ${componentsWorkflow.steps.storybook.metadata.totalStories}`);

    // Demo 3: Generate training data from existing components
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Demo 3: Generate Training Data from Existing Components`);
    console.log(`${'─'.repeat(80)}\n`);

    const trainingData = await orchestrator.generateTrainingDataFromComponents(
      './src/components'
    );

    console.log(`\n✅ Training Data Generated:`);
    console.log(`   Examples: ${trainingData.length}`);

    // Demo 4: Mine multiple URLs and merge
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Demo 4: Mine Multiple URLs and Merge Style Guides`);
    console.log(`${'─'.repeat(80)}\n`);

    const urls = [
      'https://material.io',
      'https://ant.design',
      'https://chakra-ui.com'
    ];

    console.log(`Mining ${urls.length} design systems...`);
    console.log(`⚠️  Note: This is a demo. Actual mining requires Chrome DevTools Protocol integration.\n`);

    // In a real scenario, this would mine all URLs
    // const mergedStyleGuide = await orchestrator.mineMultipleUrls(urls, {
    //   name: 'Unified Design System'
    // });

    console.log(`\n${'═'.repeat(80)}`);
    console.log(`✅ Demo completed successfully!`);
    console.log(`${'═'.repeat(80)}\n`);

    console.log(`📂 Output Locations:`);
    console.log(`   Components: ./src/components/generated/`);
    console.log(`   Stories: ./src/stories/generated/`);
    console.log(`   Training Data: ./training-data/components/`);
    console.log(`   Reports: ./output/styleguides/\n`);

    console.log(`🚀 Next Steps:`);
    console.log(`   1. Run Storybook: npm run storybook`);
    console.log(`   2. Fine-tune DeepSeek model with training data`);
    console.log(`   3. Generate new components using the fine-tuned model`);
    console.log(`   4. Integrate components into your application\n`);

    // Cleanup
    await orchestrator.cleanup();

  } catch (error) {
    console.error(`\n❌ Error during demo:`, error);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Create a Material Design 3 style guide from schema
 */
function createMaterialDesignStyleGuide() {
  const styleGuide = {
    id: 'material-design-3',
    generated: new Date().toISOString(),
    baseDesignSystem: 'material-design-3',
    url: 'https://m3.material.io',
    
    metadata: {
      name: 'Material Design 3',
      version: '3.0.0',
      description: "Google's open-source design system",
      author: 'Google',
      totalComponents: 25,
      totalTokens: 100
    },

    framework: {
      name: 'React',
      version: '18.x',
      confidence: 1.0
    },

    tokens: {
      colors: {
        primary: {
          0: '#000000',
          10: '#21005E',
          20: '#381E72',
          30: '#4F378B',
          40: '#6750A4',
          50: '#7F67BE',
          60: '#9A82DB',
          70: '#B69DF8',
          80: '#D0BCFF',
          90: '#EADDFF',
          95: '#F6EDFF',
          99: '#FFFBFE',
          100: '#FFFFFF'
        },
        secondary: {
          40: '#625B71',
          90: '#E8DEF8'
        },
        tertiary: {
          40: '#7D5260',
          90: '#FFD8E4'
        },
        error: {
          40: '#BA1A1A',
          90: '#FFDAD6'
        },
        neutral: {
          10: '#1C1B1F',
          90: '#E6E1E5',
          95: '#F4EFF4',
          99: '#FFFBFE'
        },
        semantic: {
          success: { 40: '#22C55E', 90: '#DCFCE7' },
          warning: { 40: '#F59E0B', 90: '#FEF3C7' },
          info: { 40: '#3B82F6', 90: '#DBEAFE' }
        }
      },

      typography: {
        fontFamilies: {
          brand: 'Roboto, sans-serif',
          plain: 'Roboto, sans-serif',
          code: 'Roboto Mono, monospace'
        },
        typeScale: {
          displayLarge: {
            fontSize: '57px',
            lineHeight: '64px',
            fontWeight: 400,
            letterSpacing: '-0.25px'
          },
          headlineLarge: {
            fontSize: '32px',
            lineHeight: '40px',
            fontWeight: 400,
            letterSpacing: '0px'
          },
          titleLarge: {
            fontSize: '22px',
            lineHeight: '28px',
            fontWeight: 400,
            letterSpacing: '0px'
          },
          bodyLarge: {
            fontSize: '16px',
            lineHeight: '24px',
            fontWeight: 400,
            letterSpacing: '0.5px'
          },
          labelLarge: {
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 500,
            letterSpacing: '0.1px'
          }
        }
      },

      spacing: {
        baseUnit: 8,
        scale: {
          0: '0px',
          1: '4px',
          2: '8px',
          3: '12px',
          4: '16px',
          6: '24px',
          8: '32px',
          12: '48px',
          16: '64px'
        }
      },

      elevation: {
        level0: 'none',
        level1: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 1px 3px 1px rgba(0,0,0,0.15)',
        level2: '0px 1px 2px 0px rgba(0,0,0,0.3), 0px 2px 6px 2px rgba(0,0,0,0.15)',
        level3: '0px 4px 8px 3px rgba(0,0,0,0.15), 0px 1px 3px 0px rgba(0,0,0,0.3)',
        level4: '0px 6px 10px 4px rgba(0,0,0,0.15), 0px 2px 3px 0px rgba(0,0,0,0.3)',
        level5: '0px 8px 12px 6px rgba(0,0,0,0.15), 0px 4px 4px 0px rgba(0,0,0,0.3)'
      },

      shape: {
        none: '0px',
        extraSmall: '4px',
        small: '8px',
        medium: '12px',
        large: '16px',
        extraLarge: '28px',
        full: '9999px'
      },

      motion: {
        durations: {
          short1: '50ms',
          short2: '100ms',
          medium1: '250ms',
          long1: '450ms'
        },
        easings: {
          emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
          standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)'
        }
      }
    },

    components: {
      Button: {
        name: 'Button',
        category: 'Actions',
        description: 'Buttons help people take action, such as sending an email, sharing a document, or liking a comment.',
        variants: ['elevated', 'filled', 'tonal', 'outlined', 'text'],
        states: {
          enabled: true,
          disabled: true,
          hover: true,
          focus: true,
          pressed: true
        },
        count: 1
      },
      Card: {
        name: 'Card',
        category: 'Containment',
        description: 'Cards contain content and actions about a single subject.',
        variants: ['elevated', 'filled', 'outlined'],
        states: {
          enabled: true,
          hover: true
        },
        count: 1
      },
      Chip: {
        name: 'Chip',
        category: 'Actions',
        description: 'Chips help people enter information, make selections, filter content, or trigger actions.',
        variants: ['assist', 'filter', 'input', 'suggestion'],
        states: {
          enabled: true,
          selected: true,
          disabled: true
        },
        count: 1
      },
      Dialog: {
        name: 'Dialog',
        category: 'Communication',
        description: 'Dialogs provide important prompts in a user flow.',
        variants: ['basic', 'fullscreen'],
        states: {
          open: true,
          closed: true
        },
        count: 1
      },
      TextField: {
        name: 'TextField',
        category: 'Text inputs',
        description: 'Text fields let users enter text into a UI.',
        variants: ['filled', 'outlined'],
        states: {
          enabled: true,
          disabled: true,
          error: true,
          focus: true
        },
        count: 1
      }
    },

    schemas: {},
    code: {}
  };

  // Save to temp file for demo
  const fs = require('fs');
  fs.writeFileSync('./temp-md3-styleguide.json', JSON.stringify(styleGuide, null, 2));

  return styleGuide;
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
