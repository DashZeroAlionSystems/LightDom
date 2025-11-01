/**
 * UX Patterns Documentation - Research-Based Design Principles
 * Comprehensive guide to proven UX patterns and their implementation
 */

export interface UXPattern {
  id: string;
  name: string;
  description: string;
  principles: string[];
  benefits: string[];
  implementation: string[];
  examples: string[];
  research: string;
  accessibility: string[];
}

export const UX_PATTERNS: UXPattern[] = [
  {
    id: 'progressive-disclosure',
    name: 'Progressive Disclosure',
    description: 'Revealing information and features progressively to avoid overwhelming users and reduce cognitive load.',
    principles: [
      'Show only what\'s necessary at each step',
      'Group related information together',
      'Provide clear paths to additional details',
      'Use visual hierarchy to guide attention',
    ],
    benefits: [
      'Reduces cognitive load and decision fatigue',
      'Improves focus on primary tasks',
      'Creates cleaner, less intimidating interfaces',
      'Accommodates both novice and expert users',
    ],
    implementation: [
      'Use collapsible sections for advanced options',
      'Implement multi-step wizards for complex processes',
      'Provide "Learn more" links for additional context',
      'Use tooltips and popovers for supplementary information',
    ],
    examples: [
      'Advanced settings hidden behind "Show more"',
      'Multi-step form wizards',
      'Expandable FAQ sections',
      'Contextual help tooltips',
    ],
    research: 'Based on cognitive load theory and Hick\'s Law - more options increase decision time. Studies show that progressive disclosure can improve task completion rates by up to 35%.',
    accessibility: [
      'Ensure all hidden content is accessible via keyboard',
      'Provide clear indicators for expandable content',
      'Maintain focus management when revealing/hiding content',
      'Use ARIA attributes for screen readers',
    ],
  },
  {
    id: 'immediate-feedback',
    name: 'Immediate Feedback',
    description: 'Providing instant responses to user actions to create a sense of control and confidence.',
    principles: [
      'Acknowledge every user interaction',
      'Provide clear success/error states',
      'Use micro-interactions for engagement',
      'Maintain system responsiveness',
    ],
    benefits: [
      'Increases user confidence and trust',
      'Reduces uncertainty and anxiety',
      'Creates more engaging interactions',
      'Helps users understand system state',
    ],
    implementation: [
      'Show loading states for async operations',
      'Display success/error messages immediately',
      'Use hover states to indicate interactivity',
      'Implement real-time validation feedback',
    ],
    examples: [
      'Form validation that appears as you type',
      'Button press animations',
      'Progress indicators for file uploads',
      'Toast notifications for actions',
    ],
    research: 'Nielsen Norman Group research shows that immediate feedback can increase user satisfaction by 47% and reduce error rates by 28%.',
    accessibility: [
      'Provide non-visual feedback for screen readers',
      'Ensure feedback doesn\'t interfere with keyboard navigation',
      'Use appropriate ARIA live regions for dynamic content',
      'Maintain sufficient color contrast for status indicators',
    ],
  },
  {
    id: 'consistent-navigation',
    name: 'Consistent Navigation',
    description: 'Maintaining predictable navigation patterns across the application to reduce learning curve.',
    principles: [
      'Keep navigation in expected locations',
      'Use consistent terminology and icons',
      'Maintain visual hierarchy',
      'Provide clear location indicators',
    ],
    benefits: [
      'Reduces learning time for new users',
      'Increases navigation efficiency',
      'Creates sense of familiarity and trust',
      'Supports user mental models',
    ],
    implementation: [
      'Use breadcrumbs for hierarchical navigation',
      'Implement step indicators for multi-step processes',
      'Maintain consistent menu structures',
      'Provide clear visual feedback for current location',
    ],
    examples: [
      'Breadcrumb trails showing page hierarchy',
      'Step wizards with clear progress indication',
      'Consistent sidebar navigation',
      'Persistent primary navigation',
    ],
    research: 'Research shows that consistent navigation can reduce task completion time by 22% and improve user satisfaction scores by 34%.',
    accessibility: [
      'Ensure keyboard accessibility for all navigation elements',
      'Provide skip links for keyboard users',
      'Use semantic HTML for navigation structure',
      'Maintain focus order consistency',
    ],
  },
  {
    id: 'data-visualization',
    name: 'Data Visualization',
    description: 'Presenting complex data in visual formats that are easy to understand and analyze.',
    principles: [
      'Choose appropriate chart types for data',
      'Use color consistently and meaningfully',
      'Provide clear labels and legends',
      'Highlight important insights',
    ],
    benefits: [
      'Makes complex data digestible',
      'Reveals patterns and trends quickly',
      'Supports data-driven decision making',
      'Engages users with information',
    ],
    implementation: [
      'Use animated counters for statistics',
      'Implement progress bars for completion metrics',
      'Use color coding for status indicators',
      'Provide interactive data exploration',
    ],
    examples: [
      'Animated statistics cards',
      'Progress bars with percentage labels',
      'Color-coded status indicators',
      'Interactive charts and graphs',
    ],
    research: 'MIT research shows that visual data processing is 60,000x faster than text processing, making effective visualization crucial for user understanding.',
    accessibility: [
      'Provide text alternatives for visual data',
      'Ensure sufficient color contrast',
      'Don\'t rely solely on color to convey information',
      'Make interactive elements keyboard accessible',
    ],
  },
  {
    id: 'form-design',
    name: 'Smart Form Design',
    description: 'Creating forms that are intuitive, efficient, and error-resistant through thoughtful design.',
    principles: [
      'Group related fields logically',
      'Provide clear labels and instructions',
      'Use appropriate input types',
      'Implement smart validation',
    ],
    benefits: [
      'Reduces form completion time',
      'Decreases error rates',
      'Improves user confidence',
      'Increases conversion rates',
    ],
    implementation: [
      'Use inline validation feedback',
      'Implement smart defaults and autofill',
      'Provide clear error messages',
      'Use progressive disclosure for optional fields',
    ],
    examples: [
      'Real-time form validation',
      'Smart input formatting',
      'Conditional field revealing',
      'Multi-step form wizards',
    ],
    research: 'Baymard Institute research shows that well-designed forms can increase conversion rates by up to 56% and reduce validation errors by 41%.',
    accessibility: [
      'Associate labels with form controls',
      'Provide clear error messages',
      'Ensure keyboard accessibility',
      'Use appropriate input types for mobile',
    ],
  },
  {
    id: 'status-feedback',
    name: 'Status and Feedback',
    description: 'Keeping users informed about system state and their actions through clear visual indicators.',
    principles: [
      'Show system status prominently',
      'Use consistent status indicators',
      'Provide context for status changes',
      'Use appropriate urgency levels',
    ],
    benefits: [
      'Reduces user uncertainty',
      'Improves system transparency',
      'Supports better decision making',
      'Increases user trust',
    ],
    implementation: [
      'Use color-coded status indicators',
      'Implement real-time status updates',
      'Provide clear notification systems',
      'Use progress indicators for ongoing operations',
    ],
    examples: [
      'User presence indicators',
      'System health monitors',
      'Notification systems',
      'Progress indicators',
    ],
    research: 'Research indicates that clear status feedback can reduce user anxiety by 38% and improve task completion rates by 25%.',
    accessibility: [
      'Provide text alternatives for status icons',
      'Use sufficient color contrast',
      'Don\'t rely solely on color for status',
      'Ensure status updates are announced to screen readers',
    ],
  },
  {
    id: 'content-organization',
    name: 'Content Organization',
    description: 'Structuring content in logical, scannable formats that help users find information quickly.',
    principles: [
      'Use clear visual hierarchy',
      'Group related content together',
      'Provide multiple navigation paths',
      'Use consistent formatting patterns',
    ],
    benefits: [
      'Improves information findability',
      'Reduces cognitive load',
      'Supports different user strategies',
      'Enhances content scanning',
    ],
    implementation: [
      'Use cards for content grouping',
      'Implement tags and categories',
      'Provide search and filtering',
      'Use consistent typography',
    ],
    examples: [
      'Activity timelines',
      'Tag-based categorization',
      'Card-based layouts',
      'Hierarchical content structure',
    ],
    research: 'Nielsen research shows that well-organized content can improve user task success rates by 47% and reduce time on task by 32%.',
    accessibility: [
      'Use semantic HTML for content structure',
      'Provide proper heading hierarchy',
      'Ensure keyboard navigation through content',
      'Make interactive elements clearly identifiable',
    ],
  },
];

