import { searchGitHubStorybooks } from '../services/crawler/src/discovery/github.js';

async function main() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const count = await searchGitHubStorybooks({ token });
    console.log(`Enqueued ${count} GitHub Storybook candidates.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to enqueue GitHub jobs:', error);
    process.exit(1);
  }
}

main();
