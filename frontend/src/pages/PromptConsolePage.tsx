import {
  Command,
  FileText,
  Info,
  Link2,
  Loader2,
  Sparkles,
  StopCircle,
  Undo2,
  User,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import RagConnectionStatus from '@/components/RagConnectionStatus';
import RagErrorBoundary from '@/components/RagErrorBoundary';
import { PromptInput, type PromptAction, type PromptToken } from '@/components/ui/PromptInput';
import { useRagChat } from '@/hooks/useRagChat';

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  streaming?: boolean;
}

interface SchemaSuggestion {
  id?: string;
  name?: string;
  description?: string;
  tasks?: Array<{ name?: string; description?: string; type?: string }>;
  schemas?: Array<{ name?: string; description?: string }>;
}

interface ComponentSuggestion {
  name?: string;
  type?: string;
  description?: string;
  schema?: unknown;
}

interface RetrievedDocument {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  score: number;
  metadata?: Record<string, unknown> | null;
}

const rawApiBase =
  (
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL as
      | string
      | undefined
  )?.trim() || 'http://localhost:3001/api';

const API_BASE = rawApiBase.replace(/\/$/, '');

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
  const [statusMessage, setStatusMessage] = useState('Ready');
  const [thinkingContent, setThinkingContent] = useState<string | null>(null);
  const [schemaSuggestion, setSchemaSuggestion] = useState<SchemaSuggestion | null>(null);
  const [componentSuggestion, setComponentSuggestion] = useState<ComponentSuggestion | null>(null);
  const [ingesting, setIngesting] = useState(false);
  const conversationRef = useRef<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string>(crypto.randomUUID());

  // Use RAG chat hook with automatic retry and error handling
  const {
    streamChat,
    cancelStream,
    isStreaming: loading,
    error,
    retrievedDocuments,
    isAvailable,
    healthStatus,
  } = useRagChat();

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
        label: loading ? statusMessage || 'Streaming…' : statusMessage,
        tone: loading
          ? 'accent'
          : statusMessage.toLowerCase().includes('error')
            ? 'destructive'
            : 'default',
        icon: <Sparkles className='h-4 w-4' />,
      },
    ],
    [loading, statusMessage]
  );

  const updateMessageContent = useCallback(
    (messageId: string, updater: (content: string) => string) => {
      setConversation((prev: ChatMessage[]) =>
        prev.map((msg: ChatMessage) =>
          msg.id === messageId
            ? {
                ...msg,
                content: updater(msg.content),
              }
            : msg
        )
      );
    },
    []
  );

  const markMessageComplete = useCallback((messageId: string) => {
    setConversation((prev: ChatMessage[]) =>
      prev.map((msg: ChatMessage) =>
        msg.id === messageId
          ? {
              ...msg,
              streaming: false,
            }
          : msg
      )
    );
  }, []);

  const appendSystemMessage = useCallback((content: string) => {
    setConversation((prev: ChatMessage[]) => [...prev, createMessage('system', content)]);
  }, []);

  const slashCommandList = useMemo(
    (): Array<{ command: string; description: string }> => [
      {
        command: '/services',
        description: 'List running services managed by the dev service manager.',
      },
      {
        command: '/start <serviceId>',
        description: 'Start a registered service (e.g. /start api).',
      },
      { command: '/stop <serviceId>', description: 'Stop a running service (e.g. /stop api).' },
      { command: '/help', description: 'Show all available slash commands.' },
      {
        command: '/git status',
        description: 'Show working tree status for the current repository.',
      },
      { command: '/git branches', description: 'List local and remote branches.' },
      { command: '/git checkout <branch>', description: 'Switch to an existing branch.' },
      {
        command: '/git create <branch> [--no-checkout]',
        description: 'Create (and optionally checkout) a branch.',
      },
      { command: '/git pull [remote] [branch]', description: 'Pull latest changes from a remote.' },
      {
        command: '/git diff <compare> [base]',
        description: 'Show diff against base (default HEAD).',
      },
      {
        command: '/ingest url <address>',
        description: 'Fetch a remote document or YouTube link into RAG.',
      },
      {
        command: '/ingest upload',
        description: 'Open the file picker to upload content into RAG.',
      },
      {
        command: '/crawl <url> [--depth <n>] [--instances <n>]',
        description: 'Start web crawler with optional depth and instance count.',
      },
      {
        command: '/crawl stop',
        description: 'Stop all active crawler instances.',
      },
      {
        command: '/crawl status',
        description: 'Get status of running crawler instances.',
      },
      {
        command: '/search <query>',
        description: 'Search ingested documents in RAG vector store.',
      },
      {
        command: '/train <dataset>',
        description: 'Enqueue training job for TensorFlow singleton.',
      },
    ],
    []
  );

  const slashCommandHelpMessage = useMemo(
    () =>
      [
        'Slash commands:',
        ...slashCommandList.map(
          (entry: { command: string; description: string }) =>
            `${entry.command} — ${entry.description}`
        ),
      ].join('\n'),
    [slashCommandList]
  );

  const gitRequest = useCallback(async <T = unknown,>(path: string, options: RequestInit = {}) => {
    const requestInit: RequestInit = {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    };

    if (options.body !== undefined) {
      requestInit.body =
        typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    }

    if (requestInit.method === 'GET') {
      delete requestInit.body;
    }

    const response = await fetch(`${API_BASE}/git/${path}`, requestInit);
    const text = await response.text();
    const payload = text
      ? (() => {
          try {
            return JSON.parse(text);
          } catch (error) {
            throw new Error(`Git endpoint returned invalid JSON: ${text}`);
          }
        })()
      : {};

    if (!response.ok || (payload as { status?: string }).status !== 'ok') {
      const message =
        (payload as { message?: string; error?: string }).message ||
        (payload as { message?: string; error?: string }).error ||
        `Git command failed (${response.status})`;
      throw new Error(message);
    }

    return payload as T;
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

            let parsedPayload: unknown = null;

            try {
              parsedPayload = JSON.parse(payload);
            } catch (jsonError) {
              parsedPayload = payload;
            }

            if (
              parsedPayload &&
              typeof parsedPayload === 'object' &&
              !Array.isArray(parsedPayload)
            ) {
              const typedPayload = parsedPayload as {
                type?: string;
                content?: string;
                message?: string;
                schema?: SchemaSuggestion;
                component?: ComponentSuggestion;
                documents?: RetrievedDocument[];
              };

              switch (typedPayload.type) {
                case 'context':
                  setRetrievedDocuments(typedPayload.documents ?? []);
                  continue;
                case 'status':
                  setStatusMessage(typedPayload.message ?? typedPayload.content ?? 'Working…');
                  continue;
                case 'thinking':
                  setThinkingContent(typedPayload.content ?? null);
                  continue;
                case 'schema':
                  setSchemaSuggestion(typedPayload.schema ?? null);
                  continue;
                case 'component':
                  setComponentSuggestion(typedPayload.component ?? null);
                  continue;
                case 'warning':
                  setError(
                    typedPayload.message ?? typedPayload.content ?? 'DeepSeek returned a warning'
                  );
                  setStatusMessage('Warning received');
                  continue;
                case 'complete':
                  setStatusMessage(typedPayload.message ?? 'Complete');
                  continue;
                case 'content':
                  updateMessageContent(
                    assistantMessageId,
                    (current: string) => `${current}${typedPayload.content ?? ''}`
                  );
                  continue;
                default:
                  // Handle both 'content' and 'token' fields for streaming
                  const text = typedPayload.content || typedPayload.token;
                  if (text) {
                    updateMessageContent(
                      assistantMessageId,
                      (current: string) => `${current}${text}`
                    );
                    continue;
                  }
              }
            }

            // Handle token field (streaming format)
            if (parsedPayload && typeof parsedPayload === 'object' && 'token' in parsedPayload) {
              const token = (parsedPayload as { token?: string }).token;
              if (token) {
                updateMessageContent(assistantMessageId, (current: string) => `${current}${token}`);
                continue;
              }
            }

            const contentChunk = typeof parsedPayload === 'string' ? parsedPayload : null;

            if (contentChunk) {
              updateMessageContent(
                assistantMessageId,
                (current: string) => `${current}${contentChunk}`
              );
            }
          }
        }
      } finally {
        markMessageComplete(assistantMessageId);
        streamingMessageIdRef.current = null;
        setStatusMessage('Ready');
      }
    },
    [markMessageComplete, updateMessageContent]
  );

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    streamingMessageIdRef.current = null;
    setConversation([]);
    setError(null);
    setLoading(false);
    setStatusMessage('Ready');
    setThinkingContent(null);
    setSchemaSuggestion(null);
    setComponentSuggestion(null);
    setRetrievedDocuments([]);
    conversationIdRef.current = crypto.randomUUID();
  }, []);

  const ingestUpload = useCallback(async (file: File) => {
    setIngesting(true);
    setStatusMessage(`Uploading ${file.name}…`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);

      const response = await fetch(`${API_BASE}/unified-rag/index/file`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || result?.status !== 'ok') {
        const message =
          (result &&
            typeof result === 'object' &&
            'error' in result &&
            (result as { error?: string }).error) ||
          `Upload failed with status ${response.status}`;
        throw new Error(message || 'Document ingestion failed');
      }

      if ('success' in result && result.success === false) {
        const message =
          (result as { error?: string }).error || 'Document ingestion reported failure';
        throw new Error(message);
      }

      const chunkCount =
        result.chunksIndexed ?? result.metadata?.chunkCount ?? result.metadata?.chunksIndexed;
      const version = result.version ?? result.metadata?.version;
      const documentId = result.documentId ?? result.metadata?.documentId ?? 'unknown';

      setConversation((prev: ChatMessage[]) => [
        ...prev,
        createMessage(
          'system',
          `Document "${file.name}" ingested. Document ID: ${documentId} (chunks: ${
            typeof chunkCount === 'number' ? chunkCount : 'n/a'
          }${version ? `, version ${version}` : ''}).`
        ),
      ]);
      setStatusMessage('Document ingested');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      setStatusMessage('Ingestion failed');
      setConversation((prev: ChatMessage[]) => [
        ...prev,
        createMessage('system', `⚠️ Upload failed: ${message}`),
      ]);
    } finally {
      setIngesting(false);
    }
  }, []);

  const ingestRemoteSource = useCallback(async (input: string) => {
    if (!input) return;
    setIngesting(true);
    setStatusMessage('Fetching remote source…');

    try {
      const body: Record<string, unknown> = {};
      if (/^https?:\/\//i.test(input)) {
        body.url = input;
      }

      if (/(youtube\.com|youtu\.be)/i.test(input)) {
        body.youtubeUrl = input;
      }

      if (!body.url && !body.youtubeUrl) {
        body.url = input;
      }

      body.title = input;

      const response = await fetch(`${API_BASE}/unified-rag/convert/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok || result?.status !== 'ok') {
        const message =
          (result &&
            typeof result === 'object' &&
            'error' in result &&
            (result as { error?: string }).error) ||
          `Remote ingestion failed with status ${response.status}`;
        throw new Error(message || 'Remote ingestion failed');
      }

      if ('success' in result && result.success === false) {
        const message = (result as { error?: string }).error || 'Remote ingestion reported failure';
        throw new Error(message);
      }

      const chunkCount =
        result.chunksIndexed ?? result.metadata?.chunkCount ?? result.metadata?.chunksIndexed;
      const version = result.version ?? result.metadata?.version;
      const documentId = result.documentId ?? result.metadata?.documentId ?? 'unknown';

      setConversation((prev: ChatMessage[]) => [
        ...prev,
        createMessage(
          'system',
          `Remote source ingested from ${input}. Document ID: ${documentId} (chunks: ${
            typeof chunkCount === 'number' ? chunkCount : 'n/a'
          }${version ? `, version ${version}` : ''}).`
        ),
      ]);
      setStatusMessage('Remote document ingested');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown remote ingestion error';
      setStatusMessage('Ingestion failed');
      setConversation((prev: ChatMessage[]) => [
        ...prev,
        createMessage('system', `⚠️ Remote ingestion failed: ${message}`),
      ]);
    } finally {
      setIngesting(false);
    }
  }, []);

  const promptActions = useMemo<PromptAction[]>(
    () => [
      {
        id: 'commands',
        icon: <Command className='h-4 w-4' />,
        label: 'Commands',
        onClick: () => appendSystemMessage(slashCommandHelpMessage),
      },
      {
        id: 'upload',
        icon: <FileText className='h-4 w-4' />,
        label: 'Upload',
        onClick: () => fileInputRef.current?.click(),
        disabled: ingesting,
      },
      {
        id: 'ingest-url',
        icon: <Link2 className='h-4 w-4' />,
        label: 'Add URL',
        onClick: () => {
          const value = window.prompt('Enter document URL or YouTube link to ingest into RAG');
          if (!value) return;
          void ingestRemoteSource(value.trim());
        },
        disabled: ingesting,
      },
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
    [
      appendSystemMessage,
      handleReset,
      ingestRemoteSource,
      ingesting,
      loading,
      slashCommandHelpMessage,
    ]
  );

  const handleSlashCommand = useCallback(
    async (input: string): Promise<boolean> => {
      if (!input.startsWith('/')) {
        return false;
      }

      const raw = input.slice(1).trim();
      if (!raw) {
        appendSystemMessage('⚠️ Slash command missing content. Type /help for options.');
        setStatusMessage('Command error');
        return true;
      }

      const [root, ...rest] = raw.split(/\s+/);
      const normalizedRoot = root.toLowerCase();

      const formatError = (message: string) => {
        appendSystemMessage(`⚠️ ${message}`);
        setStatusMessage('Command error');
      };

      switch (normalizedRoot) {
        case 'services': {
          setStatusMessage('Fetching services…');
          try {
            const resp = await fetch(`${API_BASE}/services`);
            if (!resp.ok) throw new Error(`Service API returned ${resp.status}`);
            const payload = await resp.json();
            const list =
              (payload.services ?? [])
                .map((s: any) => `• ${s.id} (${s.label}) — ${s.running ? 'running' : 'stopped'}`)
                .join('\n') || 'No services defined';
            appendSystemMessage(`Services:\n${list}`);
            setStatusMessage('Services listed');
          } catch (err) {
            appendSystemMessage(`⚠️ Failed to list services: ${(err as Error).message}`);
            setStatusMessage('Service list failed');
          }
          return true;
        }
        case 'start': {
          if (rest.length === 0) {
            formatError('Usage: /start <serviceId>');
            return true;
          }
          const svc = rest[0];
          setStatusMessage(`Starting ${svc}…`);
          try {
            const resp = await fetch(`${API_BASE}/services/${encodeURIComponent(svc)}/start`, {
              method: 'POST',
            });
            const payload = await resp.json();
            if (!resp.ok || !payload.success) {
              throw new Error(payload?.error || `Start failed (${resp.status})`);
            }
            appendSystemMessage(`✅ Service ${svc} started (pid: ${payload.pid ?? 'unknown'}).`);
            setStatusMessage(`Service ${svc} started`);
          } catch (err) {
            appendSystemMessage(`⚠️ Failed to start ${svc}: ${(err as Error).message}`);
            setStatusMessage('Service start failed');
          }
          return true;
        }
        case 'stop': {
          if (rest.length === 0) {
            formatError('Usage: /stop <serviceId>');
            return true;
          }
          const svc = rest[0];
          setStatusMessage(`Stopping ${svc}…`);
          try {
            const resp = await fetch(`${API_BASE}/services/${encodeURIComponent(svc)}/stop`, {
              method: 'POST',
            });
            const payload = await resp.json();
            if (!resp.ok || !payload.success) {
              throw new Error(payload?.error || `Stop failed (${resp.status})`);
            }
            appendSystemMessage(`✅ Service ${svc} stopped.`);
            setStatusMessage(`Service ${svc} stopped`);
          } catch (err) {
            appendSystemMessage(`⚠️ Failed to stop ${svc}: ${(err as Error).message}`);
            setStatusMessage('Service stop failed');
          }
          return true;
        }
        case 'help':
        case '?':
          appendSystemMessage(slashCommandHelpMessage);
          setStatusMessage('Slash commands ready');
          return true;
        case 'git': {
          if (rest.length === 0) {
            formatError('Usage: /git <status|branches|checkout|create|pull|diff> …');
            return true;
          }

          const subcommand = rest[0].toLowerCase();
          const args = rest.slice(1);

          setLoading(true);
          setStatusMessage('Executing git command…');

          try {
            switch (subcommand) {
              case 'status': {
                const result = await gitRequest<{ result?: { stdout?: string; stderr?: string } }>(
                  'status'
                );
                const output = result?.result?.stdout?.trim() || 'Working tree clean.';
                const stderr = result?.result?.stderr?.trim();
                appendSystemMessage(
                  [
                    'Git status:',
                    `\n\u0060\u0060\u0060\n${output}\n\u0060\u0060\u0060`,
                    stderr ? `\nWarnings:\n${stderr}` : '',
                  ]
                    .filter(Boolean)
                    .join('\n') || 'Git status complete.'
                );
                setStatusMessage('Git status retrieved');
                break;
              }
              case 'branches': {
                const result = await gitRequest<{ branches?: string[] }>('list-branches');
                const branches = result?.branches ?? [];
                appendSystemMessage(
                  branches.length
                    ? `Branches:\n${branches.map((branch: string) => `• ${branch}`).join('\n')}`
                    : 'No branches returned.'
                );
                setStatusMessage('Branch list ready');
                break;
              }
              case 'checkout': {
                if (args.length < 1) {
                  formatError('Usage: /git checkout <branch>');
                  break;
                }
                const branchName = args[0];
                await gitRequest('checkout-branch', {
                  method: 'POST',
                  body: { branchName },
                });
                appendSystemMessage(`✅ Checked out branch "${branchName}".`);
                setStatusMessage('Branch checked out');
                break;
              }
              case 'create': {
                if (args.length < 1) {
                  formatError('Usage: /git create <branch> [--no-checkout]');
                  break;
                }
                const checkoutFlagIndex = args.findIndex(arg => arg === '--no-checkout');
                const checkout = checkoutFlagIndex === -1;
                const branchName = checkout
                  ? args[0]
                  : args.filter((_, index) => index !== checkoutFlagIndex)[0];
                await gitRequest('create-branch', {
                  method: 'POST',
                  body: { branchName, checkout },
                });
                appendSystemMessage(
                  checkout
                    ? `✅ Created and switched to branch "${branchName}".`
                    : `✅ Created branch "${branchName}" (not checked out).`
                );
                setStatusMessage('Branch created');
                break;
              }
              case 'pull': {
                const [remote = 'origin', branch] = args;
                await gitRequest('pull', {
                  method: 'POST',
                  body: branch ? { remote, branch } : { remote },
                });
                appendSystemMessage(
                  `✅ Pulled latest changes from ${remote}${branch ? `/${branch}` : ''}.`
                );
                setStatusMessage('Git pull complete');
                break;
              }
              case 'diff': {
                if (args.length < 1) {
                  formatError('Usage: /git diff <compare> [base]');
                  break;
                }
                const [compare, base] = args;
                const result = await gitRequest<{ result?: { stdout?: string; stderr?: string } }>(
                  'diff',
                  {
                    method: 'POST',
                    body: base ? { compare, base } : { compare },
                  }
                );
                const output = result?.result?.stdout?.trim() || 'No differences found.';
                const stderr = result?.result?.stderr?.trim();
                appendSystemMessage(
                  [
                    'Git diff:',
                    `\n\u0060\u0060\u0060\n${output}\n\u0060\u0060\u0060`,
                    stderr ? `\nWarnings:\n${stderr}` : '',
                  ]
                    .filter(Boolean)
                    .join('\n') || 'Git diff complete.'
                );
                setStatusMessage('Git diff ready');
                break;
              }
              default:
                formatError(`Unknown git command: ${subcommand}`);
                break;
            }
          } catch (commandError) {
            const message =
              commandError instanceof Error ? commandError.message : 'Unknown git error';
            appendSystemMessage(`⚠️ Git command failed: ${message}`);
            setStatusMessage('Git command failed');
          } finally {
            setLoading(false);
          }

          return true;
        }
        case 'ingest': {
          if (rest.length === 0) {
            formatError('Usage: /ingest <url|upload> …');
            return true;
          }

          const subcommand = rest[0].toLowerCase();
          const args = rest.slice(1);

          switch (subcommand) {
            case 'url': {
              if (args.length === 0) {
                formatError('Usage: /ingest url <address>');
                return true;
              }
              const target = args.join(' ');
              setStatusMessage('Starting remote ingestion…');
              await ingestRemoteSource(target);
              return true;
            }
            case 'upload': {
              fileInputRef.current?.click();
              setStatusMessage('Select a file to ingest.');
              return true;
            }
            default:
              formatError(`Unknown ingest command: ${subcommand}`);
              return true;
          }
        }
        case 'crawl': {
          if (rest.length === 0) {
            formatError('Usage: /crawl <url|stop|status> …');
            return true;
          }

          const subcommand = rest[0].toLowerCase();
          const args = rest.slice(1);

          switch (subcommand) {
            case 'stop': {
              setStatusMessage('Stopping crawler…');
              try {
                const resp = await fetch(`${API_BASE}/crawler/stop`, {
                  method: 'POST',
                });
                const payload = await resp.json();
                if (!resp.ok || !payload.success) {
                  throw new Error(payload?.error || `Stop failed (${resp.status})`);
                }
                appendSystemMessage('✅ Crawler stopped successfully.');
                setStatusMessage('Crawler stopped');
              } catch (err) {
                appendSystemMessage(`⚠️ Failed to stop crawler: ${(err as Error).message}`);
                setStatusMessage('Crawler stop failed');
              }
              return true;
            }
            case 'status': {
              setStatusMessage('Fetching crawler status…');
              try {
                const resp = await fetch(`${API_BASE}/crawler/status`);
                const payload = await resp.json();
                if (!resp.ok) {
                  throw new Error(`Status failed (${resp.status})`);
                }
                const statusText = [
                  `Running: ${payload.isRunning ? 'Yes' : 'No'}`,
                  payload.currentSession
                    ? `Session: ${payload.currentSession.sessionId} (${payload.currentSession.status})`
                    : 'No active session',
                  payload.activeCrawlers?.length
                    ? `Active crawlers: ${payload.activeCrawlers.length}`
                    : '',
                ]
                  .filter(Boolean)
                  .join('\n');
                appendSystemMessage(`Crawler status:\n${statusText}`);
                setStatusMessage('Crawler status retrieved');
              } catch (err) {
                appendSystemMessage(`⚠️ Failed to get crawler status: ${(err as Error).message}`);
                setStatusMessage('Status check failed');
              }
              return true;
            }
            default: {
              // Treat as URL to crawl
              const url = rest[0];
              if (!url.startsWith('http://') && !url.startsWith('https://')) {
                formatError('Crawler URL must start with http:// or https://');
                return true;
              }

              // Parse optional flags
              let depth = 2;
              let instances = 1;
              for (let i = 1; i < rest.length; i++) {
                if (rest[i] === '--depth' && rest[i + 1]) {
                  depth = parseInt(rest[i + 1], 10);
                  i++;
                } else if (rest[i] === '--instances' && rest[i + 1]) {
                  instances = parseInt(rest[i + 1], 10);
                  i++;
                }
              }

              setStatusMessage(`Starting crawler for ${url}…`);
              try {
                const resp = await fetch(`${API_BASE}/crawler/start`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    url,
                    maxDepth: depth,
                    instanceCount: instances,
                    maxConcurrency: 5,
                    requestDelay: 2000,
                  }),
                });
                const payload = await resp.json();
                if (!resp.ok || !payload.success) {
                  throw new Error(payload?.error || `Crawler start failed (${resp.status})`);
                }
                appendSystemMessage(
                  `✅ Crawler started for ${url} (depth: ${depth}, instances: ${instances}).`
                );
                setStatusMessage('Crawler started');
              } catch (err) {
                appendSystemMessage(`⚠️ Failed to start crawler: ${(err as Error).message}`);
                setStatusMessage('Crawler start failed');
              }
              return true;
            }
          }
        }
        case 'search': {
          if (rest.length === 0) {
            formatError('Usage: /search <query>');
            return true;
          }
          const query = rest.join(' ');
          setStatusMessage('Searching RAG…');
          try {
            const resp = await fetch(`${API_BASE}/unified-rag/search`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ query, topK: 5 }),
            });
            const payload = await resp.json();
            if (!resp.ok || payload?.status !== 'ok') {
              throw new Error(
                (payload &&
                  typeof payload === 'object' &&
                  'error' in payload &&
                  (payload as { error?: string }).error) ||
                  `Search failed (${resp.status})`
              );
            }
            const results = payload.results ?? [];
            const resultText =
              results.length > 0
                ? results
                    .map(
                      (r: any, i: number) =>
                        `${i + 1}. [Score: ${r.score?.toFixed(3) ?? 'N/A'}] ${r.content?.slice(0, 150) ?? 'No content'}…`
                    )
                    .join('\n')
                : 'No results found.';
            appendSystemMessage(`Search results for "${query}":\n${resultText}`);
            setStatusMessage('Search complete');
          } catch (err) {
            appendSystemMessage(`⚠️ Search failed: ${(err as Error).message}`);
            setStatusMessage('Search failed');
          }
          return true;
        }
        case 'train': {
          if (rest.length === 0) {
            formatError('Usage: /train <dataset>');
            return true;
          }
          const dataset = rest.join(' ');
          setStatusMessage('Enqueuing training job…');
          try {
            const resp = await fetch(`${API_BASE}/learning/train`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ dataset }),
            });
            if (!resp.ok) {
              throw new Error(`Training enqueue failed (${resp.status})`);
            }
            const payload = await resp.json();
            appendSystemMessage(
              `✅ Training job enqueued for dataset "${dataset}" (Job ID: ${payload.jobId ?? 'unknown'}).`
            );
            setStatusMessage('Training job enqueued');
          } catch (err) {
            appendSystemMessage(`⚠️ Training enqueue failed: ${(err as Error).message}`);
            setStatusMessage('Training failed');
          }
          return true;
        }
        default:
          // try service manager commands: start/stop/services
          return false;
      }
    },
    [appendSystemMessage, gitRequest, ingestRemoteSource, slashCommandHelpMessage]
  );

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      event.target.value = '';
      void ingestUpload(file);
    },
    [ingestUpload]
  );

  const handleSend = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        return;
      }

      if (trimmed.startsWith('/')) {
        const handled = await handleSlashCommand(trimmed);
        if (handled) {
          return;
        }
      }

      // Cancel any existing stream
      cancelStream();

      const userMessage = createMessage('user', trimmed);
      const assistantMessage: ChatMessage = {
        ...createMessage('assistant', ''),
        streaming: true,
      };

      const history = conversationRef.current;

      streamingMessageIdRef.current = assistantMessage.id;
      setConversation((prev: ChatMessage[]) => [...prev, userMessage, assistantMessage]);
      setStatusMessage('Connecting…');
      setThinkingContent(null);
      setSchemaSuggestion(null);
      setComponentSuggestion(null);

      const messages = history
        .concat(userMessage)
        .map((msg: ChatMessage) => ({ role: msg.role, content: msg.content }));

      try {
        await streamChat(
          messages,
          {
            conversationId: conversationIdRef.current,
          },
          (chunk: string) => {
            setConversation((prev: ChatMessage[]) => {
              return prev.map(msg =>
                msg.id === assistantMessage.id ? { ...msg, content: msg.content + chunk } : msg
              );
            });
            setStatusMessage('Streaming…');
          }
        );

        // Mark message as complete
        markMessageComplete(assistantMessage.id);
        setStatusMessage('Complete');
      } catch (streamError) {
        console.error('RAG chat request failed', streamError);
        markMessageComplete(assistantMessage.id);
      }
    },
    [streamChat, cancelStream, handleSlashCommand, markMessageComplete]
  );

  return (
    <RagErrorBoundary>
      <div className='flex min-h-screen flex-col bg-surface text-on-surface'>
        <header className='flex items-center justify-between border-b border-border/70 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
              <Sparkles className='h-5 w-5' />
            </div>
            <div className='flex flex-col'>
              <span className='text-xs font-semibold uppercase tracking-[0.2em] text-primary/80'>
                DeepSeek Studio
              </span>
              <h1 className='text-lg font-semibold leading-tight'>
                Streaming conversation console
              </h1>
            </div>
          </div>
          <div className='flex items-center gap-4'>
            <RagConnectionStatus showDetails={false} />
            {loading && (
              <span className='flex items-center gap-2 text-xs text-on-surface-variant'>
                <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
                Listening…
              </span>
            )}
          </div>
        </header>

        <main className='flex-1 overflow-y-auto px-6 py-8'>
          <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
            <input
              ref={fileInputRef}
              type='file'
              className='hidden'
              onChange={handleFileInputChange}
              accept='.pdf,.txt,.md,.markdown,.json,.csv,image/*,video/*'
            />
            {conversation.length === 0 && (
              <div className='rounded-3xl border border-dashed border-border/60 bg-surface-container-low p-6 text-sm text-on-surface-variant'>
                Start a conversation to receive live DeepSeek responses. The prompt input stays
                anchored so you can review the full transcript as messages arrive.
              </div>
            )}

            {conversation.map((message: ChatMessage) => {
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
                <article
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-3xl px-5 py-4 transition-all ${bubbleClasses}`}
                  >
                    <div className='mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-on-surface-variant/70'>
                      {roleIcon}
                      <span>{roleLabel}</span>
                      <span className='text-on-surface-variant/50'>
                        • {formatTimestamp(message.timestamp)}
                      </span>
                      {message.streaming && (
                        <Loader2 className='h-3.5 w-3.5 animate-spin text-primary' />
                      )}
                    </div>
                    <div className='space-y-3 text-sm leading-relaxed'>
                      {message.content.split('\n\n').map((paragraph: string, index: number) => (
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

            {(retrievedDocuments.length > 0 ||
              thinkingContent ||
              schemaSuggestion ||
              componentSuggestion) && (
              <section className='space-y-4 rounded-3xl border border-border/60 bg-surface-container-low/80 p-6 shadow-sm shadow-primary/5'>
                <header className='flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70'>
                  <Sparkles className='h-4 w-4' />
                  DeepSeek Insights
                </header>

                {retrievedDocuments.length > 0 && (
                  <article className='rounded-2xl border border-outline/30 bg-surface p-4'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <h3 className='text-sm font-semibold text-on-surface-variant/90'>
                        Retrieved context
                      </h3>
                      <span className='text-xs text-on-surface-variant/70'>
                        Top {retrievedDocuments.length} matches
                      </span>
                    </div>
                    <div className='space-y-3 text-sm text-on-surface-variant'>
                      {retrievedDocuments.map((doc: RetrievedDocument) => (
                        <div
                          key={doc.id}
                          className='rounded-xl border border-outline/20 bg-surface-container-low px-4 py-3'
                        >
                          <div className='mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary/70'>
                            <FileText className='h-3.5 w-3.5' />
                            <span>{doc.documentId}</span>
                            <span className='text-on-surface-variant/60'>
                              Score {(doc.score ?? 0).toFixed(3)}
                            </span>
                          </div>
                          <p className='text-sm text-on-surface line-clamp-3'>{doc.content}</p>
                          {doc.metadata &&
                            doc.metadata.url &&
                            typeof doc.metadata.url === 'string' && (
                              <a
                                href={doc.metadata.url}
                                target='_blank'
                                rel='noreferrer'
                                className='mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline'
                              >
                                <Link2 className='h-3 w-3' />
                                Open source
                              </a>
                            )}
                        </div>
                      ))}
                    </div>
                  </article>
                )}

                {thinkingContent && (
                  <article className='rounded-2xl border border-outline/30 bg-surface p-4'>
                    <h3 className='mb-2 text-sm font-medium text-on-surface-variant/80'>
                      Reasoning trace
                    </h3>
                    <p className='whitespace-pre-wrap text-sm leading-relaxed text-on-surface'>
                      {thinkingContent}
                    </p>
                  </article>
                )}

                {schemaSuggestion && (
                  <article className='rounded-2xl border border-outline/20 bg-surface p-4'>
                    <div className='mb-3 flex items-center justify-between gap-3'>
                      <div>
                        <h3 className='text-base font-semibold text-on-surface'>
                          {schemaSuggestion.name ?? 'Generated workflow schema'}
                        </h3>
                        {schemaSuggestion.description && (
                          <p className='text-sm text-on-surface-variant'>
                            {schemaSuggestion.description}
                          </p>
                        )}
                      </div>
                      {schemaSuggestion.id && (
                        <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                          #{schemaSuggestion.id}
                        </span>
                      )}
                    </div>
                    {schemaSuggestion.tasks && schemaSuggestion.tasks.length > 0 && (
                      <div className='space-y-2'>
                        <p className='text-xs font-semibold uppercase tracking-wide text-on-surface-variant/70'>
                          Tasks
                        </p>
                        <ul className='space-y-1 text-sm text-on-surface-variant'>
                          {schemaSuggestion.tasks.map(
                            (
                              task: NonNullable<SchemaSuggestion['tasks']>[number],
                              index: number
                            ) => (
                              <li
                                key={`${task.name ?? 'task'}-${index}`}
                                className='rounded-xl border border-outline/10 bg-surface-container-low px-3 py-2'
                              >
                                <span className='font-medium text-on-surface'>
                                  {task.name ?? `Step ${index + 1}`}
                                </span>
                                {task.description && (
                                  <p className='text-xs text-on-surface-variant/80'>
                                    {task.description}
                                  </p>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </article>
                )}

                {componentSuggestion && (
                  <article className='rounded-2xl border border-outline/20 bg-surface p-4'>
                    <h3 className='text-base font-semibold text-on-surface'>
                      {componentSuggestion.name ?? 'Suggested component'}
                    </h3>
                    {componentSuggestion.description && (
                      <p className='mt-1 text-sm text-on-surface-variant'>
                        {componentSuggestion.description}
                      </p>
                    )}
                    {componentSuggestion.type && (
                      <p className='mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary'>
                        {componentSuggestion.type}
                      </p>
                    )}
                  </article>
                )}
              </section>
            )}
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
              slashCommands={slashCommandList}
            />
            {error && <p className='text-xs text-destructive'>{error}</p>}
          </div>
        </footer>
      </div>
    </RagErrorBoundary>
  );
};

export { PromptConsolePage };
export default PromptConsolePage;
