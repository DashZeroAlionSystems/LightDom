import { describe, expect, it } from 'vitest';
import { createSocialTimeline, trainSocialTimeline } from '../socialTimelineModule';

describe('socialTimelineModule', () => {
  it('increments negative feedback and keeps notes intact', () => {
    const timeline = createSocialTimeline();
    const responseId = timeline[1].responseCard.id;
    const updated = trainSocialTimeline(timeline, responseId, 'negative', 'needs clearer CTA');

    const updatedCard = updated.find(event => event.responseCard.id === responseId)?.responseCard;
    expect(updatedCard?.training.negative).toBe(timeline[1].responseCard.training.negative + 1);
    expect(updatedCard?.training.notes?.includes('needs clearer CTA')).toBe(true);
  });

  it('keeps existing replies intact after training', () => {
    const timeline = createSocialTimeline();
    const updated = trainSocialTimeline(timeline, timeline[0].responseCard.id, 'positive');
    expect(updated[0].replies.length).toBe(timeline[0].replies.length);
  });
});
