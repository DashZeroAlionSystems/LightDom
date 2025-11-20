import type { Meta, StoryObj } from '@storybook/react';
import { VSCodeComputerUse } from '../../components/vscode/VSCodeComputerUse';

const meta: Meta<typeof VSCodeComputerUse> = {
  title: 'AI/VSCode Computer Use',
  component: VSCodeComputerUse,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
# VSCode Computer Use Component

Provides programmatic control over VSCode IDE through Storybook interface.
This component enables full IDE automation including:

- **File Operations**: Create, read, update, delete files
- **Terminal Commands**: Execute shell commands
- **Git Operations**: Status, add, commit, push, pull
- **Debug Sessions**: Start/stop debugging (coming soon)
- **Extension Management**: Install/manage extensions (coming soon)

## Usage

### Mock Mode (Safe Testing)
\`\`\`tsx
<VSCodeComputerUse mockMode={true} workspacePath="/workspace" />
\`\`\`

### Real Mode (Actual IDE Control)
\`\`\`tsx
<VSCodeComputerUse 
  mockMode={false} 
  workspacePath="/actual/workspace"
  onOperationComplete={(op, result) => {
    console.log('Operation completed:', op, result);
  }}
/>
\`\`\`

## Architecture

This component can integrate with:
- **VSCode Extension API**: Direct IDE control when running as extension
- **Language Server Protocol (LSP)**: Code intelligence and navigation
- **Debug Adapter Protocol (DAP)**: Debugging capabilities
- **Terminal API**: Command execution
- **Git API**: Version control operations

## Security

- Mock mode is enabled by default for safe testing
- Real mode requires proper VSCode API authentication
- All operations are logged and can be audited
- File operations are sandboxed to workspace directory
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mockMode: {
      control: 'boolean',
      description: 'Enable mock mode for safe testing without affecting actual files',
    },
    workspacePath: {
      control: 'text',
      description: 'Path to VSCode workspace directory',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VSCodeComputerUse>;

export const MockMode: Story = {
  args: {
    mockMode: true,
    workspacePath: '/workspace',
  },
};

export const RealMode: Story = {
  args: {
    mockMode: false,
    workspacePath: '/home/user/projects/myproject',
  },
  parameters: {
    docs: {
      description: {
        story: 'Real mode with actual VSCode API integration. Use with caution!',
      },
    },
  },
};

export const WithCallback: Story = {
  args: {
    mockMode: true,
    workspacePath: '/workspace',
    onOperationComplete: (operation: string, result: any) => {
      console.log('✅ Operation completed:', operation);
      console.log('Result:', result);
    },
  },
};

export const FileCreationDemo: Story = {
  args: {
    mockMode: true,
    workspacePath: '/workspace/demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
Demo showing file creation workflow:
1. Select "Create File" operation
2. Enter path: "src/components/NewComponent.tsx"
3. Enter content (React component code)
4. Execute operation
5. See result in output panel
        `,
      },
    },
  },
};

export const TerminalCommandDemo: Story = {
  args: {
    mockMode: true,
    workspacePath: '/workspace/demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
Demo showing terminal command execution:
1. Switch to "Terminal" tab
2. Enter command or use quick buttons
3. See output in result panel
4. Commands are executed in workspace context
        `,
      },
    },
  },
};

export const GitWorkflowDemo: Story = {
  args: {
    mockMode: true,
    workspacePath: '/workspace/demo',
  },
  parameters: {
    docs: {
      description: {
        story: `
Demo showing complete Git workflow:
1. Switch to "Git" tab
2. Check git status
3. Stage changes with "Git Add All"
4. Enter commit message
5. Commit changes
6. Push to remote
        `,
      },
    },
  },
};
