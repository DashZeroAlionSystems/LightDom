import type { Meta, StoryObj } from '@storybook/react';
import { RAGWorkflowDemo } from '../../components/demo/RAGWorkflowDemo';

const meta: Meta<typeof RAGWorkflowDemo> = {
  title: 'Demo/RAG Workflow',
  component: RAGWorkflowDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# RAG Workflow UI Demo

A comprehensive demonstration of all RAG prompt response workflow UI components working together.

## Features Demonstrated

- **BotReplyBox**: Complete bot response with status, location, and list items
- **Interactive Controls**: Feedback, copy, and retry functionality
- **AccordionItem**: Nested accordions for hierarchical data
- **AddButton**: Action buttons with descriptions
- **BusyIndicator**: Processing states

## Try It Out

- Click the feedback buttons (thumbs up/down)
- Copy the content using the copy button
- Try the "Try Again" button to see retry functionality
- Select different AI models from the dropdown
- Expand the accordion items to see nested content
- Click the action buttons at the bottom

This demo shows how all components work together to create a professional RAG workflow interface.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RAGWorkflowDemo>;

export const Default: Story = {};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Fully interactive demo with all components. Try clicking around!',
      },
    },
  },
};
