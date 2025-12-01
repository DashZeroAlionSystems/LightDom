# Streaming vs Non-Streaming in LLM Responses

## What is Streaming?

Streaming (Server-Sent Events / SSE) sends response data in chunks as it's generated, rather than waiting for the complete response.

---

## Why Use Streaming?

### ✅ Advantages

1. **Better User Experience**
   - Users see responses appear word-by-word (like ChatGPT)
   - Feels more interactive and responsive
   - Reduces perceived latency
   - Users can start reading before generation completes

2. **Handle Long Responses**
   - Can process responses of any length
   - No timeout issues for long generations
   - Progressive rendering keeps UI responsive

3. **Early Termination**
   - Users can stop generation mid-stream
   - Saves computational resources
   - Faster iteration when response isn't needed

4. **Real-Time Feedback**
   - Can send status updates during generation
   - Show thinking process
   - Display progress indicators

5. **Lower Memory Usage**
   - Process tokens as they arrive
   - Don't buffer entire response
   - Better for large outputs

### ❌ Disadvantages

1. **Complexity**
   - More complex to implement
   - Requires proper error handling
   - Need to manage connection state

2. **No Retry on Failure**
   - Can't easily retry if stream breaks
   - Partial responses need handling
   - Connection drops lose progress

3. **Harder to Cache**
   - Difficult to cache streaming responses
   - Can't easily replay streams
   - CDN caching not applicable

4. **Debugging Challenges**
   - Harder to inspect in network tools
   - Can't easily log full response
   - Error messages may be incomplete

---

## When to Use Streaming

### ✅ Use Streaming When:

- **Long Text Generation**: Articles, essays, detailed explanations
- **Interactive Chat**: Real-time conversation interfaces
- **User Engagement**: Want to keep users engaged during generation
- **Large Outputs**: Response >500 words or >2000 characters
- **Incremental Processing**: Can act on partial data
- **Real-Time Feel**: UX priority is responsiveness

### ❌ Use Non-Streaming When:

- **Short Responses**: One-word answers, simple confirmations
- **Structured Data**: JSON objects, API responses that need parsing
- **Exact Format Required**: Responses that must be complete (SQL, code)
- **Error Handling Critical**: Need guaranteed complete response
- **Caching Important**: Want to cache full responses
- **Batch Processing**: Processing many requests in background

---

## Implementation Comparison

### Non-Streaming (Traditional)

**Backend** (Express):

```javascript
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  const response = await fetch('http://127.0.0.1:11500/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-coder',
      prompt: message,
      stream: false, // ← Non-streaming
    }),
  });

  const json = await response.json();
  return res.json({ response: json.response });
});
```

**Frontend** (React):

```tsx
const sendMessage = async (message: string) => {
  const response = await fetch('/api/rag/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const data = await response.json();
  setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
};
```

**Pros**: Simple, easy to debug, complete response guaranteed  
**Cons**: Long wait time, no progress feedback, can timeout

---

### Streaming (SSE)

**Backend** (Express):

```javascript
router.post('/chat/stream', async (req, res) => {
  const { message } = req.body;

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const response = await fetch('http://127.0.0.1:11500/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-coder',
      prompt: message,
      stream: true, // ← Streaming
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const json = JSON.parse(line);
      if (json.response) {
        // Send token to client
        res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
      }
    }
  }

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});
```

**Frontend** (React):

```tsx
const sendMessage = async (message: string) => {
  const response = await fetch('/api/rag/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim() || !line.startsWith('data:')) continue;

      const data = JSON.parse(line.slice(5).trim());
      if (data.token) {
        fullText += data.token;
        // Update UI with new token
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullText;
          return newMessages;
        });
      }
      if (data.done) break;
    }
  }
};
```

**Pros**: Real-time updates, better UX, no timeouts, early termination  
**Cons**: More complex, harder to cache, connection management

---

## LightDom Implementation

### Current Setup

**Backend**: `api/rag-fallback.js`

- Endpoint: `/api/rag/chat/stream`
- Format: Server-Sent Events (SSE)
- Token field: `{ token: "word" }`

