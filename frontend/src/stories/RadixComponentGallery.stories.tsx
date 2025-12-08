/**
 * RadixComponentGallery.stories.tsx
 * Storybook showcase for mined Radix UI atoms.
 */

import { RadixComponentGallery } from '@/components/ui/radix/RadixComponentGallery';
import { RADIX_COMPONENTS } from '@/data/radix-components.generated';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RadixComponentGallery> = {
  title: 'Design System/External/Radix Component Gallery',
  component: RadixComponentGallery,
  parameters: {
    layout: 'fullscreen',
    badges: ['beta', 'automation'],
    docs: {
      description: {
        component:
          'Aggregated Radix UI atoms mined via the styleguide crawler. Leverage this registry to cross-link external primitives into LightDom design workflows.',
      },
    },
  },
  args: {
    components: RADIX_COMPONENTS,
    highlightTags: ['navigation', 'overlay', 'input'],
  },
};

export default meta;

type Story = StoryObj<typeof RadixComponentGallery>;

export const Default: Story = {};

export const HighlightDataDisplay: Story = {
  args: {
    highlightTags: ['data', 'feedback'],
  },
};

export const NavigationFocus: Story = {
  args: {
    highlightTags: ['navigation'],
  },
};
