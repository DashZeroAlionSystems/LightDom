import type { Meta, StoryObj } from '@storybook/react';
import { Folder, FileText, Database, Package } from 'lucide-react';
import { AccordionItem } from '../../../components/atoms/rag/AccordionItem';

const meta: Meta<typeof AccordionItem> = {
  title: 'Atoms/RAG/AccordionItem',
  component: AccordionItem,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'flat'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AccordionItem>;

export const Default: Story = {
  args: {
    title: 'Click to expand',
    children: (
      <div>
        <p>This is the accordion content. It can contain any React elements.</p>
      </div>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Project Files',
    icon: <Folder className="h-5 w-5" />,
    children: (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>index.tsx</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>App.tsx</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>package.json</span>
        </div>
      </div>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    title: 'Notifications',
    badge: (
      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-error text-error-foreground">
        3
      </span>
    ),
    children: (
      <div className="space-y-2">
        <p>You have 3 new notifications</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>New comment on your post</li>
          <li>Team invitation received</li>
          <li>System update available</li>
        </ul>
      </div>
    ),
  },
};

export const DefaultExpanded: Story = {
  args: {
    title: 'Already Expanded',
    defaultExpanded: true,
    children: (
      <p>This accordion is expanded by default when the page loads.</p>
    ),
  },
};

export const Bordered: Story = {
  args: {
    title: 'Bordered Style',
    variant: 'bordered',
    children: <p>This accordion uses the bordered variant.</p>,
  },
};

export const Flat: Story = {
  args: {
    title: 'Flat Style',
    variant: 'flat',
    children: <p>This accordion uses the flat variant, suitable for lists.</p>,
  },
};

export const Small: Story = {
  args: {
    title: 'Small Size',
    size: 'sm',
    children: <p className="text-sm">Compact accordion with small padding.</p>,
  },
};

export const Large: Story = {
  args: {
    title: 'Large Size',
    size: 'lg',
    icon: <Database className="h-6 w-6" />,
    children: <p className="text-base">Large accordion with generous spacing.</p>,
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Accordion',
    disabled: true,
    children: <p>This content cannot be viewed because the accordion is disabled.</p>,
  },
};

export const NestedAccordions: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-2">
      <AccordionItem
        title="Campaign Services"
        icon={<Package className="h-5 w-5" />}
        badge={
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            5 services
          </span>
        }
      >
        <div className="space-y-2">
          <AccordionItem
            title="SEO Optimization"
            variant="bordered"
            size="sm"
          >
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Keyword research</li>
              <li>Meta tag optimization</li>
              <li>Content analysis</li>
            </ul>
          </AccordionItem>
          
          <AccordionItem
            title="Content Marketing"
            variant="bordered"
            size="sm"
          >
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Blog post creation</li>
              <li>Social media content</li>
              <li>Email campaigns</li>
            </ul>
          </AccordionItem>
          
          <AccordionItem
            title="Analytics"
            variant="bordered"
            size="sm"
          >
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Traffic analysis</li>
              <li>Conversion tracking</li>
              <li>Performance reports</li>
            </ul>
          </AccordionItem>
        </div>
      </AccordionItem>
    </div>
  ),
};

export const MultipleFlat: Story = {
  render: () => (
    <div className="w-full max-w-2xl border border-outline rounded-lg overflow-hidden">
      <AccordionItem
        title="Getting Started"
        variant="flat"
        icon={<FileText className="h-5 w-5" />}
      >
        <p>Learn the basics of using this component library.</p>
      </AccordionItem>
      <AccordionItem
        title="Components"
        variant="flat"
        icon={<Package className="h-5 w-5" />}
        defaultExpanded
      >
        <p>Explore all available components and their properties.</p>
      </AccordionItem>
      <AccordionItem
        title="Examples"
        variant="flat"
        icon={<Folder className="h-5 w-5" />}
      >
        <p>View code examples and use cases.</p>
      </AccordionItem>
    </div>
  ),
};
