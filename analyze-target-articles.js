#!/usr/bin/env node

/**
 * Targeted Article Scraper - Process Specific Articles from Problem Statement
 * 
 * This script scrapes the specific dev.to articles mentioned in the problem statement,
 * analyzes them for product insights, and generates a comprehensive research report.
 */

import { AIResearchPipeline } from './services/ai-research-pipeline.js';
import { Pool } from 'pg';
import chalk from 'chalk';
import fs from 'fs';

// Specific articles from the problem statement
const TARGET_ARTICLES = [
  'https://dev.to/bradleymatera/how-i-actually-use-agentic-ai-tools-in-vs-code-webflow-and-aws-2kad',
  'https://dev.to/themustaphatijani/the-complete-guide-to-nlp-text-preprocessing-tokenization-normalization-stemming-lemmatization-50ap',
  'https://dev.to/arvind_sundararajan/zero-click-future-predicting-user-actions-with-ai-17gj',
  'https://dev.to/stigadikar/architecting-trust-how-ai-and-blockchain-conquer-enterprise-finance-5bh9',
  'https://dev.to/arvind_sundararajan/quantum-inspired-data-sculpting-revolutionizing-offline-reinforcement-learning-20bo',
  'https://dev.to/prend_ship_9a2d0f2b7f6c6c/the-zapier-killer-is-real-a-deep-dive-into-floworks-superior-architecture-17p2',
  'https://dev.to/arvind_sundararajan/predictive-practices-simulating-societys-rhythms-to-shape-a-better-future-by-arvind-sundararajan-2b19',
  'https://dev.to/arvind_sundararajan/data-scarce-reinforcement-learning-a-quantum-inspired-shortcut-olg',
  'https://dev.to/jaideepparashar/what-prompt-engineers-should-learn-from-designers-writers-6p7',
  'https://dev.to/varun_krishnan_1339308c02/day-2-building-speaksheet-hit-my-first-rate-limit-and-learned-why-json-schemas-are-evil-340p',
  'https://dev.to/kuldeep_paul/top-5-llm-gateways-in-2025-architecture-features-and-a-practical-selection-guide-56nh',
  'https://dev.to/jiminlee/speculative-decoding-making-llms-3x-faster-without-sacrificing-quality-315l',
  'https://dev.to/ajlaston/rendering-15-million-moving-nodes-in-the-browser-with-webgpu-8ie',
  'https://dev.to/huizhudev/why-your-swot-analysis-is-probably-useless-the-ai-template-that-changes-everything-3cng',
  'https://dev.to/alesiaalesia/top-10-ai-chat-to-app-builders-in-2025-1cd',
  'https://dev.to/oar06g/smarter-ai-agents-with-caching-building-cacheutiles-4cc0',
  'https://dev.to/kedar_dangal/how-i-built-a-full-seo-insights-chrome-extension-in-just-2-hours-using-ai-76',
  'https://dev.to/izharhaq1987/fastapi-langchain-customer-support-workflow-micro-case-study-4j4m',
  'https://dev.to/sopnonill87/building-a-smart-recommendation-system-leveraging-bert-for-skill-extraction-46ln',
  'https://dev.to/michaelaiglobal/content-mapping-as-a-state-machine-architecting-the-b2b-buyer-journey-4mn',
  'https://dev.to/techwithsam/vibe-coding-build-a-complete-app-from-scratch-in-minutes-using-github-copilot-dnc',
  'https://dev.to/arvind_sundararajan/taming-complexity-unleashing-evolutionary-algorithms-for-system-modeling-52lb',
  'https://dev.to/sonu_goswami/i-trained-4-ai-tools-on-my-work-now-they-remember-everything-i-forget-15lg',
  'https://dev.to/arvind_sundararajan/chaotic-creation-building-intelligent-networks-from-noise-by-arvind-sundararajan-1bjb',
  'https://dev.to/anidigitalhub/50-python-chatgpt-prompts-for-beginners-43ji',
  'https://dev.to/monetzly/monetzly-a-new-era-for-ai-monetization-in-llm-apps-o1h',
  'https://dev.to/arvind_sundararajan/reasoning-with-numbers-taming-the-complexity-beast-in-knowledge-graphs-by-arvind-sundararajan-2blb',
  'https://dev.to/karthik_n/level-up-your-design-system-component-libraries-with-storybook-bit-and-figma-5e3m'
];

