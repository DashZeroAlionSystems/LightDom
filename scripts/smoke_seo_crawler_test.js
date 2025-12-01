import SEOCrawlerIntegration from '../crawler/SEOCrawlerIntegration.js';

// Create an instance; DB may not be available in dev, testConnection runs but will fail gracefully
const crawler = new SEOCrawlerIntegration({ dbHost: '127.0.0.1', dbPort: 5433 });

setTimeout(() => {
  const url = 'https://example.com/product/widget';
  const analysis = {
    performance: { lcp: 1800, fid: 50, cls: 0.02, ttfb: 120, fcp: 600 },
    domStats: { totalElements: 1200, unusedElements: 400, h1Count: 1 },
    pageTitle: 'Example Product Widget',
    metaDescription: 'Buy the best widget ever',
    optimizations: [],
    spaceSaved: 345,
  };
  const schemas = [{ type: 'Product' }];
  const backlinks = [{ href: 'https://example.com/about' }, { href: 'https://other.com/page' }];

  const features = crawler.extractFeatures(url, analysis, schemas, backlinks);
  console.log('Features count:', Object.keys(features).length);
  console.log('Feature sample:');
  Object.keys(features)
    .slice(0, 40)
    .forEach(k => {
      console.log(k, ':', features[k]);
    });

  // Close pool to exit cleanly
  if (crawler && crawler.close) {
    crawler
      .close()
      .then(() => process.exit(0))
      .catch(() => process.exit(0));
  } else {
    process.exit(0);
  }
}, 1200);
