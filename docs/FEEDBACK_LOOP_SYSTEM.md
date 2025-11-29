# Feedback Loop System

Complete feedback loop system for learning user preferences, conducting A/B testing, and optimizing model interactions.

## Overview

The feedback loop system provides a comprehensive framework for collecting user feedback, learning preferences, conducting A/B tests, and continuously improving model interactions based on real user data.

## Features

### 🎯 Core Capabilities

1. **User Feedback Collection**
   - Thumbs up/down with strength levels (1-5)
   - Optional reason/comment input
   - Automatic preference learning
   - Backend integration with auto-submit

2. **Preference Learning**
   - Automatic inference from feedback patterns
   - Explicit preference setting
   - Confidence scoring
   - Priority levels

3. **A/B Testing System**
   - Campaign management
   - Automatic variant assignment
   - Admin-driven questions
   - Statistical significance calculation
   - Winning variant application

4. **Communication Logging**
   - All service communications logged
   - Status-driven workflow tracking
   - Full audit trail
   - Performance metrics

5. **Workflow State Management**
   - State transitions tracked
   - Parent-child relationships
   - Expected completion times
   - Metadata storage

## Architecture

### Database Schema

```sql
-- Core tables
user_feedback           -- Feedback with context
user_preferences        -- Learned preferences
ab_test_campaigns       -- A/B test configuration
ab_test_assignments     -- User variant assignments
ab_test_questions       -- Admin questions
ab_test_responses       -- User responses
communication_logs      -- All service communications
workflow_states         -- Workflow state tracking
model_interaction_patterns -- Learned patterns
```

### Service Layer

```javascript
// FeedbackLoopService - Main service class
import FeedbackLoopService from './services/feedback-loop-service.js';

const service = new FeedbackLoopService(dbPool);
```

### API Endpoints

```
POST   /api/feedback                      - Record feedback
GET    /api/feedback/summary              - Feedback analytics
GET    /api/preferences                   - Get preferences
POST   /api/preferences                   - Set preference
POST   /api/ab-test/campaigns             - Create campaign
POST   /api/ab-test/assign                - Assign to variant
POST   /api/ab-test/questions             - Add question
GET    /api/ab-test/questions             - Get questions
POST   /api/ab-test/responses             - Record response
GET    /api/ab-test/performance/:id       - Get metrics
POST   /api/logs/communication            - Log event
GET    /api/logs/communication            - Get logs
```

## Usage

### 1. Basic Feedback Collection

```tsx
import { FeedbackControl } from '@/components/atoms/rag';

<FeedbackControl
  sessionId={session.id}
  conversationId={conversation.id}
  messageId={message.id}
  prompt="Create a button component"
  response="Here's a button component..."
  modelUsed="gpt-4"
  templateStyle="detailed"
  autoSubmit={true}
  apiEndpoint="/api/feedback"
  onChange={(data) => {
    console.log('Feedback:', data.value);
    console.log('Strength:', data.strength);
    console.log('Reason:', data.reason);
  }}
/>
```

### 2. Enhanced Feedback with Strength & Reason

```tsx
<FeedbackControl
  enableStrength={true}  // Show strength selector (1-5)
  enableReason={true}    // Show reason text input
  allowReselect={true}   // Allow modification
  showLabels={true}      // Show "Good"/"Bad" labels
  size="lg"
  onChange={(data) => {
    // data.value: 'positive' | 'negative' | null
    // data.strength: 1-5
    // data.reason: string
    // data.metadata: { sessionId, conversationId, ... }
  }}
/>
```

### 3. Set User Preferences

```javascript
// Explicitly set a preference
await fetch('/api/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session_123',
    category: 'response_style',
    key: 'preferred_template',
    value: 'detailed',
    source: 'explicit',
    confidenceScore: 1.0
  })
});
```

### 4. Create A/B Test Campaign

```javascript
// Create campaign to test response styles
await fetch('/api/ab-test/campaigns', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignName: 'response_style_test',
    testType: 'template_style',
    variantA: {
      template: 'concise',
      style: 'casual',
      maxLength: 500
    },
    variantB: {
      template: 'detailed',
      style: 'formal',
      maxLength: 1500
    },
    trafficAllocation: { a: 50, b: 50 },
    minimumSampleSize: 100,
    confidenceThreshold: 0.95
  })
});

// Start campaign
await fetch('/api/ab-test/campaigns/1/start', {
  method: 'POST'
});
```

### 5. Assign User to A/B Test

