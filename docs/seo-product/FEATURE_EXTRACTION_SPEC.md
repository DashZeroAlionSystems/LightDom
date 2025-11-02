# SEO Feature Extraction: Complete 194-Feature Specification

## Overview

This document defines all 194 SEO features that need to be extracted from each URL for machine learning training.

**Purpose**: Train ML models to predict SEO rankings and generate optimization recommendations  
**Target**: 10,000+ URLs with complete feature sets  
**Format**: JSON structure for each URL  

---

## Feature Categories

### 1. Technical SEO Features (50 features)

#### 1.1 Protocol & Security (5 features)
1. `technical.hasHttps` (boolean) - Uses HTTPS protocol
2. `technical.sslCertificateValid` (boolean) - Valid SSL certificate
3. `technical.sslExpiryDays` (integer) - Days until SSL expiry
4. `technical.httpsRedirect` (boolean) - HTTP redirects to HTTPS
5. `technical.mixedContentWarnings` (integer) - Count of mixed content warnings

#### 1.2 Performance Metrics (10 features)
6. `technical.pageLoadTime` (float, ms) - Total page load time
7. `technical.serverResponseTime` (float, ms) - TTFB (Time to First Byte)
8. `technical.domInteractive` (float, ms) - DOM Interactive time
9. `technical.domContentLoaded` (float, ms) - DOM Content Loaded time
10. `technical.firstPaint` (float, ms) - First Paint time
11. `technical.firstContentfulPaint` (float, ms) - FCP time
12. `technical.totalPageSize` (integer, bytes) - Total page weight
13. `technical.numberOfRequests` (integer) - Total HTTP requests
14. `technical.numberOfDomains` (integer) - External domains loaded
15. `technical.hasServiceWorker` (boolean) - Service worker present

#### 1.3 Resource Optimization (10 features)
16. `technical.imagesCompressed` (boolean) - Images use WebP/AVIF
17. `technical.imagesLazyLoaded` (boolean) - Lazy loading implemented
18. `technical.hasGzip` (boolean) - GZIP compression enabled
19. `technical.hasBrotli` (boolean) - Brotli compression enabled
20. `technical.cssMinified` (boolean) - CSS is minified
21. `technical.jsMinified` (boolean) - JavaScript is minified
22. `technical.inlineCssSize` (integer, bytes) - Inline CSS size
23. `technical.inlineJsSize` (integer, bytes) - Inline JS size
24. `technical.externalCssCount` (integer) - External CSS files
25. `technical.externalJsCount` (integer) - External JS files

#### 1.4 CDN & Caching (5 features)
26. `technical.usesCDN` (boolean) - CDN detected
27. `technical.cdnProvider` (string) - CDN provider name
28. `technical.browserCachingEnabled` (boolean) - Cache headers present
29. `technical.cacheMaxAge` (integer, seconds) - Max cache age
30. `technical.hasETag` (boolean) - ETag headers present

#### 1.5 Crawlability (10 features)
31. `technical.hasRobotsTxt` (boolean) - robots.txt exists
32. `technical.robotsTxtAllowsCrawling` (boolean) - Allows crawling
33. `technical.hasSitemapXml` (boolean) - sitemap.xml exists
34. `technical.sitemapUrlCount` (integer) - URLs in sitemap
35. `technical.hasXmlSitemapReference` (boolean) - Referenced in robots.txt
36. `technical.canonicalUrlSet` (boolean) - Canonical tag present
37. `technical.canonicalPointsToSelf` (boolean) - Self-referencing canonical
38. `technical.hasMetaRobotsTag` (boolean) - Meta robots tag present
39. `technical.metaRobotsContent` (string) - robots tag content
40. `technical.xRobotsTagPresent` (boolean) - X-Robots-Tag header

#### 1.6 Mobile & Accessibility (10 features)
41. `technical.mobileResponsive` (boolean) - Responsive design
42. `technical.hasViewportMeta` (boolean) - Viewport meta tag
43. `technical.viewportContent` (string) - Viewport configuration
44. `technical.touchIconsPresent` (boolean) - Apple touch icons
45. `technical.hasAmpVersion` (boolean) - AMP version exists
46. `technical.passesAccessibility` (boolean) - Basic accessibility checks
47. `technical.colorContrastRatio` (float) - Color contrast score
48. `technical.hasLangAttribute` (boolean) - HTML lang attribute
49. `technical.langAttributeValue` (string) - Language code
50. `technical.fontSizeReadable` (boolean) - Font size >= 12px

