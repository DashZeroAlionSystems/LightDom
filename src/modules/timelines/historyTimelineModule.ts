import { HistoryTimelineEvent, TimelineAttachment, TrainingSignal } from './types';

const defaultAttachments: TimelineAttachment[] = [
  {
    id: 'a1',
    name: 'competitor-brief.pdf',
    type: 'document',
    description: 'Reference brief used during the chat',
  },
  {
    id: 'a2',
    name: 'product-shot.png',
    type: 'image',
    description: 'User supplied screenshot for context',
  },
];

const defaultHistoryTimeline: HistoryTimelineEvent[] = [
  {
    id: 'h1',
    timestamp: '2025-12-22T18:10:00Z',
    actor: 'Emma',
    thread: 'Personalized onboarding chat',
    context: 'User asked for onboarding script with tone and brand attachments',
    tags: ['chat', 'attachments', 'training'],
    responseCard: {
      id: 'hc1',
      prompt: 'Can you draft a welcome message using my latest branding kit?',
      response:
        'Absolutely! Here is a friendly welcome that highlights the new tone and design language you provided. It mentions the product value, CTA, and links to the attachment set.',
      attachments: defaultAttachments,
      training: {
        positive: 18,
        negative: 2,
        lastSignal: 'positive',
        notes: ['Tone on-brand', 'Add shorter CTA variant'],
      },
      qualityScore: 92,
      channel: 'chat',
    },
  },
  {
    id: 'h2',
    timestamp: '2025-12-22T16:05:00Z',
    actor: 'Emma',
    thread: 'Support escalation chat',
    context: 'Conversation included log snippets and error screenshots',
    tags: ['chat', 'attachments', 'support'],
    responseCard: {
      id: 'hc2',
      prompt: 'Why is the staging deployment failing after the last push?',
      response:
        'The deployment fails because the env var for analytics is missing. I drafted a fix and added a rollback playbook to the attachments.',
      attachments: [
        {
          id: 'a3',
          name: 'staging-logs.txt',
          type: 'document',
          description: 'Captured error logs from CI pipeline',
        },
      ],
      training: {
        positive: 11,
        negative: 4,
        lastSignal: 'negative',
        notes: ['Ask for more context before suggesting rollback'],
      },
      qualityScore: 78,
      channel: 'chat',
    },
  },
];

export function createHistoryTimeline(): HistoryTimelineEvent[] {
  return defaultHistoryTimeline;
}

export function trainHistoryTimeline(
  events: HistoryTimelineEvent[],
  responseId: string,
  signal: TrainingSignal,
  note?: string,
): HistoryTimelineEvent[] {
  return events.map(event => {
    if (event.responseCard.id !== responseId) return event;

    const { training } = event.responseCard;
    const updatedNotes = note ? [...(training.notes || []), note] : training.notes || [];

    return {
      ...event,
      responseCard: {
        ...event.responseCard,
        training: {
          ...training,
          positive: signal === 'positive' ? training.positive + 1 : training.positive,
          negative: signal === 'negative' ? training.negative + 1 : training.negative,
          lastSignal: signal,
          notes: updatedNotes,
        },
      },
    };
  });
}
