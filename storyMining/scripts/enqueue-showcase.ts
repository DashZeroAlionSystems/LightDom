import { enqueueShowcaseJobs } from '../services/crawler/src/discovery/showcase.js';

async function main() {
  try {
    const count = await enqueueShowcaseJobs();
    console.log(`Enqueued ${count} showcase Storybook targets.`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to enqueue showcase jobs:', error);
    process.exit(1);
  }
}

main();
