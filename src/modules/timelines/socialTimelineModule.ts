import { SocialTimelineEvent, TrainingSignal } from './types';

const defaultSocialTimeline: SocialTimelineEvent[] = [
  {
    id: 's1',
    timestamp: '2025-12-22T15:45:00Z',
    contentId: 'blog-ux-audit',
    community: 'Design Hub',
    summary: 'Emma posted an audit summary and received peer comments.',
    replies: [
      { id: 's1r1', author: 'Riley', message: 'Love the actionable checklist!', sentiment: 'positive' },
      { id: 's1r2', author: 'Sam', message: 'Add a mobile section?', sentiment: 'neutral' },
    ],
    responseCard: {
      id: 'sc1',
      prompt: 'Share a short UX audit recap for social in under 120 words.',
      response:
        'Drafted a concise UX audit recap with top 3 wins, 2 blockers, and a CTA to download the full report.',
      training: {
        positive: 22,
        negative: 3,
        lastSignal: 'positive',
        notes: ['Great brevity', 'Thread asks for mobile follow-up'],
      },
      qualityScore: 88,
      channel: 'social',
    },
  },
  {
    id: 's2',
    timestamp: '2025-12-22T12:30:00Z',
    contentId: 'video-reel-cta',
    community: 'Growth Collective',
    summary: 'Community feedback requested clearer CTA in the reel copy.',
    replies: [
      { id: 's2r1', author: 'Jordan', message: 'Can we A/B test the hook?', sentiment: 'positive' },
      { id: 's2r2', author: 'Taylor', message: 'CTA feels generic', sentiment: 'negative' },
    ],
    responseCard: {
      id: 'sc2',
      prompt: 'Rewrite the reel caption to highlight the live workshop and tag speakers.',
      response:
        'Caption updated with a live-workshop CTA, speaker tags, and a timeboxed incentive for signups.',
      training: {
        positive: 9,
        negative: 5,
        lastSignal: 'negative',
        notes: ['Needs clearer incentive wording'],
      },
      qualityScore: 74,
      channel: 'social',
    },
  },
];

export function createSocialTimeline(): SocialTimelineEvent[] {
  return defaultSocialTimeline;
}

export function trainSocialTimeline(
  events: SocialTimelineEvent[],
  responseId: string,
  signal: TrainingSignal,
  note?: string,
): SocialTimelineEvent[] {
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
