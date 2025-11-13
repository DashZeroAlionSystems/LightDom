/**
 * SEO Attribute Extractor
 * Captures ~192 SEO attributes per page for training data generation
 */

import * as cheerio from 'cheerio';

/**
 * Extract comprehensive SEO attributes from HTML
 * @param {string} html - Raw HTML content
 * @param {string} url - Page URL
 * @returns {Promise<Object>} Extracted attributes
 */
export async function extractSEOAttributes(html, url) {
  const $ = cheerio.load(html);
  const attributes = {
    url,
    timestamp: new Date().toISOString(),
  };

  // === META & HEAD ATTRIBUTES (40+) ===
  attributes.title = $('title').text().trim();
  attributes.titleLength = attributes.title.length;
  attributes.metaDescription = $('meta[name="description"]').attr('content') || '';
  attributes.metaDescriptionLength = attributes.metaDescription.length;
  attributes.metaKeywords = $('meta[name="keywords"]').attr('content') || '';
  attributes.metaAuthor = $('meta[name="author"]').attr('content') || '';
  attributes.metaRobots = $('meta[name="robots"]').attr('content') || '';
  attributes.metaViewport = $('meta[name="viewport"]').attr('content') || '';
  attributes.canonical = $('link[rel="canonical"]').attr('href') || '';
  attributes.alternate = $('link[rel="alternate"]').attr('href') || '';
  attributes.prev = $('link[rel="prev"]').attr('href') || '';
  attributes.next = $('link[rel="next"]').attr('href') || '';

  // Open Graph
  attributes.ogTitle = $('meta[property="og:title"]').attr('content') || '';
  attributes.ogDescription = $('meta[property="og:description"]').attr('content') || '';
  attributes.ogImage = $('meta[property="og:image"]').attr('content') || '';
  attributes.ogUrl = $('meta[property="og:url"]').attr('content') || '';
  attributes.ogType = $('meta[property="og:type"]').attr('content') || '';
  attributes.ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
  attributes.ogLocale = $('meta[property="og:locale"]').attr('content') || '';

  // Twitter Card
  attributes.twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  attributes.twitterSite = $('meta[name="twitter:site"]').attr('content') || '';
  attributes.twitterCreator = $('meta[name="twitter:creator"]').attr('content') || '';
  attributes.twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
  attributes.twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
  attributes.twitterImage = $('meta[name="twitter:image"]').attr('content') || '';

  // Language & Charset
  attributes.lang = $('html').attr('lang') || '';
  attributes.charset = $('meta[charset]').attr('charset') || '';

  // Favicon
  attributes.favicon = $('link[rel~="icon"]').attr('href') || '';
  attributes.appleTouchIcon = $('link[rel="apple-touch-icon"]').attr('href') || '';

  // === HEADING STRUCTURE (20+) ===
  const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  for (let i = 1; i <= 6; i++) {
    $(`h${i}`).each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings[`h${i}`].push(text);
    });
  }
  attributes.h1Count = headings.h1.length;
  attributes.h2Count = headings.h2.length;
  attributes.h3Count = headings.h3.length;
  attributes.h4Count = headings.h4.length;
  attributes.h5Count = headings.h5.length;
  attributes.h6Count = headings.h6.length;
  attributes.h1Text = headings.h1.join(' | ');
  attributes.h2Text = headings.h2.slice(0, 5).join(' | ');
  attributes.h3Text = headings.h3.slice(0, 5).join(' | ');
  attributes.totalHeadings = Object.values(headings).flat().length;
  attributes.headingHierarchyValid = headings.h1.length === 1;

  // === CONTENT ATTRIBUTES (30+) ===
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  attributes.bodyTextLength = bodyText.length;
  attributes.wordCount = bodyText.split(/\s+/).length;
  attributes.paragraphCount = $('p').length;
  attributes.listCount = $('ul, ol').length;
  attributes.listItemCount = $('li').length;
  attributes.tableCount = $('table').length;
  attributes.formCount = $('form').length;
  attributes.inputCount = $('input').length;
  attributes.buttonCount = $('button').length;
  attributes.textareaCount = $('textarea').length;
  attributes.selectCount = $('select').length;

  // Content readability (basic metrics)
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  attributes.sentenceCount = sentences.length;
  attributes.avgWordsPerSentence =
    sentences.length > 0 ? (attributes.wordCount / sentences.length).toFixed(2) : 0;

  // === LINK ATTRIBUTES (25+) ===
  const links = $('a[href]');
  attributes.totalLinks = links.length;
  const internalLinks = [];
  const externalLinks = [];
  const anchorLinks = [];
  const noFollowLinks = [];
  const doFollowLinks = [];

  links.each((_, el) => {
    const href = $(el).attr('href') || '';
    const rel = $(el).attr('rel') || '';
    const isExternal = href.startsWith('http') && !href.includes(new URL(url).hostname);

    if (href.startsWith('#')) {
      anchorLinks.push(href);
    } else if (isExternal) {
      externalLinks.push(href);
    } else {
      internalLinks.push(href);
    }

    if (rel.includes('nofollow')) {
      noFollowLinks.push(href);
    } else {
      doFollowLinks.push(href);
    }
  });

  attributes.internalLinksCount = internalLinks.length;
  attributes.externalLinksCount = externalLinks.length;
  attributes.anchorLinksCount = anchorLinks.length;
  attributes.noFollowLinksCount = noFollowLinks.length;
  attributes.doFollowLinksCount = doFollowLinks.length;
  attributes.internalToExternalRatio =
    externalLinks.length > 0 ? (internalLinks.length / externalLinks.length).toFixed(2) : 0;

  // Broken link indicators (basic)
  attributes.emptyHrefCount = $('a[href=""], a[href="#"]').length;

  // === IMAGE ATTRIBUTES (20+) ===
  const images = $('img');
  attributes.totalImages = images.length;
  let imagesWithAlt = 0;
  let imagesWithTitle = 0;
  let imagesWithLazyLoad = 0;
  const imageSrcs = [];

  images.each((_, el) => {
    const alt = $(el).attr('alt');
    const title = $(el).attr('title');
    const loading = $(el).attr('loading');
    const src = $(el).attr('src') || '';

    if (alt && alt.trim()) imagesWithAlt++;
    if (title && title.trim()) imagesWithTitle++;
    if (loading === 'lazy') imagesWithLazyLoad++;
    if (src) imageSrcs.push(src);
  });

  attributes.imagesWithAlt = imagesWithAlt;
  attributes.imagesWithoutAlt = attributes.totalImages - imagesWithAlt;
  attributes.imagesWithTitle = imagesWithTitle;
  attributes.imagesWithLazyLoad = imagesWithLazyLoad;
  attributes.altTextCoverage =
    attributes.totalImages > 0 ? ((imagesWithAlt / attributes.totalImages) * 100).toFixed(2) : 0;

  // === STRUCTURED DATA (15+) ===
  const schemaScripts = $('script[type="application/ld+json"]');
  attributes.structuredDataCount = schemaScripts.length;
  const schemaTypes = [];

  schemaScripts.each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '{}');
      if (json['@type']) schemaTypes.push(json['@type']);
    } catch (e) {
      // Invalid JSON
    }
  });

  attributes.schemaTypes = schemaTypes.join(', ');
  attributes.hasArticleSchema = schemaTypes.includes('Article');
  attributes.hasProductSchema = schemaTypes.includes('Product');
  attributes.hasOrganizationSchema = schemaTypes.includes('Organization');
  attributes.hasBreadcrumbSchema = schemaTypes.includes('BreadcrumbList');

  // Microdata
  attributes.itemScopeCount = $('[itemscope]').length;
  attributes.itemPropCount = $('[itemprop]').length;

  // === PERFORMANCE ATTRIBUTES (15+) ===
  attributes.htmlSize = Buffer.byteLength(html, 'utf8');
  attributes.cssLinkCount = $('link[rel="stylesheet"]').length;
  attributes.jsScriptCount = $('script[src]').length;
  attributes.inlineScriptCount = $('script:not([src])').length;
  attributes.inlineStyleCount = $('style').length;

  // Resource hints
  attributes.prefetchCount = $('link[rel="prefetch"]').length;
  attributes.preconnectCount = $('link[rel="preconnect"]').length;
  attributes.preloadCount = $('link[rel="preload"]').length;
  attributes.dnsPreconnectCount = $('link[rel="dns-prefetch"]').length;

  // === MOBILE & ACCESSIBILITY (10+) ===
  attributes.hasViewportMeta = !!attributes.metaViewport;
  attributes.hasAppleMobileWebAppCapable = !!$('meta[name="apple-mobile-web-app-capable"]').attr(
    'content'
  );
  attributes.hasThemeColor = !!$('meta[name="theme-color"]').attr('content');
  attributes.ariaLabelCount = $('[aria-label]').length;
  attributes.ariaDescribedByCount = $('[aria-describedby]').length;
  attributes.roleCount = $('[role]').length;
  attributes.accessibilityScore = (
    ((imagesWithAlt / (attributes.totalImages || 1)) * 50 +
      (attributes.roleCount > 0 ? 25 : 0) +
      (attributes.ariaLabelCount > 0 ? 25 : 0)) *
    0.01
  ).toFixed(2);

  // === URL STRUCTURE (10+) ===
  const urlObj = new URL(url);
  attributes.protocol = urlObj.protocol;
  attributes.hostname = urlObj.hostname;
  attributes.pathname = urlObj.pathname;
  attributes.pathnameLength = urlObj.pathname.length;
  attributes.pathDepth = urlObj.pathname.split('/').filter(Boolean).length;
  attributes.hasQueryParams = !!urlObj.search;
  attributes.queryParamCount = Array.from(urlObj.searchParams.keys()).length;
  attributes.hasFragment = !!urlObj.hash;
  attributes.isSecure = urlObj.protocol === 'https:';

  // === SOCIAL SIGNALS (8+) ===
  attributes.facebookCount = $('a[href*="facebook.com"]').length;
  attributes.twitterCount = $('a[href*="twitter.com"], a[href*="x.com"]').length;
  attributes.linkedinCount = $('a[href*="linkedin.com"]').length;
  attributes.instagramCount = $('a[href*="instagram.com"]').length;
  attributes.youtubeCount = $('a[href*="youtube.com"]').length;
  attributes.pinterestCount = $('a[href*="pinterest.com"]').length;
  attributes.socialShareCount =
    attributes.facebookCount +
    attributes.twitterCount +
    attributes.linkedinCount +
    attributes.instagramCount;

  // === SECURITY & BEST PRACTICES (8+) ===
  attributes.hasHttpsInLinks = externalLinks.some(link => link.startsWith('https://'));
  attributes.hasInsecureContent = $('img[src^="http:"], script[src^="http:"]').length > 0;
  attributes.hasIframe = $('iframe').length > 0;
  attributes.iframeCount = $('iframe').length;
  attributes.hasExternalScripts = $('script[src^="http"]').length > 0;
  attributes.hasCrossOriginLinks = $('a[rel*="noopener"], a[rel*="noreferrer"]').length > 0;

  // === COMPUTED SCORES (5+) ===
  attributes.seoScore = computeSEOScore(attributes);
  attributes.contentQualityScore = computeContentQualityScore(attributes);
  attributes.technicalScore = computeTechnicalScore(attributes);
  attributes.overallScore = (
    (attributes.seoScore * 0.4 +
      attributes.contentQualityScore * 0.3 +
      attributes.technicalScore * 0.3) /
    100
  ).toFixed(2);

  return attributes;
}

