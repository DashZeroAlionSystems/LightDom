# LightDom SEO Service - User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Pricing Plans](#pricing-plans)
6. [Features](#features)
7. [API Reference](#api-reference)
8. [Examples](#examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Introduction

LightDom's Automated SEO Service is an AI-powered solution that continuously optimizes your website for search engines through a simple JavaScript injection. Our service combines:

- **Zero-configuration setup**: Single line of code to start
- **AI-powered optimization**: Continuous learning from real data
- **Real-time updates**: Dynamic SEO improvements as you go
- **Comprehensive analytics**: Track performance and ROI
- **Blockchain-verified results**: Provable SEO improvements

### What Makes Us Different?

- **40-60% cheaper** than traditional SEO tools (SEMrush, Ahrefs, Moz)
- **Automated injection** of optimizations vs. manual implementation
- **Continuous ML training** on your site's specific data
- **Real-time Core Web Vitals** monitoring and optimization
- **Blockchain rewards** for contributing training data

---

## Getting Started

### Quick Start (5 Minutes)

1. **Sign up** at https://app.lightdom.io/seo
2. **Add your domain** and choose a pricing plan
3. **Copy the script** provided in your dashboard
4. **Paste into your website's `<head>` section**
5. **Done!** SEO optimizations start immediately

### What Happens After Installation?

Within minutes of installation, the SDK will:
1. Fetch optimized configurations for your pages
2. Inject JSON-LD structured data schemas
3. Optimize meta tags (titles, descriptions, Open Graph, Twitter Cards)
4. Monitor Core Web Vitals and send analytics
5. Track user behavior for ML training
6. Generate SEO improvement recommendations

---

## Installation

### Basic Installation

Add this single line of code to your website's `<head>` section:

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Your existing head content -->

  <!-- LightDom SEO SDK -->
  <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
          data-api-key="ld_live_xxxxxxxxxxxx"></script>
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

**Replace `ld_live_xxxxxxxxxxxx` with your actual API key from the dashboard.**

### Installation Options

#### Option 1: Direct Script Tag (Recommended)

```html
<script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
        data-api-key="YOUR_API_KEY"></script>
```

**Pros**: Fastest, cached by CDN, automatic updates
**Cons**: Requires internet connection

#### Option 2: NPM Package

```bash
npm install @lightdom/seo-sdk
```

```javascript
import LightDomSEO from '@lightdom/seo-sdk';

const seo = new LightDomSEO({
  apiKey: 'YOUR_API_KEY',
  debug: process.env.NODE_ENV === 'development'
});
```

**Pros**: Version control, offline capability, TypeScript support
**Cons**: Requires build step, manual updates

#### Option 3: Self-Hosted

Download the SDK and host on your own CDN:

```html
<script async src="https://your-cdn.com/lightdom-seo.min.js"
        data-api-key="YOUR_API_KEY"></script>
```

**Pros**: Full control, no external dependencies
**Cons**: Manual updates, no automatic improvements

---

## Configuration

### Basic Configuration

The SDK is configured via data attributes on the script tag:

```html
<script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
        data-api-key="ld_live_xxxxxxxxxxxx"
        data-debug="false"
        data-analytics="true"
        data-core-web-vitals="true"
        data-analytics-interval="30000"></script>
```

### Configuration Options

| Attribute | Default | Description |
|-----------|---------|-------------|
| `data-api-key` | **Required** | Your LightDom API key |
| `data-api-endpoint` | `https://api.lightdom.io` | API endpoint URL |
| `data-debug` | `false` | Enable debug logging to console |
| `data-analytics` | `true` | Enable analytics collection |
| `data-core-web-vitals` | `true` | Enable Core Web Vitals monitoring |
| `data-analytics-interval` | `30000` | Analytics send interval (ms) |

### Advanced Configuration

For advanced use cases, you can configure the SDK programmatically:

```javascript
// Access the SDK instance
const lightdomSEO = window.LightDomSEO;

// Update configuration dynamically
lightdomSEO.updateConfig({
  schemas: [
    {
      type: 'Product',
      enabled: true,
      data: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Custom Product',
        price: '99.99'
      }
    }
  ],
  metaTags: {
    title: 'Custom Title',
    description: 'Custom description'
  }
});

// Get current Core Web Vitals
const vitals = lightdomSEO.getCoreWebVitals();
console.log('LCP:', vitals.lcp);
console.log('CLS:', vitals.cls);
console.log('INP:', vitals.inp);
```

---

## Pricing Plans

### Starter - $79/month
**Perfect for small businesses and blogs**

- ✅ Up to 10,000 page views/month
- ✅ Basic JSON-LD schemas (5 types)
- ✅ Meta tag optimization
- ✅ Core Web Vitals monitoring
- ✅ Monthly SEO reports
- ✅ Email support
- ✅ 1 domain

**Best for**: Personal blogs, small business websites, portfolios

### Professional - $249/month
**For growing businesses and e-commerce**

- ✅ Up to 100,000 page views/month
- ✅ Advanced JSON-LD schemas (15+ types)
- ✅ Meta tag A/B testing
- ✅ Real-time Core Web Vitals
- ✅ Keyword rank tracking (100 keywords)
- ✅ Weekly SEO reports + AI recommendations
- ✅ Priority email support
- ✅ Up to 5 domains
- ✅ API access

**Best for**: E-commerce sites, growing SaaS, marketing agencies

### Business - $599/month
**For agencies and high-traffic sites**

- ✅ Up to 500,000 page views/month
- ✅ All JSON-LD schema types
- ✅ Advanced A/B testing with ML
- ✅ Real-time analytics dashboard
- ✅ Keyword rank tracking (500 keywords)
- ✅ Competitor analysis
- ✅ Daily SEO reports + AI recommendations
- ✅ Priority phone + email support
- ✅ Up to 20 domains
- ✅ Full API access with webhooks
- ✅ Custom model training
- ✅ White-label options

**Best for**: Marketing agencies, high-traffic e-commerce, SaaS platforms

### Enterprise - Custom Pricing (from $1,499/month)
**For large enterprises**

- ✅ Unlimited page views
- ✅ Dedicated AI model per client
- ✅ Custom schema development
- ✅ Unlimited keyword tracking
- ✅ Full competitor intelligence
- ✅ Real-time reports + predictive analytics
- ✅ 24/7 dedicated support
- ✅ Unlimited domains
- ✅ Full API + GraphQL
- ✅ Custom integrations
- ✅ On-premise deployment option
- ✅ SLA guarantees (99.9% uptime)
- ✅ Dedicated account manager

**Best for**: Enterprise corporations, multi-brand organizations

---

## Features

### JSON-LD Schema Injection

Automatically injects structured data for better search engine understanding:

#### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png"
}
```

#### Product Schema (Professional+)
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD"
  }
}
```

#### Article Schema (Professional+)
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  }
}
```

**Available Schema Types**:
- Organization, WebSite, WebPage, BreadcrumbList (All plans)
- Product, Event, FAQPage, HowTo, VideoObject, LocalBusiness, Recipe, JobPosting (Professional+)
- All standard schemas + custom (Business+)

### Meta Tag Optimization

Automatically optimizes:
- **Title tags**: Optimal length (50-60 characters), keyword placement
- **Meta descriptions**: Engaging, 150-160 characters, call-to-action
- **Open Graph tags**: Perfect social media sharing
- **Twitter Cards**: Optimized for Twitter
- **Canonical URLs**: Prevent duplicate content issues
- **Robots meta**: Control indexing behavior

### Core Web Vitals Monitoring

Real-time tracking of Google's Core Web Vitals:

- **LCP (Largest Contentful Paint)**: < 2.5s ✅
- **INP (Interaction to Next Paint)**: < 200ms ✅
- **CLS (Cumulative Layout Shift)**: < 0.1 ✅
- **TTFB (Time to First Byte)**: < 800ms ✅
- **FCP (First Contentful Paint)**: < 1.8s ✅

### A/B Testing (Professional+)

Test different SEO strategies:

```javascript
// The SDK automatically serves different variants
// and tracks which performs better

