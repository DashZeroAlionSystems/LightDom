# DeepSeek Streaming Chat Pipeline

This guide documents the full stack used to deliver the live DeepSeek chat experience inside LightDom. It is intended for engineers, designers, and DeepSeek itself so that everyone can regenerate the UI, configure tool usage, and verify the streaming loop end-to-end.

---

## 1. Runtime Overview

```
Frontend Prompt Console  →  Simple API Server (port 3002)  →  DeepSeek Orchestrator (port 4100)
                                            ↘︎             ↘︎
                                            Storybook      Ollama (11434)
```

1. **Frontend (Vite @ 3000)** renders `PromptConsolePage.tsx`, which converts user prompts into streamed responses while exposing admin controls and templates.
2. **Simple API Server (`simple-api-server.js`)** proxies `POST /api/deepseek/chat` using Server-Sent Events (SSE). It forwards request payloads and raw stream chunks to the frontend.
3. **DeepSeek Orchestrator (`scripts/start-deepseek-service.js`)** receives `/chat` requests, builds the message stack, and calls `DeepSeekAPIService.createChatStream()`.
4. **DeepSeekAPIService** dynamically chooses between the hosted DeepSeek API or a local Ollama instance. When `DEEPSEEK_API_URL` points at Ollama (e.g., `http://127.0.0.1:11434`), streamed chunks include optional `tool_calls` entries.
5. **Ollama** returns content deltas and tool-call JSON. Our proxy does not mutate these chunks, so the frontend can detect tool requests in real time.
6. **Storybook** mirrors the console in isolation using the same configuration files so that DeepSeek can review UI states or regenerate variations via prompts.

Key environment variables:

- `PORT` (defaults to 3002) – Simple API server listening address.
- `DEEPSEEK_SERVICE_URL` – Upstream orchestrator URL (defaults to `http://127.0.0.1:4100`).
- `DEEPSEEK_API_URL` – Host for DeepSeek/Ollama chat endpoint.
- `DEEPSEEK_MODEL` – Model passed to DeepSeek/Ollama (e.g., `llama3.1`).

To ensure “we can talk to DeepSeek,” run all three services:

```bash
# Terminal 1
node simple-api-server.js

# Terminal 2
npm run start:deepseek

# Terminal 3
cd frontend && pnpm dev
```

Verify connectivity:

```bash
curl -N http://localhost:3002/api/deepseek/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"ping"}'
```

A healthy stream shows incremental JSON lines and ends with `data: [DONE]`.

---

## 2. Configuration Files

| File | Purpose |
| ---- | ------- |
| `frontend/src/config/schemas/deepseek-chat-console.schema.json` | Defines the configuration contract for templates, admin defaults, tool registry, and Storybook metadata. |
| `frontend/src/config/deepseek-chat-console.json` | Default console configuration consumed by UI, backend, and stories. |
| `frontend/src/config/style-guides/deepseek-chat.json` | Material Design 3 tone + layout defaults extended with story metadata. |
| `frontend/src/stories/prompts/deepseek-console.mdx` | Prompt instructions for DeepSeek to regenerate Storybook stories. |
| `frontend/src/stories/fixtures/deepseek-console-session.json` | Sample conversation stream (user + assistant + admin note). |

When adding new templates or tools, update the config JSON and ensure the schema still validates.

---

## 3. UI Data Flow

1. `PromptConsolePage.tsx` loads the console config, style guide, and admin defaults on mount.
2. User actions (template selection, admin overrides) are persisted in local storage (`deepseek-admin-console-config`).
3. On prompt submission, the page sends a POST to `/api/deepseek/chat` with:
   - `prompt`
   - `conversation` history (user, assistant, system/admin notes)
   - `templateId`
   - `adminConfig`
4. Streaming handler parses each line. Possible payloads:
   - Text deltas (`choices[0].delta.content`)
   - Tool calls (`message.tool_calls`)
   - Control markers (`[DONE]`)
5. When a tool call is detected, the UI logs it and (future work) can auto-execute registered tools defined in `deepseek-chat-console.json`.
6. Completed assistant messages are appended to the transcript panel with badge, timestamp, and streaming indicator.

---

## 4. Storybook Pipeline

- `frontend/src/stories/DeepSeekConsole.stories.tsx` renders the entire console using fixtures and the style guide.
- `stories/prompts/deepseek-console.mdx` provides a reproducible LLM prompt so DeepSeek can regenerate or review UI tests.
- `stories/fixtures/deepseek-console-session.json` supplies mock transcript data and tool-call events.

To run Storybook:

```bash
cd frontend
pnpm storybook
```

Once the story loads, DeepSeek can inspect the component state, adjust controls, or generate annotated screenshots for administrators.

---

## 5. Tool Registry Integration

The schema allows specifying a tool registry per console. Each entry includes:

- `id` – unique slug
- `modelIds` – models that can use the tool
- `function` – OpenAI-compatible schema forwarded to Ollama/DeepSeek
- `autoExecute` – whether the frontend should immediately run the tool when requested

### Example round trip

1. Ollama requests `workflow-registry-lookup` during streaming. The frontend displays a notification and (if `autoExecute=true`) calls our upcoming workflow registry endpoint.
2. Once the tool result is ready, we append a new message with `role: "tool"` back into the conversation and resume the chat stream (handled in a follow-up implementation task).

---

## 6. Implementation Checklist

- [x] Document runtime and configuration flow (this file).
- [x] Create console schema and default config.
- [x] Extend style guide and Storybook assets.
- [ ] Implement automated tool execution loop (frontend + backend).
- [ ] Add API endpoint for workflow registry lookup.
- [ ] Provide DeepSeek with additional prompts for admin customization scenarios.

---

## 7. Troubleshooting

| Issue | Resolution |
| ----- | ---------- |
| `Cannot POST /api/deepseek/chat` | Start `simple-api-server.js` on port 3002. |
| Stream closes immediately | Verify orchestrator (`npm run start:deepseek`) and Ollama (default 11434) are running. |
| Tool calls not parsed | Update `PromptConsolePage.tsx` parser to handle `chunk.message.tool_calls` (in progress). |
| Storybook style mismatch | Confirm `deepseek-chat-console.json` paths to style guide + fixture are correct; clear Storybook cache. |

---

For questions or updates, mention the **DeepSeek Streaming Console** doc in pull requests or open a new entry in `docs/design-system/` for broader style guide changes.
