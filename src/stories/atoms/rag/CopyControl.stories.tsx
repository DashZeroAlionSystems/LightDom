import type { Meta, StoryObj } from '@storybook/react';
import { CopyControl } from '../../../components/atoms/rag/CopyControl';

const meta: Meta<typeof CopyControl> = {
  title: 'Atoms/RAG/CopyControl',
  component: CopyControl,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['icon', 'text', 'both'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof CopyControl>;

export const Default: Story = {
  args: {
    content: 'This is the content to copy',
  },
};

export const IconOnly: Story = {
  args: {
    content: 'Copy this text to your clipboard',
    variant: 'icon',
  },
};

export const TextOnly: Story = {
  args: {
    content: 'Copy this text to your clipboard',
    variant: 'text',
  },
};

export const IconAndText: Story = {
  args: {
    content: 'Copy this text to your clipboard',
    variant: 'both',
  },
};

export const Small: Story = {
  args: {
    content: 'Small copy button',
    variant: 'both',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    content: 'Medium copy button',
    variant: 'both',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    content: 'Large copy button',
    variant: 'both',
    size: 'lg',
  },
};

export const LongContent: Story = {
  args: {
    content: `This is a much longer piece of content that will be copied to the clipboard.
It includes multiple lines and demonstrates how the copy functionality works
with larger blocks of text. You can copy code snippets, error messages,
or entire conversations using this component.`,
    variant: 'both',
  },
};

export const CodeSnippet: Story = {
  args: {
    content: `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome, \${name}\`;
}

greet('World');`,
    variant: 'icon',
    size: 'sm',
  },
};

export const WithCallback: Story = {
  args: {
    content: 'Content with callback',
    variant: 'both',
    onCopySuccess: () => {
      console.log('Content copied successfully!');
      alert('Content copied!');
    },
  },
};
