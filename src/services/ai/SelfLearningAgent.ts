import fs from 'fs';
import path from 'path';

/**
 * Extremely small self-learning agent scaffold: it collects execution
 * telemetry and applies a simple heuristic to suggest automations.
 *
 * This is a safe, local-only scaffold intended to be a starting point for
 * richer learning agents. It deliberately avoids external network calls.
 */

export type ExecutionRecord = {
  workflowId: string;
  timestamp: string;
  durationMs?: number;
  success: boolean;
  meta?: any;
};

export class SelfLearningAgent {
  private records: ExecutionRecord[] = [];
  private storageFile: string;
  private static instance: SelfLearningAgent | null = null;

  private constructor(storageFile?: string) {
    this.storageFile = storageFile || path.resolve(process.cwd(), '.workflow-executions.json');
    this.load();
  }

  public static getInstance(): SelfLearningAgent {
    if (!SelfLearningAgent.instance) SelfLearningAgent.instance = new SelfLearningAgent();
    return SelfLearningAgent.instance;
  }

  private load() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf8');
        this.records = JSON.parse(raw || '[]');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('SelfLearningAgent: failed to load', err?.toString());
    }
  }

  private persist() {
    try {
      fs.writeFileSync(this.storageFile, JSON.stringify(this.records, null, 2), 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('SelfLearningAgent: failed to persist', err?.toString());
    }
  }

  public observe(record: ExecutionRecord) {
    this.records.push(record);
    // Keep dataset bounded to last 5k records in this simple scaffold
    if (this.records.length > 5000) this.records.splice(0, this.records.length - 5000);
    this.persist();
  }

  /**
   * Very simple heuristic: if the same workflow has run successfully >= N times
   * in recent window, suggest promoting it as a scheduled automation.
   */
  public suggestAutomations(opts?: { minRuns?: number; windowHours?: number }) {
    const minRuns = opts?.minRuns ?? 3;
    const windowHours = opts?.windowHours ?? 24;

    const cutoff = Date.now() - windowHours * 60 * 60 * 1000;
    const recent = this.records.filter((r) => new Date(r.timestamp).getTime() >= cutoff && r.success);

    const counts = recent.reduce<Record<string, number>>((acc, r) => {
      acc[r.workflowId] = (acc[r.workflowId] || 0) + 1;
      return acc;
    }, {});

    const suggestions = Object.entries(counts)
      .filter(([, count]) => count >= minRuns)
      .map(([workflowId, count]) => ({ workflowId, reason: `ran ${count} times in last ${windowHours}h`, score: count }));

    return suggestions;
  }
}

export const selfLearningAgent = SelfLearningAgent.getInstance();
