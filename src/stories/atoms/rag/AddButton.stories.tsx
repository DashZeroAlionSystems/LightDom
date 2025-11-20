import type { Meta, StoryObj } from '@storybook/react';
import { Plus, Upload, Download, Mail, Share2 } from 'lucide-react';
import { AddButton } from '../../../components/atoms/rag/AddButton';

const meta: Meta<typeof AddButton> = {
  title: 'Atoms/RAG/AddButton',
  component: AddButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AddButton>;

export const Default: Story = {
  args: {
    label: 'Add',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Add Item',
    description: 'Create a new item in your list',
  },
};

export const Primary: Story = {
  args: {
    label: 'Add Campaign',
    description: 'Start a new marketing campaign',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Add Task',
    description: 'Create a new task',
    variant: 'secondary',
  },
};

export const Outlined: Story = {
  args: {
    label: 'Add Member',
    description: 'Invite a team member',
    variant: 'outlined',
  },
};

export const Small: Story = {
  args: {
    label: 'Add',
    description: 'Quick add',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    label: 'Add Item',
    description: 'Add to collection',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    label: 'Add Project',
    description: 'Create a new project workspace',
    size: 'lg',
  },
};

export const CustomIcon: Story = {
  args: {
    label: 'Upload File',
    description: 'Select files from your device',
    icon: <Upload className="h-5 w-5" />,
  },
};

export const DownloadAction: Story = {
  args: {
    label: 'Download',
    description: 'Save to your device',
    icon: <Download className="h-5 w-5" />,
    variant: 'secondary',
  },
};

export const ShareAction: Story = {
  args: {
    label: 'Share',
    description: 'Share with others',
    icon: <Share2 className="h-5 w-5" />,
    variant: 'outlined',
  },
};

export const EmailAction: Story = {
  args: {
    label: 'Send Email',
    description: 'Compose and send',
    icon: <Mail className="h-5 w-5" />,
    variant: 'primary',
    size: 'lg',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Add New Service',
    description: 'Configure and deploy a new service',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const WithoutIcon: Story = {
  args: {
    label: 'Continue',
    description: 'Proceed to next step',
    icon: null,
  },
};

export const OnClick: Story = {
  args: {
    label: 'Add Item',
    description: 'Click to add',
    onClick: () => {
      console.log('Add button clicked!');
      alert('Add button clicked!');
    },
  },
};

export const Disabled: Story = {
  args: {
    label: 'Add',
    description: 'Currently unavailable',
    disabled: true,
  },
};

export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-3">
      <AddButton
        label="Add Task"
        description="Quick add"
        size="sm"
        variant="outlined"
      />
      <AddButton
        label="Add Project"
        description="New workspace"
        size="md"
        variant="secondary"
      />
      <AddButton
        label="Add Campaign"
        description="Marketing initiative"
        size="lg"
        variant="primary"
      />
    </div>
  ),
};

export const VerticalStack: Story = {
  render: () => (
    <div className="w-80 space-y-3">
      <AddButton
        label="Add Service"
        description="Deploy a new microservice"
        fullWidth
        icon={<Plus className="h-5 w-5" />}
      />
      <AddButton
        label="Upload Data"
        description="Import data from file"
        fullWidth
        variant="outlined"
        icon={<Upload className="h-5 w-5" />}
      />
      <AddButton
        label="Share Project"
        description="Invite collaborators"
        fullWidth
        variant="secondary"
        icon={<Share2 className="h-5 w-5" />}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
