/**
 * Storybook Crawler Configuration Templates
 * 
 * Pre-configured templates for common Storybook discovery scenarios
 */

export const storybookCrawlerTemplates = {
  /**
   * Quick discovery - fast scan of popular Storybook instances
   */
  quick: {
    name: 'Quick Discovery',
    description: 'Fast scan of popular component libraries',
    config: {
      discovery: {
        enabled: true,
        searchEngines: ['known'],
      },
      mining: {
        enabled: true,
        maxComponentsPerSite: 20,
        extractData: {
          stories: true,
          props: true,
          docs: false,
          code: false,
          styles: true,
          interactions: false,
          accessibility: false,
        },
      },
      crawler: {
        maxConcurrency: 5,
        maxDepth: 1,
        requestDelay: 1000,
        timeout: 20000,
      },
      seeding: {
        enabled: true,
        initialSeeds: [
          {
            url: 'https://storybook.js.org/showcase',
            priority: 10,
          },
        ],
        autoDiscovery: false,
      },
    },
  },

  /**
   * Deep mining - comprehensive extraction of component data
   */
  deep: {
    name: 'Deep Mining',
    description: 'Comprehensive extraction of all component data',
    config: {
      discovery: {
        enabled: true,
        searchEngines: ['github', 'npm', 'known'],
      },
      mining: {
        enabled: true,
        maxComponentsPerSite: 100,
        extractData: {
          stories: true,
          props: true,
          docs: true,
          code: true,
          styles: true,
          interactions: true,
          accessibility: true,
        },
      },
      crawler: {
        maxConcurrency: 3,
        maxDepth: 3,
        requestDelay: 2000,
        timeout: 60000,
        waitForStorybook: 8000,
      },
      seeding: {
        enabled: true,
        autoDiscovery: true,
        maxSeedsPerSession: 500,
      },
    },
  },

  /**
   * React focus - target React component libraries
   */
  react: {
    name: 'React Components',
    description: 'Focus on React-based component libraries',
    config: {
      discovery: {
        enabled: true,
        searchQueries: [
          'react storybook',
          'react component library',
          'react design system',
          'react ui components',
        ],
      },
      mining: {
        enabled: true,
        componentTypes: [
          'Button',
          'Input',
          'Card',
          'Modal',
          'Dropdown',
          'Form',
          'Table',
        ],
      },
      generation: {
        framework: 'react',
        generateDocs: true,
        generateTests: true,
      },
      seeding: {
        initialSeeds: [
          {
            url: 'https://main--624b4db2c36c3900398eea65.chromatic.com',
            priority: 10,
            tags: ['react', 'ant-design'],
          },
          {
            url: 'https://primer.style/react/storybook',
            priority: 9,
            tags: ['react', 'github'],
          },
        ],
      },
    },
  },

  /**
   * Material Design - focus on Material Design implementations
   */
  material: {
    name: 'Material Design',
    description: 'Mine Material Design component libraries',
    config: {
      discovery: {
        enabled: true,
        searchQueries: [
          'material design storybook',
          'material ui storybook',
          'mui components',
        ],
        targetPatterns: [
          '**/material-ui/**',
          '**/mui/**',
          '**/material-design/**',
        ],
      },
      mining: {
        enabled: true,
        componentTypes: [
          'Button',
          'TextField',
          'Card',
          'Dialog',
          'AppBar',
          'Drawer',
          'Menu',
        ],
      },
      seeding: {
        initialSeeds: [
          {
            url: 'https://mui.com/material-ui/',
            priority: 10,
            tags: ['material', 'mui'],
          },
        ],
      },
    },
  },

  /**
   * Design Systems - focus on complete design systems
   */
  designSystems: {
    name: 'Design Systems',
    description: 'Target comprehensive design systems',
    config: {
      discovery: {
        enabled: true,
        searchQueries: [
          'design system storybook',
          'component library design system',
        ],
      },
      mining: {
        enabled: true,
        maxComponentsPerSite: 200,
        extractData: {
          stories: true,
          props: true,
          docs: true,
          code: true,
          styles: true,
          interactions: true,
          accessibility: true,
        },
      },
      crawler: {
        maxConcurrency: 2,
        maxDepth: 3,
        requestDelay: 3000,
      },
      seeding: {
        initialSeeds: [
          {
            url: 'https://react.carbondesignsystem.com',
            priority: 10,
            tags: ['design-system', 'ibm'],
          },
          {
            url: 'https://primer.style/react/storybook',
            priority: 10,
            tags: ['design-system', 'github'],
          },
          {
            url: 'https://storybook.grommet.io',
            priority: 9,
            tags: ['design-system', 'hp'],
          },
        ],
      },
    },
  },

  /**
   * Open Source - discover open source libraries
   */
  openSource: {
    name: 'Open Source',
    description: 'Discover open source component libraries from GitHub',
    config: {
      discovery: {
        enabled: true,
        searchEngines: ['github'],
        searchQueries: [
          'topic:storybook',
          'topic:component-library',
          'topic:design-system',
        ],
      },
      seeding: {
        enabled: true,
        initialSeeds: [
          {
            url: 'https://github.com/topics/storybook',
            priority: 10,
            tags: ['github', 'open-source'],
          },
          {
            url: 'https://github.com/topics/component-library',
            priority: 9,
            tags: ['github', 'open-source'],
          },
        ],
        autoDiscovery: true,
      },
    },
  },

  /**
   * Test focused - extract interaction tests
   */
  testing: {
    name: 'Test Extraction',
    description: 'Focus on extracting interaction tests and play functions',
    config: {
      mining: {
        enabled: true,
        extractData: {
          stories: true,
          props: true,
          interactions: true,
          accessibility: true,
          docs: false,
          code: false,
          styles: false,
        },
      },
      crawler: {
        maxConcurrency: 3,
        maxDepth: 2,
      },
    },
  },

  /**
   * Custom template - bare minimum for custom configuration
   */
  custom: {
    name: 'Custom Configuration',
    description: 'Start with minimal config and customize as needed',
    config: {
      discovery: {
        enabled: true,
      },
      mining: {
        enabled: true,
      },
      crawler: {
        maxConcurrency: 3,
        maxDepth: 2,
      },
      seeding: {
        enabled: true,
        initialSeeds: [],
      },
    },
  },
};

/**
 * Get template by name
 */
export function getTemplate(name) {
  return storybookCrawlerTemplates[name] || storybookCrawlerTemplates.quick;
}

/**
 * Merge template with custom config
 */
export function mergeConfig(templateName, customConfig = {}) {
  const template = getTemplate(templateName);
  
  return {
    ...template.config,
    ...customConfig,
    discovery: {
      ...template.config.discovery,
      ...customConfig.discovery,
    },
    mining: {
      ...template.config.mining,
      ...customConfig.mining,
    },
    crawler: {
      ...template.config.crawler,
      ...customConfig.crawler,
    },
    seeding: {
      ...template.config.seeding,
      ...customConfig.seeding,
    },
  };
}

/**
 * List all available templates
 */
export function listTemplates() {
  return Object.keys(storybookCrawlerTemplates).map(key => ({
    name: key,
    ...storybookCrawlerTemplates[key],
  }));
}

export default storybookCrawlerTemplates;