**Frontend**: `frontend/src/pages/PromptConsolePage.tsx`

- Handles both `token` and `content` fields
- Updates message state incrementally
- Shows streaming indicator

### SSE Message Format

```
data: {"token":"Hello"}

data: {"token":" world"}

data: {"token":"!"}

data: {"done":true}
```

### Frontend Token Handling

```tsx
// Parse each SSE message
const parsedPayload = JSON.parse(payload);

// Check for token field (streaming format)
if (parsedPayload && parsedPayload.token) {
  updateMessageContent(messageId, current => current + parsedPayload.token);
}

// Check for done flag
if (parsedPayload && parsedPayload.done) {
  markMessageComplete(messageId);
}
```

---

## Best Practices

### For Streaming

1. **Always Set Proper Headers**

   ```javascript
   res.setHeader('Content-Type', 'text/event-stream');
   res.setHeader('Cache-Control', 'no-cache');
   res.setHeader('Connection', 'keep-alive');
   ```

2. **Use `data:` Prefix for SSE**

   ```javascript
   res.write(`data: ${JSON.stringify(payload)}\n\n`);
   ```

3. **Send Done Signal**

   ```javascript
   res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
   res.end();
   ```

4. **Handle Connection Drops**

   ```tsx
   try {
     await handleStream();
   } catch (error) {
     if (error.name === 'AbortError') {
       // User cancelled
     } else {
       // Connection lost
       showReconnectOption();
     }
   }
   ```

5. **Buffer Management**
   - Keep track of incomplete lines
   - Split on `\n\n` for SSE messages
   - Handle partial JSON chunks

### For Non-Streaming

1. **Set Timeout**

   ```javascript
   const response = await fetch('/api/chat', {
     signal: AbortSignal.timeout(30000), // 30 seconds
   });
   ```

2. **Add Loading State**

   ```tsx
   setLoading(true);
   try {
     const data = await fetchResponse();
   } finally {
     setLoading(false);
   }
   ```

3. **Cache Responses**
   ```javascript
   const cache = new Map();
   if (cache.has(message)) {
     return cache.get(message);
   }
   ```

---

## Performance Comparison

| Metric                    | Streaming | Non-Streaming |
| ------------------------- | --------- | ------------- |
| Time to First Byte        | ~100ms    | ~10s+         |
| Perceived Latency         | Low       | High          |
| Memory Usage              | Low       | High          |
| Network Efficiency        | High      | Medium        |
| Cache-ability             | Hard      | Easy          |
| Error Recovery            | Hard      | Easy          |
| Implementation Complexity | High      | Low           |

---

## Recommendation for LightDom

**Use Streaming** ✅

**Reasons**:

1. Chat interface benefits from real-time feedback
2. Long responses (code, explanations) are common
3. Users expect ChatGPT-like experience
4. Can show "thinking" status during generation
5. Better UX for multi-turn conversations

**Keep Non-Streaming** for:

- API responses that return structured JSON
- Short, factual queries (counts, lookups)
- Background batch processing
- Cached/repeated queries

---

## Debugging Streaming Issues

### Common Problems

1. **No Response Appearing**
   - Check `Content-Type: text/event-stream` header
   - Verify `data:` prefix on messages
   - Look for CORS issues
   - Check browser network tab (EventStream)

2. **Partial Text Display**
   - Verify `token` vs `content` field name
   - Check frontend parsing logic
   - Ensure buffer management correct

3. **Connection Drops**
   - Add reconnection logic
   - Increase server timeout
   - Check for proxy/nginx buffering

4. **Memory Leaks**
   - Clean up readers on unmount
   - Abort controllers properly
   - Clear message buffers

### Debug Tools

```javascript
// Backend logging
res.write(`data: ${JSON.stringify({ token: word })}\n\n`);
console.log('Sent token:', word);

// Frontend logging
console.log('Received data:', parsedPayload);
console.log('Current message length:', fullText.length);
```

---

**Last Updated**: 2025-01-12  
**Recommended**: Use streaming for LightDom chat interface
