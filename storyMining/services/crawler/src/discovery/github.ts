import fetch from 'node-fetch';
import { enqueueDiscovery } from '../../../orchestrator/src/index.js';

interface GitHubRepo {
  name: string;
  html_url: string;
}

interface GitHubSearchResponse {
  items: GitHubRepo[];
}

export interface GitHubDiscoveryOptions {
  token?: string;
  query?: string;
  perPage?: number;
}

const DEFAULT_QUERY = '"storybook-static" in:path path:.storybook language:JavaScript';
const SEARCH_ENDPOINT = 'https://api.github.com/search/repositories';

function buildHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'LightDom-StoryMiner',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function searchGitHubStorybooks(options: GitHubDiscoveryOptions = {}): Promise<number> {
  const { token, query = DEFAULT_QUERY, perPage = 10 } = options;
  const url = new URL(SEARCH_ENDPOINT);
  url.searchParams.set('q', query);
  url.searchParams.set('per_page', perPage.toString());

  const response = await fetch(url, { headers: buildHeaders(token) });
  if (!response.ok) {
    throw new Error(`GitHub search failed (${response.status})`);
  }
  const data = (await response.json()) as GitHubSearchResponse;

  let count = 0;
  for (const repo of data.items ?? []) {
    await enqueueDiscovery({
      source: 'github',
      payload: {
        url: `${repo.html_url}/storybook-static`,
        repo: repo.name,
      },
    });
    count += 1;
  }
  return count;
}