```javascript
// Automatically assign user to variant
const response = await fetch('/api/ab-test/assign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 1,
    sessionId: 'session_123'
  })
});

const { assignment, variant } = await response.json();

// Use variant configuration for this user
console.log('Assigned to variant:', assignment.assigned_variant);
console.log('Variant config:', variant);
```

### 6. Add Admin Questions

```javascript
// Ask users which style they prefer after 5 interactions
await fetch('/api/ab-test/questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaignId: 1,
    questionText: 'Which response style do you prefer?',
    questionType: 'comparison',
    options: {
      a: 'Concise and casual',
      b: 'Detailed and formal'
    },
    showAfterInteractions: 5,
    showProbability: 1.0
  })
});
```

### 7. Display and Collect Question Responses

```javascript
// Get questions to show user
const questions = await fetch(
  `/api/ab-test/questions?campaignId=1&sessionId=session_123`
).then(r => r.json());

// Show question in UI
if (questions.questions.length > 0) {
  const question = questions.questions[0];
  
  // Display question
  showQuestionModal({
    text: question.question_text,
    options: question.options,
    onResponse: async (selectedVariant) => {
      // Record response
      await fetch('/api/ab-test/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          assignmentId: assignment.id,
          campaignId: 1,
          responseValue: question.options[selectedVariant],
          responseVariant: selectedVariant,
          interactionCount: currentInteractions,
          shownAt: new Date().toISOString(),
          responseTimeMs: timeTakenToRespond
        })
      });
    }
  });
}
```

### 8. Get User Preferences

```javascript
// Retrieve learned preferences for personalization
const prefs = await fetch(
  `/api/preferences?sessionId=session_123&category=response_style`
).then(r => r.json());

// Apply preferences to next response
const templatePreference = prefs.preferences.find(
  p => p.preference_key === 'preferred_template'
);

if (templatePreference) {
  useTemplate(templatePreference.preference_value);
}
```

### 9. Complete A/B Test

```javascript
// When sample size reached, complete test and determine winner
const result = await fetch('/api/ab-test/campaigns/1/complete', {
  method: 'POST'
}).then(r => r.json());

console.log('Winner:', result.winner);
console.log('Statistical significance:', result.significance);

// Winning variant is automatically applied as learned pattern
```

### 10. Log Communications

```javascript
// Log all service communications for audit trail
await fetch('/api/logs/communication', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    logType: 'prompt',
    serviceName: 'rag',
    direction: 'inbound',
    content: 'User prompt text...',
    sessionId: 'session_123',
    conversationId: 'conv_456',
    status: 'active',
    workflowStage: 'prompt_received',
    processingTimeMs: 150,
    tokenCount: 50
  })
});
```

## Component Integration

### BotReplyBox with Full Feedback Loop

```tsx
import { BotReplyBox } from '@/components/atoms/rag';

<BotReplyBox
  status="success"
  content="Created components successfully!"
  location={{
    repo: 'owner/repo',
    task: '#123',
    branch: 'feature/x'
  }}
  listItems={[
    { id: '1', label: 'Button.tsx', description: 'Main button component' }
  ]}
  // Enhanced feedback integration
  feedbackProps={{
    sessionId: session.id,
    conversationId: conversation.id,
    messageId: message.id,
    prompt: originalPrompt,
    response: content,
    modelUsed: 'gpt-4',
    templateStyle: 'detailed',
    enableStrength: true,
    enableReason: true,
    autoSubmit: true,
    apiEndpoint: '/api/feedback'
  }}
  onFeedback={(data) => {
    // Feedback automatically submitted if autoSubmit=true
    console.log('User provided feedback:', data);
    
    // Record interaction for A/B test
    fetch('/api/ab-test/interaction', {
      method: 'POST',
      body: JSON.stringify({
        campaignId: activeCampaignId,
        sessionId: session.id,
        feedbackType: data.value
      })
    });
  }}
/>
```

## Analytics & Monitoring

### Feedback Summary

```javascript
// Get aggregated feedback metrics
const summary = await fetch(
  '/api/feedback/summary?modelUsed=gpt-4&templateStyle=detailed'
).then(r => r.json());

/*
{
  model_used: 'gpt-4',
  template_style: 'detailed',
  feedback_type: 'positive',
  feedback_count: 150,
  avg_strength: 4.2,
  unique_sessions: 75,
  feedback_date: '2025-11-18'
}
*/
```

### A/B Test Performance

```javascript
// Get real-time A/B test metrics
const perf = await fetch(
  '/api/ab-test/performance/1'
).then(r => r.json());

/*
{
  campaign_id: 1,
  campaign_name: 'response_style_test',
  assigned_variant: 'a',
  participants: 52,
  total_positive: 38,
  total_negative: 8,
  positive_rate: 0.73,
  avg_decision_time_seconds: 45.3
}
*/
```

