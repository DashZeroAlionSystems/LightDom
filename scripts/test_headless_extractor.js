import HeadlessExtractor from '../crawler/headlessExtractor.js';

(async function run() {
  const extractor = new HeadlessExtractor();
  try {
    const url = process.argv[2] || 'https://example.com';
    console.log('Running headless extractor for', url);
    const analysis = await extractor.extract(url, { timeout: 30000 });
    console.log('Analysis result sample:');
    console.log(JSON.stringify(analysis, null, 2).slice(0, 2000));
    console.log('\n--- keys ---', Object.keys(analysis));
  } catch (err) {
    console.error('Extractor failed:', err && err.message ? err.message : err);
  } finally {
    try {
      await extractor.close();
    } catch (e) {}
    process.exit(0);
  }
})();
