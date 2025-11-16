#!/usr/bin/env node
/**
 * Quick Demo: TensorFlow SEO System
 * 
 * This script provides a quick demonstration of the TensorFlow SEO system
 * without requiring external dependencies or database connections.
 */

import { TensorFlowEnhancedCrawler } from './src/ml/tensorflow-crawler-integration.js';
import { SEOModelRegistry } from './src/ml/seo-tensorflow-models.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  TensorFlow SEO Data Mining - Quick Demo                   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function runDemo() {
  try {
    // Demo 1: List Available Models
    console.log('📚 Step 1: Available TensorFlow Models');
    console.log('─'.repeat(60));
    
    const registry = new SEOModelRegistry();
    const models = registry.listModels();
    
    console.log(`Found ${models.length} specialized SEO models:\n`);
    models.forEach((model, idx) => {
      console.log(`${idx + 1}. ${model.name}`);
      console.log(`   Use Case: ${model.useCase}`);
      console.log(`   Version: ${model.version}\n`);
    });

    // Demo 2: Initialize ML-Enhanced Crawler
    console.log('\n🚀 Step 2: Initialize ML-Enhanced Crawler');
    console.log('─'.repeat(60));
    
    const crawler = new TensorFlowEnhancedCrawler({
      enableML: true,
      autoLearn: false, // Disabled for demo
      modelPath: './demo-models'
    });
    
    console.log('Initializing TensorFlow crawler...');
    await crawler.initialize();
    console.log('✅ Crawler initialized with ML capabilities\n');

    // Demo 3: Analyze Sample Pages
    console.log('\n🔍 Step 3: Analyze Sample Web Pages');
    console.log('─'.repeat(60));

    const samplePages = [
      {
        name: 'High-Quality Blog Post',
        url: 'https://example.com/comprehensive-seo-guide',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>The Complete SEO Guide 2024 - Best Practices and Strategies</title>
            <meta name="description" content="Comprehensive guide covering technical SEO, on-page optimization, content strategy, and link building. Learn proven techniques to improve your search rankings.">
            <link rel="canonical" href="https://example.com/comprehensive-seo-guide">
            <meta property="og:title" content="The Complete SEO Guide 2024">
            <meta property="og:description" content="Master SEO with our comprehensive guide">
            <meta property="og:image" content="https://example.com/seo-guide.jpg">
            <meta name="twitter:card" content="summary_large_image">
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Article",
              "headline": "The Complete SEO Guide 2024",
              "author": {
                "@type": "Person",
                "name": "John Doe"
              }
            }
            </script>
          </head>
          <body>
            <header>
              <nav>
                <a href="/blog">Blog</a>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
              </nav>
            </header>
            <main>
              <article>
                <h1>The Complete SEO Guide 2024</h1>
                <h2>Understanding Technical SEO</h2>
                <p>${'Technical SEO involves optimizing your website for search engine crawlers. This includes site speed, mobile-friendliness, and proper indexing. '.repeat(5)}</p>
                <img src="/images/technical-seo.jpg" alt="Technical SEO diagram showing site architecture">
                
                <h2>On-Page Optimization</h2>
                <p>${'On-page SEO focuses on optimizing individual pages through content quality, meta tags, and internal linking. '.repeat(5)}</p>
                <img src="/images/onpage-seo.jpg" alt="On-page SEO checklist infographic">
                
                <h2>Content Strategy</h2>
                <p>${'Creating high-quality, relevant content is crucial for SEO success. Focus on user intent and comprehensive coverage. '.repeat(5)}</p>
                
                <h3>Keyword Research</h3>
                <p>${'Proper keyword research helps you understand what your audience is searching for. '.repeat(3)}</p>
                
                <h3>Content Creation</h3>
                <p>${'Create in-depth content that answers user questions and provides real value. '.repeat(3)}</p>
                
                <h2>Link Building</h2>
                <p>${'Quality backlinks remain a crucial ranking factor. Focus on earning links through great content. '.repeat(5)}</p>
                
                <ul>
                  <li>Create linkable assets</li>
                  <li>Guest posting on relevant sites</li>
                  <li>Build relationships with industry influencers</li>
                  <li>Monitor your backlink profile</li>
                </ul>
              </article>
            </main>
            <footer>
              <p>© 2024 Example.com. All rights reserved.</p>
              <a href="https://twitter.com/example">Twitter</a>
              <a href="https://linkedin.com/company/example">LinkedIn</a>
            </footer>
          </body>
          </html>
        `
      },
      {
        name: 'Low-Quality Page',
        url: 'https://example.com/poor-page',
        html: `
          <html>
          <head>
            <title>Page</title>
          </head>
          <body>
            <h1>Welcome</h1>
            <p>This is a page with minimal content and no SEO optimization.</p>
            <img src="image.jpg">
          </body>
          </html>
        `
      },
      {
        name: 'E-commerce Product Page',
        url: 'https://example.com/products/wireless-headphones',
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Premium Wireless Headphones | Noise Cancelling | Free Shipping</title>
            <meta name="description" content="Experience superior sound quality with our premium wireless headphones. Active noise cancelling, 30-hour battery, comfortable design. Order now with free shipping.">
            <link rel="canonical" href="https://example.com/products/wireless-headphones">
            <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Premium Wireless Headphones",
              "description": "High-quality wireless headphones with noise cancelling",
              "image": "https://example.com/headphones.jpg",
              "offers": {
                "@type": "Offer",
                "price": "199.99",
                "priceCurrency": "USD"
              }
            }
            </script>
          </head>
          <body>
            <h1>Premium Wireless Headphones</h1>
            <h2>Product Features</h2>
            <p>${'Superior audio quality with advanced noise cancellation technology. '.repeat(3)}</p>
            <img src="/headphones-main.jpg" alt="Premium wireless headphones with active noise cancelling">
            <h2>Specifications</h2>
            <ul>
              <li>Battery Life: 30 hours</li>
              <li>Weight: 250g</li>
              <li>Bluetooth 5.0</li>
              <li>Active Noise Cancelling</li>
            </ul>
            <h2>Customer Reviews</h2>
            <p>${'Rated 4.8/5 stars by verified customers. '.repeat(2)}</p>
          </body>
          </html>
        `
      }
    ];

    for (const page of samplePages) {
      console.log(`\n📄 Analyzing: ${page.name}`);
      console.log(`   URL: ${page.url}`);
      
      const attributes = await crawler.crawlPage(page.url, page.html);
      
      console.log('\n   📊 SEO Metrics:');
      console.log(`   ├─ SEO Score: ${attributes.seoScore}/100`);
      console.log(`   ├─ Content Quality: ${attributes.contentQualityScore}/100`);
      console.log(`   ├─ Technical Score: ${attributes.technicalScore}/100`);
      console.log(`   ├─ Word Count: ${attributes.wordCount}`);
      console.log(`   ├─ Images: ${attributes.totalImages} (${attributes.imagesWithAlt} with alt text)`);
      console.log(`   ├─ Internal Links: ${attributes.internalLinksCount}`);
      console.log(`   ├─ Structured Data: ${attributes.structuredDataCount} schema(s)`);
      console.log(`   └─ HTTPS: ${attributes.isSecure ? '✓' : '✗'}`);
      
      if (attributes.mlRecommendations && attributes.mlRecommendations.length > 0) {
        console.log('\n   🎯 Top 3 ML Recommendations:');
        attributes.mlRecommendations.slice(0, 3).forEach((rec, idx) => {
          console.log(`   ${idx + 1}. ${rec.title}`);
          console.log(`      Category: ${rec.category} | Priority: ${rec.priority}/100`);
          console.log(`      Impact: ${rec.estimatedImpact} | Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
        });
      }
      
      console.log('   ' + '─'.repeat(58));
    }

    // Demo 4: Show Statistics
    console.log('\n\n📈 Step 4: Crawler Statistics');
    console.log('─'.repeat(60));
    
    const stats = crawler.getStats();
    console.log(`Total Pages Analyzed: ${stats.totalPages}`);
    console.log(`ML Processing Enabled: ${stats.mlEnabled ? '✓' : '✗'}`);
    console.log(`Average ML Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
    console.log(`Recommendations Generated: ${stats.recommendationsGenerated}`);
    
    if (stats.networkStatus) {
      console.log('\n🧠 Neural Network Status:');
      console.log(`├─ Model Version: ${stats.networkStatus.modelVersion}`);
      console.log(`├─ Initialized: ${stats.networkStatus.initialized ? '✓' : '✗'}`);
      console.log(`├─ Training Samples: ${stats.networkStatus.totalTrainingSamples}`);
      console.log('└─ Performance Metrics:');
      const metrics = stats.networkStatus.performanceMetrics;
      if (metrics) {
        console.log(`   ├─ Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
        console.log(`   ├─ Precision: ${(metrics.precision * 100).toFixed(1)}%`);
        console.log(`   └─ F1 Score: ${(metrics.f1Score * 100).toFixed(1)}%`);
      }
    }

    // Cleanup
    await crawler.dispose();
    registry.disposeAll();

    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  Demo Complete! 🎉                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('\n📚 Next Steps:');
    console.log('  1. Check TENSORFLOW_SEO_INTEGRATION_GUIDE.md for full docs');
    console.log('  2. Run: node examples/tensorflow-seo-examples.js');
    console.log('  3. Explore src/ml/ directory for implementation details');
    console.log('  4. Integrate with your crawler: npm run seo:test');
    console.log('\n💡 Key Features Demonstrated:');
    console.log('  ✓ 11 specialized TensorFlow models');
    console.log('  ✓ 192 SEO attributes extraction');
    console.log('  ✓ ML-powered recommendations');
    console.log('  ✓ Real-time confidence scoring');
    console.log('  ✓ Automated prioritization\n');

  } catch (error) {
    console.error('\n❌ Demo Error:', error.message);
    console.error('\nStack Trace:', error.stack);
    process.exit(1);
  }
}

// Run the demo
runDemo().catch(console.error);
