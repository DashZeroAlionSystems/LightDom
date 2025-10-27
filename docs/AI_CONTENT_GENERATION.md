# AI Content Generation Service

## Overview

The AI Content Generation Service is a fully automated, AI-powered system that generates SEO-optimized content without requiring human input. It leverages TensorFlow.js machine learning models, competitive analysis, and the existing 194 SEO features to create accurate, reliable content that boosts search engine rankings.

## Key Features

- **Fully Automated**: No human input required - provide a URL and keywords, get optimized content
- **AI-Powered**: Uses TensorFlow.js ML models trained on high-performing content
- **SEO-Optimized**: Generates content optimized for search engines based on 194 SEO features
- **Competitive Analysis**: Analyzes competitor pages to understand what ranks well
- **Quality Validation**: Automated quality checks ensure generated content meets standards
- **Continuous Learning**: Feedback system improves models over time
- **Performance Tracking**: Tracks real-world performance of generated content
- **Batch Processing**: Queue system for generating content at scale

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  POST /api/ai/content/generate                              │
│  POST /api/ai/content/queue                                 │
│  GET  /api/ai/content/:id                                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│           AIContentGenerationService                         │
│  • Feature Extraction                                        │
│  • Competitor Analysis                                       │
│  • Content Generation (Title, Meta, Content, Schema)        │
│  • Quality Validation                                        │
│  • Performance Calculation                                   │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│              TensorFlow.js Models                            │
│  • Title Optimizer Model                                     │
│  • Meta Description Generator Model                          │
│  • Content Generator Model                                   │
│  • Combined Multi-task Model                                 │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                 Database Layer                               │
│  • ai_content.generated_content                             │
│  • ai_content.generation_models                             │
│  • ai_content.content_performance                           │
│  • ai_content.training_feedback                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Database Schema (`database/ai_content_generation_schema.sql`)

Comprehensive database schema including:

- **generation_models**: Stores trained ML models metadata
- **generated_content**: All AI-generated content with quality metrics
- **generation_queue**: Queue for batch content generation
- **content_performance**: Real-world performance tracking
- **training_feedback**: User and automated feedback for model improvement
- **content_templates**: Successful content patterns for reuse

### 2. AIContentGenerationService (`src/services/api/AIContentGenerationService.ts`)

Main service responsible for:

- Extracting features from pages and competitors
- Generating optimized titles (50-60 characters, keyword-optimized)
- Creating compelling meta descriptions (150-160 characters)
- Producing full content with proper structure (H1, H2, paragraphs)
- Generating JSON-LD schema markup
- Calculating SEO scores, readability, keyword density
- Validating content quality automatically
- Queue management for batch processing

### 3. AIContentModelTrainer (`src/services/api/AIContentModelTrainer.ts`)

Handles ML model training:

- Collects training data from high-performing content
- Builds vocabulary for NLP
- Trains TensorFlow.js models (LSTM, Dense layers)
- Evaluates model performance (accuracy, precision, recall, F1)
- Saves models and deploys automatically
- Supports retraining with new feedback data

## API Endpoints

### Content Generation

#### Generate Content
```http
POST /api/ai/content/generate
Content-Type: application/json

{
  "url": "https://example.com/page",
  "targetKeywords": ["seo optimization", "content marketing"],
  "contentType": "full_page",
  "competitorUrls": [
    "https://competitor1.com/similar-page",
    "https://competitor2.com/similar-page"
  ],
  "brandGuidelines": {
    "tone": "professional",
    "industry": "saas",
    "targetAudience": "marketers"
  },
  "minLength": 800,
  "maxLength": 2000,
  "includeCompetitorAnalysis": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "SEO Optimization: The Ultimate Guide for 2025",
    "metaDescription": "Master SEO optimization with proven strategies. Boost rankings, drive traffic, and maximize ROI. Start optimizing today!",
    "h1": "SEO Optimization: Complete Guide to Boost Your Rankings",
    "h2Headings": [
      "What is SEO Optimization?",
      "Why SEO Optimization Matters",
      "Key Benefits of SEO Optimization"
    ],
    "content": "Full generated content...",
    "schema": { "@context": "https://schema.org", ... },
    "seoScore": 92.5,
    "readabilityScore": 68.3,
    "confidenceScore": 95.0,
    "keywordDensity": 2.1,
    "generationTimeMs": 3420,
    "qualityValidationPassed": true,
    "validationErrors": []
  }
}
```

