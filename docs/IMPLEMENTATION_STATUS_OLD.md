# LightDom Chat UI/UX Implementation Status

## ✅ Completed (Phase 1)

### 1. Comprehensive Chat UI/UX Design Research

**File**: `docs/CHAT_UI_DESIGN_RESEARCH.md`

**What's Included**:

- Analysis of leading LLM interfaces (ChatGPT, Claude, Cursor, GitHub Copilot)
- **EnhancedChatMessage Schema** with full TypeScript interfaces:
  - Schema.org markup integration
  - Message categorization system (10 categories: code, explanation, question, command, result, error, documentation, planning, debugging, other)
  - Content structure detection (code blocks, markdown, lists, tables, links)
  - Metadata tracking (model, tokens, duration, finish reason)
  - UI state management (collapsed, bookmarked, copied, edited)

- **Self-Organizing Chat Components**:
  - `CategoryFilter` - Filter messages by category with stats
  - `CollapsibleMessage` - Accordion pattern for long messages
  - `ChatMessageList` - Filtered message display
  - `MessageSummary` - Smart summaries for collapsed messages

- **Intelligent Scrolling System**:
  - `useSmartScroll` hook - Auto-scroll management
  - User scroll detection (disables auto-scroll when scrolling up)
  - "Near bottom" detection (100px threshold)
  - `ScrollToBottomButton` - Appears when new messages arrive

- **Optimized Input Component**:
  - Auto-resizing textarea
  - Keyboard shortcuts (Enter to send, Shift+Enter for newline)
  - Slash command detection
  - Character counter (4000 limit)
  - Composition event handling for IME

- **Conversation History Optimization**:
  - `ConversationHistoryManager` class for DeepSeek
  - Message summarization for old context
  - Semantic indexing with embeddings
  - Token usage tracking (4096 limit)
  - Relevant context retrieval via cosine similarity
  - Keeps last 20 messages, summarizes older

- **Design Tokens** for chat UI (JSON)
- **Accessibility Requirements** (WCAG AA compliance)
- **Implementation Checklist** (6 phases, 30+ tasks)

**Impact**: Complete blueprint for redesigning the chat interface with modern UX patterns.

---

### 2. React Component Discovery Crawler

**File**: `scripts/campaigns/react-component-crawler.js`

**Capabilities**:

- **Multi-Source Mining**:
  - Storybook instances (sidebar navigation, canvas extraction)
  - Design system documentation sites (Material UI, Ant Design, etc.)
  - GitHub repositories (via API, searches .tsx/.jsx files)

- **Data Extraction**:
  - Component tree structure (DOM hierarchy, classes, attributes)
  - Computed CSS styles (50+ properties: typography, colors, spacing, layout, flexbox, grid)
  - Storybook props from controls panel
  - TypeScript interfaces from docs
  - Live demo components
  - Component API tables

- **Source Code Parsing** (via Babel):
  - Function components, arrow functions, class components
  - Props interfaces (TypeScript)
  - Hooks usage (useState, useEffect, etc.)
  - Export types (default, named)

- **Reporting**:
  - JSON reports with metadata
  - Statistics (sites visited, components found, props/types extracted)
  - Top props and hooks analysis
  - Grouping by source and type

**Usage**:

```bash
node scripts/campaigns/react-component-crawler.js
```

**Targets**: Storybook.js, Ant Design, Material UI, Chakra UI, GitHub repos

**Impact**: Automated discovery of React components from any source for design system enrichment.

---

### 3. RAG Endpoint Fix (Previously Completed)

**File**: `api/rag-fallback.js`

**Changes**:

- Both `/api/rag/chat` and `/api/rag/chat/stream` now support:
  - `message` (string) format
  - `messages` (array) format with automatic conversion
- Converts messages array to formatted prompt: `role: content\nrole: content`

**File**: `vite.config.ts`

- Fixed proxy from port 3002 → 3001

**Status**: Services running on:

- Ollama: http://127.0.0.1:11500
- API: http://localhost:3001
- Frontend: http://localhost:3000

---

### 4. Analysis Tools (Previously Created)

**A. Storybook Blog Analyzer**
**File**: `scripts/campaigns/storybook-blog-analyzer.js`

Features: Performance metrics, preload strategies, caching headers, service worker detection, React package analysis

**B. Styleguide Property Scraper**
**File**: `scripts/campaigns/styleguide-property-scraper.js`

Features: 50+ CSS property extraction, JSON schema generation, Storybook + custom design system support

**C. RAG Connectivity Monitor**
**File**: `scripts/test-rag-connectivity.js`

Features: Continuous health checking (30s intervals), Ollama/API/RAG endpoint validation, EventEmitter-based, stats tracking

---

## 🚧 Next Steps (Priority Order)

### Phase 2: Category-Based Message Organization

**Tasks**:

1. Implement `EnhancedChatMessage` interface in `src/types/chat.ts`
2. Create `CategoryFilter` component in `src/components/chat/CategoryFilter.tsx`
3. Create `CollapsibleMessage` component in `src/components/chat/CollapsibleMessage.tsx`
4. Build `ChatMessageList` with filtering in `src/components/chat/ChatMessageList.tsx`
5. Add message classifier function (DeepSeek-powered or rule-based)
6. Integrate schema.org markup into message rendering
7. Update `PromptConsolePage.tsx` to use new components

**Estimated Time**: 2-3 days

---

### Phase 3: Chat UI Mining Campaign

**Tasks**:

