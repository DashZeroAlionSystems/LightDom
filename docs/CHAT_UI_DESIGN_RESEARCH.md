# LLM Chat UI/UX Design Research & Implementation Guide

## Executive Summary

Comprehensive research into modern LLM chat interfaces with actionable design patterns for LightDom's DeepSeek integration. Includes schema-based message organization, intelligent scrolling, accordion patterns, and self-organizing conversation management.

---

## 1. Leading LLM Chat Interface Analysis

### ChatGPT (OpenAI)

**Strengths:**

- **Message Layout**: Clean, centered conversation flow with max-width containers
- **Input Design**: Sticky bottom input with send button, auto-resizing textarea
- **Code Blocks**: Syntax highlighting with copy button, language badges
- **Scrolling**: Auto-scroll on new messages, manual scroll locks auto-scroll
- **Regeneration**: Easy regenerate/edit controls inline with messages

**Key Patterns:**

```tsx
// Message structure
interface ChatGPTMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  id: string;
  metadata?: {
    model: string;
    finishReason?: string;
    tokens?: number;
  };
}

// Layout: max-width 768px, padding 24px, gap 16px between messages
```

### Claude (Anthropic)

**Strengths:**

- **Thinking Process**: Shows "thinking..." with animated dots during generation
- **Citations**: Inline reference links to sources when applicable
- **Artifacts**: Side-by-side code/preview panels for generated content
- **Context Management**: Clear token usage indicator, conversation summarization
- **Message Actions**: Bookmark, copy, retry, branch conversation

**Key Patterns:**

```tsx
// Thinking indicator
<div className="thinking-indicator">
  <span className="avatar">🤔</span>
  <div className="dots">
    <span></span><span></span><span></span>
  </div>
</div>

// Artifact panel
<div className="artifact-panel">
  <div className="code-view">{/* Generated code */}</div>
  <div className="preview-view">{/* Live preview */}</div>
</div>
```

### Cursor (AI Code Editor)

**Strengths:**

- **Inline Chat**: Context-aware chat directly in code editor
- **Apply Button**: One-click to apply suggested changes to files
- **Diff View**: Side-by-side comparison of changes before applying
- **Command Palette**: Quick commands like "/edit", "/fix", "/docs"
- **File References**: @file mentions with autocomplete

**Key Patterns:**

```tsx
// Inline command
<div className="command-input">
  <span className="slash">/</span>
  <input placeholder="Type command..." />
</div>

// File reference
<span className="file-ref" data-file="path/to/file.ts">
  @components/Button.tsx
</span>
```

### GitHub Copilot Chat

**Strengths:**

- **Workspace Context**: Automatically includes relevant files
- **Quick Actions**: "Insert at cursor", "Copy", "Run in terminal"
- **Code Suggestions**: Inline code blocks with syntax highlighting
- **Multi-Turn**: Maintains conversation context across requests
- **Slash Commands**: /explain, /fix, /tests, /doc

**Key Patterns:**

```tsx
// Quick action buttons
<div className='message-actions'>
  <button onClick={insertAtCursor}>Insert at Cursor</button>
  <button onClick={copy}>Copy</button>
  <button onClick={runInTerminal}>Run</button>
</div>
```

---

## 2. Recommended Design System for LightDom

### Message Schema with schema.org Markup

```typescript
// Enhanced message schema with category classification
interface EnhancedChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;

  // Category classification
  category: MessageCategory;
  subcategories: string[];

  // Schema.org markup
  schema: {
    '@context': 'https://schema.org';
    '@type': 'Message';
    dateCreated: string;
    author: {
      '@type': 'Person' | 'SoftwareApplication';
      name: string;
    };
    text: string;
    about?: string[]; // Topics/categories
    keywords?: string[]; // Searchable tags
  };

  // Content structure
  structure: {
    hasCode: boolean;
    codeBlocks: CodeBlock[];
    hasMarkdown: boolean;
    hasList: boolean;
    hasTable: boolean;
    hasLinks: boolean;
    links: string[];
  };

  // Metadata
  metadata: {
    model?: string;
    tokens?: number;
    duration?: number;
    finishReason?: string;
    temperature?: number;
  };

  // UI state
  ui: {
    collapsed: boolean;
    bookmarked: boolean;
    copied: boolean;
    edited: boolean;
  };
}

type MessageCategory =
  | 'code' // Code generation/modification
  | 'explanation' // Conceptual explanations
  | 'question' // User questions
  | 'command' // System commands/actions
  | 'result' // Execution results
  | 'error' // Error messages
  | 'documentation' // Documentation snippets
  | 'planning' // Strategic planning
  | 'debugging' // Debug assistance
  | 'other';

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
  startLine?: number;
  endLine?: number;
}
```

