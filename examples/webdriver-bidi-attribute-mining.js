/**
 * WebDriver BiDi and Attribute Mining Example
 * Demonstrates the new capabilities for headless browser automation
 * and attribute-based data mining in LightDom
 */

// This example assumes you're running in an Electron renderer process
// with access to window.electronAPI

async function demonstrateWebDriverBiDi() {
  console.log('=== WebDriver BiDi and Attribute Mining Demo ===\n');

  // 1. Check worker pool status
  console.log('1. Checking worker pool status...');
  const status = await window.electronAPI.worker.getStatus();
  console.log(`   Total workers: ${status.total}`);
  console.log(`   Available: ${status.available}`);
  console.log(`   Busy: ${status.busy}\n`);

  // 2. Create attribute-specific workers
  console.log('2. Creating attribute-specific workers...');
  
  const priceWorker = await window.electronAPI.worker.createAttributeWorker('price', {
    useBiDi: true
  });
  console.log(`   Price worker created: ${priceWorker.workerId}`);

  const titleWorker = await window.electronAPI.worker.createAttributeWorker('title', {
    useBiDi: true
  });
  console.log(`   Title worker created: ${titleWorker.workerId}\n`);

  // 3. Mine product data from e-commerce site
  console.log('3. Mining product attributes...');
  
  const productUrl = 'https://example.com/product/12345';

  // Mine product price
  const priceResult = await window.electronAPI.puppeteer.mineAttribute({
    url: productUrl,
    attribute: {
      name: 'price',
      selectors: [
        '[data-testid="product-price"]',
        '[itemprop="price"]',
        '.price-box .final-price',
        '.product-price span',
        'span.price'
      ],
      type: 'text',
      waitFor: '.price-container',
      pattern: '\\$([0-9,.]+)',
      validator: {
        type: 'string',
        pattern: '^\\$?[0-9,.]+$',
        minLength: 2,
        maxLength: 20
      }
    }
  });

  if (priceResult.success) {
    console.log(`   ✓ Price extracted: ${priceResult.data}`);
  } else {
    console.log(`   ✗ Price extraction failed: ${priceResult.error}`);
  }

  // Mine product title
  const titleResult = await window.electronAPI.puppeteer.mineAttribute({
    url: productUrl,
    attribute: {
      name: 'title',
      selectors: [
        '[data-testid="product-title"]',
        'h1.product-name',
        '[itemprop="name"]',
        'h1',
        '.title'
      ],
      type: 'text',
      validator: {
        type: 'string',
        minLength: 5,
        maxLength: 200
      }
    }
  });

  if (titleResult.success) {
    console.log(`   ✓ Title extracted: ${titleResult.data}`);
  } else {
    console.log(`   ✗ Title extraction failed: ${titleResult.error}`);
  }

  // Mine product description
  const descResult = await window.electronAPI.puppeteer.mineAttribute({
    url: productUrl,
    attribute: {
      name: 'description',
      selectors: [
        '[data-testid="product-description"]',
        '[itemprop="description"]',
        '.product-description',
        '#description',
        '.description'
      ],
      type: 'html', // Get HTML to preserve formatting
      validator: {
        type: 'string',
        minLength: 10
      }
    }
  });

  if (descResult.success) {
    console.log(`   ✓ Description extracted (${descResult.data.length} chars)`);
  } else {
    console.log(`   ✗ Description extraction failed: ${descResult.error}`);
  }

  console.log('');

  // 4. Generate social media Open Graph image
  console.log('4. Generating social media preview image...');
  
  const ogImage = await window.electronAPI.puppeteer.generateOGImage({
    template: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 1200px;
              height: 630px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              color: white;
              display: flex;
              align-items: center;
              padding: 80px;
            }
            .content {
              max-width: 100%;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 40px;
              opacity: 0.9;
            }
            h1 {
              font-size: 72px;
              line-height: 1.2;
              margin-bottom: 30px;
              font-weight: 800;
            }
            p {
              font-size: 36px;
              opacity: 0.9;
              line-height: 1.4;
            }
            .price {
              font-size: 64px;
              font-weight: 700;
              margin-top: 40px;
              color: #ffd700;
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="logo">{{siteName}}</div>
            <h1>{{title}}</h1>
            <p>{{description}}</p>
            <div class="price">{{price}}</div>
          </div>
        </body>
      </html>
    `,
    data: {
      siteName: 'LightDom Store',
      title: titleResult.success ? titleResult.data : 'Amazing Product',
      description: 'Premium quality, best price',
      price: priceResult.success ? priceResult.data : '$99.99'
    },
    width: 1200,
    height: 630
  });

  if (ogImage.success) {
    console.log(`   ✓ OG image generated (${ogImage.image.length} bytes)`);
    console.log(`   Dimensions: ${ogImage.dimensions.width}x${ogImage.dimensions.height}`);
    // Image is base64 encoded and can be saved or sent to server
  } else {
    console.log(`   ✗ OG image generation failed: ${ogImage.error}`);
  }

  console.log('');

  // 5. Take a full-page screenshot
  console.log('5. Taking full-page screenshot...');
  
  const screenshot = await window.electronAPI.puppeteer.screenshot({
    url: productUrl,
    fullPage: true,
    timeout: 30000
  });

  if (screenshot.success) {
    console.log(`   ✓ Screenshot captured (${screenshot.screenshot.length} bytes)`);
  } else {
    console.log(`   ✗ Screenshot failed: ${screenshot.error}`);
  }

  console.log('');

  // 6. Check updated worker status
  console.log('6. Final worker pool status...');
  const finalStatus = await window.electronAPI.worker.getStatus();
  console.log(`   Total workers: ${finalStatus.total}`);
  console.log(`   Available: ${finalStatus.available}`);
  console.log(`   Busy: ${finalStatus.busy}`);
  
  console.log('\n   Worker details:');
  finalStatus.workers.forEach(worker => {
    const attr = worker.attribute ? ` (${worker.attribute})` : '';
    const status = worker.busy ? 'BUSY' : 'AVAILABLE';
    console.log(`   - Worker ${worker.id}${attr}: ${status}`);
  });

  console.log('\n=== Demo Complete ===');
}

// Example: Listen for real-time worker events
function setupWorkerEventListeners() {
  console.log('Setting up worker event listeners...\n');

  // Listen for general worker messages
  const unsubscribeWorker = window.electronAPI.on.workerMessage((data) => {
    console.log(`[Worker ${data.workerId}] Message:`, data);
  });

  // Listen for attribute worker messages (BiDi events, etc.)
  const unsubscribeAttr = window.electronAPI.on.attributeWorkerMessage((data) => {
    console.log(`[Attribute Worker: ${data.attribute}] Message:`, data);
    
    // Handle BiDi events
    if (data.type === 'biDiEvent') {
      console.log(`  BiDi Event: ${data.event}`);
      if (data.data) {
        console.log(`  Data:`, data.data);
      }
    }
  });

  // Clean up listeners when done
  return () => {
    unsubscribeWorker();
    unsubscribeAttr();
  };
}

// Example: Batch attribute mining
async function batchAttributeMining() {
  console.log('=== Batch Attribute Mining ===\n');

  const urls = [
    'https://example.com/product/1',
    'https://example.com/product/2',
    'https://example.com/product/3'
  ];

  const attributeConfig = {
    name: 'price',
    selectors: ['.price', '[itemprop="price"]'],
    type: 'text'
  };

  console.log(`Mining ${urls.length} URLs in parallel...\n`);

  // Mine all URLs in parallel
  const results = await Promise.all(
    urls.map(url =>
      window.electronAPI.puppeteer.mineAttribute({
        url,
        attribute: attributeConfig
      })
    )
  );

  // Process results
  results.forEach((result, index) => {
    console.log(`URL ${index + 1}: ${urls[index]}`);
    if (result.success) {
      console.log(`  ✓ Price: ${result.data}`);
    } else {
      console.log(`  ✗ Error: ${result.error}`);
    }
  });

  console.log('\n=== Batch Mining Complete ===');
}

// Example: Generate multiple OG images with different templates
async function generateMultipleOGImages() {
  console.log('=== Multiple OG Image Templates ===\n');

  const templates = {
    blog: `
      <!DOCTYPE html>
      <html>
        <head><style>
          body {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 80px;
            font-family: Arial, sans-serif;
          }
          h1 { font-size: 64px; margin-bottom: 30px; }
          p { font-size: 32px; opacity: 0.9; }
        </style></head>
        <body>
          <h1>{{title}}</h1>
          <p>{{author}} · {{date}}</p>
        </body>
      </html>
    `,
    product: `
      <!DOCTYPE html>
      <html>
        <head><style>
          body {
            background: #000;
            color: #fff;
            padding: 80px;
            font-family: Arial, sans-serif;
          }
          h1 { font-size: 72px; color: #ffd700; }
          .price { font-size: 96px; color: #00ff00; margin-top: 40px; }
        </style></head>
        <body>
          <h1>{{title}}</h1>
          <div class="price">{{price}}</div>
        </body>
      </html>
    `
  };

  // Generate blog image
  const blogImage = await window.electronAPI.puppeteer.generateOGImage({
    template: templates.blog,
    data: {
      title: 'Understanding WebDriver BiDi',
      author: 'LightDom Team',
      date: 'November 2025'
    }
  });

  console.log('Blog image:', blogImage.success ? '✓ Generated' : '✗ Failed');

  // Generate product image
  const productImage = await window.electronAPI.puppeteer.generateOGImage({
    template: templates.product,
    data: {
      title: 'Premium Widget',
      price: '$299.99'
    }
  });

  console.log('Product image:', productImage.success ? '✓ Generated' : '✗ Failed');

  console.log('\n=== Image Generation Complete ===');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    demonstrateWebDriverBiDi,
    setupWorkerEventListeners,
    batchAttributeMining,
    generateMultipleOGImages
  };
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && window.electronAPI) {
  console.log('WebDriver BiDi and Attribute Mining example loaded!');
  console.log('Run demonstrateWebDriverBiDi() to see it in action.');
}
