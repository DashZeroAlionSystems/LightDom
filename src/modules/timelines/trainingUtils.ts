import { TrainingSignal } from './types';

interface TrainingState {
  positive: number;
  negative: number;
  lastSignal?: TrainingSignal;
  notes?: string[];
}

export function applyTraining(
  training: TrainingState,
  signal: TrainingSignal,
  note?: string,
): TrainingState {
  const updatedNotes = note ? [...(training.notes ?? []), note] : training.notes ?? [];
  return {
    ...training,
    positive: signal === 'positive' ? training.positive + 1 : training.positive,
    negative: signal === 'negative' ? training.negative + 1 : training.negative,
    lastSignal: signal,
    notes: updatedNotes,
  };
}