---

### 2. Content SEO Features (70 features)

#### 2.1 Title Tag (5 features)
51. `content.hasTitle` (boolean) - Title tag exists
52. `content.titleLength` (integer) - Character count
53. `content.titleOptimalLength` (boolean) - 50-60 characters
54. `content.titleHasKeyword` (boolean) - Contains target keyword
55. `content.titleKeywordPosition` (integer) - Keyword position (0=start)

#### 2.2 Meta Description (5 features)
56. `content.hasMetaDescription` (boolean) - Meta description exists
57. `content.descriptionLength` (integer) - Character count
58. `content.descriptionOptimalLength` (boolean) - 150-160 characters
59. `content.descriptionHasKeyword` (boolean) - Contains keyword
60. `content.descriptionUnique` (boolean) - Not duplicate

#### 2.3 Heading Structure (10 features)
61. `content.h1Count` (integer) - Number of H1 tags
62. `content.h1Text` (string) - H1 content
63. `content.h1HasKeyword` (boolean) - H1 contains keyword
64. `content.h2Count` (integer) - Number of H2 tags
65. `content.h3Count` (integer) - Number of H3 tags
66. `content.h4Count` (integer) - Number of H4 tags
67. `content.headingHierarchy` (boolean) - Proper hierarchy (H1→H2→H3)
68. `content.multipleH1` (boolean) - Multiple H1s (bad practice)
69. `content.emptyHeadings` (integer) - Empty heading tags count
70. `content.headingLengthAvg` (float) - Average heading length

#### 2.4 Content Quality (15 features)
71. `content.wordCount` (integer) - Total words on page
72. `content.paragraphCount` (integer) - Number of paragraphs
73. `content.sentenceCount` (integer) - Total sentences
74. `content.averageWordsPerSentence` (float) - Words per sentence
75. `content.averageWordsPerParagraph` (float) - Words per paragraph
76. `content.readabilityScore` (float) - Flesch Reading Ease score
77. `content.readingLevel` (string) - Grade level
78. `content.keywordDensity` (float, %) - Keyword density percentage
79. `content.keywordFrequency` (integer) - Keyword occurrences
80. `content.lsiKeywordsCount` (integer) - Related keywords found
81. `content.uniqueWordsRatio` (float, %) - Unique words percentage
82. `content.stopWordsRatio` (float, %) - Stop words percentage
83. `content.contentFreshness` (integer, days) - Days since last update
84. `content.hasDatePublished` (boolean) - Publish date visible
85. `content.hasDateModified` (boolean) - Modified date visible

#### 2.5 Links (10 features)
86. `content.internalLinksCount` (integer) - Internal links
87. `content.externalLinksCount` (integer) - External links
88. `content.totalLinksCount` (integer) - All links
89. `content.brokenLinksCount` (integer) - 404 links
90. `content.nofollowLinksCount` (integer) - Nofollow links
91. `content.linkTextDescriptive` (boolean) - No "click here" links
92. `content.linksToHomepage` (integer) - Links to own homepage
93. `content.deepLinksCount` (integer) - Links to deep pages
94. `content.externalLinksDomain` (array) - External domains linked
95. `content.anchorTextOptimized` (boolean) - Keyword-rich anchors

#### 2.6 Images & Media (10 features)
96. `content.imageCount` (integer) - Total images
97. `content.imagesWithAlt` (integer) - Images with alt text
98. `content.imagesWithoutAlt` (integer) - Images missing alt
99. `content.altTextQuality` (float) - Alt text quality score
100. `content.altTextHasKeyword` (boolean) - Alt contains keyword
101. `content.imageFileNamesOptimized` (boolean) - Descriptive filenames
102. `content.videoCount` (integer) - Embedded videos
103. `content.audioCount` (integer) - Audio elements
104. `content.iframeCount` (integer) - Iframe embeds
105. `content.svgCount` (integer) - SVG images

#### 2.7 Structured Data (10 features)
106. `content.hasStructuredData` (boolean) - JSON-LD present
107. `content.structuredDataTypes` (array) - Schema types found
108. `content.structuredDataValid` (boolean) - Validates correctly
109. `content.hasOrganizationSchema` (boolean) - Organization schema
110. `content.hasProductSchema` (boolean) - Product schema
111. `content.hasArticleSchema` (boolean) - Article schema
112. `content.hasBreadcrumbSchema` (boolean) - Breadcrumb schema
113. `content.hasFAQSchema` (boolean) - FAQ schema
114. `content.hasReviewSchema` (boolean) - Review schema
115. `content.hasLocalBusinessSchema` (boolean) - LocalBusiness schema