### Self-Organizing Chat with Category Filtering

```tsx
// Category filter component
const CategoryFilter: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<Set<MessageCategory>>(new Set());
  const [stats, setStats] = useState<Record<MessageCategory, number>>({});

  return (
    <div className='category-filter'>
      {Object.keys(stats).map(category => (
        <button
          key={category}
          className={cn(
            'category-chip',
            selectedCategories.has(category as MessageCategory) && 'active'
          )}
          onClick={() => toggleCategory(category)}
        >
          <CategoryIcon category={category} />
          <span>{category}</span>
          <span className='count'>{stats[category]}</span>
        </button>
      ))}
    </div>
  );
};

// Message list with filtering
const ChatMessageList: React.FC<{ messages: EnhancedChatMessage[] }> = ({ messages }) => {
  const filteredMessages = useMemo(() => {
    if (selectedCategories.size === 0) return messages;
    return messages.filter(msg => selectedCategories.has(msg.category));
  }, [messages, selectedCategories]);

  return (
    <div className='message-list'>
      {filteredMessages.map(message => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};
```

### Accordion Pattern for Long Responses

```tsx
// Collapsible message component
const CollapsibleMessage: React.FC<{ message: EnhancedChatMessage }> = ({ message }) => {
  const [collapsed, setCollapsed] = useState(message.ui.collapsed);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-collapse long messages (>500 chars)
  useEffect(() => {
    if (message.content.length > 500 && !collapsed) {
      setCollapsed(true);
    }
  }, [message]);

  return (
    <div className={cn('message-container', collapsed && 'collapsed')}>
      <div className='message-header' onClick={() => setCollapsed(!collapsed)}>
        <MessageAvatar role={message.role} />
        <MessageSummary message={message} />
        <ChevronIcon direction={collapsed ? 'down' : 'up'} />
      </div>

      <div
        ref={contentRef}
        className='message-content'
        style={{
          maxHeight: collapsed ? '0' : `${contentRef.current?.scrollHeight}px`,
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        <MessageRenderer content={message.content} />
      </div>

      <MessageActions message={message} />
    </div>
  );
};

// Message summary for collapsed state
const MessageSummary: React.FC<{ message: EnhancedChatMessage }> = ({ message }) => {
  const summary = useMemo(() => {
    // Extract first sentence or first 100 chars
    const firstLine = message.content.split('\n')[0];
    return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
  }, [message.content]);

  return (
    <div className='message-summary'>
      <span className='category-badge'>{message.category}</span>
      <span className='summary-text'>{summary}</span>
      {message.structure.hasCode && <CodeIcon className='has-code-indicator' />}
    </div>
  );
};
```

### Intelligent Scrolling Behavior

```tsx
// Smart scroll manager
const useSmartScroll = (
  containerRef: RefObject<HTMLDivElement>,
  messages: EnhancedChatMessage[]
) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const lastMessageCountRef = useRef(messages.length);

  // Detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Consider "near bottom" if within 100px
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);

    // Disable auto-scroll if user scrolled up
    if (!nearBottom && autoScroll) {
      setAutoScroll(false);
    }
  }, [autoScroll]);

  // Auto-scroll on new messages if enabled
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current && autoScroll) {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, autoScroll]);

  // Re-enable auto-scroll when user scrolls to bottom
  useEffect(() => {
    if (isNearBottom && !autoScroll) {
      setAutoScroll(true);
    }
  }, [isNearBottom]);

  return {
    autoScroll,
    isNearBottom,
    scrollToBottom: () => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
      setAutoScroll(true);
    },
  };
};

// Scroll-to-bottom button
const ScrollToBottomButton: React.FC<{ visible: boolean; onClick: () => void }> = ({
  visible,
  onClick,
}) => {
  if (!visible) return null;

  return (
    <button className='scroll-to-bottom' onClick={onClick}>
      <ChevronDownIcon />
      <span>New messages</span>
    </button>
  );
};
```