### Communication Flow

```sql
-- View communication patterns
SELECT * FROM communication_flow
WHERE service_name = 'rag'
  AND log_hour >= NOW() - INTERVAL '24 hours';
```

## Workflow Examples

### Example 1: Learning User's Preferred Response Style

```
1. User receives response with template='concise'
   └─> Provides positive feedback (strength=5)
   
2. System infers preference:
   └─> preference_category: 'response_style'
   └─> preference_key: 'preferred_template'
   └─> preference_value: 'concise'
   └─> confidence_score: 1.0 (strength/5)
   
3. Next response uses 'concise' template
   └─> User provides positive feedback again
   
4. Confidence score reinforced
   └─> System consistently uses 'concise' template
```

### Example 2: A/B Test for Button Design Patterns

```
1. Admin creates campaign:
   └─> Variant A: Outlined buttons
   └─> Variant B: Solid buttons
   
2. Users assigned automatically (50/50 split)
   └─> Group A sees outlined buttons
   └─> Group B sees solid buttons
   
3. After 5 interactions, show question:
   └─> "Which button style do you prefer?"
   
4. Collect responses and feedback
   └─> Track positive/negative feedback per variant
   
5. After 100+ samples, complete test:
   └─> Variant B wins (positive_rate=0.82 vs 0.68)
   └─> Statistical significance: 0.96
   
6. Apply winner:
   └─> All new users get solid buttons
   └─> Pattern stored: { buttonStyle: 'solid' }
```

### Example 3: Conversation State Tracking

```
1. User starts conversation
   └─> workflow_state: 'conversation_started'
   └─> communication_log: 'User initiated chat'
   
2. User provides prompt
   └─> workflow_state: 'prompt_received'
   └─> communication_log: prompt content
   
3. Model generates response
   └─> workflow_state: 'response_generated'
   └─> communication_log: response content
   
4. User provides feedback
   └─> workflow_state: 'feedback_received'
   └─> communication_log: feedback details
   
5. System learns from feedback
   └─> workflow_state: 'preferences_updated'
   └─> communication_log: preferences changes
```

## Database Queries

### Top Performing Models

```sql
SELECT 
  model_used,
  COUNT(*) as total_feedback,
  SUM(CASE WHEN feedback_type = 'positive' THEN 1 ELSE 0 END)::float / 
    COUNT(*) as positive_rate,
  AVG(feedback_strength) as avg_strength
FROM user_feedback
WHERE status = 'active'
  AND created_at >= NOW() - INTERVAL '7 days'
GROUP BY model_used
ORDER BY positive_rate DESC, total_feedback DESC;
```

### User Preference Trends

```sql
SELECT 
  preference_category,
  preference_key,
  preference_value,
  COUNT(*) as adoption_count,
  AVG(confidence_score) as avg_confidence
FROM user_preferences
WHERE is_active = true
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY preference_category, preference_key, preference_value
ORDER BY adoption_count DESC;
```

### A/B Test Results

```sql
SELECT 
  c.campaign_name,
  a.assigned_variant,
  COUNT(DISTINCT a.session_id) as participants,
  AVG(CASE WHEN a.feedback_provided THEN 1.0 ELSE 0.0 END) as feedback_rate,
  AVG(a.positive_feedbacks::float / NULLIF(a.interactions_count, 0)) as positive_rate
FROM ab_test_campaigns c
JOIN ab_test_assignments a ON c.id = a.campaign_id
WHERE c.status = 'active'
GROUP BY c.campaign_name, a.assigned_variant;
```

## Best Practices

### 1. Feedback Collection
- **Always provide context**: Include prompt, response, model, and template
- **Enable strength for critical features**: Get detailed feedback on important decisions
- **Use auto-submit sparingly**: Only when user experience allows
- **Allow reselection**: Let users modify feedback if they change their mind

### 2. Preference Learning
- **Set confidence thresholds**: Don't apply low-confidence preferences
- **Expire temporary preferences**: Use `expires_at` for transient preferences
- **Prioritize explicit over inferred**: User explicitly set preferences should win

### 3. A/B Testing
- **Minimum sample size**: Wait for at least 100 participants before concluding
- **Statistical significance**: Require 0.95+ confidence before applying winner
- **Ask at the right time**: Show questions after users have experienced the variant
- **Don't over-test**: Limit active campaigns to avoid fatigue

