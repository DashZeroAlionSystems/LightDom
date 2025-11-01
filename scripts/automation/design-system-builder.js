#!/usr/bin/env node

/**
 * Design System Component Builder
 * 
 * Uses Ollama to generate reusable design system components
 * and workflows that build from single tasks to complete dashboards
 */

const OllamaPromptEngine = require('./ollama-prompt-engine');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class DesignSystemBuilder {
  constructor() {
    this.promptEngine = new OllamaPromptEngine();
    this.componentsDir = path.join(__dirname, '..', '..', 'src', 'components', 'generated');
    this.designSystemPath = path.join(__dirname, '..', '..', 'src', 'styles', 'design-system.ts');
  }

  /**
   * Initialize the builder
   */
  async initialize() {
    console.log('🎨 Initializing Design System Builder...\n');
    await this.promptEngine.loadTemplates();
    await fs.mkdir(this.componentsDir, { recursive: true });
    console.log('✅ Initialization complete\n');
  }

  /**
   * Load design system tokens
   */
  async loadDesignSystem() {
    try {
      const content = await fs.readFile(this.designSystemPath, 'utf8');
      
      // Extract key design tokens
      const colorMatch = content.match(/export const colors = \{[\s\S]*?\n\};/);
      const spacingMatch = content.match(/export const spacing = \{[\s\S]*?\n\};/);
      const typographyMatch = content.match(/export const typography = \{[\s\S]*?\n\};/);
      
      return {
        colors: colorMatch ? colorMatch[0] : null,
        spacing: spacingMatch ? spacingMatch[0] : null,
        typography: typographyMatch ? typographyMatch[0] : null,
        full: content
      };
    } catch (error) {
      console.warn('⚠️  Could not load design system:', error.message);
      return { colors: null, spacing: null, typography: null, full: null };
    }
  }

  /**
   * Generate a single reusable component
   */
  async generateComponent(description, options = {}) {
    console.log(`\n🔨 Generating component: ${description}\n`);

    const designSystem = await this.loadDesignSystem();

    const prompt = `You are a React component expert. Generate a reusable, accessible React component based on this description:

Description: ${description}

Design System Context:
${designSystem.colors ? designSystem.colors.substring(0, 500) + '...' : 'Use standard Tailwind colors'}

Requirements:
1. Use TypeScript with proper types
2. Use functional components with hooks
3. Follow design system tokens
4. Include proper accessibility (ARIA labels, keyboard navigation)
5. Add JSDoc documentation
6. Export as named export
7. Use Ant Design components where appropriate
8. Add error boundaries if needed

Return ONLY the component code, no explanation.`;

    const result = await this.promptEngine.executePrompt(prompt, options.model || 'codellama:7b', {
      timeout: 90000,
      stream: false
    });

    if (result.success) {
      // Extract code from response
      const codeMatch = result.output.match(/```(?:typescript|tsx|ts)?\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : result.output;

      return {
        success: true,
        code: code.trim(),
        description
      };
    }

    return { success: false, error: 'Failed to generate component' };
  }

  /**
   * Generate a workflow for building a dashboard
   */
  async generateDashboardWorkflow(dashboardDescription, options = {}) {
    console.log(`\n📊 Generating dashboard workflow: ${dashboardDescription}\n`);

    const prompt = `You are a dashboard architecture expert. Create a step-by-step workflow for building this dashboard:

Dashboard: ${dashboardDescription}

Generate a JSON workflow with these steps:
1. Identify required components (list each component with description)
2. Define data flow and state management
3. Outline layout structure
4. List integration points
5. Specify testing requirements

Return ONLY valid JSON in this format:
{
  "name": "Dashboard Name",
  "description": "Dashboard description",
  "components": [
    {
      "name": "ComponentName",
      "description": "What it does",
      "type": "widget|chart|form|layout",
      "dependencies": ["other components"],
      "priority": 1-10
    }
  ],
  "dataFlow": {
    "sources": ["API endpoints or data sources"],
    "transformations": ["How data is processed"],
    "destinations": ["Where data goes"]
  },
  "layout": {
    "structure": "Grid description",
    "responsive": "Mobile/tablet/desktop breakpoints"
  },
  "integrations": ["External services or APIs"],
  "testing": ["Test scenarios"]
}`;

    const result = await this.promptEngine.executePrompt(prompt, options.model || 'llama2:7b', {
      timeout: 120000,
      stream: false
    });

    if (result.success) {
      // Extract JSON
      const jsonMatch = result.output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const workflow = JSON.parse(jsonMatch[0]);
          return { success: true, workflow };
        } catch (error) {
          console.error('❌ Failed to parse workflow JSON:', error.message);
        }
      }
    }

    return { success: false, error: 'Failed to generate workflow' };
  }

  /**
   * Build dashboard progressively from workflow
   */
  async buildDashboardProgressive(workflow, options = {}) {
    console.log(`\n🏗️  Building dashboard progressively: ${workflow.name}\n`);

    const feedbackLog = [];
    const components = [];

    // Sort components by priority
    const sortedComponents = workflow.components.sort((a, b) => (b.priority || 5) - (a.priority || 5));

    for (let i = 0; i < sortedComponents.length; i++) {
      const component = sortedComponents[i];
      
      const feedback = {
        step: i + 1,
        total: sortedComponents.length,
        component: component.name,
        status: 'starting',
        timestamp: new Date().toISOString()
      };

      feedbackLog.push(feedback);
      
      if (options.onProgress) {
        options.onProgress(feedback);
      }

      console.log(`\n[${ i + 1}/${sortedComponents.length}] Generating ${component.name}...`);

      try {
        const result = await this.generateComponent(component.description, {
          model: options.model
        });

        if (result.success) {
          feedback.status = 'completed';
          feedback.code = result.code;
          
          // Save component
          const filename = `${component.name}.tsx`;
          const filepath = path.join(this.componentsDir, filename);
          await fs.writeFile(filepath, result.code);
          
          components.push({
            name: component.name,
            file: filepath,
            code: result.code
          });

          console.log(`✅ Generated ${component.name}`);
        } else {
          feedback.status = 'failed';
          feedback.error = result.error;
          console.error(`❌ Failed to generate ${component.name}`);
        }
      } catch (error) {
        feedback.status = 'error';
        feedback.error = error.message;
        console.error(`❌ Error generating ${component.name}:`, error.message);
      }

      feedbackLog.push({ ...feedback, timestamp: new Date().toISOString() });
      
      if (options.onProgress) {
        options.onProgress(feedback);
      }
    }

    // Generate main dashboard component that combines all components
    console.log(`\n🎨 Generating main dashboard component...\n`);

    const dashboardCode = this.generateDashboardCode(workflow, components);
    const dashboardFile = path.join(this.componentsDir, `${workflow.name.replace(/\s+/g, '')}Dashboard.tsx`);
    await fs.writeFile(dashboardFile, dashboardCode);

    console.log(`✅ Dashboard built: ${dashboardFile}\n`);

    return {
      success: true,
      components,
      dashboardFile,
      feedbackLog
    };
  }

  /**
   * Generate the main dashboard component code
   */
  generateDashboardCode(workflow, components) {
    const imports = components.map(c => 
      `import { ${c.name} } from './${c.name}';`
    ).join('\n');

    const componentElements = components.map(c => 
      `        <${c.name} />`
    ).join('\n');

    return `import React from 'react';
import { Layout, Row, Col, Card } from 'antd';
${imports}

const { Content } = Layout;

/**
 * ${workflow.name}
 * ${workflow.description}
 * 
 * Auto-generated dashboard combining multiple components
 */
export const ${workflow.name.replace(/\s+/g, '')}Dashboard: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh', padding: '24px' }}>
      <Content>
        <Card title="${workflow.name}" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
${componentElements}
            </Col>
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default ${workflow.name.replace(/\s+/g, '')}Dashboard;
`;
  }

  /**
   * Monitor for changes and regenerate
   */
  async watchAndRegenerate(workflowFile, options = {}) {
    console.log(`\n👀 Watching workflow file for changes: ${workflowFile}\n`);

    const chokidar = require('chokidar');
    
    const watcher = chokidar.watch(workflowFile, {
      persistent: true,
      ignoreInitial: false
    });

    watcher.on('change', async (path) => {
      console.log(`\n🔄 Workflow file changed: ${path}`);
      console.log('♻️  Regenerating dashboard...\n');

      try {
        const content = await fs.readFile(workflowFile, 'utf8');
        const workflow = JSON.parse(content);

        const result = await this.buildDashboardProgressive(workflow, options);

        if (result.success) {
          console.log('✅ Dashboard regenerated successfully\n');
          
          if (options.onRegenerate) {
            options.onRegenerate(result);
          }
        }
      } catch (error) {
        console.error('❌ Failed to regenerate:', error.message);
      }
    });

    console.log('Press Ctrl+C to stop watching\n');

    // Keep process alive
    return new Promise(() => {});
  }

  /**
   * Interactive component generator
   */
  async interactive() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    try {
      console.log('\n' + '='.repeat(70));
      console.log('🎨 DESIGN SYSTEM COMPONENT BUILDER');
      console.log('='.repeat(70) + '\n');

      const mode = await question('Choose mode:\n  1. Generate single component\n  2. Generate complete dashboard\n  3. Progressive dashboard with monitoring\nChoice (1-3): ');

      if (mode === '1') {
        const description = await question('\nDescribe the component:\n> ');
        const result = await this.generateComponent(description);

        if (result.success) {
          console.log('\n✅ Component generated!\n');
          console.log('Code:\n');
          console.log(result.code);

          const save = (await question('\nSave to file? (y/n): ')).toLowerCase() === 'y';
          if (save) {
            const name = await question('Component name: ');
            const filepath = path.join(this.componentsDir, `${name}.tsx`);
            await fs.writeFile(filepath, result.code);
            console.log(`\n💾 Saved to: ${filepath}\n`);
          }
        }

      } else if (mode === '2' || mode === '3') {
        const description = await question('\nDescribe the dashboard:\n> ');
        const workflowResult = await this.generateDashboardWorkflow(description);

        if (workflowResult.success) {
          console.log('\n✅ Workflow generated!\n');
          console.log(JSON.stringify(workflowResult.workflow, null, 2));

          const proceed = (await question('\nProceed with building? (y/n): ')).toLowerCase() === 'y';
          
          if (proceed) {
            const buildResult = await this.buildDashboardProgressive(workflowResult.workflow, {
              onProgress: (feedback) => {
                console.log(`\n📍 Progress: ${feedback.step}/${feedback.total} - ${feedback.component} - ${feedback.status}`);
              }
            });

            if (buildResult.success) {
              console.log('\n✅ Dashboard built successfully!\n');
              console.log(`Dashboard: ${buildResult.dashboardFile}`);
              console.log(`Components: ${buildResult.components.length}`);

              // Save feedback log
              const feedbackFile = path.join(this.componentsDir, 'build-feedback.json');
              await fs.writeFile(feedbackFile, JSON.stringify(buildResult.feedbackLog, null, 2));
              console.log(`Feedback log: ${feedbackFile}\n`);

              if (mode === '3') {
                const workflowFile = path.join(this.componentsDir, 'workflow.json');
                await fs.writeFile(workflowFile, JSON.stringify(workflowResult.workflow, null, 2));
                
                console.log('\n👀 Starting change monitoring...');
                console.log(`Edit ${workflowFile} to trigger regeneration\n`);
                
                await this.watchAndRegenerate(workflowFile, {
                  onRegenerate: (result) => {
                    console.log('✨ Dashboard updated!');
                  }
                });
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  const builder = new DesignSystemBuilder();
  await builder.initialize();

  if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
    await builder.interactive();
  } else if (args[0] === '--component' || args[0] === '-c') {
    const description = args.slice(1).join(' ');
    const result = await builder.generateComponent(description);
    
    if (result.success) {
      console.log(result.code);
    } else {
      process.exit(1);
    }
  } else if (args[0] === '--dashboard' || args[0] === '-d') {
    const description = args.slice(1).join(' ');
    const workflowResult = await builder.generateDashboardWorkflow(description);
    
    if (workflowResult.success) {
      const buildResult = await builder.buildDashboardProgressive(workflowResult.workflow, {
        onProgress: (f) => console.log(`[${f.step}/${f.total}] ${f.component}: ${f.status}`)
      });
      
      if (buildResult.success) {
        console.log('\nDashboard:', buildResult.dashboardFile);
      }
    }
  } else {
    console.log('Usage:');
    console.log('  node design-system-builder.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -i, --interactive              Interactive mode');
    console.log('  -c, --component <description>  Generate single component');
    console.log('  -d, --dashboard <description>  Generate complete dashboard');
    console.log('');
    console.log('Examples:');
    console.log('  node design-system-builder.js -i');
    console.log('  node design-system-builder.js -c "A button with loading state"');
    console.log('  node design-system-builder.js -d "Analytics dashboard with charts"');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = DesignSystemBuilder;
