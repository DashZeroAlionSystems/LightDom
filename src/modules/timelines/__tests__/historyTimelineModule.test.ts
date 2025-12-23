import { describe, expect, it } from 'vitest';
import { createHistoryTimeline, trainHistoryTimeline } from '../historyTimelineModule';

describe('historyTimelineModule', () => {
  it('increments positive feedback and stores note', () => {
    const timeline = createHistoryTimeline();
    const responseId = timeline[0].responseCard.id;
    const updated = trainHistoryTimeline(timeline, responseId, 'positive', 'keeps attachments aligned');

    const updatedCard = updated.find(event => event.responseCard.id === responseId)?.responseCard;
    expect(updatedCard?.training.positive).toBe(timeline[0].responseCard.training.positive + 1);
    expect(updatedCard?.training.notes?.includes('keeps attachments aligned')).toBe(true);
  });

  it('does not mutate unrelated responses', () => {
    const timeline = createHistoryTimeline();
    const untouchedId = timeline[0].responseCard.id;
    const updated = trainHistoryTimeline(timeline, 'not-found', 'negative');

    const updatedCard = updated.find(event => event.responseCard.id === untouchedId)?.responseCard;
    expect(updatedCard?.training.negative).toBe(timeline[0].responseCard.training.negative);
  });
});