#### Queue Batch Generation
```http
POST /api/ai/content/queue
Content-Type: application/json

{
  "urls": [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3"
  ],
  "config": {
    "targetKeywords": ["keyword1"],
    "contentType": "full_page"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "queuedCount": 3,
    "queuedIds": ["uuid1", "uuid2", "uuid3"]
  }
}
```

#### Process Queue
```http
POST /api/ai/content/process-queue
Content-Type: application/json

{
  "batchSize": 10
}
```

### Content Retrieval

#### Get Generated Content
```http
GET /api/ai/content/:id
```

#### Get Content History for URL
```http
GET /api/ai/content/history/:url?limit=10&offset=0
```

#### Get Active Content Summary
```http
GET /api/ai/content/summary/active
```

### Performance Tracking

#### Get Content Performance
```http
GET /api/ai/content/:id/performance
```

Returns:
```json
{
  "success": true,
  "data": [
    {
      "measurement_date": "2025-10-24",
      "search_position": 3,
      "search_impressions": 15420,
      "search_clicks": 892,
      "search_ctr": 5.78,
      "page_views": 1250,
      "avg_time_on_page": 145.3,
      "bounce_rate": 42.1,
      "lcp": 1.8,
      "inp": 85,
      "cls": 0.05
    }
  ]
}
```

#### Submit Feedback
```http
POST /api/ai/content/:id/feedback
Content-Type: application/json

{
  "feedbackType": "user_rating",
  "rating": 4.5,
  "feedbackText": "Great content, very helpful",
  "successfulElements": {
    "title": "Compelling and keyword-rich",
    "structure": "Clear and easy to follow"
  },
  "failedElements": {
    "length": "Could be more detailed in section 3"
  }
}
```

### Model Training

#### Train New Model
```http
POST /api/ai/model/train
Content-Type: application/json

{
  "modelType": "title",
  "epochs": 50,
  "batchSize": 32,
  "learningRate": 0.001,
  "validationSplit": 0.2,
  "minDatasetSize": 100
}
```

Model types:
- `title`: Title generation
- `meta_description`: Meta description generation
- `content`: Full content generation
- `combined`: Multi-task model for all content types

#### Get Model Performance
```http
GET /api/ai/model/performance
```

#### Retrain Model with Feedback
```http
POST /api/ai/model/:id/retrain
```

### Content Templates

#### Get Templates
```http
GET /api/ai/templates?industry=saas&contentCategory=landing_page
```

## Content Generation Process

### 1. Feature Extraction
The service extracts comprehensive features including:
- Current page content (title, meta, H1, word count, etc.)
- SEO features (194 features from existing analytics)
- Competitor analysis (titles, descriptions, structure, performance)
- Page type detection (blog, product, landing page, etc.)

### 2. Competitor Analysis
If enabled, analyzes competitor pages to understand:
- What content ranks well for target keywords
- Average content length and structure
- Common themes and patterns
- Schema markup usage

### 3. Content Generation
Uses AI models and pattern-based generation:
- **Titles**: 50-60 characters, keyword at front, power words, numbers
- **Meta Descriptions**: 150-160 characters, benefits, CTA, keyword-rich
- **H1**: Compelling headline with keyword and benefit
- **H2 Headings**: Logical content structure (8-10 headings)
- **Content**: 800-2500 words with proper structure, keyword optimization
- **Schema**: JSON-LD markup appropriate for page type

### 4. Quality Metrics Calculation
Automatically calculates:
- **SEO Score** (0-100): Based on title, meta, content length, keywords, structure
- **Readability Score**: Flesch Reading Ease
- **Confidence Score**: Model confidence in generation quality
- **Keyword Density**: Target keyword density (optimal 1-3%)

### 5. Quality Validation
Automated validation checks:
- Title length (30-70 characters)
- Meta description length (120-170 characters)
- Keyword presence in title and meta
- Content length (minimum requirements)
- Keyword density (avoid stuffing, 0.5-5%)
- Readability standards

### 6. Save and Track
- Saves generated content to database
- Records generation time and metrics
- Tracks quality validation results
- Links to original URL and keywords

## Quality Metrics

### SEO Score Calculation (0-100)

| Component | Points | Criteria |
|-----------|--------|----------|
| Title Optimization | 20 | Length 50-60 chars (10pts), Keyword present (10pts) |
| Meta Description | 20 | Length 150-160 chars (10pts), Keyword present (10pts) |
| Content Length | 20 | 1000-2500 words (20pts), 500+ words (10pts) |
| Keyword Optimization | 20 | Density 1-3% (20pts), Density >0% (10pts) |
| Structure | 10 | Has H1 (5pts), 3+ H2 headings (5pts) |
| Schema Markup | 10 | Has JSON-LD schema (10pts) |

