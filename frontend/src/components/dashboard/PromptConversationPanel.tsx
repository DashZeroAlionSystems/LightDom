import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Loader2,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Tag,
} from 'lucide-react';

import {
  PromptInput,
  PromptSidebar,
} from '@/components/ui';
import type {
  PromptAction,
  PromptInputHeaderConfig,
  PromptToken,
} from '@/components/ui/PromptInput';

interface PromptConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PromptWorkflowListItem {
  id: string;
  name: string;
  description?: string;
  schema?: string;
  status?: string;
  configCount?: number;
  lastRun?: string;
}

interface PromptConversationPanelProps {
  conversation: PromptConversationEntry[];
  loading: boolean;
  promptError: string | null;
  onSend: (prompt: string) => Promise<void> | void;
  onReset: () => void;
  tokens: PromptToken[];
  header?: PromptInputHeaderConfig;
  helperText?: React.ReactNode;
  usage?: React.ReactNode;
  actions?: PromptAction[];
  workflowItems?: PromptWorkflowListItem[];
  workflowsLoading?: boolean;
  onRefreshWorkflows?: () => void;
}

const PromptConversationPanel: React.FC<PromptConversationPanelProps> = ({
  conversation,
  loading,
  promptError,
  onSend,
  onReset,
  tokens,
  header,
  helperText,
  usage,
  actions,
  workflowItems,
  workflowsLoading = false,
  onRefreshWorkflows,
}) => {
  const { Shell, Section, Item, Divider } = PromptSidebar;

  const latestAssistantSummary = useMemo(() => {
    const replies = conversation.filter((entry) => entry.role === 'assistant');
    return replies.length ? replies[replies.length - 1] : null;
  }, [conversation]);

  const recentMessages = useMemo(() => {
    return [...conversation].slice(-8).reverse();
  }, [conversation]);

  const lastUserMessage = useMemo(() => {
    const users = conversation.filter((entry) => entry.role === 'user');
    return users.length ? users[users.length - 1] : null;
  }, [conversation]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            DeepSeek session
          </h2>
          <PromptInput
            onSend={onSend}
            loading={loading}
            tokens={tokens}
            actions={actions}
            header={header}
            helperText={helperText}
            usage={usage}
            placeholder="Describe a workflow or dashboard optimisation…"
            className="w-full"
            maxLength={4000}
          />
        </div>

        <Shell className="border border-border bg-card shadow-none">
          <Section
            title="Latest response"
            icon={<Sparkles className="h-4 w-4" />}
            meta={latestAssistantSummary ? formatTimestamp(latestAssistantSummary.timestamp) : 'Awaiting response'}
            tone="accent"
            actions={
              <button
                type="button"
                onClick={onReset}
                className="text-xs font-medium text-on-surface-variant transition hover:text-primary"
              >
                Reset
              </button>
            }
          >
            <div className="space-y-3 text-sm text-on-surface-variant">
              {latestAssistantSummary ? (
                <p className="leading-relaxed text-on-surface">{latestAssistantSummary.content}</p>
              ) : (
                <p className="text-on-surface-variant/70">Send a prompt to see assistant insights here.</p>
              )}
              {promptError && (
                <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                  <span>{promptError}</span>
                </div>
              )}
            </div>
          </Section>

          <Divider />

          <Section
            title="Recent conversation"
            icon={<MessageCircle className="h-4 w-4" />}
            meta={recentMessages.length ? `${recentMessages.length} entries` : undefined}
          >
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {recentMessages.length === 0 ? (
                <p className="text-xs text-on-surface-variant/70">No conversation history yet.</p>
              ) : (
                recentMessages.map((entry, index) => (
                  <Item
                    key={`${entry.timestamp}-${index}`}
                    type="button"
                    title={entry.role === 'user' ? 'You' : 'DeepSeek'}
                    titleFormat={entry.role === 'assistant' ? 'code' : 'plain'}
                    description={<span className="line-clamp-2 text-xs text-on-surface-variant/80">{entry.content}</span>}
                    meta={formatTimestamp(entry.timestamp)}
                    indicator={entry.role === 'assistant' ? 'gitMerge' : 'none'}
                    active={index === 0}
                  />
                ))
              )}
            </div>
          </Section>

          {lastUserMessage && (
            <Section
              title="Last prompt"
              icon={<RefreshCw className="h-4 w-4" />}
              meta={formatTimestamp(lastUserMessage.timestamp)}
              tone="subdued"
              defaultOpen={false}
            >
              <p className="leading-relaxed text-xs text-on-surface-variant/80">{lastUserMessage.content}</p>
            </Section>
          )}
        </Shell>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-on-surface">Workflows & schemas surfaced</h3>
            <p className="text-sm text-on-surface-variant">
              DeepSeek references these configurations when planning workflows. Update schemas to influence outcomes.
            </p>
          </div>
          {onRefreshWorkflows && (
            <button
              type="button"
              onClick={onRefreshWorkflows}
              className="inline-flex items-center gap-2 rounded-full border border-outline/30 px-3 py-1 text-xs font-medium text-on-surface-variant transition hover:border-primary/40 hover:text-primary"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          )}
        </div>

        {workflowsLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading workflow summaries…
          </div>
        ) : workflowItems && workflowItems.length > 0 ? (
          <div className="mt-4 space-y-3">
            {workflowItems.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-outline/20 bg-surface p-4 transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-on-surface">{item.name}</h4>
                      {item.status && (
                        <Tag className="rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {item.status}
                        </Tag>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-on-surface-variant/90">{item.description}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs text-on-surface-variant/70">
                    {item.lastRun && <span>Last run: {item.lastRun}</span>}
                    {typeof item.configCount === 'number' && (
                      <span>{item.configCount} schema configs</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant/70">
                  {item.schema ? (
                    <span className="rounded-full bg-surface-container-low px-3 py-1 font-medium text-primary">
                      Schema: {item.schema}
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-container-low px-3 py-1">Schema pending configuration</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-outline/20 bg-surface-container-low p-6 text-sm text-on-surface-variant">
            No workflows have been linked to this prompt yet. Launch a run or import schema configs to populate this list.
          </div>
        )}
      </div>
    </div>
  );
};

export type { PromptConversationEntry, PromptWorkflowListItem };
export default PromptConversationPanel;

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    return iso;
  }
}