// Variant A: Short, direct title
// Variant B: Longer, descriptive title

// Winner is automatically deployed after statistical significance
```

### AI Recommendations

Get actionable recommendations:

- "Add Product schema to /shop/* pages for +15% traffic"
- "Improve LCP by optimizing hero image (currently 3.2s → target 2.0s)"
- "Missing Open Graph tags on 12 pages"
- "Competitors rank higher for 'keyword' - add to title tags"

### Competitor Analysis (Business+)

Track and compare against competitors:

- Keyword rankings comparison
- Schema usage analysis
- Core Web Vitals benchmarking
- Content gap identification

---

## API Reference

### REST API Endpoints

Base URL: `https://api.lightdom.io/api/v1/seo`

#### Authentication

All API requests require an API key in the header:

```
Authorization: Bearer ld_live_xxxxxxxxxxxx
```

#### Get Configuration

```http
GET /config/:apiKey?url=https://example.com&path=/products
```

**Response**:
```json
{
  "schemas": [...],
  "metaTags": {...},
  "customizations": {...}
}
```

#### Submit Analytics

```http
POST /analytics
Content-Type: application/json

{
  "apiKey": "ld_live_xxxxxxxxxxxx",
  "data": {
    "url": "https://example.com/page",
    "coreWebVitals": {...},
    "userBehavior": {...}
  }
}
```