export interface UXGuideline {
  category: string;
  principles: string[];
  bestPractices: string[];
  commonMistakes: string[];
  metrics: string[];
}

export const UX_GUIDELINES: UXGuideline[] = [
  {
    category: 'Visual Design',
    principles: [
      'Maintain visual hierarchy to guide attention',
      'Use consistent spacing and alignment',
      'Apply color purposefully and consistently',
      'Ensure sufficient contrast for readability',
    ],
    bestPractices: [
      'Use an 8pt grid system for spacing',
      'Limit color palette to 3-5 primary colors',
      'Maintain consistent border radius (4-8px)',
      'Use typography scale for hierarchy',
    ],
    commonMistakes: [
      'Using too many colors or fonts',
      'Inconsistent spacing throughout the interface',
      'Poor color contrast affecting readability',
      'Lack of clear visual hierarchy',
    ],
    metrics: [
      'Visual consistency score',
      'Color contrast compliance',
      'Typography hierarchy adherence',
      'Spacing consistency rate',
    ],
  },
  {
    category: 'Interaction Design',
    principles: [
      'Provide immediate feedback for all interactions',
      'Use consistent interaction patterns',
      'Make interactive elements clearly identifiable',
      'Support both novice and expert users',
    ],
    bestPractices: [
      'Implement hover states for all interactive elements',
      'Use loading states for async operations',
      'Provide keyboard shortcuts for power users',
      'Use micro-interactions for engagement',
    ],
    commonMistakes: [
      'Missing hover or focus states',
      'Inconsistent button behaviors',
      'No feedback for user actions',
      'Confusing interaction patterns',
    ],
    metrics: [
      'Interaction response time',
      'User error rate',
      'Task completion time',
      'User satisfaction score',
    ],
  },
  {
    category: 'Information Architecture',
    principles: [
      'Organize content logically and intuitively',
      'Provide clear navigation paths',
      'Use consistent labeling and terminology',
      'Support multiple ways to find information',
    ],
    bestPractices: [
      'Use card sorting for content organization',
      'Implement breadcrumb navigation',
      'Provide search functionality',
      'Use clear, descriptive labels',
    ],
    commonMistakes: [
      'Deep navigation hierarchies',
      'Inconsistent terminology',
      'Poor content categorization',
      'Lack of search functionality',
    ],
    metrics: [
      'Information findability rate',
      'Navigation efficiency',
      'Search success rate',
      'Task completion rate',
    ],
  },
  {
    category: 'Accessibility',
    principles: [
      'Ensure keyboard accessibility for all features',
      'Provide sufficient color contrast',
      'Use semantic HTML correctly',
      'Support screen readers and assistive technologies',
    ],
    bestPractices: [
      'Test with keyboard only navigation',
      'Use ARIA labels and landmarks',
      'Provide alt text for images',
      'Ensure focus management is logical',
    ],
    commonMistakes: [
      'Relying solely on color for information',
      'Missing keyboard accessibility',
      'Poor focus management',
      'Lack of screen reader support',
    ],
    metrics: [
      'WCAG compliance score',
      'Keyboard navigation coverage',
      'Screen reader compatibility',
      'Color contrast compliance',
    ],
  },
];

