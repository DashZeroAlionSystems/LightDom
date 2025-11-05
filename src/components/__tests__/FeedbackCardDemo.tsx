/**
 * FeedbackCard Demo/Test Component
 * Demonstrates the FeedbackCard component with various states
 */

import React, { useState } from 'react';
import FeedbackCard, { FeedbackStatus } from '../components/ui/FeedbackCard';

const FeedbackCardDemo: React.FC = () => {
  const [reviews, setReviews] = useState<Record<string, boolean>>({});

  const handleReview = (id: string, approved: boolean) => {
    setReviews(prev => ({ ...prev, [id]: approved }));
    console.log(`Feedback ${id} ${approved ? 'approved' : 'rejected'}`);
  };

  const demoSteps = [
    {
      id: 'step-1',
      step: 1,
      title: 'Analyzing prompt',
      content: 'DeepSeek is analyzing your request to create a data mining workflow for SEO analysis.',
      status: 'success' as FeedbackStatus,
      timestamp: new Date(Date.now() - 60000),
      metadata: {
        duration: 245,
        tokens: 150
      }
    },
    {
      id: 'step-2',
      step: 2,
      title: 'DeepSeek is thinking...',
      content: `Based on your request, I'll create a comprehensive SEO data mining workflow that includes:

1. Web Crawler Component
   - Multi-threaded crawling capability
   - Robots.txt compliance
   - Rate limiting and retry logic

2. Data Extraction Module
   - Meta tags parsing
   - Heading structure analysis
   - Content quality metrics
   - Backlink extraction

3. Analysis Engine
   - Keyword density calculation
   - Readability scoring
   - SEO score computation
   - Competitive analysis

4. Storage Layer
   - PostgreSQL for structured data
   - Redis for caching
   - S3 for raw HTML storage

Let me generate the schemas for these components...`,
      status: 'success' as FeedbackStatus,
      timestamp: new Date(Date.now() - 45000),
      metadata: {
        duration: 3420,
        tokens: 850,
        thinking_time: '3.4s'
      }
    },
    {
      id: 'step-3',
      step: 3,
      title: 'Schema generated',
      content: 'Successfully generated workflow schema with 4 tasks and dependencies.',
      status: 'success' as FeedbackStatus,
      timestamp: new Date(Date.now() - 30000),
      schema: {
        id: 'workflow-seo-data-mining-1',
        name: 'SEO Data Mining Workflow',
        description: 'Comprehensive SEO analysis and data mining workflow',
        tasks: [
          {
            id: 'task-1',
            name: 'Web Crawler',
            type: 'crawl',
            dependencies: []
          },
          {
            id: 'task-2',
            name: 'Data Extraction',
            type: 'extract',
            dependencies: ['task-1']
          },
          {
            id: 'task-3',
            name: 'SEO Analysis',
            type: 'analyze',
            dependencies: ['task-2']
          },
          {
            id: 'task-4',
            name: 'Report Generation',
            type: 'report',
            dependencies: ['task-3']
          }
        ]
      },
      metadata: {
        schemasGenerated: 4,
        tasksCreated: 4,
        dependencies: 3
      }
    },
    {
      id: 'step-4',
      step: 4,
      title: 'Component generation in progress',
      content: 'Generating React components for the workflow dashboard...',
      status: 'processing' as FeedbackStatus,
      timestamp: new Date(Date.now() - 5000)
    },
    {
      id: 'step-5',
      step: 5,
      title: 'Warning: Rate limit approaching',
      content: 'API rate limit is at 80%. Consider implementing caching or request throttling.',
      status: 'warning' as FeedbackStatus,
      timestamp: new Date(),
      metadata: {
        currentRate: 80,
        limit: 100,
        resetTime: '15 minutes'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FeedbackCard Component Demo
          </h1>
          <p className="text-gray-600">
            Demonstrating the collapsible feedback cards with various states and features.
          </p>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Status Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400" />
              <span className="text-sm">Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-sm">Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm">Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-sm">Warning</span>
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="space-y-4">
          {demoSteps.map((step) => (
            <FeedbackCard
              key={step.id}
              {...step}
              onReview={handleReview}
              defaultExpanded={step.status === 'processing'}
            />
          ))}
        </div>

        {/* Reviews Summary */}
        {Object.keys(reviews).length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Reviews Summary</h2>
            <div className="space-y-2">
              {Object.entries(reviews).map(([id, approved]) => (
                <div key={id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{id}</span>
                  <span className={approved ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {approved ? '✓ Approved' : '✗ Rejected'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackCardDemo;
