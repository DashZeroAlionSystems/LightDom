/**
 * TextArea Component Stories
 * 
 * Multi-line text input component for longer content.
 * Following LightDom Design System guidelines.
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

// Inline TextArea component for Storybook
const TextArea: React.FC<{
  label?: string;
  helperText?: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
}> = ({
  label,
  helperText,
  error,
  size = 'md',
  placeholder,
  disabled = false,
  rows = 4,
  maxLength,
  showCount = false,
  value = '',
  onChange,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const stateClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className={`
            w-full rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-800
            transition-colors duration-200
            ${sizeClasses[size]}
            ${stateClasses}
          `}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {(helperText || error) && (
        <p className={`text-sm px-1 ${error ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

const meta: Meta<typeof TextArea> = {
  title: 'DESIGN SYSTEM/Atoms/TextArea',
  component: TextArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## TextArea Component

Multi-line text input for longer form content like descriptions, comments, and messages.

### Design System Rules
- **Min Height**: 4 rows (default) for adequate input space
- **Resize**: Vertical resize only to maintain layout
- **Border Radius**: 12px (rounded-xl) for consistency
- **Character Count**: Show when maxLength is set
- **Focus Ring**: 2px ring with offset for accessibility

### Accessibility
- Always include a label (visible or sr-only)
- Helper text should describe requirements
- Error messages must be descriptive
- Supports keyboard navigation

### When to Use
- Long-form text input (descriptions, bios, comments)
- Message composition
- Code or structured text input
- Multi-line addresses
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

// Default
export const Default: Story = {
  args: {
    label: 'Description',
    placeholder: 'Enter your description...',
    helperText: 'Provide a detailed description',
  },
};

// Size variants
export const SizeVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <TextArea
        label="Small"
        size="sm"
        placeholder="Small textarea"
        rows={3}
      />
      <TextArea
        label="Medium (default)"
        size="md"
        placeholder="Medium textarea"
        rows={3}
      />
      <TextArea
        label="Large"
        size="lg"
        placeholder="Large textarea"
        rows={3}
      />
    </div>
  ),
};

// With character count
export const WithCharacterCount: Story = {
  render: function CharacterCountDemo() {
    const [value, setValue] = useState('');
    
    return (
      <div className="max-w-md">
        <TextArea
          label="Bio"
          placeholder="Tell us about yourself..."
          maxLength={280}
          showCount
          value={value}
          onChange={(e) => setValue(e.target.value)}
          helperText="Brief description for your profile"
        />
      </div>
    );
  },
};

// Error state
export const ErrorState: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <TextArea
        label="Message"
        placeholder="Enter your message..."
        error="Message is required"
      />
      <TextArea
        label="Comment"
        placeholder="Add a comment..."
        error="Comment must be at least 10 characters"
        value="Short"
      />
    </div>
  ),
};

// Disabled state
export const DisabledState: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <TextArea
        label="Read-only content"
        value="This textarea is disabled and cannot be edited."
        disabled
      />
      <TextArea
        label="Empty disabled"
        placeholder="Cannot enter text here..."
        disabled
        helperText="This field is currently unavailable"
      />
    </div>
  ),
};

// Different row counts
export const RowVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <TextArea
        label="Short (2 rows)"
        placeholder="Brief input..."
        rows={2}
      />
      <TextArea
        label="Default (4 rows)"
        placeholder="Standard input..."
        rows={4}
      />
      <TextArea
        label="Long (8 rows)"
        placeholder="Extended input for longer content..."
        rows={8}
      />
    </div>
  ),
};

// Real-world examples
export const CommentForm: Story = {
  render: function CommentFormDemo() {
    const [comment, setComment] = useState('');
    
    return (
      <div className="max-w-lg p-6 border rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leave a Comment</h3>
        
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            JD
          </div>
          <div className="flex-1">
            <TextArea
              placeholder="Write your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              showCount
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={!comment.trim()}
          >
            Post Comment
          </button>
        </div>
      </div>
    );
  },
};

export const FeedbackForm: Story = {
  render: function FeedbackFormDemo() {
    const [feedback, setFeedback] = useState({
      subject: '',
      details: '',
    });
    
    return (
      <div className="max-w-lg p-6 border rounded-lg space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Send Feedback</h3>
          <p className="text-sm text-gray-500">Help us improve by sharing your thoughts</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              placeholder="What's this about?"
              value={feedback.subject}
              onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <TextArea
            label="Details"
            placeholder="Please provide as much detail as possible..."
            value={feedback.details}
            onChange={(e) => setFeedback({ ...feedback, details: e.target.value })}
            rows={6}
            helperText="Include steps to reproduce if reporting a bug"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {['Bug', 'Feature Request', 'General', 'Other'].map((cat) => (
                <button
                  key={cat}
                  className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Submit Feedback
          </button>
        </div>
      </div>
    );
  },
};

export const MarkdownEditor: Story = {
  render: function MarkdownEditorDemo() {
    const [content, setContent] = useState(`# Welcome to the Editor

This is a **markdown** editor example.

## Features
- Rich text formatting
- Live preview
- Syntax highlighting

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`);
    
    return (
      <div className="max-w-2xl">
        <div className="border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-bold">B</button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded italic">I</button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded line-through">S</button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded font-mono text-sm">{`</>`}</button>
          </div>
          
          {/* Editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none resize-none"
            rows={12}
          />
          
          {/* Footer */}
          <div className="flex items-center justify-between p-2 border-t bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
            <span>Markdown supported</span>
            <span>{content.length} characters</span>
          </div>
        </div>
      </div>
    );
  },
};