#### Get Dashboard Data

```http
GET /analytics/:clientId?timeRange=7d
Authorization: Bearer ld_live_xxxxxxxxxxxx
```

**Response**:
```json
{
  "seoScore": {
    "overall": 85,
    "technical": 90,
    "content": 80,
    "performance": 85,
    "userExperience": 85
  },
  "coreWebVitals": [...],
  "topPages": [...],
  "trafficSources": [...],
  "keywordRankings": [...]
}
```

#### Generate Report

```http
GET /analytics/:clientId/reports?timeRange=30d
Authorization: Bearer ld_live_xxxxxxxxxxxx
```

Full API documentation: https://docs.lightdom.io/api

---

## Examples

### Example 1: E-commerce Product Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Amazing Product | Your Store</title>

  <!-- LightDom SEO SDK -->
  <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
          data-api-key="ld_live_xxxxxxxxxxxx"></script>

  <!-- The SDK will automatically inject:
       - Product schema with price, availability, reviews
       - Optimized meta tags
       - Open Graph tags for social sharing
       - BreadcrumbList schema
  -->
</head>
<body>
  <h1>Amazing Product</h1>
  <p>Product description...</p>
  <div class="price">$99.99</div>
  <button>Add to Cart</button>
</body>
</html>
```

**Result**: Product appears in rich snippets on Google with ratings, price, and availability.

### Example 2: Blog Article

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>How to Improve Your SEO | Blog</title>

  <!-- LightDom SEO SDK -->
  <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
          data-api-key="ld_live_xxxxxxxxxxxx"></script>

  <!-- The SDK will automatically inject:
       - Article schema with author, publish date
       - Optimized meta description
       - Open Graph article tags
       - Twitter Card tags
  -->
</head>
<body>
  <article>
    <h1>How to Improve Your SEO</h1>
    <p class="author">By John Doe</p>
    <p>Article content...</p>
  </article>
</body>
</html>
```

**Result**: Article shows in Google News, has proper social media cards, and author attribution.

### Example 3: Local Business

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Joe's Pizza | Best Pizza in NYC</title>

  <!-- LightDom SEO SDK -->
  <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
          data-api-key="ld_live_xxxxxxxxxxxx"></script>

  <!-- The SDK will automatically inject:
       - LocalBusiness schema with address, hours
       - Organization schema
       - Optimized meta tags for local SEO
  -->
</head>
<body>
  <h1>Joe's Pizza</h1>
  <address>123 Main St, New York, NY</address>
  <p>Hours: Mon-Fri 11am-10pm</p>
</body>
</html>
```

**Result**: Business appears in Google Maps, local pack, and knowledge panel.

### Example 4: FAQ Page

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Frequently Asked Questions | Your Site</title>

  <!-- LightDom SEO SDK -->
  <script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
          data-api-key="ld_live_xxxxxxxxxxxx"></script>

  <!-- The SDK will automatically inject:
       - FAQPage schema
       - Optimized meta tags
  -->
</head>
<body>
  <h1>FAQ</h1>
  <div class="faq">
    <h2>Question 1?</h2>
    <p>Answer 1...</p>
  </div>
</body>
</html>
```

