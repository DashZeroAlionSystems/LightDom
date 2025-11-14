/**
 * User Story Test Template for Storybook
 * 
 * This template demonstrates how to write user story tests using Storybook's
 * interaction testing capabilities with @storybook/addon-interactions.
 * 
 * User Story Format:
 * - As a [role]
 * - I want to [action]
 * - So that [benefit]
 * 
 * @see https://storybook.js.org/docs/writing-tests/interaction-testing
 */

import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent, expect, waitFor } from '@storybook/test';
import { Button } from '../../../components/atoms/Button/Button';

const meta: Meta<typeof Button> = {
  title: 'User Stories/Button Interactions',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'User story tests for Button component interactions.',
      },
    },
  },
  tags: ['autodocs', 'user-story', 'test'],
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * User Story: Click Button to Perform Action
 * 
 * As a user
 * I want to click a button
 * So that I can trigger an action
 */
export const ClickButtonInteraction: Story = {
  args: {
    children: 'Click Me',
    variant: 'filled',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Step 1: Find the button
    const button = canvas.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    
    // Step 2: Verify button is clickable
    expect(button).not.toBeDisabled();
    
    // Step 3: Click the button
    await userEvent.click(button);
    
    // Step 4: Verify button is still in document (basic interaction test)
    expect(button).toBeInTheDocument();
  },
};

/**
 * User Story: Disabled Button Cannot Be Clicked
 * 
 * As a user
 * I want disabled buttons to be non-interactive
 * So that I don't accidentally trigger actions when they're not available
 */
export const DisabledButtonInteraction: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    variant: 'filled',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Step 1: Find the button
    const button = canvas.getByRole('button', { name: /disabled button/i });
    expect(button).toBeInTheDocument();
    
    // Step 2: Verify button is disabled
    expect(button).toBeDisabled();
    
    // Step 3: Verify button has appropriate aria attributes
    expect(button).toHaveAttribute('disabled');
  },
};

/**
 * User Story: Loading Button Shows Spinner
 * 
 * As a user
 * I want to see a loading indicator when a button is processing
 * So that I know my action is being handled
 */
export const LoadingButtonInteraction: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    variant: 'filled',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // Step 1: Find the button
    const button = canvas.getByRole('button', { name: /loading/i });
    expect(button).toBeInTheDocument();
    
    // Step 2: Verify button shows loading state (should be disabled)
    expect(button).toBeDisabled();
  },
};