### 4. Communication Logging
- **Log all critical events**: Prompts, responses, errors, state changes
- **Include timing metrics**: Track processing time for performance analysis
- **Use workflow stages**: Consistent naming for state transitions
- **Clean up old logs**: Archive logs older than 90 days

### 5. Workflow Management
- **Use consistent state names**: Define standard workflow stages
- **Track parent-child relationships**: For nested workflows
- **Set expected exit times**: For monitoring stuck workflows
- **Include recovery metadata**: Information needed to resume failed workflows

## Integration with Existing Systems

### With Neural Mining Campaign

```javascript
// Log mining campaign interactions
await feedbackService.logCommunication({
  logType: 'service_call',
  serviceName: 'mining_campaign',
  content: 'Discovered new Storybook',
  metadata: {
    url: discoveredUrl,
    quality_score: 0.92,
    components_found: 15
  }
});
```

### With RAG System

```javascript
// Track RAG prompt/response workflow
const workflowId = await feedbackService.updateWorkflowState({
  workflowName: 'rag_conversation',
  workflowType: 'conversation',
  entityId: conversationId,
  currentState: 'generating_response',
  sessionId,
  userId
});
```

### With Blockchain Mining

```javascript
// Log blockchain mining feedback
await feedbackService.recordFeedback({
  sessionId,
  conversationId,
  messageId,
  feedbackType: 'positive',
  feedbackStrength: 4,
  prompt: 'Mine blockchain data',
  response: 'Mined 150 blocks successfully',
  modelUsed: 'blockchain_miner',
  templateStyle: 'technical',
  metadata: {
    blocks_mined: 150,
    rewards_earned: '0.5 ETH'
  }
});
```

## Monitoring & Alerts

### Key Metrics to Track

1. **Feedback Rate**: % of responses that receive feedback
2. **Positive Rate**: % of feedback that is positive
3. **Average Strength**: Average feedback strength (1-5)
4. **Response Time**: Time from prompt to feedback
5. **Preference Adoption**: % of users with active preferences
6. **A/B Test Participation**: % of eligible users assigned to tests
7. **Question Response Rate**: % of questions answered
8. **Workflow Completion**: % of workflows that complete successfully

### Alert Conditions

```javascript
// Example monitoring alerts
if (positiveFeedbackRate < 0.5) {
  alert('Low positive feedback rate detected');
}

if (avgProcessingTime > 5000) {
  alert('Slow response processing detected');
}

if (workflowStuckCount > 10) {
  alert('Multiple workflows stuck in processing state');
}
```

## Migration

To set up the database schema:

```bash
# Run the migration
psql -U postgres -d dom_space_harvester -f migrations/feedback-loop-system-schema.sql

# Verify tables created
psql -U postgres -d dom_space_harvester -c "\dt" | grep -E "user_feedback|user_preferences|ab_test"
```

## API Integration in Express

```javascript
// In api-server-express.js
import { createFeedbackRouter } from './api/feedback-loop-routes.js';

// Mount feedback routes
app.use('/api', createFeedbackRouter(dbPool));

console.log('✅ Feedback loop API mounted');
```

## Testing

```javascript
// Test feedback submission
const response = await fetch('http://localhost:3001/api/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'test_session',
    conversationId: 'test_conv',
    messageId: 'test_msg',
    feedbackType: 'positive',
    feedbackStrength: 5,
    prompt: 'Test prompt',
    response: 'Test response'
  })
});

console.log(await response.json());
// { success: true, feedback: {...} }
```

## Security Considerations

1. **Rate Limiting**: Limit feedback submissions per session
2. **Input Validation**: Sanitize all user input (reason, metadata)
3. **Authentication**: Verify user IDs when provided
4. **Privacy**: Don't log sensitive information in communication logs
5. **Data Retention**: Implement automated data cleanup policies

## Future Enhancements

- [ ] Multi-armed bandit algorithms for variant selection
- [ ] Bayesian optimization for faster convergence
- [ ] Real-time preference visualization dashboard
- [ ] Automatic pattern recognition from feedback clusters
- [ ] Integration with model retraining pipelines
- [ ] Export feedback data for offline analysis
- [ ] User feedback history and patterns dashboard
- [ ] Collaborative filtering for preference suggestions

## Support

For questions or issues with the feedback loop system:
1. Check the communication logs: `GET /api/logs/communication`
2. Review workflow states: `GET /api/workflow/state/:type/:id`
3. Check database schema: `docs/feedback-loop-system-schema.sql`
4. Review service code: `services/feedback-loop-service.js`

---

**Built with:** PostgreSQL, Express.js, React, Material Design 3  
**Version:** 1.0.0  
**Last Updated:** 2025-11-18