**Result**: FAQs appear as rich snippets in Google search results.

---

## Best Practices

### 1. Install on Every Page

Install the SDK on all pages, not just your homepage:

```html
<!-- Include in your site-wide header template -->
<script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
        data-api-key="YOUR_API_KEY"></script>
```

### 2. Customize Schemas for Page Types

Configure different schemas for different page types in your dashboard:

- Homepage → Organization + WebSite schemas
- Product pages → Product schema
- Blog posts → Article schema
- Contact page → ContactPage + LocalBusiness schemas

### 3. Monitor Core Web Vitals

Check your dashboard weekly for Core Web Vitals trends:

- If LCP > 2.5s, optimize images and fonts
- If CLS > 0.1, fix layout shifts (set image dimensions, reserve space)
- If INP > 200ms, optimize JavaScript

### 4. Review AI Recommendations

Act on AI recommendations in priority order:

1. **Critical** issues first (red alerts)
2. **High-impact** optimizations (Expected +10% traffic)
3. **Quick wins** (Easy implementation, moderate impact)

### 5. A/B Test Changes (Professional+)

Before rolling out major changes, use A/B testing:

- Test different title formats
- Test different meta descriptions
- Test different schema variations

### 6. Track ROI

Monitor key metrics:

- Organic traffic growth
- Keyword ranking improvements
- Conversion rate changes
- Revenue attributed to organic search

---

## Troubleshooting

### SDK Not Loading

**Problem**: Script doesn't load or no optimizations applied

**Solutions**:
1. Check API key is correct
2. Verify script URL is correct
3. Check browser console for errors
4. Ensure domain is registered in dashboard
5. Check ad blockers aren't blocking the script

```javascript
// Debug mode to see what's happening
<script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
        data-api-key="YOUR_API_KEY"
        data-debug="true"></script>
```

### Rate Limit Exceeded

**Problem**: "Rate limit exceeded" error in console

**Solutions**:
1. Upgrade to higher pricing tier
2. Reduce analytics interval:
   ```html
   data-analytics-interval="60000"  <!-- Every 60 seconds instead of 30 -->
   ```
3. Contact support for temporary limit increase

### Schemas Not Showing in Google

**Problem**: Schemas aren't appearing in Google search results

**Solutions**:
1. Use [Google Rich Results Test](https://search.google.com/test/rich-results) to validate
2. Check schema is properly formatted (debug mode)
3. Wait 2-4 weeks for Google to re-crawl and process
4. Submit sitemap to Google Search Console
5. Ensure schemas have required fields

### Core Web Vitals Not Improving

**Problem**: Vitals are tracked but not improving

**Solutions**:
1. Our SDK optimizes meta tags and schemas, not performance
2. For performance improvements:
   - Optimize images (WebP format, lazy loading)
   - Minimize JavaScript and CSS
   - Use a CDN
   - Enable compression (gzip/brotli)
   - Upgrade hosting
3. Check our Business plan for custom performance optimization

### Analytics Not Appearing

**Problem**: No data in dashboard

**Solutions**:
1. Verify SDK is installed correctly
2. Check analytics is enabled: `data-analytics="true"`
3. Wait 5-10 minutes for data to process
4. Check browser console for errors
5. Verify firewall isn't blocking API requests

### Support

- **Email**: support@lightdom.io
- **Documentation**: https://docs.lightdom.io
- **Status Page**: https://status.lightdom.io
- **Community**: https://community.lightdom.io

**Priority Support** (Professional+): Priority email within 4 hours
**Dedicated Support** (Business+): Phone + email within 1 hour
**24/7 Support** (Enterprise): Dedicated account manager, instant response

---

## Next Steps

1. **Install the SDK** on your website
2. **Configure your domains** in the dashboard
3. **Review the analytics** after 24 hours
4. **Act on AI recommendations** for quick wins
5. **Monitor weekly** to track progress
6. **Upgrade your plan** as you grow

Start optimizing now: https://app.lightdom.io/seo

---

**LightDom - Automated SEO That Actually Works**

© 2024 LightDom. All rights reserved.