### Readability Score (Flesch Reading Ease)

- **90-100**: Very Easy (5th grade)
- **80-90**: Easy (6th grade)
- **70-80**: Fairly Easy (7th grade)
- **60-70**: Standard (8th-9th grade) - **Target**
- **50-60**: Fairly Difficult (10th-12th grade)
- **30-50**: Difficult (College)
- **0-30**: Very Difficult (College graduate)

### Confidence Score (0-100)

Based on:
- Availability of input features (-20 if missing SEO features)
- Competitor data availability (-10 if no competitors)
- Content length appropriateness (-20 if too short, -10 if too long)

## Machine Learning Models

### Model Architecture

Default TensorFlow.js model structure:

```
Input Layer (Feature Vector: 150 dimensions)
    ↓
Dense Layer (256 units, ReLU activation)
    ↓
Dropout (30%)
    ↓
Dense Layer (128 units, ReLU activation)
    ↓
Dropout (30%)
    ↓
Dense Layer (64 units, ReLU activation)
    ↓
Dropout (20%)
    ↓
Output Layer (4 units, Softmax) [poor, average, good, excellent]
```

### Training Process

1. **Data Collection**: Gathers high-performing content (SEO score >= 70, search position <= 10)
2. **Vocabulary Building**: Creates vocabulary from successful content
3. **Feature Extraction**: Converts content to feature vectors
4. **Label Creation**: Creates performance-based labels
5. **Training**: Trains model with Adam optimizer, categorical crossentropy loss
6. **Evaluation**: Calculates accuracy, precision, recall, F1 score
7. **Deployment**: Auto-deploys if accuracy >= 70%

### Training Data Requirements

- **Minimum**: 100 samples
- **Recommended**: 1,000+ samples
- **Optimal**: 10,000+ samples

Data includes:
- Generated titles, meta descriptions, content
- Input features (194 SEO features)
- Performance metrics (search position, CTR, engagement)
- User feedback and ratings

## Usage Examples

### Example 1: Generate Content for New Page

```javascript
const response = await fetch('http://localhost:3001/api/ai/content/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://mysite.com/new-product-page',
    targetKeywords: ['wireless headphones', 'bluetooth headphones'],
    contentType: 'full_page',
    brandGuidelines: {
      tone: 'professional',
      industry: 'ecommerce',
      targetAudience: 'tech enthusiasts'
    },
    includeCompetitorAnalysis: true,
    competitorUrls: [
      'https://amazon.com/wireless-headphones-top',
      'https://bestbuy.com/bluetooth-headphones'
    ]
  })
});

const result = await response.json();
console.log('Generated:', result.data.title);
console.log('SEO Score:', result.data.seoScore);
```

### Example 2: Batch Content Generation

```javascript
// Queue multiple URLs
const queueResponse = await fetch('http://localhost:3001/api/ai/content/queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    urls: [
      'https://mysite.com/page1',
      'https://mysite.com/page2',
      'https://mysite.com/page3',
      'https://mysite.com/page4',
      'https://mysite.com/page5'
    ],
    config: {
      targetKeywords: ['main keyword'],
      contentType: 'full_page'
    }
  })
});

// Process queue
await fetch('http://localhost:3001/api/ai/content/process-queue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ batchSize: 10 })
});
```

### Example 3: Train Custom Model

```javascript
const trainResponse = await fetch('http://localhost:3001/api/ai/model/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelType: 'title',
    epochs: 100,
    batchSize: 64,
    learningRate: 0.0001,
    validationSplit: 0.2,
    minDatasetSize: 500
  })
});

console.log('Training started:', trainResponse.data.message);
```

## Database Setup

Run the database migration:

```bash
psql -U postgres -d dom_space_harvester -f database/ai_content_generation_schema.sql
```

This will create:
- Schema `ai_content`
- All tables, indexes, views
- Triggers for automatic updates
- Sample models and templates

## Configuration

Environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=your_password

# AI Content Generation
AI_CONTENT_MIN_DATASET_SIZE=100
AI_CONTENT_DEFAULT_EPOCHS=50
AI_CONTENT_DEFAULT_BATCH_SIZE=32
AI_CONTENT_MODEL_SAVE_DIR=./models/content-generation