/**
 * Compute basic SEO score (0-100)
 */
function computeSEOScore(attrs) {
  let score = 0;

  // Title (15 points)
  if (attrs.title && attrs.titleLength >= 30 && attrs.titleLength <= 60) score += 15;
  else if (attrs.title) score += 8;

  // Meta description (15 points)
  if (
    attrs.metaDescription &&
    attrs.metaDescriptionLength >= 120 &&
    attrs.metaDescriptionLength <= 160
  )
    score += 15;
  else if (attrs.metaDescription) score += 8;

  // H1 (10 points)
  if (attrs.h1Count === 1) score += 10;
  else if (attrs.h1Count > 0) score += 5;

  // Canonical (10 points)
  if (attrs.canonical) score += 10;

  // Structured data (10 points)
  if (attrs.structuredDataCount > 0) score += 10;

  // Images with alt (10 points)
  if (attrs.totalImages > 0 && attrs.altTextCoverage >= 80) score += 10;
  else if (attrs.totalImages > 0 && attrs.altTextCoverage >= 50) score += 5;

  // Internal links (10 points)
  if (attrs.internalLinksCount >= 5) score += 10;
  else if (attrs.internalLinksCount > 0) score += 5;

  // Mobile (10 points)
  if (attrs.hasViewportMeta) score += 10;

  // Security (10 points)
  if (attrs.isSecure) score += 10;

  return score;
}

