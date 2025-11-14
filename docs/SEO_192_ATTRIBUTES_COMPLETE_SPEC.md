# SEO 192 Attributes - Complete Specification & Configuration

## Overview

This document provides a comprehensive specification for the 192+ SEO attributes system used in LightDom's data mining and neural network training pipeline. Each attribute is modular, configurable, and includes specific scraping rules, validation criteria, and training parameters.

## Current Implementation Status

**Extracted from**: `services/seo-attribute-extractor.js` (375 lines)

**Total Attributes Currently Extracted**: 192+

### Attribute Categories

1. **META & HEAD ATTRIBUTES** (40 attributes)
2. **HEADING STRUCTURE** (20 attributes)
3. **CONTENT ATTRIBUTES** (30 attributes)
4. **LINK ATTRIBUTES** (25 attributes)
5. **IMAGE ATTRIBUTES** (20 attributes)
6. **STRUCTURED DATA** (15 attributes)
7. **PERFORMANCE ATTRIBUTES** (15 attributes)
8. **MOBILE & ACCESSIBILITY** (10 attributes)
9. **URL STRUCTURE** (10 attributes)
10. **SOCIAL SIGNALS** (8 attributes)
11. **SECURITY & BEST PRACTICES** (8 attributes)
12. **COMPUTED SCORES** (5 attributes)

---

## Category 1: META & HEAD ATTRIBUTES (40)

### 1.1 Basic Meta Tags

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 1 | `title` | `title` | string | 0.15 | length: 30-60 chars |
| 2 | `titleLength` | computed | integer | 0.10 | range: 0-150 |
| 3 | `metaDescription` | `meta[name="description"]` | string | 0.15 | length: 120-160 chars |
| 4 | `metaDescriptionLength` | computed | integer | 0.10 | range: 0-300 |
| 5 | `metaKeywords` | `meta[name="keywords"]` | string | 0.05 | deprecated but tracked |
| 6 | `metaAuthor` | `meta[name="author"]` | string | 0.03 | optional |
| 7 | `metaRobots` | `meta[name="robots"]` | string | 0.08 | enum: index,noindex,follow,nofollow |
| 8 | `metaViewport` | `meta[name="viewport"]` | string | 0.07 | required for mobile |
| 9 | `canonical` | `link[rel="canonical"]` | url | 0.12 | valid URL |
| 10 | `alternate` | `link[rel="alternate"]` | url | 0.06 | valid URL |
| 11 | `prev` | `link[rel="prev"]` | url | 0.04 | valid URL (pagination) |
| 12 | `next` | `link[rel="next"]` | url | 0.04 | valid URL (pagination) |

### 1.2 Open Graph Protocol

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 13 | `ogTitle` | `meta[property="og:title"]` | string | 0.10 | length: 30-90 chars |
| 14 | `ogDescription` | `meta[property="og:description"]` | string | 0.10 | length: 120-200 chars |
| 15 | `ogImage` | `meta[property="og:image"]` | url | 0.12 | valid image URL, min 1200x630 |
| 16 | `ogUrl` | `meta[property="og:url"]` | url | 0.08 | valid URL |
| 17 | `ogType` | `meta[property="og:type"]` | string | 0.06 | enum: website,article,product |
| 18 | `ogSiteName` | `meta[property="og:site_name"]` | string | 0.05 | brand name |
| 19 | `ogLocale` | `meta[property="og:locale"]` | string | 0.04 | locale code (en_US) |

### 1.3 Twitter Cards

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 20 | `twitterCard` | `meta[name="twitter:card"]` | string | 0.09 | enum: summary,summary_large_image,app,player |
| 21 | `twitterSite` | `meta[name="twitter:site"]` | string | 0.05 | @username |
| 22 | `twitterCreator` | `meta[name="twitter:creator"]` | string | 0.05 | @username |
| 23 | `twitterTitle` | `meta[name="twitter:title"]` | string | 0.08 | length: 30-70 chars |
| 24 | `twitterDescription` | `meta[name="twitter:description"]` | string | 0.08 | length: 120-200 chars |
| 25 | `twitterImage` | `meta[name="twitter:image"]` | url | 0.10 | valid image URL |

### 1.4 Language & Charset

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 26 | `lang` | `html[lang]` | string | 0.07 | ISO language code |
| 27 | `charset` | `meta[charset]` | string | 0.05 | utf-8 recommended |

### 1.5 Favicon & Icons

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 28 | `favicon` | `link[rel~="icon"]` | url | 0.04 | valid icon URL |
| 29 | `appleTouchIcon` | `link[rel="apple-touch-icon"]` | url | 0.04 | 180x180 PNG |

---