1. Create Puppeteer campaign for ChatGPT UI (https://chat.openai.com)
2. Create Puppeteer campaign for Claude UI (https://claude.ai)
3. Create Puppeteer campaign for Perplexity (https://www.perplexity.ai)
4. Extract: message layouts, input designs, code block styling, accordion patterns
5. Store patterns in PostgreSQL with semantic tags
6. Generate design tokens from extracted patterns

**Tools**: Modify `react-component-crawler.js` or create new `chat-ui-crawler.js`

**Estimated Time**: 1-2 days

---

### Phase 4: DeepSeek History Optimization

**Tasks**:

1. Implement `ConversationHistoryManager` class
2. Add message summarization endpoint (calls DeepSeek)
3. Integrate semantic indexing (embeddings via Ollama)
4. Add token usage tracking to conversation state
5. Implement relevant context retrieval
6. Update chat API to use optimized history

**Files**:

- `src/services/ConversationHistoryManager.ts`
- `api/deepseek-routes.js` (add `/api/deepseek/summarize`)

**Estimated Time**: 2-3 days

---

### Phase 5: File Watcher Service

**Tasks**:

1. Create file watcher using `chokidar`
2. Watch `src/components/**/*.tsx` for changes
3. Auto-generate/update Storybook stories on file change
4. Validate component schemas
5. Trigger visual regression tests (optional)

**File**: `scripts/services/file-watcher-service.js`

**Estimated Time**: 1 day

---

### Phase 6: DeepSeek-Powered Crawler Config

**Tasks**:

1. Create `crawler_configs` table in PostgreSQL:
   ```sql
   CREATE TABLE crawler_configs (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     intent TEXT NOT NULL,  -- User's natural language intent
     config JSONB NOT NULL, -- Generated crawler config
     created_by_deepseek BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```
2. Create API endpoint `/api/crawler/generate-config` that:
   - Takes user intent as input
   - Sends to DeepSeek with specialized prompt
   - Returns crawler configuration JSON
3. Integrate with `react-component-crawler.js`
4. Add seeder script to populate database
5. Create admin UI for managing configs

**Files**:

- `db/migrations/015_crawler_configs.sql`
- `api/crawler-config-routes.js`
- `src/components/admin/CrawlerConfigManager.tsx`

**Estimated Time**: 2-3 days

---

### Phase 7: Design System Robustness

**Tasks**:

1. Add JSON schema validation for design tokens
2. Create component versioning system
3. Build automated consistency checker
4. Generate prop types from schemas automatically
5. Create component dependency graph
6. Add visual regression testing integration

**Tools**: JSON Schema, Ajv, Storybook Test Runner, Percy/Chromatic

**Estimated Time**: 3-4 days

---

## 📊 Overall Progress

| Phase                        | Status            | Completion |
| ---------------------------- | ----------------- | ---------- |
| **Research & Planning**      | ✅ Complete       | 100%       |
| **Crawling Infrastructure**  | ✅ Complete       | 100%       |
| **RAG Connectivity**         | ✅ Complete       | 100%       |
| **Category-Based Chat**      | ⚠️ Ready to Build | 0%         |
| **Chat UI Mining**           | ⚠️ Ready to Build | 0%         |
| **History Optimization**     | ⚠️ Ready to Build | 0%         |
| **File Watcher**             | ⚠️ Ready to Build | 0%         |
| **DeepSeek Crawler Config**  | ⚠️ Ready to Build | 0%         |
| **Design System Robustness** | ⚠️ Ready to Build | 0%         |

**Total Progress**: 3/9 phases complete (33%)

---

## 🎯 Immediate Next Actions

1. **Test RAG Connection** (5 minutes)
   - Open http://localhost:3000
   - Navigate to Prompt Console
   - Send test message
   - Verify streaming response

2. **Implement Category Filter** (1 hour)
   - Create `CategoryFilter.tsx` component
   - Add to `PromptConsolePage.tsx`
   - Test with mock data

3. **Implement CollapsibleMessage** (2 hours)
   - Create accordion component
   - Add animation transitions
   - Test with long messages

4. **Run React Component Crawler** (30 minutes)
   - Execute crawler on target design systems
   - Review generated reports
   - Import findings into design system

5. **Start Chat UI Mining Campaign** (2 hours)
   - Setup Puppeteer for ChatGPT/Claude
   - Extract UI patterns
   - Generate pattern library

---

## 📝 Notes

### Design System Targets

- ChatGPT (https://chat.openai.com)
- Claude (https://claude.ai)
- Cursor Chat (embedded in VS Code)
- Perplexity (https://www.perplexity.ai)
- Phind (https://www.phind.com)
- Material UI (https://mui.com)
- Ant Design (https://ant.design)
- Chakra UI (https://chakra-ui.com)
- Radix UI (https://www.radix-ui.com)

### Schema.org Types for Messages

- `Message` - Base type for all messages
- `Question` - User questions
- `Answer` - Assistant responses
- `SoftwareSourceCode` - Code blocks
- `HowTo` - Instructional content

### Accessibility Checklist

- [ ] Keyboard navigation for all actions
- [ ] ARIA labels for category filters
- [ ] Focus management in accordions
- [ ] Screen reader announcements for new messages
- [ ] Color contrast (4.5:1 minimum)
- [ ] Reduced motion support

---

## 🔗 Related Documentation

- `CHAT_UI_DESIGN_RESEARCH.md` - Complete design system and patterns
- `COMPREHENSIVE_STORYBOOK_GUIDE.md` - Storybook implementation
- `STYLEGUIDE_MINING_UX_RULES_SYSTEM.md` - Mining strategies
- `react-component-crawler.js` - Component discovery tool

---

**Last Updated**: 2025-01-12
**Status**: Research Complete, Implementation Ready