async function main() {
  console.log(chalk.cyan.bold('\n🎯 Targeted Article Analysis - Problem Statement URLs\n'));
  console.log(chalk.gray('======================================================\n'));

  // Initialize database connection
  const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'lightdom',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  try {
    // Test database connection
    await db.query('SELECT NOW()');
    console.log(chalk.green('✓ Database connected\n'));
  } catch (error) {
    console.log(chalk.yellow('⚠️  Database not available, continuing without persistence\n'));
  }

  // Initialize pipeline
  console.log(chalk.blue('🔧 Initializing AI Research Pipeline...'));
  const pipeline = new AIResearchPipeline({ 
    db, 
    headless: true,
    maxConcurrent: 3,
    rateLimit: 30 // Slower for respectful scraping
  });

  await pipeline.initialize();
  console.log(chalk.green('✓ Pipeline initialized\n'));

  // Process each article
  console.log(chalk.cyan.bold(`📚 Processing ${TARGET_ARTICLES.length} Target Articles\n`));

  const results = {
    articles: [],
    features: [],
    codeExamples: [],
    seoInsights: [],
    errors: []
  };

  for (let i = 0; i < TARGET_ARTICLES.length; i++) {
    const url = TARGET_ARTICLES[i];
    console.log(chalk.blue(`\n[${i + 1}/${TARGET_ARTICLES.length}] Processing: ${url}`));

    try {
      // Scrape article details
      const details = await pipeline.scrapeArticleDetails(url);
      
      if (!details) {
        console.log(chalk.yellow('  ⚠️  Could not scrape article'));
        results.errors.push({ url, error: 'Failed to scrape' });
        continue;
      }

      // Extract title from URL for now
      const title = url.split('/').pop().replace(/-/g, ' ').replace(/\d+[a-z]+$/, '');
      
      const article = {
        url,
        title: title.substring(0, 100),
        ...details
      };

      console.log(chalk.white(`  Title: ${article.title}`));
      console.log(chalk.gray(`  Words: ${details.wordCount} | Code blocks: ${details.codeBlocks?.length || 0}`));

      // Store article
      results.articles.push(article);

      // Analyze for features
      const features = await pipeline.analyzeArticleForFeatures(article);
      if (features.length > 0) {
        console.log(chalk.green(`  ✓ Found ${features.length} potential features`));
        results.features.push(...features);
      }

      // Extract SEO insights
      const seoInsights = await pipeline.extractSEOInsights(article);
      if (seoInsights.length > 0) {
        console.log(chalk.cyan(`  ✓ Extracted ${seoInsights.length} SEO insights`));
        results.seoInsights.push(...seoInsights);
      }

      // Collect code examples
      if (article.codeBlocks && article.codeBlocks.length > 0) {
        console.log(chalk.magenta(`  ✓ Collected ${article.codeBlocks.length} code examples`));
        results.codeExamples.push(...article.codeBlocks.map(cb => ({ ...cb, articleUrl: url })));
      }

      // Store in database if available
      if (db) {
        await pipeline.storeArticles([article]);
        for (const feature of features) {
          await pipeline.storeFeature(feature);
        }
      }

    } catch (error) {
      console.log(chalk.red(`  ✗ Error: ${error.message}`));
      results.errors.push({ url, error: error.message });
    }

    // Small delay between articles
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate comprehensive research report
  console.log(chalk.cyan.bold('\n\n📝 Generating Comprehensive Research Report\n'));
  
  const report = generateReport(results);
  
  // Save report to file
  const reportPath = './TARGETED_ARTICLES_RESEARCH_REPORT.md';
  fs.writeFileSync(reportPath, report);
  console.log(chalk.green(`✓ Report saved to: ${reportPath}\n`));

  // Display summary
  displaySummary(results);

  // Generate research paper if database is available
  if (db && results.articles.length > 10) {
    console.log(chalk.blue('\n📄 Generating Research Paper from Collected Data...\n'));
    try {
      const paper = await pipeline.generateResearchPaper('targeted-analysis', 50);
      console.log(chalk.green(`✓ Research paper generated: ${paper.title}\n`));
    } catch (error) {
      console.log(chalk.yellow(`⚠️  Could not generate paper: ${error.message}\n`));
    }
  }

  // Cleanup
  await pipeline.cleanup();
  if (db) await db.end();

  console.log(chalk.green.bold('\n✅ Targeted Article Analysis Complete!\n'));
  console.log(chalk.white(`📊 Processed: ${results.articles.length} articles`));
  console.log(chalk.white(`💡 Identified: ${results.features.length} features`));
  console.log(chalk.white(`💻 Extracted: ${results.codeExamples.length} code examples`));
  console.log(chalk.white(`🔍 Found: ${results.seoInsights.length} SEO insights\n`));
}

function generateReport(results) {
  const now = new Date().toISOString().split('T')[0];
  
  let report = `# Targeted Articles Research Report
## Generated: ${now}

## Executive Summary

This report analyzes ${results.articles.length} specific articles from dev.to covering AI/ML/LLM topics.
The analysis identified ${results.features.length} potential product features, extracted ${results.codeExamples.length} code examples,
and discovered ${results.seoInsights.length} SEO insights.

## Articles Analyzed

`;

  results.articles.forEach((article, i) => {
    report += `### ${i + 1}. ${article.title}\n`;
    report += `- **URL**: ${article.url}\n`;
    report += `- **Word Count**: ${article.wordCount || 'N/A'}\n`;
    report += `- **Code Examples**: ${article.codeBlocks?.length || 0}\n`;
    report += `- **Reading Time**: ${article.readingTime || 'N/A'}\n\n`;
  });

  report += `\n## Key Features Identified\n\n`;

  const highValueFeatures = results.features.filter(f => 
    f.revenue_potential === 'high' || f.impact_level === 'high'
  );

  if (highValueFeatures.length > 0) {
    report += `### High-Value Features (${highValueFeatures.length})\n\n`;
    highValueFeatures.slice(0, 20).forEach((feature, i) => {
      report += `${i + 1}. **${feature.feature_name}**\n`;
      report += `   - Category: ${feature.category}\n`;
      report += `   - Impact: ${feature.impact_level}\n`;
      report += `   - Revenue Potential: ${feature.revenue_potential}\n`;
      report += `   - Effort: ${feature.effort_estimate}\n\n`;
    });
  }

  report += `\n## Code Examples by Language\n\n`;

  const languageCounts = {};
  results.codeExamples.forEach(ex => {
    languageCounts[ex.language] = (languageCounts[ex.language] || 0) + 1;
  });

  Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, count]) => {
      report += `- **${lang}**: ${count} examples\n`;
    });

  report += `\n## SEO Insights\n\n`;

  const insightsByType = {};
  results.seoInsights.forEach(insight => {
    if (!insightsByType[insight.pattern_type]) {
      insightsByType[insight.pattern_type] = [];
    }
    insightsByType[insight.pattern_type].push(insight);
  });

  Object.entries(insightsByType).forEach(([type, insights]) => {
    report += `### ${type} (${insights.length})\n`;
    insights.slice(0, 5).forEach(insight => {
      report += `- ${insight.pattern_name}: Effectiveness ${(insight.effectiveness_score * 100).toFixed(0)}%\n`;
    });
    report += `\n`;
  });

  report += `\n## Recommendations\n\n`;

  report += `Based on the analysis of these ${results.articles.length} articles, we recommend:\n\n`;
  report += `1. **Prioritize High-Impact Features**: Focus on the ${highValueFeatures.length} high-value features identified\n`;
  report += `2. **Leverage Code Examples**: Use the ${results.codeExamples.length} code examples as implementation guides\n`;
  report += `3. **Apply SEO Insights**: Implement the ${results.seoInsights.length} SEO patterns discovered\n`;
  report += `4. **Focus on Trending Topics**: AI agents, NLP, quantum-inspired algorithms, and LLM optimization\n`;
  report += `5. **Monetization Opportunities**: SEO tools, AI chat builders, caching solutions, component libraries\n\n`;

  report += `## Top Implementation Priorities\n\n`;

  const categories = {};
  results.features.forEach(f => {
    if (!categories[f.category]) {
      categories[f.category] = [];
    }
    categories[f.category].push(f);
  });

  Object.entries(categories)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([category, features]) => {
      report += `### ${category} (${features.length} features)\n`;
      const highPriority = features.filter(f => f.impact_level === 'high' || f.revenue_potential === 'high');
      if (highPriority.length > 0) {
        report += `**High Priority**: ${highPriority.length} features\n\n`;
      }
    });

  if (results.errors.length > 0) {
    report += `\n## Processing Errors\n\n`;
    results.errors.forEach(err => {
      report += `- ${err.url}: ${err.error}\n`;
    });
  }

  report += `\n## Conclusion\n\n`;
  report += `This targeted analysis provides actionable insights for product development. `;
  report += `The identified features span ${Object.keys(categories).length} categories with strong emphasis on `;
  report += `AI/ML integration, performance optimization, and developer tools.\n`;

  return report;
}