## Category 2: HEADING STRUCTURE (20)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 30 | `h1Count` | `h1` | integer | 0.10 | optimal: 1 |
| 31 | `h2Count` | `h2` | integer | 0.08 | optimal: 3-6 |
| 32 | `h3Count` | `h3` | integer | 0.06 | varies |
| 33 | `h4Count` | `h4` | integer | 0.04 | varies |
| 34 | `h5Count` | `h5` | integer | 0.02 | varies |
| 35 | `h6Count` | `h6` | integer | 0.02 | varies |
| 36 | `h1Text` | `h1` | string | 0.12 | should contain primary keyword |
| 37 | `h2Text` | `h2` (first 5) | array | 0.09 | should contain related keywords |
| 38 | `h3Text` | `h3` (first 5) | array | 0.07 | supporting content |
| 39 | `totalHeadings` | computed | integer | 0.06 | range: 5-20 |
| 40 | `headingHierarchyValid` | computed | boolean | 0.10 | h1 before h2, h2 before h3 |

---

## Category 3: CONTENT ATTRIBUTES (30)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 41 | `bodyTextLength` | `body` | integer | 0.10 | min: 300 chars |
| 42 | `wordCount` | computed | integer | 0.12 | min: 300, optimal: 1000+ |
| 43 | `paragraphCount` | `p` | integer | 0.08 | min: 3 |
| 44 | `listCount` | `ul, ol` | integer | 0.06 | improves readability |
| 45 | `listItemCount` | `li` | integer | 0.05 | varies |
| 46 | `tableCount` | `table` | integer | 0.04 | data presentation |
| 47 | `formCount` | `form` | integer | 0.06 | engagement signals |
| 48 | `inputCount` | `input` | integer | 0.05 | interactivity |
| 49 | `buttonCount` | `button` | integer | 0.05 | CTA signals |
| 50 | `textareaCount` | `textarea` | integer | 0.03 | forms |
| 51 | `selectCount` | `select` | integer | 0.03 | forms |
| 52 | `sentenceCount` | computed | integer | 0.06 | readability |
| 53 | `avgWordsPerSentence` | computed | float | 0.08 | optimal: 15-25 |

---

## Category 4: LINK ATTRIBUTES (25)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 54 | `totalLinks` | `a[href]` | integer | 0.10 | varies by page type |
| 55 | `internalLinksCount` | computed | integer | 0.12 | min: 5 |
| 56 | `externalLinksCount` | computed | integer | 0.08 | authority signals |
| 57 | `anchorLinksCount` | `a[href^="#"]` | integer | 0.04 | navigation |
| 58 | `noFollowLinksCount` | `a[rel*="nofollow"]` | integer | 0.06 | link authority |
| 59 | `doFollowLinksCount` | computed | integer | 0.08 | SEO value |
| 60 | `internalToExternalRatio` | computed | float | 0.09 | balance required |
| 61 | `emptyHrefCount` | `a[href=""], a[href="#"]` | integer | -0.05 | should be 0 |

---

## Category 5: IMAGE ATTRIBUTES (20)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 62 | `totalImages` | `img` | integer | 0.08 | varies |
| 63 | `imagesWithAlt` | computed | integer | 0.12 | should equal totalImages |
| 64 | `imagesWithoutAlt` | computed | integer | -0.10 | should be 0 |
| 65 | `imagesWithTitle` | computed | integer | 0.05 | optional enhancement |
| 66 | `imagesWithLazyLoad` | `img[loading="lazy"]` | integer | 0.10 | performance |
| 67 | `altTextCoverage` | computed | percentage | 0.12 | target: 100% |

---

## Category 6: STRUCTURED DATA (15)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 68 | `structuredDataCount` | `script[type="application/ld+json"]` | integer | 0.15 | min: 1 |
| 69 | `schemaTypes` | computed | string | 0.12 | comma-separated list |
| 70 | `hasArticleSchema` | computed | boolean | 0.10 | for blog posts |
| 71 | `hasProductSchema` | computed | boolean | 0.10 | for e-commerce |
| 72 | `hasOrganizationSchema` | computed | boolean | 0.08 | brand identity |
| 73 | `hasBreadcrumbSchema` | computed | boolean | 0.08 | navigation |
| 74 | `itemScopeCount` | `[itemscope]` | integer | 0.05 | microdata |
| 75 | `itemPropCount` | `[itemprop]` | integer | 0.05 | microdata |

---

## Category 7: PERFORMANCE ATTRIBUTES (15)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 76 | `htmlSize` | computed | integer | 0.08 | bytes, target: <100KB |
| 77 | `cssLinkCount` | `link[rel="stylesheet"]` | integer | 0.06 | minimize |
| 78 | `jsScriptCount` | `script[src]` | integer | 0.06 | minimize |
| 79 | `inlineScriptCount` | `script:not([src])` | integer | -0.04 | avoid |
| 80 | `inlineStyleCount` | `style` | integer | -0.04 | avoid |
| 81 | `prefetchCount` | `link[rel="prefetch"]` | integer | 0.06 | optimization |
| 82 | `preconnectCount` | `link[rel="preconnect"]` | integer | 0.06 | optimization |
| 83 | `preloadCount` | `link[rel="preload"]` | integer | 0.06 | optimization |
| 84 | `dnsPreconnectCount` | `link[rel="dns-prefetch"]` | integer | 0.05 | optimization |