#### 2.8 Social & Rich Cards (5 features)
116. `content.hasOpenGraph` (boolean) - OG tags present
117. `content.ogTagsComplete` (boolean) - All required OG tags
118. `content.hasTwitterCards` (boolean) - Twitter card meta
119. `content.twitterCardType` (string) - Card type
120. `content.hasSocialShareButtons` (boolean) - Share buttons present

---

### 3. Performance Features (24 features)

#### 3.1 Core Web Vitals (6 features)
121. `performance.lcp` (float, ms) - Largest Contentful Paint
122. `performance.fid` (float, ms) - First Input Delay
123. `performance.cls` (float) - Cumulative Layout Shift
124. `performance.inp` (float, ms) - Interaction to Next Paint
125. `performance.ttfb` (float, ms) - Time to First Byte
126. `performance.fcp` (float, ms) - First Contentful Paint

#### 3.2 Page Structure (6 features)
127. `performance.domSize` (integer) - DOM elements count
128. `performance.domDepth` (integer) - Maximum DOM depth
129. `performance.iframesCount` (integer) - Embedded iframes
130. `performance.scriptsCount` (integer) - Script tags count
131. `performance.stylesCount` (integer) - Style tags count
132. `performance.fontsCount` (integer) - Font files loaded

#### 3.3 Resource Loading (6 features)
133. `performance.criticalResourcesCount` (integer) - Critical resources
134. `performance.renderBlockingResources` (integer) - Blocking resources
135. `performance.asyncScriptsRatio` (float, %) - Async scripts percentage
136. `performance.deferScriptsRatio` (float, %) - Deferred scripts percentage
137. `performance.criticalCssInlined` (boolean) - Critical CSS inline
138. `performance.aboveFoldOptimized` (boolean) - Above fold optimized

#### 3.4 JavaScript Performance (6 features)
139. `performance.jsExecutionTime` (float, ms) - JS execution time
140. `performance.jsHeapSize` (integer, bytes) - Memory usage
141. `performance.longTasksCount` (integer) - Tasks >50ms
142. `performance.mainThreadWorkTime` (float, ms) - Main thread time
143. `performance.totalBlockingTime` (float, ms) - TBT score
144. `performance.thirdPartyScriptsCount` (integer) - 3rd party scripts

---

### 4. User Engagement Features (40 features)

#### 4.1 Analytics Metrics (10 features)
145. `engagement.bounceRate` (float, %) - Bounce rate percentage
146. `engagement.avgTimeOnPage` (float, seconds) - Average time
147. `engagement.avgSessionDuration` (float, seconds) - Session length
148. `engagement.pagesPerSession` (float) - Pages per visit
149. `engagement.exitRate` (float, %) - Exit rate percentage
150. `engagement.returnVisitorRate` (float, %) - Returning visitors
151. `engagement.newVisitorRate` (float, %) - New visitors
152. `engagement.directTrafficRate` (float, %) - Direct traffic
153. `engagement.organicTrafficRate` (float, %) - Organic search
154. `engagement.referralTrafficRate` (float, %) - Referral traffic

#### 4.2 User Behavior (10 features)
155. `engagement.scrollDepthAvg` (float, %) - Average scroll depth
156. `engagement.clicksPerVisit` (float) - Average clicks
157. `engagement.formSubmissions` (integer) - Form submits
158. `engagement.videoPlays` (integer) - Video interactions
159. `engagement.downloadClicks` (integer) - File downloads
160. `engagement.outboundClicks` (integer) - External link clicks
161. `engagement.socialShares` (integer) - Social media shares
162. `engagement.commentsCount` (integer) - User comments
163. `engagement.pageLoadAbandons` (integer) - Load abandons
164. `engagement.errorPageViews` (integer) - 404/error views