# Feature flags
ENABLE_COMPETITOR_ANALYSIS=true
ENABLE_AUTO_DEPLOYMENT=true
AUTO_DEPLOY_MIN_ACCURACY=0.70
```

## Performance Optimization

### Caching Strategy
- Use Redis to cache frequently generated content patterns
- Cache competitor analysis results (TTL: 24 hours)
- Cache model predictions for common queries

### Batch Processing
- Use generation queue for bulk content creation
- Process queue in background worker
- Limit concurrent generations to avoid resource exhaustion

### Model Optimization
- Use TensorFlow.js optimized models for inference
- Quantize models to reduce size and improve speed
- Cache model in memory after first load

## Monitoring and Metrics

### Key Metrics to Track

1. **Generation Metrics**
   - Average generation time
   - Success rate
   - Quality validation pass rate
   - SEO scores distribution

2. **Model Performance**
   - Model accuracy over time
   - Precision, recall, F1 scores
   - User ratings and feedback

3. **Content Performance**
   - Search ranking improvements
   - Click-through rates
   - Engagement metrics
   - Conversion rates

4. **System Health**
   - Queue processing rate
   - Error rates
   - Resource utilization

## Continuous Improvement

The system learns and improves over time:

1. **Automatic Feedback Collection**
   - Tracks real-world performance of generated content
   - Collects user ratings and feedback
   - Monitors search rankings and traffic

2. **Model Retraining**
   - Automatically retrains models when new feedback accumulates
   - Uses transfer learning to fine-tune existing models
   - A/B tests new models before full deployment

3. **Template Optimization**
   - Identifies successful content patterns
   - Creates templates based on high performers
   - Updates templates based on industry trends

## Best Practices

### 1. Provide Quality Input
- Always include target keywords
- Provide competitor URLs when possible
- Set appropriate brand guidelines
- Specify content length requirements

### 2. Monitor Performance
- Track generated content performance
- Submit feedback for continuous improvement
- Review quality validation errors
- Adjust generation parameters based on results

### 3. Use Batch Processing
- Queue multiple URLs for efficient processing
- Process queue during low-traffic hours
- Set appropriate batch sizes (10-20 recommended)

### 4. Maintain Training Data
- Regularly review and clean training data
- Remove low-performing content from training set
- Add high-performing content to training data
- Retrain models quarterly or when performance degrades

### 5. A/B Testing
- Test generated content against existing content
- Use variant groups for A/B testing
- Track performance differences
- Deploy winners site-wide

## Troubleshooting

### Issue: Low SEO Scores
**Solution**: Check if:
- Target keywords are too competitive
- Content length is insufficient
- Keyword density is too low or too high
- Title and meta description don't include keywords

### Issue: Quality Validation Failures
**Solution**: Adjust generation parameters:
- Increase minLength
- Provide more competitor URLs for analysis
- Improve brand guidelines clarity
- Check if target keywords are too generic

### Issue: Model Training Fails
**Solution**: Verify:
- Sufficient training data (min 100 samples)
- Database contains high-performing content
- Adequate system resources (RAM, CPU)
- TensorFlow.js is properly installed

### Issue: Slow Generation
**Solution**: Optimize:
- Enable caching for competitor analysis
- Reduce number of competitor URLs
- Increase batch size for queue processing
- Use faster model architecture (reduce layers)

## Security Considerations

- API rate limiting is enforced
- Input validation on all endpoints
- SQL injection protection via parameterized queries
- XSS prevention in content output
- User authentication required for training endpoints
- Content moderation for generated text

## Future Enhancements

1. **GPT Integration**: Optional integration with GPT-4 for enhanced generation
2. **Multi-language Support**: Generate content in multiple languages
3. **Image Generation**: AI-generated images with alt text
4. **Video Script Generation**: Scripts for video content
5. **Voice Optimization**: Content optimized for voice search
6. **Personalization**: User-specific content generation
7. **Real-time Collaboration**: Multiple users editing generated content
8. **Advanced Analytics**: Deeper insights into content performance

## Support and Resources

- Documentation: `/docs/AI_CONTENT_GENERATION.md`
- API Reference: See endpoints section above
- Database Schema: `/database/ai_content_generation_schema.sql`
- Service Code: `/src/services/api/AIContentGenerationService.ts`
- Model Trainer: `/src/services/api/AIContentModelTrainer.ts`

## License

Copyright © 2025 LightDom. All rights reserved.
