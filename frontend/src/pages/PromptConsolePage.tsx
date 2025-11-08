import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Loader2, StopCircle, Undo2, User, Info } from 'lucide-react';

import { PromptInput, type PromptAction, type PromptToken } from '@/components/ui/PromptInput';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  streaming?: boolean;
}

const API_BASE = (
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL as string | undefined
) ?? '/api';

const createMessage = (role: ChatRole, content: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
  timestamp: new Date().toISOString(),
});

const formatTimestamp = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const PromptConsolePage: React.FC = () => {
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const conversationRef = useRef<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const tokens = useMemo<PromptToken[]>(
    () => [
      {
        id: 'status',
        label: loading ? 'Streaming…' : 'Ready',
        tone: loading ? 'accent' : 'default',
        icon: <Sparkles className='h-4 w-4' />,
      },
    ],
    [loading],
  );

  const updateMessageContent = useCallback((messageId: string, updater: (content: string) => string) => {
    setConversation((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: updater(msg.content),
            }
          : msg,
      ),
    );
  }, []);

  const markMessageComplete = useCallback((messageId: string) => {
    setConversation((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              streaming: false,
            }
          : msg,
      ),
    );
  }, []);

  const handleStreamResponse = useCallback(
    async (response: Response, assistantMessageId: string) => {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('DeepSeek streaming response is not readable.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line) continue;

            const payload = line.startsWith('data:') ? line.slice(5).trim() : line;

            if (!payload || payload === ':connected') {
              continue;
            }

            if (payload === '[DONE]') {
              markMessageComplete(assistantMessageId);
              streamingMessageIdRef.current = null;
              return;
            }

            let contentChunk: string | null = null;

            try {
              const parsed = JSON.parse(payload);
              if (typeof parsed === 'string') {
                contentChunk = parsed;
              } else if (parsed?.choices?.[0]?.delta?.content) {
                contentChunk = parsed.choices[0].delta.content as string;
              } else if (parsed?.message || parsed?.content) {
                contentChunk = parsed.message?.content ?? parsed.content ?? null;
              }
            } catch (jsonError) {
              contentChunk = payload;
            }

            if (!contentChunk) {
              continue;
            }

            updateMessageContent(assistantMessageId, (current) => `${current}${contentChunk}`);
          }
        }
      } finally {
        markMessageComplete(assistantMessageId);
        streamingMessageIdRef.current = null;
      }
    },
    [markMessageComplete, updateMessageContent],
  );

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    streamingMessageIdRef.current = null;
    setConversation([]);
    setError(null);
    setLoading(false);
  }, []);

  const promptActions = useMemo<PromptAction[]>(
    () => [
      {
        id: 'stop',
        icon: <StopCircle className='h-4 w-4' />,
        label: 'Stop',
        disabled: !loading,
        onClick: () => {
          abortControllerRef.current?.abort();
          setLoading(false);
        },
      },
      {
        id: 'reset',
        icon: <Undo2 className='h-4 w-4' />,
        label: 'Reset',
        onClick: handleReset,
      },
    ],
    [handleReset, loading],
  );

  const handleSend = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        return;
      }

      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMessage = createMessage('user', trimmed);
      const assistantMessage: ChatMessage = {
        ...createMessage('assistant', ''),
        streaming: true,
      };

      const history = conversationRef.current;

      streamingMessageIdRef.current = assistantMessage.id;
      setConversation((prev) => [...prev, userMessage, assistantMessage]);
      setLoading(true);
      setError(null);

      const payload = {
        prompt: trimmed,
        conversation: history
          .concat(userMessage)
          .map(({ role, content }) => ({ role, content })),
      };

      try {
        const response = await fetch(`${API_BASE}/deepseek/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `DeepSeek request failed with status ${response.status}`);
        }

        await handleStreamResponse(response, assistantMessage.id);
      } catch (streamError) {
        if ((streamError as Error).name === 'AbortError') {
          return;
        }
        console.error('DeepSeek chat request failed', streamError);
        setError('Unable to reach the DeepSeek service. Check the orchestrator on port 4100.');
        markMessageComplete(assistantMessage.id);
      } finally {
        setLoading(false);
      }
    },
    [handleStreamResponse, markMessageComplete],
  );

  return (
    <div className='flex min-h-screen flex-col bg-surface text-on-surface'>
      <header className='flex items-center justify-between border-b border-border/70 px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
            <Sparkles className='h-5 w-5' />
          </div>
          <div className='flex flex-col'>
            <span className='text-xs font-semibold uppercase tracking-[0.2em] text-primary/80'>DeepSeek Studio</span>
            <h1 className='text-lg font-semibold leading-tight'>Streaming conversation console</h1>
          </div>
        </div>
        {loading && (
          <span className='flex items-center gap-2 text-xs text-on-surface-variant'>
            <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
            Listening…
          </span>
        )}
      </header>

      <main className='flex-1 overflow-y-auto px-6 py-8'>
        <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
          {conversation.length === 0 && (
            <div className='rounded-3xl border border-dashed border-border/60 bg-surface-container-low p-6 text-sm text-on-surface-variant'>
              Start a conversation to receive live DeepSeek responses. The prompt input stays anchored so you can review
              the full transcript as messages arrive.
            </div>
          )}

          {conversation.map((message) => {
            const isAssistant = message.role === 'assistant';
            const isUser = message.role === 'user';

            const bubbleClasses = isAssistant
              ? 'bg-surface-container-low/80 border border-border shadow-sm'
              : isUser
              ? 'bg-primary text-primary-foreground border border-primary/70 shadow-lg shadow-primary/20'
              : 'bg-surface-container-low border border-dashed border-outline/60';

            const roleIcon = isAssistant ? (
              <Sparkles className='h-3.5 w-3.5' />
            ) : isUser ? (
              <User className='h-3.5 w-3.5' />
            ) : (
              <Info className='h-3.5 w-3.5' />
            );

            const roleLabel = isAssistant ? 'DeepSeek' : isUser ? 'You' : 'System';

            return (
              <article key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-3xl px-5 py-4 transition-all ${bubbleClasses}`}>
                  <div className='mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-on-surface-variant/70'>
                    {roleIcon}
                    <span>{roleLabel}</span>
                    <span className='text-on-surface-variant/50'>• {formatTimestamp(message.timestamp)}</span>
                    {message.streaming && <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />}
                  </div>
                  <div className='space-y-3 text-sm leading-relaxed'>
                    {message.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className='whitespace-pre-wrap text-on-surface'>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className='border-t border-border/70 bg-surface-container-high/80 px-6 py-4'>
        <div className='mx-auto w-full max-w-4xl space-y-3'>
          <PromptInput
            onSend={handleSend}
            loading={loading}
            tokens={tokens}
            actions={promptActions}
            helperText='Shift + Enter for newline · Enter to send'
            usage='Enter to send'
            allowSendWhileLoading={false}
            className='shadow-lg shadow-primary/10'
          />
          {error && (
            <p className='text-xs text-destructive'>
              {error}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
};

export { PromptConsolePage };
export default PromptConsolePage;