export interface UXMetric {
  name: string;
  description: string;
  category: 'usability' | 'performance' | 'engagement' | 'conversion';
  target: string;
  measurement: string;
}

export const UX_METRICS: UXMetric[] = [
  {
    name: 'Task Success Rate',
    description: 'Percentage of users who successfully complete a given task',
    category: 'usability',
    target: '> 90%',
    measurement: 'User testing sessions, analytics tracking',
  },
  {
    name: 'Time on Task',
    description: 'Average time users take to complete a specific task',
    category: 'performance',
    target: '< 2 minutes for common tasks',
    measurement: 'Session recordings, analytics data',
  },
  {
    name: 'Error Rate',
    description: 'Frequency of errors users encounter while using the interface',
    category: 'usability',
    target: '< 5%',
    measurement: 'Error tracking, user feedback',
  },
  {
    name: 'User Satisfaction',
    description: 'Overall satisfaction score from user feedback',
    category: 'engagement',
    target: '> 4.5/5',
    measurement: 'Surveys, feedback forms, ratings',
  },
  {
    name: 'Conversion Rate',
    description: 'Percentage of users who complete desired actions',
    category: 'conversion',
    target: '> 15%',
    measurement: 'Analytics tracking, funnel analysis',
  },
  {
    name: 'System Usability Scale (SUS)',
    description: 'Standardized usability metric',
    category: 'usability',
    target: '> 80',
    measurement: 'SUS questionnaire responses',
  },
];

export const getUXPatternById = (id: string): UXPattern | undefined => {
  return UX_PATTERNS.find(pattern => pattern.id === id);
};

export const getUXPatternsByCategory = (category: string): UXPattern[] => {
  return UX_PATTERNS.filter(pattern => 
    pattern.name.toLowerCase().includes(category.toLowerCase())
  );
};

export const getUXGuidelinesByCategory = (category: string): UXGuideline | undefined => {
  return UX_GUIDELINES.find(guideline => 
    guideline.category.toLowerCase() === category.toLowerCase()
  );
};

export const getUXMetricsByCategory = (category: UXMetric['category']): UXMetric[] => {
  return UX_METRICS.filter(metric => metric.category === category);
};

export default {
  patterns: UX_PATTERNS,
  guidelines: UX_GUIDELINES,
  metrics: UX_METRICS,
  getPatternById: getUXPatternById,
  getPatternsByCategory: getUXPatternsByCategory,
  getGuidelinesByCategory: getUXGuidelinesByCategory,
  getMetricsByCategory: getUXMetricsByCategory,
};