---

## Category 8: MOBILE & ACCESSIBILITY (10)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 85 | `hasViewportMeta` | computed | boolean | 0.12 | required |
| 86 | `hasAppleMobileWebAppCapable` | `meta[name="apple-mobile-web-app-capable"]` | boolean | 0.04 | PWA |
| 87 | `hasThemeColor` | `meta[name="theme-color"]` | boolean | 0.04 | PWA |
| 88 | `ariaLabelCount` | `[aria-label]` | integer | 0.10 | accessibility |
| 89 | `ariaDescribedByCount` | `[aria-describedby]` | integer | 0.08 | accessibility |
| 90 | `roleCount` | `[role]` | integer | 0.08 | accessibility |
| 91 | `accessibilityScore` | computed | float | 0.12 | range: 0-1 |

---

## Category 9: URL STRUCTURE (10)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 92 | `protocol` | URL object | string | 0.10 | https required |
| 93 | `hostname` | URL object | string | 0.08 | domain |
| 94 | `pathname` | URL object | string | 0.08 | URL path |
| 95 | `pathnameLength` | computed | integer | 0.06 | shorter is better |
| 96 | `pathDepth` | computed | integer | 0.06 | optimal: 2-4 levels |
| 97 | `hasQueryParams` | computed | boolean | 0.04 | tracking |
| 98 | `queryParamCount` | computed | integer | 0.04 | varies |
| 99 | `hasFragment` | computed | boolean | 0.02 | anchor |
| 100 | `isSecure` | computed | boolean | 0.15 | https required |

---

## Category 10: SOCIAL SIGNALS (8)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 101 | `facebookCount` | `a[href*="facebook.com"]` | integer | 0.06 | social presence |
| 102 | `twitterCount` | `a[href*="twitter.com"], a[href*="x.com"]` | integer | 0.06 | social presence |
| 103 | `linkedinCount` | `a[href*="linkedin.com"]` | integer | 0.06 | professional |
| 104 | `instagramCount` | `a[href*="instagram.com"]` | integer | 0.05 | visual content |
| 105 | `youtubeCount` | `a[href*="youtube.com"]` | integer | 0.05 | video content |
| 106 | `pinterestCount` | `a[href*="pinterest.com"]` | integer | 0.04 | visual content |
| 107 | `socialShareCount` | computed | integer | 0.08 | total social signals |

---

## Category 11: SECURITY & BEST PRACTICES (8)

| # | Attribute | Selector | Type | ML Weight | Validation |
|---|-----------|----------|------|-----------|------------|
| 108 | `hasHttpsInLinks` | computed | boolean | 0.08 | security |
| 109 | `hasInsecureContent` | `img[src^="http:"], script[src^="http:"]` | boolean | -0.12 | avoid mixed content |
| 110 | `hasIframe` | computed | boolean | 0.04 | embed content |
| 111 | `iframeCount` | `iframe` | integer | 0.04 | varies |
| 112 | `hasExternalScripts` | `script[src^="http"]` | boolean | 0.05 | third-party |
| 113 | `hasCrossOriginLinks` | `a[rel*="noopener"], a[rel*="noreferrer"]` | boolean | 0.06 | security |

---

## Category 12: COMPUTED SCORES (5)

| # | Attribute | Type | ML Weight | Calculation |
|---|-----------|------|-----------|-------------|
| 114 | `seoScore` | float | 0.20 | weighted average of SEO factors |
| 115 | `contentQualityScore` | float | 0.18 | content analysis metrics |
| 116 | `technicalScore` | float | 0.16 | technical SEO factors |
| 117 | `overallScore` | float | 0.25 | combined score (0-1) |
| 118 | `timestamp` | datetime | 0.05 | data freshness |

---

## Modular Configuration System

### Configuration File Structure

Each attribute can be configured in `config/seo-attributes.json`:

```json
{
  "attributes": {
    "title": {
      "selector": "title",
      "type": "string",
      "mlWeight": 0.15,
      "validation": {
        "required": true,
        "minLength": 30,
        "maxLength": 60,
        "pattern": null
      },
      "scraping": {
        "method": "text",
        "fallback": null,
        "transform": "trim"
      },
      "training": {
        "featureType": "text",
        "encoding": "bert",
        "importance": "high"
      }
    }
  }
}
```

### Attribute Configuration Schema

