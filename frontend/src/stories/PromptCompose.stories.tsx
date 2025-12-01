import {
  PromptCompose,
  PromptComposeAction,
  PromptComposeHeader,
  PromptComposeInput,
  PromptComposeShell,
  PromptComposeToken,
  PromptComposeToolbar,
  PromptInput,
} from '@/components/ui';
import deepseekChatGuide from '@/config/style-guides/deepseek-chat.json';
import type { Meta, StoryObj } from '@storybook/react';
import { Database, RefreshCw, Settings2, Sparkles, Zap } from 'lucide-react';

const promptTextColor = deepseekChatGuide.properties?.prompt?.default?.textColor ?? '#000000';

const meta: Meta<typeof PromptInput> = {
  title: 'AI/PromptCompose',
  component: PromptInput,
  args: {
    placeholder: 'Describe the agent workflow…',
    helperText: 'Use @ for data sources, # for campaigns, /run to trigger automations.',
    usage: 'Shift + Enter for newline · Enter to send',
    tokens: [
      {
        id: 'agent',
        label: 'AI Developer',
        tone: 'accent',
        icon: <Sparkles className='w-3.5 h-3.5' />,
      },
      {
        id: 'status',
        label: 'DB Active',
        tone: 'accent',
        icon: <Database className='w-3.5 h-3.5' />,
      },
      { id: 'mode', label: 'Workflow mode', icon: <Zap className='w-3.5 h-3.5' /> },
    ],
    actions: [
      { id: 'sync', label: 'Sync services', icon: <RefreshCw className='w-4 h-4' /> },
      { id: 'settings', label: 'Agent settings', icon: <Settings2 className='w-4 h-4' /> },
    ],
    header: {
      title: 'DeepSeek Agent',
      subtitle: 'Full-stack orchestration',
      leading: (
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <Sparkles className='h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold'>DeepSeek Agent</span>
            <span className='text-xs text-on-surface-variant'>Workflow composer</span>
          </div>
        </div>
      ),
    },
    textColor: promptTextColor,
  },
  argTypes: {
    textColor: {
      control: 'color',
      description: 'Overrides the prompt input text color, defaults to DeepSeek style guide token.',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PromptInput>;

export const Playground: Story = {
  render: props => <PromptInput {...props} />,
};

export const SlashCommands: Story = {
  name: 'Slash Commands (dev service control)',
  render: props => (
    <PromptInput
      {...props}
      slashCommands={[
        { command: '/services', description: 'List dev services' },
        { command: '/start <serviceId>', description: 'Start a service' },
        { command: '/stop <serviceId>', description: 'Stop a service' },
      ]}
      onSend={async (value: string) => {
        // In Storybook we can't control the dev server; mimic a response for demo
        if (value.startsWith('/')) {
          // eslint-disable-next-line no-alert
          alert(`Slash command executed: ${value}`);
          return;
        }
        // normal send
        // eslint-disable-next-line no-alert
        alert(`Send: ${value}`);
      }}
    />
  ),
};

export const Primitives: StoryObj<typeof PromptComposeShell> = {
  name: 'PromptCompose Building Blocks',
  render: () => (
    <PromptComposeShell
      header={
        <PromptComposeHeader
          leading={
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <Sparkles className='h-5 w-5' />
              </div>
              <div className='flex flex-col'>
                <span className='text-sm font-semibold'>Agent Console</span>
                <span className='text-xs text-on-surface-variant'>MD3 shell primitives</span>
              </div>
            </div>
          }
        />
      }
      toolbar={
        <PromptComposeToolbar className='justify-between pt-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <PromptComposeToken tone='accent' icon={<Sparkles className='w-3.5 h-3.5' />}>
              AI Workspace
            </PromptComposeToken>
            <PromptComposeToken icon={<Database className='w-3.5 h-3.5' />}>
              DB Active
            </PromptComposeToken>
          </div>
          <div className='flex items-center gap-2'>
            <PromptComposeAction icon={<RefreshCw className='w-4 h-4' />} label='Sync' />
            <PromptComposeAction icon={<Settings2 className='w-4 h-4' />} label='Settings' />
          </div>
        </PromptComposeToolbar>
      }
      footer={
        <PromptCompose.Footer
          helpers={<span>Shift + Enter for newline · /menu for commands</span>}
          usage='Enter to send'
        />
      }
    >
      <PromptComposeInput placeholder='Compose prompt with primitive controls…' />
    </PromptComposeShell>
  ),
};
