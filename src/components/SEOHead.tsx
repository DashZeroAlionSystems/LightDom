/**
 * SEO Helper Component
 * Provides rich snippets, structured data, and meta tags for better search engine optimization
 */

import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  image?: string;
  url?: string;
  published?: string;
  modified?: string;
  schema?: object;
}

const SEOHead: React.FC<SEOProps> = ({
  title = 'LightDom - DOM Optimization Platform',
  description = 'Advanced DOM optimization platform with blockchain verification, real-time analytics, and AI-powered insights. Reduce page load times by up to 80%.',
  keywords = ['DOM optimization', 'web performance', 'blockchain', 'page speed', 'SEO', 'analytics', 'web optimization'],
  author = 'LightDom Team',
  type = 'website',
  image = '/og-image.png',
  url = 'https://lightdom.io',
  published,
  modified,
  schema
}) => {
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LightDom Platform',
    applicationCategory: 'DeveloperApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000'
    },
    operatingSystem: 'Web, Windows, macOS, Linux',
    description,
    url,
    author: {
      '@type': 'Organization',
      name: 'LightDom'
    },
    keywords: keywords.join(', ')
  };

  useEffect(() => {
    // Update meta tags
    document.title = title;
    
    const updateMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMeta('description', description);
    updateMeta('keywords', keywords.join(', '));
    updateMeta('author', author);
    
    // Open Graph
    updateMeta('og:type', type, true);
    updateMeta('og:url', url, true);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    
    // Twitter
    updateMeta('twitter:card', 'summary_large_image', true);
    updateMeta('twitter:url', url, true);
    updateMeta('twitter:title', title, true);
    updateMeta('twitter:description', description, true);
    updateMeta('twitter:image', image, true);
    
    // Article specific
    if (published) updateMeta('article:published_time', published, true);
    if (modified) updateMeta('article:modified_time', modified, true);
    
    // Structured data
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema || defaultSchema);
    
    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }, [title, description, keywords, author, type, image, url, published, modified, schema]);

  return null;
};

export default SEOHead;

/**
 * Generate rich snippet structured data for different content types
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'LightDom',
  url: 'https://lightdom.io',
  logo: 'https://lightdom.io/logo.png',
  description: 'Advanced DOM optimization platform with blockchain technology',
  sameAs: [
    'https://twitter.com/lightdom',
    'https://github.com/lightdom',
    'https://linkedin.com/company/lightdom'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Support',
    email: 'support@lightdom.io'
  }
});

export const generateProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  rating?: number;
  reviewCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  offers: {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: product.currency,
    availability: 'https://schema.org/InStock'
  },
  ...(product.rating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 100
    }
  })
});

export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});

export const generateHowToSchema = (howTo: {
  name: string;
  description: string;
  steps: string[];
  totalTime?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: howTo.name,
  description: howTo.description,
  ...(howTo.totalTime && { totalTime: howTo.totalTime }),
  step: howTo.steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    text: step
  }))
});