#### 4.3 Search Metrics (10 features)
165. `engagement.organicImpressions` (integer) - SERP impressions
166. `engagement.organicClicks` (integer) - Organic clicks
167. `engagement.organicCTR` (float, %) - Click-through rate
168. `engagement.averagePosition` (float) - Average SERP position
169. `engagement.topKeywordsCount` (integer) - Top 10 keywords
170. `engagement.featuredSnippets` (integer) - Featured snippet wins
171. `engagement.peopleAlsoAsk` (integer) - PAA appearances
172. `engagement.richResultTypes` (array) - Rich result types
173. `engagement.siteLinks` (boolean) - Site links in SERP
174. `engagement.knowledgePanel` (boolean) - Knowledge panel

#### 4.4 Conversion Metrics (10 features)
175. `engagement.conversionRate` (float, %) - Overall conversion
176. `engagement.goalCompletions` (integer) - Goal completions
177. `engagement.ecommerceRevenue` (float) - Revenue (if applicable)
178. `engagement.transactionCount` (integer) - Transactions
179. `engagement.avgOrderValue` (float) - Average order value
180. `engagement.cartAbandonment` (float, %) - Cart abandonment rate
181. `engagement.emailSignups` (integer) - Email captures
182. `engagement.trialSignups` (integer) - Trial registrations
183. `engagement.leadFormSubmits` (integer) - Lead form submits
184. `engagement.phoneCallClicks` (integer) - Click-to-call

---

### 5. Competitive Features (10 features)

#### 5.1 Domain Authority (4 features)
185. `competitive.domainAuthority` (integer, 0-100) - DA score
186. `competitive.pageAuthority` (integer, 0-100) - PA score
187. `competitive.trustFlow` (integer, 0-100) - Trust score
188. `competitive.citationFlow` (integer, 0-100) - Citation score

#### 5.2 Backlink Profile (3 features)
189. `competitive.backlinksCount` (integer) - Total backlinks
190. `competitive.referringDomainsCount` (integer) - Unique domains
191. `competitive.dofollowBacklinksRatio` (float, %) - Dofollow percentage

#### 5.3 Market Position (3 features)
192. `competitive.keywordDifficulty` (integer, 0-100) - KD score
193. `competitive.searchVolume` (integer) - Monthly search volume
194. `competitive.competitorRankingAvg` (float) - Avg competitor position

---

## Data Collection Workflow

### Step 1: URL Discovery
- Crawl seed URLs
- Extract all internal links
- Prioritize by domain authority
- Queue for feature extraction

### Step 2: Feature Extraction
For each URL:
1. Load page with headless browser
2. Measure performance metrics
3. Extract DOM content
4. Analyze technical SEO
5. Calculate content metrics
6. Fetch analytics data (if available)
7. Query competitive data APIs

### Step 3: Quality Scoring
- Calculate completeness (% of features extracted)
- Validate data integrity
- Assign quality score (0-100)
- Flag for review if score <70

### Step 4: Storage
- Store in `seo_training_data` table
- Include metadata (timestamp, source, quality)
- Calculate data hash for blockchain
- Queue for ML training

---

## Implementation Files

### Primary Implementation
- `services/seo-workers/feature-extractor.js` - Main extraction logic
- `src/seo/services/SEODataCollector.ts` - Data collection service
- `src/ml/TrainingDataPipeline.ts` - ML pipeline integration

### Supporting Files
- `config/feature-extraction-rules.json` - Extraction rules
- `config/quality-scoring-weights.json` - Quality score calculation
- `scripts/validate-features.js` - Feature validation script

---

## Data Quality Requirements

### Minimum Requirements
- At least 150 of 194 features extracted (77% completeness)
- All Core Web Vitals measured
- All technical SEO features collected
- Content analysis complete

### Quality Tiers
- **Excellent** (90-100%): All features, high confidence
- **Good** (80-89%): Most features, medium confidence
- **Acceptable** (70-79%): Core features, low confidence
- **Poor** (<70%): Incomplete, exclude from training

---

## Expected Output Format

```json
{
  "url": "https://example.com/page",
  "timestamp": "2024-11-02T12:00:00Z",
  "technical": { /* 50 features */ },
  "content": { /* 70 features */ },
  "performance": { /* 24 features */ },
  "engagement": { /* 40 features */ },
  "competitive": { /* 10 features */ },
  "metadata": {
    "completeness": 98.5,
    "qualityScore": 92,
    "extractionTime": 3.2,
    "source": "crawler",
    "version": "1.0.0"
  }
}
```

---

**Status**: ✅ Feature specification complete  
**Next**: Implement extraction logic in worker scripts  
**Target**: 10,000+ URLs with >80% feature completeness
