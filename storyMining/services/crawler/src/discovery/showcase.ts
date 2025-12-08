import fetch from 'node-fetch';
import { enqueueDiscovery } from '../../../orchestrator/src/index.js';

const SHOWCASE_URL = 'https://storybook.js.org/showcase/index.json';

interface ShowcaseEntry {
  name: string;
  websiteUrl?: string;
  storybookUrl?: string;
}

export async function fetchShowcaseEntries(): Promise<ShowcaseEntry[]> {
  const response = await fetch(SHOWCASE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch showcase data (${response.status})`);
  }
  const data = (await response.json()) as { projects: ShowcaseEntry[] };
  return data.projects ?? [];
}

export async function enqueueShowcaseJobs(): Promise<number> {
  const entries = await fetchShowcaseEntries();
  let count = 0;
  for (const entry of entries) {
    if (!entry.storybookUrl) {
      continue;
    }
    await enqueueDiscovery({
      source: 'showcase',
      payload: {
        url: entry.storybookUrl,
        name: entry.name,
      },
    });
    count += 1;
  }
  return count;
}
