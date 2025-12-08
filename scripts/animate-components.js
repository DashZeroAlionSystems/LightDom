#!/usr/bin/env node

/**
 * Anime.js Component Animation CLI
 * 
 * Generate animated UI components with Storybook
 */

import { AnimejsFluidDesignService, ANIMATION_TYPES, COMPONENT_TYPES } from '../services/animejs-fluid-design-service.js';
import { program } from 'commander';

const designer = new AnimejsFluidDesignService();

program
  .name('animate-components')
  .description('Generate animated UI components')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate animated component')
  .option('--type <type>', 'Component type', 'button')
  .option('--animation <animation>', 'Animation type', 'hover')
  .option('--framework <framework>', 'Framework (react/vue/svelte/vanilla)', 'react')
  .option('--output <dir>', 'Output directory', './generated')
  .action(async (options) => {
    console.log('🎨 Generating animated component...\n');
    
    const component = await designer.generateFluidComponent({
      type: options.type,
      animation: options.animation,
      framework: options.framework,
    });
    
    console.log('✅ Component generated!');
    console.log('ID:', component.id);
    console.log('Type:', component.type);
    console.log('Animation:', component.animation);
    console.log('Framework:', component.framework);
    console.log('\nCode preview:');
    console.log(component.code.substring(0, 300) + '...');
  });

program
  .command('storybook')
  .description('Generate complete animated Storybook')
  .option('--components <types>', 'Component types (comma-separated)', 'button,card,modal')
  .option('--animations <animations>', 'Animation types (comma-separated)', 'fadeIn,hover,click')
  .option('--frameworks <frameworks>', 'Frameworks (comma-separated)', 'react')
  .option('--output <dir>', 'Output directory', './animated-storybook')
  .action(async (options) => {
    console.log('🎨 Generating animated Storybook...\n');
    
    const storybook = await designer.generateAnimatedStorybook({
      components: options.components.split(','),
      animations: options.animations.split(','),
      frameworks: options.frameworks.split(','),
    });
    
    console.log('✅ Storybook generated!');
    console.log('Location:', storybook.outputPath);
    console.log('Components:', storybook.components.length);
    console.log('\nTo run:');
    console.log(`  cd ${storybook.outputPath}`);
    console.log('  npm install');
    console.log('  npm run storybook');
  });

program
  .command('list-animations')
  .description('List available animation types')
  .action(() => {
    console.log('Available Animations:\n');
    
    console.log('Entrance:');
    console.log('  - fadeIn: Fade in from transparent');
    console.log('  - slideIn: Slide in from left');
    console.log('  - zoomIn: Zoom in from small');
    console.log('  - bounceIn: Bounce in effect');
    console.log('  - rotateIn: Rotate while fading in');
    
    console.log('\nInteraction:');
    console.log('  - hover: Scale on hover');
    console.log('  - click: Scale pulse on click');
    console.log('  - drag: Follow mouse dragging');
    
    console.log('\nMorphing:');
    console.log('  - morphShape: Morph border radius');
    console.log('  - morphColor: Cycle through colors');
    console.log('  - morphSize: Scale in loop');
    
    console.log('\nComplex:');
    console.log('  - stagger: Staggered entrance for lists');
    console.log('  - sequential: Sequential animations');
    console.log('  - timeline: Custom timeline');
  });

program
  .command('list-components')
  .description('List available component types')
  .action(() => {
    console.log('Available Components:\n');
    
    for (const [key, value] of Object.entries(COMPONENT_TYPES)) {
      console.log(`  - ${value}: ${key.toLowerCase().replace('_', ' ')}`);
    }
  });

program
  .command('metrics')
  .description('Get generation metrics')
  .action(() => {
    const metrics = designer.getMetrics();
    
    console.log('📈 Generation Metrics\n');
    console.log('Components Generated:', metrics.componentsGenerated);
    console.log('Animations Created:', metrics.animationsCreated);
    console.log('Storybooks Generated:', metrics.storybooksGenerated);
  });

program.parse();
