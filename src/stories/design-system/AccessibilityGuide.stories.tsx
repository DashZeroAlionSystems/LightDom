import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Typography } from '../../components/atoms/Typography/Typography';
import { Card } from '../../components/atoms/Card/Card';
import { Button } from '../../components/atoms/Button/Button';
import { Input } from '../../components/atoms/Input/Input';
import { Badge } from '../../components/atoms/Badge/Badge';
import { Divider } from '../../components/atoms/Divider/Divider';
import {
  getContrastRatio,
  meetsContrastRequirement,
  prefersReducedMotion,
  announceToScreenReader,
  trapFocus,
  handleButtonKeyDown,
} from '../../utils/accessibility';
import { designTokens } from '../../utils/designTokens';

const meta: Meta = {
  title: 'Design System/Accessibility Guide',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Comprehensive guide to accessibility features and best practices in the LightDom design system.',
      },
    },
  },
};

export default meta;

// Introduction Story
export const Introduction: StoryObj = {
  render: () => (
    <div className="max-w-4xl space-y-8">
      <div>
        <Typography variant="h1" className="mb-4">Accessibility Guide</Typography>
        <Typography variant="lead" className="text-gray-600 dark:text-gray-400">
          Building inclusive and accessible user interfaces following WCAG 2.1 AA standards.
        </Typography>
      </div>

      <Divider />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated" accentColor="blue">
          <Card.Header>
            <Typography variant="h3">🎯 Our Commitment</Typography>
          </Card.Header>
          <div className="p-6">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• <strong>WCAG 2.1 AA</strong> compliance</li>
              <li>• <strong>Keyboard navigation</strong> support</li>
              <li>• <strong>Screen reader</strong> optimized</li>
              <li>• <strong>Color contrast</strong> standards</li>
              <li>• <strong>Reduced motion</strong> support</li>
              <li>• <strong>Focus management</strong></li>
            </ul>
          </div>
        </Card>

        <Card variant="elevated" accentColor="purple">
          <Card.Header>
            <Typography variant="h3">📚 Resources</Typography>
          </Card.Header>
          <div className="p-6">
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• <a href="https://www.w3.org/WAI/WCAG21/quickref/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">WCAG 2.1 Quick Reference</a></li>
              <li>• <a href="https://webaim.org/resources/contrastchecker/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">WebAIM Contrast Checker</a></li>
              <li>• <a href="https://www.w3.org/WAI/ARIA/apg/" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">ARIA Authoring Practices</a></li>
              <li>• <a href="https://developer.mozilla.org/en-US/docs/Web/Accessibility" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">MDN Accessibility</a></li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  ),
};

// Color Contrast Story
export const ColorContrast: StoryObj = {
  render: () => {
    const colorCombinations = [
      { fg: '#000000', bg: '#FFFFFF', name: 'Black on White' },
      { fg: '#FFFFFF', bg: '#000000', name: 'White on Black' },
      { fg: designTokens.colors.primary[700], bg: '#FFFFFF', name: 'Primary 700 on White' },
      { fg: '#FFFFFF', bg: designTokens.colors.primary[600], name: 'White on Primary 600' },
      { fg: designTokens.colors.gray[600], bg: '#FFFFFF', name: 'Gray 600 on White' },
      { fg: designTokens.colors.error[600], bg: '#FFFFFF', name: 'Error 600 on White' },
      { fg: designTokens.colors.success[700], bg: '#FFFFFF', name: 'Success 700 on White' },
      { fg: '#FFFF00', bg: '#FFFFFF', name: 'Yellow on White (Fail)' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Color Contrast Checking</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            WCAG 2.1 requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorCombinations.map(({ fg, bg, name }) => {
            const ratio = getContrastRatio(fg, bg);
            const meetsAA = meetsContrastRequirement(ratio, 'AA', 'normal');
            const meetsAAA = meetsContrastRequirement(ratio, 'AAA', 'normal');
            const meetsAALarge = meetsContrastRequirement(ratio, 'AA', 'large');

            return (
              <Card key={name} variant="outlined">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Typography variant="h4">{name}</Typography>
                    <Badge variant={meetsAA ? 'success' : 'error'}>
                      {ratio.toFixed(2)}:1
                    </Badge>
                  </div>

                  <div
                    className="p-4 rounded-lg flex items-center justify-center min-h-[100px]"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    <Typography variant="body1" style={{ color: fg }}>
                      Sample Text
                    </Typography>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>WCAG AA (Normal):</span>
                      <Badge variant={meetsAA ? 'success' : 'error'} size="sm">
                        {meetsAA ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>WCAG AAA (Normal):</span>
                      <Badge variant={meetsAAA ? 'success' : 'error'} size="sm">
                        {meetsAAA ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>WCAG AA (Large):</span>
                      <Badge variant={meetsAALarge ? 'success' : 'error'} size="sm">
                        {meetsAALarge ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  },
};

// Keyboard Navigation Story
export const KeyboardNavigation: StoryObj = {
  render: () => {
    const [focusedItem, setFocusedItem] = React.useState<string | null>(null);

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Keyboard Navigation</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            All interactive elements must be keyboard accessible. Use Tab, Enter, Space, and Arrow keys.
          </Typography>
        </div>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Keyboard Shortcuts Reference</Typography>
          </Card.Header>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'Tab', action: 'Move focus to next element' },
                { key: 'Shift + Tab', action: 'Move focus to previous element' },
                { key: 'Enter', action: 'Activate focused element' },
                { key: 'Space', action: 'Activate button or toggle checkbox' },
                { key: 'Escape', action: 'Close modal or dropdown' },
                { key: 'Arrow Keys', action: 'Navigate within component (e.g., menu)' },
                { key: 'Home', action: 'Jump to first item' },
                { key: 'End', action: 'Jump to last item' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Badge variant="secondary" className="shrink-0">{key}</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{action}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Interactive Example</Typography>
          </Card.Header>
          <div className="p-6">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
              Try navigating these buttons using Tab and Enter/Space keys:
            </Typography>
            <div className="flex flex-wrap gap-3">
              {['First', 'Second', 'Third', 'Fourth', 'Fifth'].map((label) => (
                <Button
                  key={label}
                  variant="outlined"
                  onFocus={() => setFocusedItem(label)}
                  onBlur={() => setFocusedItem(null)}
                  onClick={() => announceToScreenReader(`${label} button clicked`)}
                >
                  {label} Button
                </Button>
              ))}
            </div>
            {focusedItem && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Typography variant="body2" className="text-blue-700 dark:text-blue-300">
                  Currently focused: <strong>{focusedItem}</strong>
                </Typography>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  },
};

// ARIA Labels Story
export const ARIALabels: StoryObj = {
  render: () => (
    <div className="space-y-6">
      <div>
        <Typography variant="h2" className="mb-4">ARIA Labels & Attributes</Typography>
        <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
          Proper ARIA attributes help screen readers understand and navigate your interface.
        </Typography>
      </div>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Common ARIA Attributes</Typography>
        </Card.Header>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">aria-label</code>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Provides a text alternative for elements without visible text.
            </Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              <code>{`<button aria-label="Close dialog">
  <XIcon />
</button>`}</code>
            </pre>
          </div>

          <Divider />

          <div className="space-y-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">aria-describedby</code>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              References elements that describe the current element.
            </Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              <code>{`<input 
  id="email" 
  aria-describedby="email-help"
/>
<span id="email-help">
  We'll never share your email.
</span>`}</code>
            </pre>
          </div>

          <Divider />

          <div className="space-y-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">aria-invalid</code>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Indicates the entered value is invalid.
            </Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              <code>{`<input 
  aria-invalid="true"
  aria-describedby="error-message"
/>`}</code>
            </pre>
          </div>

          <Divider />

          <div className="space-y-2">
            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">aria-live</code>
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Announces dynamic content changes to screen readers.
            </Typography>
            <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
              <code>{`<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>`}</code>
            </pre>
          </div>
        </div>
      </Card>

      <Card variant="outlined">
        <Card.Header>
          <Typography variant="h3">Live Example: Form with ARIA</Typography>
        </Card.Header>
        <div className="p-6">
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); announceToScreenReader('Form submitted successfully', 'polite'); }}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username <span className="text-red-500" aria-label="required">*</span>
              </label>
              <Input
                id="username"
                type="text"
                required
                aria-required="true"
                aria-describedby="username-help"
              />
              <span id="username-help" className="text-xs text-gray-500 dark:text-gray-400">
                Choose a unique username
              </span>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                aria-describedby="email-help"
              />
              <span id="email-help" className="text-xs text-gray-500 dark:text-gray-400">
                We'll never share your email
              </span>
            </div>

            <Button type="submit">Submit Form</Button>
          </form>
        </div>
      </Card>
    </div>
  ),
};

// Reduced Motion Story
export const ReducedMotion: StoryObj = {
  render: () => {
    const [isAnimating, setIsAnimating] = React.useState(false);
    const reducedMotion = prefersReducedMotion();

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Reduced Motion Support</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            Respecting user preferences for reduced motion improves accessibility for users with vestibular disorders.
          </Typography>
        </div>

        <Card variant="outlined">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="h4">Your Preference</Typography>
              <Badge variant={reducedMotion ? 'warning' : 'success'}>
                {reducedMotion ? 'Reduced Motion ON' : 'Reduced Motion OFF'}
              </Badge>
            </div>

            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              {reducedMotion 
                ? 'Your system is set to reduce motion. Animations will be minimized or disabled.'
                : 'Your system allows motion. Animations will play normally.'}
            </Typography>

            <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button onClick={() => setIsAnimating(!isAnimating)} className="mb-4">
                Toggle Animation
              </Button>

              <div className="relative h-32 bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`absolute top-0 left-0 w-16 h-16 bg-blue-500 rounded-lg ${
                    isAnimating ? 'animate-bounce' : ''
                  }`}
                  style={{
                    animation: isAnimating && !reducedMotion ? 'bounce 1s infinite' : 'none',
                  }}
                />
              </div>

              <Typography variant="caption" className="text-gray-600 dark:text-gray-400 mt-2">
                {reducedMotion && isAnimating 
                  ? 'Animation disabled due to reduced motion preference'
                  : isAnimating 
                    ? 'Animation playing'
                    : 'Click button to start animation'}
              </Typography>
            </div>

            <Divider />

            <div>
              <Typography variant="h4" className="mb-2">Implementation</Typography>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { prefersReducedMotion } from '@/utils/accessibility';

// Check user preference
const shouldAnimate = !prefersReducedMotion();

// Use in CSS
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}`}</code>
              </pre>
            </div>
          </div>
        </Card>
      </div>
    );
  },
};

// Focus Management Story
export const FocusManagement: StoryObj = {
  render: () => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const modalRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (isModalOpen && modalRef.current) {
        const cleanup = trapFocus(modalRef.current);
        return cleanup;
      }
    }, [isModalOpen]);

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Focus Management</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            Proper focus management ensures keyboard users can navigate efficiently.
          </Typography>
        </div>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Focus Trap Example</Typography>
          </Card.Header>
          <div className="p-6">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
              When a modal opens, focus should be trapped inside it until it's closed.
            </Typography>

            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal with Focus Trap
            </Button>

            {isModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                  <Typography variant="h3" className="mb-4">Modal Dialog</Typography>
                  <Typography variant="body2" className="text-gray-600 dark:text-gray-400 mb-4">
                    Try using Tab to navigate. Focus will stay within this modal.
                  </Typography>

                  <div className="space-y-3 mb-4">
                    <Input placeholder="First input" />
                    <Input placeholder="Second input" />
                    <Input placeholder="Third input" />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                      Confirm
                    </Button>
                    <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Best Practices</Typography>
          </Card.Header>
          <div className="p-6">
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              <li>✓ Set focus to the first interactive element when opening modals</li>
              <li>✓ Return focus to the trigger element when closing modals</li>
              <li>✓ Trap focus within modal dialogs</li>
              <li>✓ Provide visible focus indicators</li>
              <li>✓ Ensure logical tab order</li>
              <li>✓ Skip to main content link for keyboard users</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  },
};

// Screen Reader Story
export const ScreenReaderSupport: StoryObj = {
  render: () => {
    const [message, setMessage] = React.useState('');

    const handleAnnounce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
      announceToScreenReader(text, priority);
      setMessage(`Announced (${priority}): "${text}"`);
      setTimeout(() => setMessage(''), 3000);
    };

    return (
      <div className="space-y-6">
        <div>
          <Typography variant="h2" className="mb-4">Screen Reader Support</Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400 mb-6">
            Make your content accessible to users who rely on screen readers.
          </Typography>
        </div>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Live Announcements</Typography>
          </Card.Header>
          <div className="p-6 space-y-4">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Use ARIA live regions to announce dynamic content changes to screen readers.
            </Typography>

            <div className="flex gap-3">
              <Button 
                variant="outlined"
                onClick={() => handleAnnounce('This is a polite announcement', 'polite')}
              >
                Announce (Polite)
              </Button>
              <Button 
                variant="primary"
                onClick={() => handleAnnounce('This is an assertive announcement!', 'assertive')}
              >
                Announce (Assertive)
              </Button>
            </div>

            {message && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Typography variant="body2" className="text-blue-700 dark:text-blue-300">
                  {message}
                </Typography>
              </div>
            )}

            <Divider />

            <div>
              <Typography variant="h4" className="mb-2">Implementation</Typography>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{`import { announceToScreenReader } from '@/utils/accessibility';

// Announce to screen reader
announceToScreenReader('Item added to cart', 'polite');

// For urgent messages
announceToScreenReader('Error occurred!', 'assertive');`}</code>
              </pre>
            </div>
          </div>
        </Card>

        <Card variant="outlined">
          <Card.Header>
            <Typography variant="h3">Screen Reader Only Text</Typography>
          </Card.Header>
          <div className="p-6 space-y-4">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Sometimes you need text that's only visible to screen readers:
            </Typography>

            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{`<span className="sr-only">
  Additional context for screen readers
</span>

// Or use utility
import { visuallyHiddenStyles } from '@/utils/accessibility';

<span style={visuallyHiddenStyles}>
  Hidden but accessible
</span>`}</code>
            </pre>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <button className="text-blue-500 hover:underline">
                Click me
                <span className="sr-only">(opens in new window)</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  },
};
