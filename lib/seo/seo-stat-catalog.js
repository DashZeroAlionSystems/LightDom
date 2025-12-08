// SEO Stat Catalog and feature computation utilities
// Provides a single source of truth for SEO feature engineering across crawlers and ML pipelines

const SEO_STAT_VERSION = 'seo-stats-v1';

const clampNumber = (value, fallback = 0) => {
  if (Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeDivide = (numerator, denominator) => {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
};

const dedupeArray = list => Array.from(new Set((list || []).filter(Boolean)));

const average = values => {
  if (!values || values.length === 0) {
    return 0;
  }
  const total = values.reduce((sum, value) => sum + clampNumber(value), 0);
  return total / values.length;
};

const countSyllables = text => {
  if (!text) {
    return 0;
  }
  const sanitized = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
  const words = sanitized.split(/\s+/).filter(Boolean);
  let syllableCount = 0;
  for (const word of words) {
    const matches = word.match(/[aeiouy]+/g);
    if (!matches) {
      continue;
    }
    let count = matches.length;
    if (word.endsWith('e')) {
      count -= 1;
    }
    if (count <= 0) {
      count = 1;
    }
    syllableCount += count;
  }
  return syllableCount;
};

const calculateReadability = text => {
  if (!text) {
    return { flesch: 0, sentenceCount: 0, averageSentenceLength: 0 };
  }
  const sentences = text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const syllableCount = countSyllables(text);
  const averageSentenceLength = wordCount / sentenceCount;
  const wordsPerSyllable = syllableCount ? wordCount / syllableCount : 0;
  const flesch = 206.835 - 1.015 * averageSentenceLength - 84.6 * wordsPerSyllable;
  return {
    flesch: Number.isFinite(flesch) ? Number(flesch.toFixed(2)) : 0,
    sentenceCount,
    averageSentenceLength: Number.isFinite(averageSentenceLength)
      ? Number(averageSentenceLength.toFixed(2))
      : 0,
  };
};

const defaultScorer = () => null;

export const SEO_STAT_CATALOG = [
  {
    id: 'metadata_title_length',
    category: 'metadata',
    description: 'Length of the <title> tag content',
    weight: 2,
    extractor: ctx => (ctx.seoData.title || '').trim().length,
    scorer: value => value >= 30 && value <= 65,
  },
  {
    id: 'metadata_description_length',
    category: 'metadata',
    description: 'Length of the meta description content',
    weight: 2,
    extractor: ctx => (ctx.seoData.description || '').trim().length,
    scorer: value => value >= 110 && value <= 165,
  },
  {
    id: 'metadata_title_keyword_coverage',
    category: 'metadata',
    description: 'Ratio of configured keywords that appear in title text',
    weight: 1,
    extractor: ctx => {
      const keywords = (ctx.seoData.keywords || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
      if (!keywords.length) {
        return 0;
      }
      const title = (ctx.seoData.title || '').toLowerCase();
      const matches = keywords.filter(keyword => title.includes(keyword)).length;
      return safeDivide(matches, keywords.length);
    },
    scorer: value => value >= 0.5,
  },
  {
    id: 'metadata_description_keyword_coverage',
    category: 'metadata',
    description: 'Ratio of configured keywords mentioned in meta description',
    weight: 1,
    extractor: ctx => {
      const keywords = (ctx.seoData.keywords || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
      if (!keywords.length) {
        return 0;
      }
      const description = (ctx.seoData.description || '').toLowerCase();
      const matches = keywords.filter(keyword => description.includes(keyword)).length;
      return safeDivide(matches, keywords.length);
    },
    scorer: value => value >= 0.4,
  },
  {
    id: 'metadata_canonical_present',
    category: 'metadata',
    description: 'Indicates whether a canonical link tag is present',
    weight: 1,
    extractor: ctx => ((ctx.seoData.canonical || '').trim() ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'metadata_canonical_self',
    category: 'metadata',
    description: 'Canonical URL matches current URL domain',
    weight: 1,
    extractor: ctx => {
      if (!ctx.seoData.canonical || !ctx.seoData.url) {
        return 0;
      }
      try {
        const canonicalHost = new URL(ctx.seoData.canonical).hostname;
        const currentHost = new URL(ctx.seoData.url).hostname;
        return canonicalHost === currentHost ? 1 : 0;
      } catch (err) {
        return 0;
      }
    },
    scorer: value => value === 1,
  },
  {
    id: 'metadata_robots_indexable',
    category: 'metadata',
    description: 'PAGE is indexable based on robots meta directives',
    weight: 1,
    extractor: ctx => {
      const robots = (ctx.seoData.robots || '').toLowerCase();
      if (!robots) {
        return 1;
      }
      return robots.includes('noindex') ? 0 : 1;
    },
    scorer: value => value === 1,
  },
  {
    id: 'metadata_viewport_present',
    category: 'metadata',
    description: 'Viewport meta tag declared for mobile responsiveness',
    weight: 1,
    extractor: ctx => ((ctx.seoData.viewport || '').includes('width=device-width') ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'metadata_lang_present',
    category: 'metadata',
    description: 'HTML lang attribute declared',
    weight: 1,
    extractor: ctx => ((ctx.seoData.htmlLang || '').trim() ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'metadata_hreflang_count',
    category: 'metadata',
    description: 'Number of hreflang alternate links',
    weight: 0,
    extractor: ctx => ctx.seoData.hreflangs || 0,
    scorer: defaultScorer,
  },
  {
    id: 'headings_h1_count',
    category: 'content_structure',
    description: 'Number of H1 headings on the page',
    weight: 1,
    extractor: ctx => ctx.seoData.headings?.h1?.length || 0,
    scorer: value => value === 1,
  },
  {
    id: 'headings_h2_count',
    category: 'content_structure',
    description: 'Number of H2 headings on the page',
    weight: 1,
    extractor: ctx => ctx.seoData.headings?.h2?.length || 0,
    scorer: value => value >= 2,
  },
  {
    id: 'headings_h3_count',
    category: 'content_structure',
    description: 'Number of H3 headings on the page',
    weight: 0.5,
    extractor: ctx => ctx.seoData.headings?.h3?.length || 0,
    scorer: value => value >= 2,
  },
  {
    id: 'headings_keyword_coverage',
    category: 'content_structure',
    description: 'Keywords appearing within heading hierarchy',
    weight: 1,
    extractor: ctx => {
      const keywords = (ctx.seoData.keywords || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
      if (!keywords.length) {
        return 0;
      }
      const headingText = [
        ...(ctx.seoData.headings?.h1 || []),
        ...(ctx.seoData.headings?.h2 || []),
        ...(ctx.seoData.headings?.h3 || []),
      ]
        .join(' ')
        .toLowerCase();
      const matches = keywords.filter(keyword => headingText.includes(keyword)).length;
      return safeDivide(matches, keywords.length);
    },
    scorer: value => value >= 0.5,
  },
  {
    id: 'content_word_count',
    category: 'content_quality',
    description: 'Visible body text word count (first 50k characters)',
    weight: 1.5,
    extractor: ctx => ctx.seoData.wordCount || 0,
    scorer: value => value >= 600,
  },
  {
    id: 'content_paragraph_count',
    category: 'content_quality',
    description: 'Number of paragraph elements detected',
    weight: 0.5,
    extractor: ctx => ctx.seoData.paragraphCount || 0,
    scorer: value => value >= 5,
  },
  {
    id: 'content_readability_flesch',
    category: 'content_quality',
    description: 'Flesch Reading Ease score computed from extracted text',
    weight: 1,
    extractor: ctx => ctx.readability?.flesch || 0,
    scorer: value => value >= 50,
  },
  {
    id: 'content_sentence_length_avg',
    category: 'content_quality',
    description: 'Average sentence length in words',
    weight: 0.5,
    extractor: ctx => ctx.readability?.averageSentenceLength || 0,
    scorer: value => value <= 25,
  },
  {
    id: 'content_keyword_density',
    category: 'content_quality',
    description: 'Average keyword density across body content',
    weight: 0.5,
    extractor: ctx => {
      const keywords = (ctx.seoData.keywords || '')
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean);
      if (!keywords.length || !ctx.seoData.content) {
        return 0;
      }
      const content = ctx.seoData.content.toLowerCase();
      const wordCount = ctx.seoData.wordCount || content.split(/\s+/).filter(Boolean).length;
      if (!wordCount) {
        return 0;
      }
      let keywordOccurrences = 0;
      for (const keyword of keywords) {
        if (!keyword) {
          continue;
        }
        const occurrences = content.split(keyword).length - 1;
        keywordOccurrences += occurrences;
      }
      return Number((keywordOccurrences / wordCount).toFixed(4));
    },
    scorer: value => value >= 0.005 && value <= 0.03,
  },
  {
    id: 'media_image_count',
    category: 'media',
    description: 'Number of <img> elements',
    weight: 0.5,
    extractor: ctx => (ctx.seoData.images || []).length,
    scorer: value => value >= 3,
  },
  {
    id: 'media_image_alt_ratio',
    category: 'media',
    description: 'Ratio of images with non-empty alt text',
    weight: 1,
    extractor: ctx => {
      const images = ctx.seoData.images || [];
      if (!images.length) {
        return 0;
      }
      const withAlt = images.filter(image => (image.alt || '').trim().length > 0).length;
      return safeDivide(withAlt, images.length);
    },
    scorer: value => value >= 0.8,
  },
  {
    id: 'media_image_lazy_ratio',
    category: 'media',
    description: 'Ratio of images using lazy loading',
    weight: 0.5,
    extractor: ctx => {
      const images = ctx.seoData.images || [];
      if (!images.length) {
        return 0;
      }
      const lazy = images.filter(image => (image.loading || '').toLowerCase() === 'lazy').length;
      return safeDivide(lazy, images.length);
    },
    scorer: value => value >= 0.3,
  },
  {
    id: 'links_total',
    category: 'links',
    description: 'Total number of anchor elements',
    weight: 0.5,
    extractor: ctx => (ctx.seoData.links || []).length,
    scorer: value => value >= 20,
  },
  {
    id: 'links_internal_ratio',
    category: 'links',
    description: 'Ratio of links pointing to the same domain',
    weight: 1,
    extractor: ctx => ctx.linkStats.internalRatio,
    scorer: value => value >= 0.6,
  },
  {
    id: 'links_external_ratio',
    category: 'links',
    description: 'Ratio of links pointing to external domains',
    weight: 0.5,
    extractor: ctx => ctx.linkStats.externalRatio,
    scorer: value => value >= 0.1 && value <= 0.4,
  },
  {
    id: 'links_nofollow_ratio',
    category: 'links',
    description: 'Ratio of outbound links marked nofollow',
    weight: 0.5,
    extractor: ctx => ctx.linkStats.nofollowRatio,
    scorer: value => value <= 0.4,
  },
  {
    id: 'schemas_total',
    category: 'structured_data',
    description: 'Number of structured data script blocks detected',
    weight: 1,
    extractor: ctx => ctx.schemaStats.total,
    scorer: value => value >= 1,
  },
  {
    id: 'schemas_unique_types',
    category: 'structured_data',
    description: 'Number of unique schema.org @type values detected',
    weight: 1,
    extractor: ctx => ctx.schemaStats.uniqueTypes,
    scorer: value => value >= 1,
  },
  {
    id: 'schemas_article_present',
    category: 'structured_data',
    description: 'Article or BlogPosting schema present (binary)',
    weight: 0.5,
    extractor: ctx => (ctx.schemaStats.flags.article ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'schemas_product_present',
    category: 'structured_data',
    description: 'Product schema present (binary)',
    weight: 0.5,
    extractor: ctx => (ctx.schemaStats.flags.product ? 1 : 0),
    scorer: value => value === 1 || value === 0,
  },
  {
    id: 'schemas_faq_present',
    category: 'structured_data',
    description: 'FAQPage schema present (binary)',
    weight: 0.5,
    extractor: ctx => (ctx.schemaStats.flags.faq ? 1 : 0),
    scorer: value => value === 1 || value === 0,
  },
  {
    id: 'schemas_howto_present',
    category: 'structured_data',
    description: 'HowTo schema present (binary)',
    weight: 0.5,
    extractor: ctx => (ctx.schemaStats.flags.howto ? 1 : 0),
    scorer: value => value === 1 || value === 0,
  },
  {
    id: 'schemas_breadcrumb_present',
    category: 'structured_data',
    description: 'BreadcrumbList schema present (binary)',
    weight: 0.5,
    extractor: ctx => (ctx.schemaStats.flags.breadcrumb ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'social_open_graph_present',
    category: 'social',
    description: 'Open Graph tags present',
    weight: 0.5,
    extractor: ctx => {
      const og = ctx.seoData;
      const hasCore = og.ogTitle || og.ogDescription || og.ogImage;
      return hasCore ? 1 : 0;
    },
    scorer: value => value === 1,
  },
  {
    id: 'social_twitter_card_present',
    category: 'social',
    description: 'Twitter card tags present',
    weight: 0.5,
    extractor: ctx => (ctx.seoData.twitterCard ? 1 : 0),
    scorer: value => value === 1,
  },
  {
    id: 'performance_dom_size',
    category: 'performance',
    description: 'HTML document size in bytes',
    weight: 0.5,
    extractor: ctx => ctx.domInfo?.domSize || 0,
    scorer: value => value <= 750000,
  },
  {
    id: 'performance_dom_elements',
    category: 'performance',
    description: 'Total number of DOM elements',
    weight: 0.5,
    extractor: ctx => ctx.domInfo?.totalElements || 0,
    scorer: value => value <= 1500,
  },
  {
    id: 'performance_scripts_count',
    category: 'performance',
    description: 'Number of external script tags',
    weight: 0.5,
    extractor: ctx => ctx.domInfo?.tagCounts?.script || 0,
    scorer: value => value <= 20,
  },
  {
    id: 'performance_inline_styles',
    category: 'performance',
    description: 'Number of inline <style> blocks',
    weight: 0.5,
    extractor: ctx => ctx.seoData.inlineStyles || 0,
    scorer: value => value <= 5,
  },
  {
    id: 'performance_resource_js',
    category: 'performance',
    description: 'Number of JS resources requested during load',
    weight: 0,
    extractor: ctx => ctx.resourceStats.jsCount,
    scorer: defaultScorer,
  },
  {
    id: 'performance_resource_css',
    category: 'performance',
    description: 'Number of CSS resources requested during load',
    weight: 0,
    extractor: ctx => ctx.resourceStats.cssCount,
    scorer: defaultScorer,
  },
  {
    id: 'performance_resource_img',
    category: 'performance',
    description: 'Number of image resources requested during load',
    weight: 0,
    extractor: ctx => ctx.resourceStats.imgCount,
    scorer: defaultScorer,
  },
  {
    id: 'performance_transfer_kb',
    category: 'performance',
    description: 'Total transfer size of sampled resources (KB)',
    weight: 0.5,
    extractor: ctx => Number((ctx.resourceStats.transferBytes / 1024).toFixed(2)),
    scorer: value => value <= 1500,
  },
  {
    id: 'performance_ttfb_ms',
    category: 'performance',
    description: 'Time to first byte in milliseconds',
    weight: 0.5,
    extractor: ctx => ctx.navigationTimings.ttfb,
    scorer: value => value <= 600,
  },
  {
    id: 'performance_first_contentful_paint',
    category: 'performance',
    description: 'First Contentful Paint timing in milliseconds (if available)',
    weight: 0,
    extractor: ctx => ctx.navigationTimings.fcp,
    scorer: defaultScorer,
  },
  {
    id: 'performance_layout_duration',
    category: 'performance',
    description: 'Layout duration metric from Chrome performance API',
    weight: 0,
    extractor: ctx => ctx.metrics?.LayoutDuration || 0,
    scorer: defaultScorer,
  },
  {
    id: 'seo_score_overall',
    category: 'scores',
    description: 'Overall SEO score from crawler heuristic',
    weight: 1,
    extractor: ctx => ctx.seoScore?.overall || 0,
    scorer: value => value >= 70,
  },
  {
    id: 'seo_score_content',
    category: 'scores',
    description: 'Content focused score from crawler heuristic',
    weight: 0,
    extractor: ctx => ctx.seoScore?.content || 0,
    scorer: defaultScorer,
  },
  {
    id: 'seo_score_technical',
    category: 'scores',
    description: 'Technical SEO score from crawler heuristic',
    weight: 0,
    extractor: ctx => ctx.seoScore?.technical || 0,
    scorer: defaultScorer,
  },
  {
    id: 'seo_score_performance',
    category: 'scores',
    description: 'Performance score from crawler heuristic',
    weight: 0,
    extractor: ctx => ctx.seoScore?.performance || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_lcp',
    category: 'core_web_vitals',
    description: 'Largest Contentful Paint (ms)',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.lcp || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_cls',
    category: 'core_web_vitals',
    description: 'Cumulative Layout Shift',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.cls || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_inp',
    category: 'core_web_vitals',
    description: 'Interaction to Next Paint (ms)',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.inp || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_fid',
    category: 'core_web_vitals',
    description: 'First Input Delay (ms)',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.fid || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_ttfb',
    category: 'core_web_vitals',
    description: 'Time to First Byte (ms) from analytics',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.ttfb || 0,
    scorer: defaultScorer,
  },
  {
    id: 'core_web_vitals_fcp',
    category: 'core_web_vitals',
    description: 'First Contentful Paint (ms) from analytics',
    weight: 0,
    extractor: ctx => ctx.analytics?.coreWebVitals?.fcp || 0,
    scorer: defaultScorer,
  },
  {
    id: 'engagement_time_on_page',
    category: 'engagement',
    description: 'Average time on page (seconds)',
    weight: 0,
    extractor: ctx => ctx.analytics?.userBehavior?.timeOnPage || 0,
    scorer: defaultScorer,
  },
  {
    id: 'engagement_scroll_depth',
    category: 'engagement',
    description: 'Average scroll depth percentage',
    weight: 0,
    extractor: ctx => ctx.analytics?.userBehavior?.scrollDepth || 0,
    scorer: defaultScorer,
  },
  {
    id: 'engagement_interactions',
    category: 'engagement',
    description: 'Average interactive events per session',
    weight: 0,
    extractor: ctx => ctx.analytics?.userBehavior?.interactions || 0,
    scorer: defaultScorer,
  },
];

const FEATURE_NAMES = SEO_STAT_CATALOG.map(entry => entry.id);

export const getFeatureNames = () => FEATURE_NAMES.slice();

export const toFeatureVector = metrics =>
  FEATURE_NAMES.map(name => clampNumber(metrics?.[name] ?? 0));

const FLAG_SCHEMA_TYPES = [
  'Article',
  'BlogPosting',
  'Product',
  'FAQPage',
  'HowTo',
  'BreadcrumbList',
];

const buildSchemaStats = structuredData => {
  const schemaEntries = structuredData || [];
  const types = [];
  for (const entry of schemaEntries) {
    if (!entry) {
      continue;
    }
    const typeField = entry['@type'];
    if (Array.isArray(typeField)) {
      typeField.forEach(typeItem => types.push(String(typeItem)));
    } else if (typeof typeField === 'string') {
      types.push(typeField);
    }
  }
  const unique = dedupeArray(types.map(type => type.trim()));
  const flags = FLAG_SCHEMA_TYPES.reduce((acc, type) => {
    acc[type.toLowerCase().replace(/[^a-z]/g, '')] = unique.some(
      entry => entry.toLowerCase() === type.toLowerCase()
    );
    return acc;
  }, {});
  return {
    total: schemaEntries.length,
    uniqueTypes: unique.length,
    types: unique,
    flags,
  };
};

const buildLinkStats = (links, originHostname) => {
  if (!links || links.length === 0) {
    return {
      internalRatio: 0,
      externalRatio: 0,
      nofollowRatio: 0,
      totals: {
        internal: 0,
        external: 0,
        nofollow: 0,
      },
    };
  }
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  for (const link of links) {
    const href = link?.href;
    if (!href) {
      continue;
    }
    try {
      const url = new URL(href, `https://${originHostname}`);
      if (url.hostname === originHostname) {
        internal += 1;
      } else {
        external += 1;
      }
      const rel = (link.rel || '').toLowerCase();
      if (rel.includes('nofollow')) {
        nofollow += 1;
      }
    } catch (err) {
      continue;
    }
  }
  const total = internal + external;
  return {
    internalRatio: safeDivide(internal, total),
    externalRatio: safeDivide(external, total),
    nofollowRatio: safeDivide(nofollow, total),
    totals: { internal, external, nofollow },
  };
};

const buildResourceStats = resources => {
  const stats = {
    jsCount: 0,
    cssCount: 0,
    imgCount: 0,
    transferBytes: 0,
  };
  if (!Array.isArray(resources)) {
    return stats;
  }
  for (const resource of resources) {
    const initiator = (resource?.initiatorType || '').toLowerCase();
    if (initiator === 'script') {
      stats.jsCount += 1;
    } else if (initiator === 'link' || initiator === 'stylesheet') {
      stats.cssCount += 1;
    } else if (initiator === 'img' || initiator === 'image') {
      stats.imgCount += 1;
    }
    stats.transferBytes += resource?.transferSize || 0;
  }
  return stats;
};

const buildNavigationTimings = navigation => {
  if (!navigation) {
    return {
      ttfb: 0,
      fcp: 0,
    };
  }
  const ttfb = navigation.responseStart ? Number(navigation.responseStart.toFixed(2)) : 0;
  const fcpEntry = navigation.domContentLoadedEventEnd || navigation.responseEnd;
  const fcp = fcpEntry ? Number(fcpEntry.toFixed(2)) : 0;
  return { ttfb, fcp };
};

export function computeSeoStats(rawContext) {
  const seoData = rawContext?.seoData || {};
  const domInfo = rawContext?.domInfo || {};
  const devtoolsPayload = rawContext?.devtoolsPayload || {};
  const metrics = rawContext?.metrics || {};
  const structuredData = rawContext?.structuredData || seoData.structuredData || [];
  const resourceSummary = rawContext?.resourceSummary || devtoolsPayload.resources || [];
  const navigation = buildNavigationTimings(devtoolsPayload.navigation || {});
  const resourceStats = buildResourceStats(resourceSummary);
  const schemaStats = buildSchemaStats(structuredData);
  const textContent = seoData.content || rawContext?.textContent || '';
  const readability = calculateReadability(textContent);
  const urlHost = (() => {
    try {
      return new URL(seoData.url || rawContext?.url || '').hostname;
    } catch (err) {
      return '';
    }
  })();
  const linkStats = buildLinkStats(seoData.links || [], urlHost);

  const context = {
    ...rawContext,
    seoData,
    domInfo,
    devtoolsPayload,
    metrics,
    schemaStats,
    resourceStats,
    readability,
    navigationTimings: navigation,
    linkStats,
    analytics: rawContext?.analytics || null,
    seoScore: rawContext?.seoScore || seoData.seoScore || null,
  };

  const computedMetrics = {};
  let totalWeight = 0;
  let totalScore = 0;
  for (const stat of SEO_STAT_CATALOG) {
    const value = clampNumber(stat.extractor(context));
    computedMetrics[stat.id] = value;
    if (stat.weight) {
      const result = stat.scorer ? stat.scorer(value, context) : null;
      if (result === true) {
        totalScore += stat.weight;
        totalWeight += stat.weight;
      } else if (result === false) {
        totalWeight += stat.weight;
      }
    }
  }

  const qualityScore = totalWeight ? Number(((totalScore / totalWeight) * 100).toFixed(2)) : 0;
  const featureVector = toFeatureVector(computedMetrics);
  const schemaTypes = schemaStats.types;
  const richSnippetTargets = schemaTypes.filter(type => FLAG_SCHEMA_TYPES.includes(type));

  return {
    metrics: computedMetrics,
    featureVector,
    featureNames: getFeatureNames(),
    version: SEO_STAT_VERSION,
    qualityScore,
    schemaTypes,
    richSnippetTargets,
    schemaFlags: schemaStats.flags,
    linkTotals: linkStats.totals,
    readability,
  };
}

export { SEO_STAT_VERSION };
