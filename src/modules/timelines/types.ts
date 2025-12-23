export type TrainingSignal = 'positive' | 'negative';

export interface TimelineAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'link';
  url?: string;
  description?: string;
}

export interface TimelineResponseCard {
  id: string;
  prompt: string;
  response: string;
  attachments?: TimelineAttachment[];
  training: {
    positive: number;
    negative: number;
    lastSignal?: TrainingSignal;
    notes?: string[];
  };
  qualityScore?: number;
  channel?: 'chat' | 'social' | 'automation';
}

export interface HistoryTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  thread: string;
  context: string;
  tags: string[];
  responseCard: TimelineResponseCard;
}

export interface SocialTimelineEvent {
  id: string;
  timestamp: string;
  contentId: string;
  community: string;
  summary: string;
  replies: Array<{
    id: string;
    author: string;
    message: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }>;
  responseCard: TimelineResponseCard;
}
