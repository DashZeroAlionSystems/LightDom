# DeepSeek Finetuning Guide: Local Customization & Training

## Executive Summary

This comprehensive guide documents finetuning options for DeepSeek models, including LoRA/QLoRA approaches for local customization, training data format specifications, best practices for domain-specific tuning, and examples for tool-use training. This document is designed for developers integrating DeepSeek into the LightDom platform.

**Last Updated**: November 29, 2024  
**Status**: Research Complete  
**Related Implementation**: `services/deepseek-component-finetuning-service.js`, `training_data/`

---

## Table of Contents

1. [DeepSeek Model Overview](#1-deepseek-model-overview)
2. [Finetuning Options](#2-finetuning-options)
3. [LoRA/QLoRA Approaches](#3-loraq-lora-approaches)
4. [Training Data Format Specifications](#4-training-data-format-specifications)
5. [Best Practices for Domain-Specific Tuning](#5-best-practices-for-domain-specific-tuning)
6. [Tool-Use Training Examples](#6-tool-use-training-examples)
7. [LightDom Integration Patterns](#7-lightdom-integration-patterns)
8. [Implementation Roadmap](#8-implementation-roadmap)

---

## 1. DeepSeek Model Overview

### 1.1 Available Models

DeepSeek provides several models suitable for different use cases:

| Model | Parameters | Best For | Context Length |
|-------|------------|----------|----------------|
| DeepSeek-V3 | 671B | General reasoning, code generation | 128K |
| DeepSeek-Coder-V2 | 236B | Code completion, code review | 128K |
| DeepSeek-Chat | 7B-67B | Conversational AI, assistants | 32K-128K |
| DeepSeek-LLM | 7B-67B | General text generation | 32K |
| DeepSeek-MoE | 16B | Efficient inference | 32K |

### 1.2 Model Architecture

DeepSeek models use a Mixture-of-Experts (MoE) architecture with key features:

```
┌─────────────────────────────────────────────────────────┐
│                  DeepSeek Architecture                   │
├─────────────────────────────────────────────────────────┤
│  Input Embedding → Multi-Head Attention → FFN/MoE       │
│                          ↓                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Expert Selection (Top-K Routing)                 │    │
│  │  ├── Expert 1: Code patterns                     │    │
│  │  ├── Expert 2: Reasoning chains                  │    │
│  │  ├── Expert 3: Tool interactions                 │    │
│  │  └── Expert N: Domain-specific                   │    │
│  └─────────────────────────────────────────────────┘    │
│                          ↓                               │
│  Output Projection → Language Modeling Head             │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Finetuning Accessibility

| Method | Local Feasibility | Hardware Requirements |
|--------|-------------------|----------------------|
| Full Finetuning | Requires significant resources | 8x A100 80GB (minimum) |
| LoRA | Highly accessible | 1x RTX 3090/4090 (24GB) |
| QLoRA | Most accessible | 1x RTX 3060 (12GB) |
| API Finetuning | Cloud-based | API access only |

---

## 2. Finetuning Options

### 2.1 DeepSeek API Finetuning

DeepSeek offers API-based finetuning for their hosted models:

```javascript
// DeepSeek API Finetuning Configuration
const finetuneConfig = {
  // Model selection
  baseModel: 'deepseek-chat',      // or 'deepseek-coder'
  
  // Training parameters
  training: {
    epochs: 3,                      // Number of training epochs
    batchSize: 4,                   // Batch size per device
    learningRate: 2e-5,             // Learning rate
    warmupRatio: 0.1,               // Warmup proportion
    weightDecay: 0.01,              // Regularization
  },
  
  // Data configuration
  data: {
    format: 'jsonl',                // Training data format
    validationSplit: 0.1,           // Validation set proportion
    maxSeqLength: 4096,             // Maximum sequence length
  },
  
  // Output configuration
  output: {
    modelName: 'my-finetuned-model',
    saveCheckpoints: true,
    evaluationStrategy: 'epoch',
  }
};
```

### 2.2 Local Finetuning Options

For local customization, several approaches are available:

#### 2.2.1 Full Finetuning

Complete model weight updates for maximum customization:

```python
# Full finetuning configuration (requires significant compute)
from transformers import AutoModelForCausalLM, TrainingArguments

training_args = TrainingArguments(
    output_dir="./deepseek-finetuned",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    gradient_accumulation_steps=8,
    learning_rate=2e-5,
    fp16=True,                      # Mixed precision
    gradient_checkpointing=True,    # Memory optimization
    optim="adamw_torch_fused",
    save_strategy="epoch",
    logging_steps=10,
)
```

#### 2.2.2 Parameter-Efficient Finetuning (PEFT)

More practical for most use cases:

| Method | Memory Reduction | Quality | Training Speed |
|--------|------------------|---------|----------------|
| LoRA | 60-70% | Excellent | 2-3x faster |
| QLoRA | 80-90% | Very Good | 1.5-2x faster |
| Prefix Tuning | 70-80% | Good | 2x faster |
| Adapter Layers | 65-75% | Good | 1.5x faster |

---

## 3. LoRA/QLoRA Approaches

### 3.1 LoRA (Low-Rank Adaptation)

LoRA reduces the number of trainable parameters by decomposing weight updates into low-rank matrices.

#### 3.1.1 How LoRA Works

```
Original Weight Matrix W (d × k)
           ↓
Frozen W + Trainable ΔW
           ↓
ΔW = A × B where A (d × r) and B (r × k)
           ↓
r << min(d, k) → Significant parameter reduction
```

#### 3.1.2 LoRA Configuration for DeepSeek

```python
from peft import LoraConfig, get_peft_model

# LoRA configuration optimized for DeepSeek
lora_config = LoraConfig(
    # Core parameters
    r=16,                           # Rank (8-64 typical)
    lora_alpha=32,                  # Scaling factor (often 2x rank)
    lora_dropout=0.05,              # Dropout for regularization
    
    # Target modules (DeepSeek-specific)
    target_modules=[
        "q_proj",                   # Query projection
        "k_proj",                   # Key projection
        "v_proj",                   # Value projection
        "o_proj",                   # Output projection
        "gate_proj",                # MLP gate
        "up_proj",                  # MLP up projection
        "down_proj",                # MLP down projection
    ],
    
    # Training configuration
    bias="none",                    # Don't train biases
    task_type="CAUSAL_LM",          # Causal language modeling
)

# Apply LoRA to model
model = get_peft_model(base_model, lora_config)
print(f"Trainable parameters: {model.num_parameters(only_trainable=True):,}")
```

#### 3.1.3 Rank Selection Guide

| Use Case | Recommended Rank | Alpha | Notes |
|----------|------------------|-------|-------|
| Simple task adaptation | 8 | 16 | Minimal customization |
| Domain vocabulary | 16 | 32 | Standard choice |
| Tool-use learning | 32 | 64 | Complex behaviors |
| Full capability extension | 64-128 | 128-256 | Near full-finetune quality |

### 3.2 QLoRA (Quantized LoRA)

QLoRA combines LoRA with 4-bit quantization for memory-efficient training.

#### 3.2.1 QLoRA Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    QLoRA Pipeline                        │
├─────────────────────────────────────────────────────────┤
│  Base Model Weights (16-bit)                             │
│           ↓                                              │
│  4-bit NormalFloat Quantization (NF4)                    │
│           ↓                                              │
│  Double Quantization (quantize scaling factors)          │
│           ↓                                              │
│  Frozen 4-bit Weights + FP16 LoRA Adapters              │
│           ↓                                              │
│  Paged Optimizers (handle memory spikes)                │
└─────────────────────────────────────────────────────────┘
```

#### 3.2.2 QLoRA Configuration

```python
from transformers import BitsAndBytesConfig
from peft import prepare_model_for_kbit_training

# 4-bit quantization configuration
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",           # NormalFloat4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,      # Double quantization
)

# Load quantized model
model = AutoModelForCausalLM.from_pretrained(
    "deepseek-ai/deepseek-coder-7b-instruct-v1.5",
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)

# Prepare for k-bit training
model = prepare_model_for_kbit_training(
    model,
    use_gradient_checkpointing=True,
)
```

#### 3.2.3 Memory Requirements Comparison

| Model Size | Full FT (FP16) | LoRA (FP16) | QLoRA (4-bit) |
|------------|----------------|-------------|---------------|
| 7B | ~56GB | ~16GB | ~6GB |
| 16B | ~128GB | ~38GB | ~12GB |
| 33B | ~264GB | ~80GB | ~24GB |
| 67B | ~536GB | ~160GB | ~48GB |

### 3.3 Training Script Template

```python
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq,
    BitsAndBytesConfig,
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

def train_deepseek_qlora(
    model_name: str = "deepseek-ai/deepseek-coder-7b-instruct-v1.5",
    train_data_path: str = "training_data/train.jsonl",
    output_dir: str = "./deepseek-finetuned",
    lora_rank: int = 16,
    epochs: int = 3,
    batch_size: int = 4,
    learning_rate: float = 2e-4,
):
    """
    Complete QLoRA training script for DeepSeek models.
    
    Args:
        model_name: HuggingFace model identifier
        train_data_path: Path to training data (JSONL format)
        output_dir: Output directory for checkpoints
        lora_rank: LoRA rank (higher = more capacity)
        epochs: Number of training epochs
        batch_size: Per-device batch size
        learning_rate: Learning rate
    """
    
    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True,
        padding_side="right",
    )
    tokenizer.pad_token = tokenizer.eos_token
    
    # Quantization config
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
    )
    model = prepare_model_for_kbit_training(model)
    
    # LoRA config
    lora_config = LoraConfig(
        r=lora_rank,
        lora_alpha=lora_rank * 2,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj",
        ],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(model, lora_config)
    
    # Load and prepare dataset
    dataset = load_dataset("json", data_files=train_data_path)
    
    def tokenize_function(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=4096,
            padding="max_length",
        )
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset["train"].column_names,
    )
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=4,
        learning_rate=learning_rate,
        weight_decay=0.01,
        warmup_ratio=0.1,
        lr_scheduler_type="cosine",
        logging_steps=10,
        save_strategy="epoch",
        bf16=True,
        gradient_checkpointing=True,
        optim="paged_adamw_8bit",
        report_to="none",
    )
    
    # Data collator
    data_collator = DataCollatorForSeq2Seq(
        tokenizer=tokenizer,
        padding=True,
        return_tensors="pt",
    )
    
    # Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        data_collator=data_collator,
    )
    
    # Train
    trainer.train()
    
    # Save adapter
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    return model, tokenizer


if __name__ == "__main__":
    train_deepseek_qlora()
```

---

## 4. Training Data Format Specifications

### 4.1 Supported Formats

DeepSeek models support multiple training data formats:

#### 4.1.1 Chat/Conversation Format (Recommended)

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "What is React?"}, {"role": "assistant", "content": "React is a JavaScript library for building user interfaces."}]}
{"messages": [{"role": "system", "content": "You are a code expert."}, {"role": "user", "content": "Write a Button component."}, {"role": "assistant", "content": "```tsx\nexport const Button = ({children}) => <button>{children}</button>\n```"}]}
```

#### 4.1.2 Instruction Format

```jsonl
{"instruction": "Generate a React component", "input": "Button with primary variant", "output": "export const Button = ({variant='primary'}) => ..."}
{"instruction": "Explain this code", "input": "const x = arr.map(fn)", "output": "This creates a new array by applying fn to each element..."}
```

#### 4.1.3 Completion Format

```jsonl
{"prompt": "### Task: Generate a component\n### Input: Button\n### Output:", "completion": " export const Button = () => <button>Click</button>"}
{"prompt": "### Code Review\n### Code:\nconst x = 1\n### Review:", "completion": " This is a simple constant declaration..."}
```

### 4.2 Schema Specification

Complete schema for training data:

```typescript
// Training Data Schema for DeepSeek Finetuning
interface TrainingExample {
  // Chat format (recommended)
  messages?: Message[];
  
  // Instruction format
  instruction?: string;
  input?: string;
  output?: string;
  
  // Completion format
  prompt?: string;
  completion?: string;
  
  // Metadata (optional)
  metadata?: {
    source?: string;
    quality_score?: number;
    domain?: string;
    task_type?: string;
    created_at?: string;
    tags?: string[];
  };
}

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  
  // Tool-specific fields
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;  // JSON string
  };
}
```

### 4.3 Tool-Use Training Data Format

For training models on tool usage:

```jsonl
{"messages": [
  {"role": "system", "content": "You are an assistant with access to tools. Use them when needed."},
  {"role": "user", "content": "What's the SEO score for example.com?"},
  {"role": "assistant", "content": null, "tool_calls": [{"id": "call_1", "type": "function", "function": {"name": "analyze_seo", "arguments": "{\"url\": \"example.com\"}"}}]},
  {"role": "tool", "tool_call_id": "call_1", "name": "analyze_seo", "content": "{\"score\": 85, \"issues\": [\"Missing meta description\"]}"},
  {"role": "assistant", "content": "The SEO score for example.com is 85/100. There's one issue: missing meta description."}
]}
```

### 4.4 LightDom-Specific Training Data Format

Custom format for LightDom platform:

```jsonl
{"messages": [
  {"role": "system", "content": "You are a LightDom SEO assistant. You help users with DOM optimization, mining campaigns, and schema generation."},
  {"role": "user", "content": "Create a mining campaign for e-commerce product pages"},
  {"role": "assistant", "content": null, "tool_calls": [
    {"id": "call_1", "type": "function", "function": {"name": "createMiningCampaign", "arguments": "{\"objective\": \"Extract product data\", \"attributes\": [\"productName\", \"price\", \"availability\", \"rating\"], \"schedule\": \"realtime\"}"}}
  ]},
  {"role": "tool", "tool_call_id": "call_1", "name": "createMiningCampaign", "content": "{\"campaignId\": \"camp_123\", \"status\": \"created\", \"estimatedDataPoints\": 1000}"},
  {"role": "assistant", "content": "I've created a mining campaign (ID: camp_123) to extract product data including name, price, availability, and ratings. The campaign will run in real-time and is expected to collect approximately 1000 data points."}
]}
```

### 4.5 Data Quality Guidelines

#### Minimum Requirements

| Criterion | Requirement |
|-----------|-------------|
| Total Examples | 100+ (1000+ recommended) |
| Average Length | 500+ tokens per example |
| Diversity | Multiple task types |
| Balance | Balanced class distribution |
| Quality | Human-verified or high-confidence |

#### Quality Scoring

```javascript
// Quality scoring function for training data
function scoreTrainingExample(example) {
  let score = 0;
  
  // Completeness
  if (example.messages?.length >= 2) score += 20;
  if (example.messages?.some(m => m.tool_calls)) score += 10;
  
  // Content quality
  const avgLength = example.messages?.reduce((sum, m) => 
    sum + (m.content?.length || 0), 0) / example.messages?.length;
  if (avgLength > 100) score += 20;
  if (avgLength > 500) score += 10;
  
  // Structure
  const hasSystem = example.messages?.some(m => m.role === 'system');
  if (hasSystem) score += 15;
  
  // Tool usage (for tool training)
  const hasToolUsage = example.messages?.some(m => m.tool_calls);
  const hasToolResponse = example.messages?.some(m => m.role === 'tool');
  if (hasToolUsage && hasToolResponse) score += 25;
  
  return score;
}
```

---

## 5. Best Practices for Domain-Specific Tuning

### 5.1 Data Collection Strategies

#### 5.1.1 Curriculum Learning

Train in phases of increasing complexity:

```
Phase 1: Basic tasks (simple Q&A)
    ↓
Phase 2: Domain vocabulary introduction
    ↓
Phase 3: Complex reasoning patterns
    ↓
Phase 4: Tool-use integration
    ↓
Phase 5: Multi-step workflows
```

#### 5.1.2 Data Augmentation

```javascript
// Data augmentation techniques
const augmentationStrategies = {
  // Paraphrase user queries
  queryVariation: (example) => {
    const variations = generateParaphrases(example.messages[1].content);
    return variations.map(v => ({
      ...example,
      messages: [example.messages[0], { role: 'user', content: v }, ...example.messages.slice(2)]
    }));
  },
  
  // Add error recovery examples
  errorRecovery: (example) => ({
    messages: [
      ...example.messages,
      { role: 'user', content: 'That didn\'t work, try again' },
      { role: 'assistant', content: '...' }  // Recovery response
    ]
  }),
  
  // Create negative examples
  negativeExamples: (example) => ({
    messages: [
      example.messages[0],
      { role: 'user', content: 'Do something unrelated to your domain' },
      { role: 'assistant', content: 'I\'m specialized in [domain]. For that question, you might want to...' }
    ]
  })
};
```

### 5.2 Hyperparameter Optimization

#### 5.2.1 Recommended Starting Points

| Parameter | LoRA | QLoRA | Full Finetune |
|-----------|------|-------|---------------|
| Learning Rate | 2e-4 | 2e-4 | 2e-5 |
| Epochs | 3-5 | 3-5 | 1-3 |
| Batch Size | 4-8 | 2-4 | 2-4 |
| Warmup Ratio | 0.1 | 0.1 | 0.1 |
| Weight Decay | 0.01 | 0.01 | 0.01 |
| LoRA Rank | 16-64 | 16-64 | N/A |
| LoRA Alpha | 2x rank | 2x rank | N/A |

#### 5.2.2 Learning Rate Schedules

```python
# Recommended: Cosine with warm restarts
lr_scheduler_type = "cosine_with_restarts"

# Alternative schedules
schedules = {
    "cosine": "Smooth decay, good for most cases",
    "linear": "Simple, predictable decay",
    "cosine_with_restarts": "Good for longer training",
    "polynomial": "More control over decay shape",
}
```

### 5.3 Evaluation Strategies

#### 5.3.1 Metrics by Task Type

| Task | Primary Metric | Secondary Metrics |
|------|----------------|-------------------|
| Code Generation | Pass@k | BLEU, Edit Distance |
| Classification | Accuracy | F1, Precision, Recall |
| Generation | Perplexity | ROUGE, Human Eval |
| Tool Use | Success Rate | Tool Selection Accuracy |

#### 5.3.2 Evaluation Script

```python
def evaluate_finetuned_model(model, tokenizer, eval_dataset):
    """Comprehensive evaluation for finetuned DeepSeek models."""
    
    results = {
        "perplexity": [],
        "tool_accuracy": [],
        "response_quality": [],
    }
    
    for example in eval_dataset:
        # Generate response
        inputs = tokenizer(example["prompt"], return_tensors="pt")
        outputs = model.generate(**inputs, max_new_tokens=512)
        response = tokenizer.decode(outputs[0])
        
        # Calculate perplexity
        with torch.no_grad():
            loss = model(**inputs, labels=inputs["input_ids"]).loss
            results["perplexity"].append(torch.exp(loss).item())
        
        # Tool accuracy (if applicable)
        if "expected_tool" in example:
            tool_correct = extract_tool_call(response) == example["expected_tool"]
            results["tool_accuracy"].append(tool_correct)
        
        # Response quality (using reference)
        if "reference" in example:
            quality = compute_similarity(response, example["reference"])
            results["response_quality"].append(quality)
    
    return {
        "avg_perplexity": np.mean(results["perplexity"]),
        "tool_accuracy": np.mean(results["tool_accuracy"]) if results["tool_accuracy"] else None,
        "avg_quality": np.mean(results["response_quality"]) if results["response_quality"] else None,
    }
```

### 5.4 Common Pitfalls and Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Catastrophic Forgetting | Model loses general abilities | Lower learning rate, more regularization |
| Overfitting | Perfect train, poor eval | More data, dropout, early stopping |
| Underfitting | High loss, poor performance | Higher rank, more epochs, better data |
| Mode Collapse | Repetitive outputs | Temperature tuning, diverse training data |
| Tool Confusion | Wrong tool selection | More tool examples, clearer tool descriptions |

---

## 6. Tool-Use Training Examples

### 6.1 Tool Definition Schema

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "mineAttribute",
        "description": "Extract specific data attributes from web pages using BiDi-powered browser instances",
        "parameters": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "Target URL to mine"
            },
            "attribute": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "selectors": {
                  "type": "array",
                  "items": { "type": "string" }
                }
              },
              "required": ["name"]
            }
          },
          "required": ["url", "attribute"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "generateSchema",
        "description": "Generate a JSON schema from natural language description",
        "parameters": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "Natural language description of the schema"
            },
            "format": {
              "type": "string",
              "enum": ["json-schema", "graphql", "openapi"],
              "description": "Output format"
            }
          },
          "required": ["description"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "createWorkflow",
        "description": "Create an automated workflow from description",
        "parameters": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "steps": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "action": { "type": "string" },
                  "config": { "type": "object" }
                }
              }
            },
            "schedule": {
              "type": "string",
              "enum": ["once", "hourly", "daily", "weekly"]
            }
          },
          "required": ["name", "steps"]
        }
      }
    }
  ]
}
```

### 6.2 Training Examples for Tool Use

#### Example 1: Single Tool Call

```jsonl
{"messages": [
  {"role": "system", "content": "You are a LightDom assistant with access to web mining tools. Use them to help users extract data from websites."},
  {"role": "user", "content": "Get the product prices from shopify-store.com"},
  {"role": "assistant", "content": null, "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "mineAttribute",
        "arguments": "{\"url\": \"https://shopify-store.com\", \"attribute\": {\"name\": \"productPrice\", \"selectors\": [\"[data-price]\", \".product-price\", \"[itemprop=price]\"]}}"
      }
    }
  ]},
  {"role": "tool", "tool_call_id": "call_abc123", "name": "mineAttribute", "content": "{\"success\": true, \"data\": [{\"value\": \"$29.99\", \"selector\": \"[data-price]\"}, {\"value\": \"$49.99\", \"selector\": \"[data-price]\"}], \"confidence\": 0.95}"},
  {"role": "assistant", "content": "I found 2 product prices on shopify-store.com:\n\n1. $29.99\n2. $49.99\n\nThe data was extracted with 95% confidence using the `[data-price]` selector."}
]}
```

#### Example 2: Multiple Tool Calls

```jsonl
{"messages": [
  {"role": "system", "content": "You are a LightDom assistant with access to schema generation and workflow tools."},
  {"role": "user", "content": "Create an e-commerce schema and set up daily mining for product updates"},
  {"role": "assistant", "content": null, "tool_calls": [
    {
      "id": "call_1",
      "type": "function",
      "function": {
        "name": "generateSchema",
        "arguments": "{\"description\": \"E-commerce product with name, price, availability, and category\", \"format\": \"json-schema\"}"
      }
    },
    {
      "id": "call_2",
      "type": "function",
      "function": {
        "name": "createWorkflow",
        "arguments": "{\"name\": \"daily-product-sync\", \"steps\": [{\"action\": \"mineAttribute\", \"config\": {\"attribute\": \"all\"}}], \"schedule\": \"daily\"}"
      }
    }
  ]},
  {"role": "tool", "tool_call_id": "call_1", "name": "generateSchema", "content": "{\"$schema\": \"http://json-schema.org/draft-07/schema#\", \"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}, \"price\": {\"type\": \"number\"}, \"availability\": {\"type\": \"boolean\"}, \"category\": {\"type\": \"string\"}}}"},
  {"role": "tool", "tool_call_id": "call_2", "name": "createWorkflow", "content": "{\"workflowId\": \"wf_789\", \"status\": \"scheduled\", \"nextRun\": \"<next scheduled time>\"}"},
  {"role": "assistant", "content": "I've set up your e-commerce system:\n\n**Schema Created:**\n```json\n{\n  \"name\": \"string\",\n  \"price\": \"number\",\n  \"availability\": \"boolean\",\n  \"category\": \"string\"\n}\n```\n\n**Workflow Scheduled:**\n- Name: daily-product-sync\n- ID: wf_789\n- Schedule: Daily\n- Next run: Tomorrow at midnight\n\nThe workflow will automatically mine and sync product data every day."}
]}
```

#### Example 3: Error Handling

```jsonl
{"messages": [
  {"role": "system", "content": "You are a LightDom assistant. Handle errors gracefully and suggest alternatives."},
  {"role": "user", "content": "Mine data from internal-server.example.com"},
  {"role": "assistant", "content": null, "tool_calls": [
    {
      "id": "call_err1",
      "type": "function",
      "function": {
        "name": "mineAttribute",
        "arguments": "{\"url\": \"https://internal-server.example.com\", \"attribute\": {\"name\": \"general\"}}"
      }
    }
  ]},
  {"role": "tool", "tool_call_id": "call_err1", "name": "mineAttribute", "content": "{\"success\": false, \"error\": \"NETWORK_ERROR\", \"message\": \"Unable to reach internal-server.example.com - host not accessible\"}"},
  {"role": "assistant", "content": "I wasn't able to access that URL. The error indicates the host `internal-server.example.com` isn't accessible from my environment.\n\n**Possible solutions:**\n\n1. **VPN/Tunnel**: If this is an internal server, you might need to set up a tunnel or VPN connection first\n2. **Proxy Configuration**: Configure a proxy that has access to your internal network\n3. **Alternative URL**: If there's a public-facing version of this service, please provide that URL\n4. **Local Agent**: Consider running a LightDom agent inside your network that can access internal resources\n\nWould you like help with any of these options?"}
]}
```

### 6.3 Tool Training Dataset Structure

```
training_data/
├── tool-use/
│   ├── mining_examples.jsonl      # Mining tool examples
│   ├── schema_examples.jsonl      # Schema generation examples
│   ├── workflow_examples.jsonl    # Workflow creation examples
│   ├── multi_tool_examples.jsonl  # Complex multi-tool scenarios
│   └── error_handling.jsonl       # Error recovery examples
├── domain/
│   ├── seo_tasks.jsonl            # SEO-specific training
│   ├── component_gen.jsonl        # Component generation
│   └── data_mining.jsonl          # Data mining tasks
└── validation/
    ├── tool_use_eval.jsonl        # Tool use evaluation set
    └── domain_eval.jsonl          # Domain task evaluation
```

### 6.4 Generating Tool-Use Training Data

```javascript
// Tool-use training data generator for LightDom
class ToolTrainingDataGenerator {
  constructor(tools) {
    this.tools = tools;
    this.examples = [];
  }

  generateExample(userRequest, toolCalls, toolResponses, finalResponse) {
    const messages = [
      {
        role: 'system',
        content: this.getSystemPrompt()
      },
      {
        role: 'user',
        content: userRequest
      },
      {
        role: 'assistant',
        content: null,
        tool_calls: toolCalls.map((call, i) => ({
          id: `call_${i}`,
          type: 'function',
          function: {
            name: call.name,
            arguments: JSON.stringify(call.arguments)
          }
        }))
      }
    ];

    // Add tool responses
    toolResponses.forEach((response, i) => {
      messages.push({
        role: 'tool',
        tool_call_id: `call_${i}`,
        name: toolCalls[i].name,
        content: JSON.stringify(response)
      });
    });

    // Add final response
    messages.push({
      role: 'assistant',
      content: finalResponse
    });

    return { messages };
  }

  getSystemPrompt() {
    return `You are a LightDom AI assistant specialized in web data mining, schema generation, and workflow automation. You have access to the following tools:

${this.tools.map(t => `- ${t.function.name}: ${t.function.description}`).join('\n')}

Use these tools to help users accomplish their tasks. Always explain what you're doing and provide clear, actionable responses.`;
  }

  async generateDataset(scenarios, outputPath) {
    for (const scenario of scenarios) {
      const example = this.generateExample(
        scenario.userRequest,
        scenario.toolCalls,
        scenario.toolResponses,
        scenario.finalResponse
      );
      this.examples.push(example);
    }

    // Write to JSONL
    const jsonl = this.examples
      .map(ex => JSON.stringify(ex))
      .join('\n');
    
    await fs.writeFile(outputPath, jsonl, 'utf-8');
    console.log(`Generated ${this.examples.length} tool-use examples`);
  }
}

// Usage
const generator = new ToolTrainingDataGenerator(toolDefinitions);
await generator.generateDataset(scenarios, 'training_data/tool-use/generated.jsonl');
```

---

## 7. LightDom Integration Patterns

### 7.1 Existing Integration Points

The LightDom platform already has several DeepSeek integration points:

```
LightDom DeepSeek Integration
├── services/
│   ├── deepseek-api-service.js           # Core API wrapper
│   ├── deepseek-component-finetuning-service.js  # Finetuning service
│   ├── deepseek-workflow-manager.js      # Workflow integration
│   └── deepseek-memory-system.js         # Context management
├── api/
│   ├── deepseek-chat-routes.js           # Chat endpoints
│   ├── deepseek-workflow-routes.js       # Workflow endpoints
│   └── deepseek-automation-routes.js     # Automation endpoints
└── training_data/
    ├── test_dataset_train.jsonl          # Training examples
    └── test_dataset_test.jsonl           # Test examples
```

### 7.2 Finetuning Integration with Existing Services

```javascript
// Integration example: Finetuning for component generation
import { DeepSeekComponentFinetuningService } from './services/deepseek-component-finetuning-service.js';
import { TrainingDataBundler } from './services/training-data-bundler.js';

async function finetuneForLightDom() {
  // Step 1: Collect training data from existing components
  const bundler = new TrainingDataBundler(db);
  const trainingBundle = await bundler.createTrainingBundle(
    'component_generation',
    sampleUrls
  );

  // Step 2: Initialize finetuning service
  const finetuner = new DeepSeekComponentFinetuningService({
    trainingDataDir: './training_data',
    modelName: 'deepseek-coder-7b-instruct-v1.5'
  });
  await finetuner.initialize();

  // Step 3: Generate training data from style guide
  const styleGuide = await loadStyleGuide();
  await finetuner.generateTrainingDataFromStyleGuide(styleGuide);

  // Step 4: Add examples from existing components
  await finetuner.generateTrainingDataFromComponents('./src/components');

  // Step 5: Save and train
  const dataPath = await finetuner.saveTrainingData();
  const model = await finetuner.fineTuneModel(dataPath);

  return model;
}
```

### 7.3 Deployment Configuration

```javascript
// Configuration for deploying finetuned models
const deploymentConfig = {
  // Model serving
  serving: {
    engine: 'vllm',              // or 'text-generation-inference'
    gpuMemoryFraction: 0.9,
    maxModelLen: 8192,
    tensorParallel: 1,
  },

  // Adapter merging (optional)
  merging: {
    mergeAdapters: true,         // Merge LoRA weights into base
    exportFormat: 'safetensors',
    quantization: 'awq',          // Post-training quantization
  },

  // API configuration
  api: {
    host: '0.0.0.0',
    port: 8000,
    maxConcurrentRequests: 100,
    timeout: 60000,
  }
};
```

---

## 8. Implementation Roadmap

> **Status**: ✅ **IMPLEMENTED** - See `services/deepseek-finetuning-pipeline.js` and `api/deepseek-finetuning-routes.js`

### Phase 1: Data Infrastructure (Week 1-2)

- [x] Set up training data collection pipeline (`TrainingDataCollectionPipeline`)
- [x] Implement data quality scoring (`DataQualityScorer`)
- [x] Create tool-use example generators (`ToolUseTrainingGenerator`)
- [x] Build validation dataset (`ValidationDatasetBuilder`)

**Implementation**: `services/deepseek-finetuning-pipeline.js` - Lines 1-300

### Phase 2: Local Training Setup (Week 3-4)

- [x] Configure QLoRA training environment (`QLoRATrainingConfig`)
- [x] Implement training scripts (Python script generator)
- [x] Set up evaluation metrics (`EvaluationMetrics`)
- [x] Create training monitoring dashboard (via API endpoints)

**Implementation**: `services/deepseek-finetuning-pipeline.js` - Lines 301-550

### Phase 3: Integration (Week 5-6)

- [x] Integrate finetuned models with existing services (`ModelIntegrationService`)
- [x] Implement A/B testing framework (A/B test creation, routing, recording)
- [x] Create model versioning system (`ModelVersionControl`)
- [x] Deploy to staging environment (deployment simulation)

**Implementation**: `services/deepseek-finetuning-pipeline.js` - Lines 551-750

### Phase 4: Production (Week 7-8)

- [x] Production deployment (`ProductionDeploymentManager`)
- [x] Monitoring and alerting (health checks, event emission)
- [x] Continuous training pipeline (`ContinuousTrainingPipeline`)
- [x] Documentation and training materials (this guide + demo script)

**Implementation**: `services/deepseek-finetuning-pipeline.js` - Lines 751-950

### API Endpoints

All phases are accessible via REST API at `/api/finetuning`:

```bash
# Phase 1
POST /api/finetuning/phase1/collect
POST /api/finetuning/phase1/score-quality
POST /api/finetuning/phase1/generate-tool-examples
POST /api/finetuning/phase1/create-validation-split

# Phase 2
POST /api/finetuning/phase2/configure
POST /api/finetuning/phase2/generate-scripts
GET  /api/finetuning/phase2/training-script
GET  /api/finetuning/phase2/requirements

# Phase 3
POST /api/finetuning/phase3/register-model
GET  /api/finetuning/phase3/models
GET  /api/finetuning/phase3/versions/:modelName
POST /api/finetuning/phase3/ab-test
GET  /api/finetuning/phase3/ab-test/:testId

# Phase 4
POST /api/finetuning/phase4/deploy
GET  /api/finetuning/phase4/deployments
POST /api/finetuning/phase4/rollback/:deploymentId

# Continuous Training
POST /api/finetuning/continuous/add-example
GET  /api/finetuning/continuous/status
POST /api/finetuning/continuous/trigger

# Full Pipeline
POST /api/finetuning/run-pipeline
```

### Demo

Run the demo to see all phases in action:

```bash
node demo-deepseek-finetuning-pipeline.js
```

---

## Appendix A: Hardware Recommendations

| Setup | GPU | VRAM | Suitable For |
|-------|-----|------|--------------|
| Minimal | RTX 3060 | 12GB | 7B model QLoRA |
| Recommended | RTX 4090 | 24GB | 7B-16B model QLoRA |
| Professional | A100 40GB | 40GB | 16B-33B model LoRA |
| Enterprise | 2x A100 80GB | 160GB | 67B model LoRA |

## Appendix B: Resource Links

- DeepSeek Official Docs: https://platform.deepseek.com/docs
- HuggingFace PEFT: https://huggingface.co/docs/peft
- QLoRA Paper: https://arxiv.org/abs/2305.14314
- LightDom Repository: (internal)

---

**Document Status**: Complete  
**Maintainers**: LightDom Development Team  
**Last Review**: November 2024