### Optimized Input Component

```tsx
// Auto-resizing textarea with slash commands
const ChatInput: React.FC = () => {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [value]);

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isComposing) return;

    onSubmit(value);
    setValue('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className='chat-input-container' onSubmit={handleSubmit}>
      <div className='input-wrapper'>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder='Ask DeepSeek anything... (Enter to send, Shift+Enter for new line)'
          rows={1}
          className='chat-input'
        />

        <div className='input-actions'>
          <button type='button' className='attach-btn'>
            <PaperclipIcon />
          </button>
          <button type='submit' disabled={!value.trim()} className='send-btn'>
            <SendIcon />
          </button>
        </div>
      </div>

      <div className='input-hints'>
        <span className='hint'>Pro tip: Use / for commands</span>
        <span className='char-count'>{value.length} / 4000</span>
      </div>
    </form>
  );
};
```

---

## 3. Conversation History Optimization for DeepSeek

### Context-Aware History Structure

```typescript
// Optimized conversation history
interface OptimizedHistory {
  // Full messages (last N)
  recentMessages: EnhancedChatMessage[];

  // Summarized older messages
  summarizedContext: {
    summary: string;
    messageCount: number;
    dateRange: { start: Date; end: Date };
    keyTopics: string[];
  };

  // Semantic index
  semanticIndex: {
    embeddings: Map<string, number[]>;
    messageIds: string[];
  };

  // Token optimization
  tokenUsage: {
    current: number;
    limit: number;
    percentage: number;
  };
}

// History manager
class ConversationHistoryManager {
  private maxRecentMessages = 20;
  private maxTokens = 4096;

  async optimizeForDeepSeek(messages: EnhancedChatMessage[]): Promise<OptimizedHistory> {
    // Keep last N messages
    const recent = messages.slice(-this.maxRecentMessages);
    const older = messages.slice(0, -this.maxRecentMessages);

    // Summarize older messages if they exist
    let summarized = null;
    if (older.length > 0) {
      summarized = await this.summarizeMessages(older);
    }

    // Build semantic index
    const semanticIndex = await this.buildSemanticIndex(messages);

    // Calculate token usage
    const tokens = this.calculateTokens(recent);

    return {
      recentMessages: recent,
      summarizedContext: summarized,
      semanticIndex,
      tokenUsage: {
        current: tokens,
        limit: this.maxTokens,
        percentage: (tokens / this.maxTokens) * 100,
      },
    };
  }

  private async summarizeMessages(messages: EnhancedChatMessage[]): Promise<any> {
    // Use DeepSeek to summarize old messages
    const summary = await this.callDeepSeek({
      prompt: `Summarize this conversation in 3-5 bullet points:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`,
      temperature: 0.3,
    });

    return {
      summary,
      messageCount: messages.length,
      dateRange: {
        start: messages[0].timestamp,
        end: messages[messages.length - 1].timestamp,
      },
      keyTopics: this.extractKeyTopics(messages),
    };
  }

  private async buildSemanticIndex(messages: EnhancedChatMessage[]) {
    // Create embeddings for semantic search
    const embeddings = new Map();

    for (const message of messages) {
      const embedding = await this.createEmbedding(message.content);
      embeddings.set(message.id, embedding);
    }

    return {
      embeddings,
      messageIds: messages.map(m => m.id),
    };
  }

  private calculateTokens(messages: EnhancedChatMessage[]): number {
    // Rough token estimation (1 token ≈ 4 characters)
    return messages.reduce((sum, m) => sum + Math.ceil(m.content.length / 4), 0);
  }

  async findRelevantContext(
    query: string,
    history: OptimizedHistory
  ): Promise<EnhancedChatMessage[]> {
    // Semantic search to find relevant previous messages
    const queryEmbedding = await this.createEmbedding(query);

    const similarities = Array.from(history.semanticIndex.embeddings.entries())
      .map(([id, embedding]) => ({
        id,
        similarity: this.cosineSimilarity(queryEmbedding, embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return similarities
      .map(s => history.recentMessages.find(m => m.id === s.id))
      .filter(Boolean) as EnhancedChatMessage[];
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
```

