# LightDom Training Data Examples

This directory contains training data examples for finetuning DeepSeek models for the LightDom platform.

## Directory Structure

```
training_data/
├── examples/
│   └── tool_use_examples.jsonl    # Tool-use training examples
├── collected/                      # Collected training data (generated)
└── README.md                       # This file
```

## Training Data Format

All training data follows the OpenAI chat completions format with tool-use extensions:

### Basic Chat Format

```json
{
  "messages": [
    {"role": "system", "content": "System prompt..."},
    {"role": "user", "content": "User message"},
    {"role": "assistant", "content": "Assistant response"}
  ]
}
```

### Tool-Use Format

```json
{
  "messages": [
    {"role": "system", "content": "System prompt with tool capabilities..."},
    {"role": "user", "content": "User request requiring tool use"},
    {
      "role": "assistant",
      "content": null,
      "tool_calls": [{
        "id": "call_unique_id",
        "type": "function",
        "function": {
          "name": "toolName",
          "arguments": "{\"param\": \"value\"}"
        }
      }]
    },
    {
      "role": "tool",
      "tool_call_id": "call_unique_id",
      "name": "toolName",
      "content": "{\"result\": \"tool output\"}"
    },
    {"role": "assistant", "content": "Final response incorporating tool result"}
  ]
}
```

## Available Tools

The following tools are available for training:

| Tool Name | Description |
|-----------|-------------|
| `mineAttribute` | Extract specific data attributes from web pages |
| `createMiningCampaign` | Create automated data mining campaigns |
| `generateSchema` | Generate JSON schemas from descriptions |
| `createWorkflow` | Create multi-step automation workflows |

## Example Categories

### 1. Data Mining Examples
- Price extraction
- SEO analysis
- Schema.org markup detection
- Competitor monitoring

### 2. Schema Generation Examples
- Blog post schemas
- Product schemas
- Event schemas
- Organization schemas

### 3. Workflow Examples
- SEO analysis workflows
- A/B testing workflows
- Monitoring workflows
- Report generation workflows

### 4. Error Handling Examples
- Access denied scenarios
- Rate limiting
- Invalid URLs
- Partial failures

## Usage

### Loading Training Data

```javascript
import { TrainingDataCollectionPipeline } from '../services/deepseek-finetuning-pipeline.js';

const pipeline = new TrainingDataCollectionPipeline();
const data = await pipeline.collectFromSources([
  {
    type: 'jsonl',
    name: 'Tool Use Examples',
    path: './training_data/examples/tool_use_examples.jsonl'
  }
]);
```

### Quality Scoring

```javascript
import { DataQualityScorer } from '../services/deepseek-finetuning-pipeline.js';

const scorer = new DataQualityScorer();
const report = scorer.scoreDataset(data);

console.log(`Total examples: ${report.totalExamples}`);
console.log(`Average quality: ${report.averageScore}`);
console.log(`High quality: ${report.distribution.high}`);
```

### Creating Train/Validation Split

```javascript
import { ValidationDatasetBuilder } from '../services/deepseek-finetuning-pipeline.js';

const builder = new ValidationDatasetBuilder({ splitRatio: 0.1 });
const { train, validation } = builder.splitDataset(data);

console.log(`Training examples: ${train.length}`);
console.log(`Validation examples: ${validation.length}`);
```

## Adding New Examples

1. Create examples in JSONL format (one JSON object per line)
2. Follow the tool-use format for tool-calling examples
3. Include diverse scenarios (success, errors, multi-step)
4. Run quality scoring to validate

```bash
node demo-deepseek-finetuning-pipeline.js
```

## Quality Guidelines

- **Completeness**: Include system, user, and assistant messages
- **Format**: Use proper JSON with correct role assignments
- **Length**: Keep responses informative but concise (200-4000 chars)
- **Tool Usage**: Include tool call ID matching for tool responses
- **Diversity**: Cover different use cases and edge cases

## Related Documentation

- [DeepSeek Finetuning Guide](../docs/research/DEEPSEEK_FINETUNING_GUIDE.md)
- [Finetuning Pipeline Service](../services/deepseek-finetuning-pipeline.js)
- [API Routes](../api/deepseek-finetuning-routes.js)