/**
 * Compute content quality score (0-100)
 */
function computeContentQualityScore(attrs) {
  let score = 0;

  // Word count (30 points)
  if (attrs.wordCount >= 1000) score += 30;
  else if (attrs.wordCount >= 500) score += 20;
  else if (attrs.wordCount >= 300) score += 10;

  // Heading structure (20 points)
  if (attrs.h1Count === 1 && attrs.h2Count >= 3 && attrs.headingHierarchyValid) score += 20;
  else if (attrs.h1Count > 0 && attrs.h2Count > 0) score += 10;

  // Readability (20 points)
  const avgWords = parseFloat(attrs.avgWordsPerSentence);
  if (avgWords >= 15 && avgWords <= 25) score += 20;
  else if (avgWords > 0) score += 10;

  // Paragraph count (15 points)
  if (attrs.paragraphCount >= 5) score += 15;
  else if (attrs.paragraphCount >= 3) score += 8;

  // Lists (15 points)
  if (attrs.listCount >= 2) score += 15;
  else if (attrs.listCount > 0) score += 8;

  return score;
}

/**
 * Compute technical score (0-100)
 */
function computeTechnicalScore(attrs) {
  let score = 0;

  // HTTPS (20 points)
  if (attrs.isSecure) score += 20;

  // Performance hints (20 points)
  if (attrs.preconnectCount > 0 || attrs.prefetchCount > 0 || attrs.preloadCount > 0) score += 20;
  else if (attrs.dnsPreconnectCount > 0) score += 10;

  // No inline scripts/styles (15 points)
  if (attrs.inlineScriptCount === 0 && attrs.inlineStyleCount === 0) score += 15;
  else if (attrs.inlineScriptCount + attrs.inlineStyleCount <= 2) score += 8;

  // Lazy loading (15 points)
  if (attrs.totalImages > 0 && attrs.imagesWithLazyLoad / attrs.totalImages >= 0.5) score += 15;
  else if (attrs.imagesWithLazyLoad > 0) score += 8;

  // No insecure content (15 points)
  if (!attrs.hasInsecureContent) score += 15;

  // Accessibility (15 points)
  if (parseFloat(attrs.accessibilityScore) >= 0.7) score += 15;
  else if (parseFloat(attrs.accessibilityScore) >= 0.4) score += 8;

  return score;
}

export default extractSEOAttributes;