---

## 4. Implementation Checklist

### Phase 1: Message Schema & Classification

- [ ] Implement EnhancedChatMessage interface
- [ ] Add schema.org markup to all messages
- [ ] Build category classifier (use DeepSeek or rule-based)
- [ ] Create message structure analyzer (detect code/markdown/lists)
- [ ] Add metadata tracking (tokens, duration, model)

### Phase 2: UI Components

- [ ] Build CollapsibleMessage component with accordions
- [ ] Create CategoryFilter with stats
- [ ] Implement ChatMessageList with filtering
- [ ] Add MessageRenderer with syntax highlighting
- [ ] Design MessageActions bar (copy, retry, bookmark)

### Phase 3: Scroll Management

- [ ] Implement useSmartScroll hook
- [ ] Add ScrollToBottomButton
- [ ] Handle auto-scroll on new messages
- [ ] Detect user scroll-up to disable auto-scroll
- [ ] Re-enable auto-scroll when user scrolls to bottom

### Phase 4: Input Enhancement

- [ ] Build auto-resizing textarea
- [ ] Add slash command detection
- [ ] Implement file attachment support
- [ ] Add character/token counter
- [ ] Support keyboard shortcuts (Cmd+Enter, etc.)

### Phase 5: History Optimization

- [ ] Implement ConversationHistoryManager
- [ ] Add message summarization for old context
- [ ] Build semantic indexing with embeddings
- [ ] Create token usage tracker
- [ ] Add relevant context retrieval

### Phase 6: Storybook Integration

- [ ] Create stories for all chat components
- [ ] Add interaction tests
- [ ] Document UX patterns
- [ ] Build component sandbox
- [ ] Visual regression testing

---

## 5. Design Tokens for Chat UI

```json
{
  "chat": {
    "message": {
      "maxWidth": "768px",
      "padding": "16px 24px",
      "gap": "16px",
      "borderRadius": "12px",
      "user": {
        "background": "var(--color-primary-100)",
        "color": "var(--color-primary-900)"
      },
      "assistant": {
        "background": "var(--color-surface-100)",
        "color": "var(--color-on-surface)"
      }
    },
    "input": {
      "minHeight": "48px",
      "maxHeight": "200px",
      "padding": "12px 16px",
      "borderRadius": "24px",
      "fontSize": "16px",
      "lineHeight": "1.5"
    },
    "code": {
      "background": "var(--color-surface-200)",
      "padding": "16px",
      "borderRadius": "8px",
      "fontSize": "14px",
      "fontFamily": "var(--font-mono)"
    },
    "accordion": {
      "transitionDuration": "0.3s",
      "transitionTiming": "ease-in-out",
      "headerHeight": "56px"
    }
  }
}
```

---

## 6. Accessibility Requirements

- **Keyboard Navigation**: All actions accessible via keyboard
- **Screen Reader Support**: ARIA labels for all interactive elements
- **Focus Management**: Clear focus indicators, logical tab order
- **Color Contrast**: WCAG AA minimum (4.5:1 for text)
- **Reduced Motion**: Respect prefers-reduced-motion
- **Semantic HTML**: Proper heading hierarchy, lists, landmarks

---

## Next Steps

1. Create Storybook stories for chat components
2. Build data mining campaign for chat UIs
3. Implement RAG connectivity tests
4. Design self-organizing conversation UI
5. Optimize conversation history for DeepSeek
