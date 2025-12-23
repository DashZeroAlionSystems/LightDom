import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';

/**
 * # Checkbox Component
 * 
 * Checkbox input for boolean selection in forms.
 * 
 * ## Styleguide Rules
 * - Always provide associated label
 * - Use proper disabled states
 * - Group related checkboxes together
 * - Minimum touch target: 44x44px
 */
const meta: Meta<typeof Checkbox> = {
  title: 'DESIGN SYSTEM/Atoms/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center gap-2">
        <Checkbox 
          id="checkbox-default"
          checked={checked} 
          onCheckedChange={(c) => setChecked(c === true)} 
        />
        <label htmlFor="checkbox-default" className="text-on-surface cursor-pointer">
          Default checkbox
        </label>
      </div>
    );
  },
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-checked" checked />
      <label htmlFor="checkbox-checked" className="text-on-surface">
        Checked checkbox
      </label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled" disabled />
        <label htmlFor="checkbox-disabled" className="text-on-surface-variant">
          Disabled unchecked
        </label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-disabled-checked" disabled checked />
        <label htmlFor="checkbox-disabled-checked" className="text-on-surface-variant">
          Disabled checked
        </label>
      </div>
    </div>
  ),
};

// ============================================================================
// With Description
// ============================================================================

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-start gap-3">
        <Checkbox 
          id="terms"
          checked={checked} 
          onCheckedChange={(c) => setChecked(c === true)} 
          className="mt-0.5"
        />
        <div>
          <label htmlFor="terms" className="text-on-surface font-medium cursor-pointer block">
            Accept Terms of Service
          </label>
          <p className="text-on-surface-variant text-sm">
            By checking this, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Checkbox Group
// ============================================================================

export const CheckboxGroup: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>(['email']);
    
    const toggleOption = (option: string) => {
      setSelected(prev => 
        prev.includes(option) 
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    };
    
    return (
      <div className="space-y-3">
        <p className="font-medium text-on-surface">Notification preferences:</p>
        {['email', 'sms', 'push', 'slack'].map(option => (
          <div key={option} className="flex items-center gap-2">
            <Checkbox 
              id={option}
              checked={selected.includes(option)} 
              onCheckedChange={() => toggleOption(option)}
            />
            <label htmlFor={option} className="text-on-surface cursor-pointer capitalize">
              {option === 'sms' ? 'SMS' : option} notifications
            </label>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// Form Example
// ============================================================================

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      newsletter: true,
      updates: false,
      marketing: false,
      terms: false,
    });
    
    const updateForm = (key: keyof typeof formData) => {
      setFormData(prev => ({ ...prev, [key]: !prev[key] }));
    };
    
    return (
      <div className="max-w-md p-6 bg-surface rounded-lg space-y-6">
        <h3 className="text-lg font-semibold text-on-surface">Email Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="newsletter"
              checked={formData.newsletter} 
              onCheckedChange={() => updateForm('newsletter')}
            />
            <div>
              <label htmlFor="newsletter" className="text-on-surface font-medium cursor-pointer block">
                Newsletter
              </label>
              <p className="text-on-surface-variant text-sm">
                Weekly digest of new features and updates
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox 
              id="updates"
              checked={formData.updates} 
              onCheckedChange={() => updateForm('updates')}
            />
            <div>
              <label htmlFor="updates" className="text-on-surface font-medium cursor-pointer block">
                Product updates
              </label>
              <p className="text-on-surface-variant text-sm">
                Important product updates and announcements
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox 
              id="marketing"
              checked={formData.marketing} 
              onCheckedChange={() => updateForm('marketing')}
            />
            <div>
              <label htmlFor="marketing" className="text-on-surface font-medium cursor-pointer block">
                Marketing emails
              </label>
              <p className="text-on-surface-variant text-sm">
                Special offers and promotional content
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-outline">
          <div className="flex items-start gap-3">
            <Checkbox 
              id="terms-form"
              checked={formData.terms} 
              onCheckedChange={() => updateForm('terms')}
            />
            <div>
              <label htmlFor="terms-form" className="text-on-surface font-medium cursor-pointer block">
                I agree to the terms
              </label>
              <p className="text-on-surface-variant text-sm">
                You must accept the terms to continue
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// ============================================================================
// Todo List
// ============================================================================

export const TodoList: Story = {
  render: () => {
    const [todos, setTodos] = useState([
      { id: 1, text: 'Complete design system', done: true },
      { id: 2, text: 'Review pull request', done: true },
      { id: 3, text: 'Write documentation', done: false },
      { id: 4, text: 'Deploy to production', done: false },
    ]);
    
    const toggleTodo = (id: number) => {
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, done: !todo.done } : todo
        )
      );
    };
    
    return (
      <div className="max-w-sm">
        <h3 className="font-semibold text-on-surface mb-4">Today's Tasks</h3>
        <div className="space-y-2">
          {todos.map(todo => (
            <div 
              key={todo.id} 
              className="flex items-center gap-3 p-3 bg-surface rounded-lg"
            >
              <Checkbox 
                id={`todo-${todo.id}`}
                checked={todo.done} 
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <label 
                htmlFor={`todo-${todo.id}`}
                className={`cursor-pointer flex-1 ${
                  todo.done ? 'line-through text-on-surface-variant' : 'text-on-surface'
                }`}
              >
                {todo.text}
              </label>
            </div>
          ))}
        </div>
        <p className="text-sm text-on-surface-variant mt-4">
          {todos.filter(t => t.done).length} of {todos.length} completed
        </p>
      </div>
    );
  },
};

// ============================================================================
// All States
// ============================================================================

export const AllStates: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">States</h3>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Checkbox id="unchecked" />
            <label htmlFor="unchecked">Unchecked</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="checked-state" checked />
            <label htmlFor="checked-state">Checked</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="disabled-state" disabled />
            <label htmlFor="disabled-state" className="text-on-surface-variant">Disabled</label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="disabled-checked-state" disabled checked />
            <label htmlFor="disabled-checked-state" className="text-on-surface-variant">Disabled Checked</label>
          </div>
        </div>
      </div>
    </div>
  ),
};