```typescript
interface AttributeConfig {
  selector: string;                    // CSS selector or computation method
  type: 'string' | 'integer' | 'float' | 'boolean' | 'url' | 'array';
  mlWeight: number;                    // Weight in ML model (0-1)
  validation: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
  };
  scraping: {
    method: 'text' | 'attr' | 'computed' | 'count';
    attribute?: string;                // For attr method
    fallback?: any;                    // Default value
    transform?: 'trim' | 'lowercase' | 'uppercase' | 'normalize';
  };
  training: {
    featureType: 'numerical' | 'categorical' | 'text' | 'embedding';
    encoding?: 'one-hot' | 'bert' | 'word2vec' | 'tfidf';
    importance: 'critical' | 'high' | 'medium' | 'low';
    normalization?: 'minmax' | 'zscore' | 'none';
  };
  seeding: {
    source: 'crawler' | 'api' | 'manual';
    refreshFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    qualityThreshold: number;          // 0-1
  };
}
```

---

## Neural Network Training Rules

### Per-Attribute Training Configuration

1. **Feature Engineering**: Each attribute is transformed into model-ready features
2. **Weight Assignment**: ML weights determine attribute importance in predictions
3. **Normalization**: Attributes are normalized based on type and distribution
4. **Embedding**: Text attributes use BERT/word2vec embeddings
5. **Validation**: Training data quality is validated per attribute

### Training Pipeline

```javascript
// Example training configuration
const trainingConfig = {
  inputDimensions: 192,
  hiddenLayers: [256, 128, 64],
  outputDimensions: 50, // 50 optimization types
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  validationSplit: 0.2,
  attributeWeights: { /* per-attribute ML weights */ }
};
```

---

## Scraping Rules Per Attribute

### Rule Types

1. **Direct Selection**: CSS selector extraction
2. **Computed Values**: Derived from multiple elements
3. **Aggregations**: Counts, sums, averages
4. **Transformations**: Text processing, normalization
5. **Validations**: Quality checks, format validation

### Example Rules

```javascript
const scrapingRules = {
  title: {
    selector: 'title',
    extract: (el) => el.text().trim(),
    validate: (value) => value.length >= 30 && value.length <= 60,
    transform: (value) => value.replace(/\s+/g, ' '),
    weight: 0.15
  },
  metaDescription: {
    selector: 'meta[name="description"]',
    extract: (el) => el.attr('content') || '',
    validate: (value) => value.length >= 120 && value.length <= 160,
    weight: 0.15
  }
};
```

---

## Seeding Rules

### Data Source Priority

1. **Real-time Crawling**: Live website scraping
2. **API Integration**: Google Search Console, PageSpeed Insights
3. **Historical Data**: Database cached values
4. **Manual Input**: User-provided data

### Quality Thresholds

- **Critical Attributes** (weight > 0.10): Must be 95%+ accurate
- **High Priority** (weight 0.05-0.10): Must be 90%+ accurate
- **Medium Priority** (weight 0.03-0.05): Must be 80%+ accurate
- **Low Priority** (weight < 0.03): Best effort

---

## Integration with TensorFlow

### Model Architecture

```javascript
// Neural network for SEO optimization
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [192], units: 256, activation: 'relu' }),
    tf.layers.dropout({ rate: 0.3 }),
    tf.layers.dense({ units: 128, activation: 'relu' }),
    tf.layers.batchNormalization(),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 64, activation: 'relu' }),
    tf.layers.batchNormalization(),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 50, activation: 'sigmoid' }) // 50 optimization recommendations
  ]
});
```

### Training Data Format

```json
{
  "trainingData": [
    {
      "inputs": {
        "title": 0.8,
        "metaDescription": 0.9,
        "h1Count": 1.0,
        // ... all 192 attributes normalized to 0-1
      },
      "outputs": {
        "optimizeTitle": 0.2,
        "optimizeMetaDesc": 0.1,
        "addStructuredData": 0.9,
        // ... 50 optimization recommendations (0-1)
      },
      "results": {
        "optimizeTitle": { success: true, improvement: 0.15 },
        // ... actual results
      }
    }
  ]
}
```

---

## Next Steps

1. **Create Modular Config**: Generate `config/seo-attributes.json` with all 192 attributes
2. **Implement Config Loader**: Service to load and validate attribute configurations
3. **Enhance Extractor**: Use config to drive extraction logic dynamically
4. **Training Integration**: Connect attribute configs to TensorFlow training
5. **Documentation**: Update all docs with attribute references
6. **Testing**: Validate all 192 attributes can be extracted correctly

---

## References

- Implementation: `services/seo-attribute-extractor.js`
- Neural Network: `services/neural-network-seo-trainer.js`
- Database Schema: `migrations/006_seo_attributes_and_vectors.sql`
- API Routes: `api/seo-workflow-routes.js`, `api/client-seo-routes.js`
