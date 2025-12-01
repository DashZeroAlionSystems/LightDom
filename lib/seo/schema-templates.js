// Schema template helpers used by the SEO training pipeline
// Generates JSON-LD payloads for recommended structured data types

const stringifyJsonLd = payload => JSON.stringify(payload, null, 2);

const buildBaseContext = () => ({
  '@context': 'https://schema.org',
});

const buildArticleSchema = ({ title, description, url, author, publishDate }) => ({
  ...buildBaseContext(),
  '@type': 'Article',
  headline: title || '',
  description: description || '',
  mainEntityOfPage: url || '',
  author: author ? { '@type': 'Person', name: author } : undefined,
  datePublished: publishDate || undefined,
});

const buildFaqSchema = faqItems => ({
  ...buildBaseContext(),
  '@type': 'FAQPage',
  mainEntity: faqItems.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

const buildHowToSchema = steps => ({
  ...buildBaseContext(),
  '@type': 'HowTo',
  name: steps.title || '',
  step: steps.items.map((item, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: item.title,
    text: item.text,
  })),
});

const buildProductSchema = product => ({
  ...buildBaseContext(),
  '@type': 'Product',
  name: product.name || '',
  description: product.description || '',
  sku: product.sku || undefined,
  offers: product.offers || undefined,
  aggregateRating: product.aggregateRating || undefined,
});

const buildBreadcrumbSchema = trail => ({
  ...buildBaseContext(),
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

const buildSnippet = ({ type, payload, suggestions }) => ({
  type,
  jsonLd: stringifyJsonLd(payload),
  suggestions,
});

const truncateText = (text, limit) => {
  if (!text) {
    return '';
  }
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}...`;
};

const extractHeadingPairs = headings => {
  if (!headings || headings.length === 0) {
    return [];
  }
  const pairs = [];
  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    if (!current) {
      continue;
    }
    const question = truncateText(current.text || current.innerText || '', 120);
    let answer = '';
    if (next) {
      answer = truncateText(next.text || next.innerText || '', 240);
    }
    if (question && answer) {
      pairs.push({ question, answer });
    }
  }
  return pairs.slice(0, 6);
};

export function buildSchemaSnippets(input) {
  const {
    schemaTypes,
    url,
    title,
    description,
    author,
    publishDate,
    headings = [],
    breadcrumbTrail = [],
    product = null,
  } = input;

  const uniqueTypes = Array.isArray(schemaTypes) ? Array.from(new Set(schemaTypes)) : [];
  const snippets = [];
  const suggestions = [];

  if (uniqueTypes.includes('Article') || uniqueTypes.includes('BlogPosting')) {
    const payload = buildArticleSchema({ title, description, url, author, publishDate });
    snippets.push(
      buildSnippet({
        type: 'Article',
        payload,
        suggestions: [
          'Validate headline length between 50-110 characters',
          'Ensure article has a visible author and publish date',
        ],
      })
    );
  }

  if (uniqueTypes.includes('FAQPage')) {
    const faqPairs = extractHeadingPairs(headings);
    if (faqPairs.length) {
      const payload = buildFaqSchema(faqPairs);
      snippets.push(
        buildSnippet({
          type: 'FAQPage',
          payload,
          suggestions: [
            'Ensure FAQ content answers user intent concisely',
            'Mark up at least three question and answer pairs',
          ],
        })
      );
    } else {
      suggestions.push('Consider drafting FAQ content based on H2/H3 questions for FAQPage schema');
    }
  }

  if (uniqueTypes.includes('HowTo')) {
    const howToSteps = headings
      .slice(0, 6)
      .map(entry => ({
        title: truncateText(entry.text || entry.innerText || '', 90),
        text: truncateText(entry.followingParagraph || '', 240),
      }))
      .filter(item => item.title && item.text);
    if (howToSteps.length) {
      const payload = buildHowToSchema({ items: howToSteps, title: truncateText(title, 160) });
      snippets.push(
        buildSnippet({
          type: 'HowTo',
          payload,
          suggestions: ['Add images for each how-to step when available'],
        })
      );
    } else {
      suggestions.push('Outline clear procedural steps to unlock HowTo rich results');
    }
  }

  if (uniqueTypes.includes('Product')) {
    const payload = buildProductSchema(product || {});
    snippets.push(
      buildSnippet({
        type: 'Product',
        payload,
        suggestions: [
          'Include offers with priceCurrency and price',
          'Add aggregateRating with ratingValue and reviewCount',
        ],
      })
    );
  }

  if (uniqueTypes.includes('BreadcrumbList')) {
    if (breadcrumbTrail.length) {
      const payload = buildBreadcrumbSchema(breadcrumbTrail.slice(0, 6));
      snippets.push(
        buildSnippet({
          type: 'BreadcrumbList',
          payload,
          suggestions: ['Ensure breadcrumb navigation matches on-page hierarchy'],
        })
      );
    } else {
      suggestions.push('Implement breadcrumb navigation to qualify for BreadcrumbList schema');
    }
  }

  if (!snippets.length) {
    suggestions.push(
      'No schema templates generated; collect training data or run schema suggester models'
    );
  }

  return {
    snippets,
    suggestions,
  };
}