function displaySummary(results) {
  console.log(chalk.cyan.bold('\n📊 Analysis Summary\n'));
  console.log(chalk.white('Articles Processed:'));
  console.log(chalk.gray(`  Successful: ${results.articles.length}`));
  console.log(chalk.gray(`  Failed: ${results.errors.length}`));
  
  console.log(chalk.white('\nFeatures Identified:'));
  const byCategory = {};
  results.features.forEach(f => {
    byCategory[f.category] = (byCategory[f.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(chalk.gray(`  ${cat}: ${count}`));
  });

  console.log(chalk.white('\nCode Examples:'));
  const byLanguage = {};
  results.codeExamples.forEach(ex => {
    byLanguage[ex.language] = (byLanguage[ex.language] || 0) + 1;
  });
  Object.entries(byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([lang, count]) => {
      console.log(chalk.gray(`  ${lang}: ${count}`));
    });

  const highValue = results.features.filter(f => 
    f.revenue_potential === 'high' && f.impact_level === 'high'
  );
  console.log(chalk.yellow(`\n🎯 High-Value Features: ${highValue.length}`));
  
  if (highValue.length > 0) {
    console.log(chalk.white('\nTop 5 High-Value Features:'));
    highValue.slice(0, 5).forEach((f, i) => {
      console.log(chalk.green(`  ${i + 1}. ${f.feature_name}`));
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('\n❌ Error:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  });
}

export default main;
