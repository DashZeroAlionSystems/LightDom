#!/usr/bin/env node

/**
 * AI Research Pipeline Demo
 * 
 * Demonstrates the complete AI research pipeline:
 * 1. Scraping dev.to for AI/ML/LLM articles
 * 2. Analyzing content for actionable features
 * 3. Extracting code examples
 * 4. Generating product research papers
 * 5. Creating service packages
 * 6. Setting up continuous monitoring campaigns
 */

import { Pool } from 'pg';
import { AIResearchPipeline } from './services/ai-research-pipeline.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.cyan.bold('\n🚀 LightDom AI Research Pipeline Demo\n'));
  console.log(chalk.gray('========================================\n'));

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
    console.log(chalk.blue('📊 Connecting to database...'));
    await db.query('SELECT NOW()');
    console.log(chalk.green('✓ Database connected\n'));

    // Initialize pipeline
    console.log(chalk.blue('🔧 Initializing AI Research Pipeline...'));
    const pipeline = new AIResearchPipeline({ 
      db, 
      headless: true,
      maxConcurrent: 5,
      rateLimit: 50
    });

    await pipeline.initialize();
    console.log(chalk.green('✓ Pipeline initialized\n'));

    // Demo 1: Scrape dev.to articles
    console.log(chalk.cyan.bold('\n📚 DEMO 1: Scraping dev.to Articles\n'));
    console.log(chalk.gray('Target topics: AI, ML, LLM, NLP, Agentic AI\n'));
    
    const topics = ['ai', 'ml', 'llm', 'nlp', 'agents'];
    const articles = await pipeline.scrapeDevToArticles(topics, 25);
    
    console.log(chalk.green(`✓ Scraped ${articles.length} articles`));
    console.log(chalk.gray('\nSample articles:'));
    articles.slice(0, 5).forEach((article, i) => {
      console.log(chalk.white(`  ${i + 1}. ${article.title}`));
      console.log(chalk.gray(`     ${article.url}`));
      console.log(chalk.yellow(`     Tags: ${article.tags?.join(', ') || 'none'}\n`));
    });

    // Demo 2: Analyze articles for features
    console.log(chalk.cyan.bold('\n🔍 DEMO 2: Analyzing Articles for Features\n'));
    
    let totalFeatures = 0;
    for (const article of articles.slice(0, 10)) {
      // Get full article details
      const details = await pipeline.scrapeArticleDetails(article.url);
      if (details) {
        Object.assign(article, details);
        
        // Analyze for features
        const features = await pipeline.analyzeArticleForFeatures(article);
        totalFeatures += features.length;
        
        if (features.length > 0) {
          console.log(chalk.white(`\n📄 ${article.title}`));
          features.forEach(f => {
            console.log(chalk.green(`   ✓ ${f.feature_name}`));
            console.log(chalk.gray(`     Impact: ${f.impact_level} | Revenue: ${f.revenue_potential} | Effort: ${f.effort_estimate}`));
          });
        }
      }
    }
    
    console.log(chalk.green(`\n✓ Identified ${totalFeatures} potential features\n`));

    // Demo 3: Create research campaign
    console.log(chalk.cyan.bold('\n🎯 DEMO 3: Creating Continuous Research Campaign\n'));
    
    const campaign = await pipeline.createResearchCampaign({
      name: 'AI/ML/LLM Continuous Monitoring',
      description: 'Automated monitoring of AI, ML, and LLM content for feature opportunities',
      type: 'continuous',
      queries: [
        'artificial intelligence',
        'machine learning',
        'large language models',
        'nlp',
        'agentic ai',
        'seo automation',
        'ai agents'
      ],
      topics: ['ai', 'ml', 'llm', 'nlp', 'agents', 'seo'],
      schedule: '0 */6 * * *', // Every 6 hours
      maxArticles: 100,
      minRelevance: 0.6,
      fullScrape: true,
      extractFeatures: true
    });

    console.log(chalk.green(`✓ Campaign created: ${campaign.name}`));
    console.log(chalk.gray(`  ID: ${campaign.id}`));
    console.log(chalk.gray(`  Schedule: Every 6 hours`));
    console.log(chalk.gray(`  Topics: ${campaign.topic_filters.join(', ')}\n`));

    // Demo 4: Generate research paper
    console.log(chalk.cyan.bold('\n📝 DEMO 4: Generating Product Research Paper\n'));
    
    const paper = await pipeline.generateResearchPaper('ai-ml-integration', 30);
    
    console.log(chalk.green(`✓ Research paper generated: ${paper.title}`));
    console.log(chalk.white('\nExecutive Summary:'));
    console.log(chalk.gray(paper.executive_summary));
    console.log(chalk.white('\nKey Findings:'));
    paper.key_findings.forEach((finding, i) => {
      console.log(chalk.yellow(`  ${i + 1}. ${finding}`));
    });
    console.log(chalk.white('\nRecommendations:'));
    paper.recommendations.forEach((rec, i) => {
      console.log(chalk.cyan(`  ${i + 1}. ${rec}`));
    });

    // Demo 5: Display statistics
    console.log(chalk.cyan.bold('\n📊 DEMO 5: Pipeline Statistics\n'));
    
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM research_articles) as total_articles,
        (SELECT COUNT(*) FROM feature_recommendations) as total_features,
        (SELECT COUNT(*) FROM feature_recommendations WHERE revenue_potential = 'high') as high_revenue_features,
        (SELECT COUNT(*) FROM research_campaigns WHERE is_active = true) as active_campaigns,
        (SELECT COUNT(*) FROM research_code_examples) as total_code_examples,
        (SELECT COUNT(DISTINCT language) FROM research_code_examples) as unique_languages
    `);

    const s = stats.rows[0];
    console.log(chalk.white('Pipeline Statistics:'));
    console.log(chalk.gray(`  Total Articles: ${s.total_articles}`));
    console.log(chalk.gray(`  Total Features: ${s.total_features}`));
    console.log(chalk.yellow(`  High Revenue Features: ${s.high_revenue_features}`));
    console.log(chalk.gray(`  Active Campaigns: ${s.active_campaigns}`));
    console.log(chalk.gray(`  Code Examples: ${s.total_code_examples} (${s.unique_languages} languages)\n`));

    // Demo 6: Show monetization opportunities
    console.log(chalk.cyan.bold('\n💰 DEMO 6: Monetization Opportunities\n'));
    
    const highValueFeatures = await db.query(`
      SELECT feature_name, category, impact_level, revenue_potential, effort_estimate
      FROM feature_recommendations
      WHERE revenue_potential = 'high' AND status = 'proposed'
      ORDER BY 
        CASE impact_level WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC
      LIMIT 10
    `);

    console.log(chalk.white('Top 10 High-Revenue Features:\n'));
    highValueFeatures.rows.forEach((feature, i) => {
      console.log(chalk.green(`${i + 1}. ${feature.feature_name}`));
      console.log(chalk.gray(`   Category: ${feature.category} | Impact: ${feature.impact_level} | Effort: ${feature.effort_estimate}\n`));
    });

    // Demo 7: SEO Insights
    console.log(chalk.cyan.bold('\n🔍 DEMO 7: SEO Insights from Research\n'));
    
    const seoInsights = await db.query(`
      SELECT pattern_type, pattern_name, effectiveness_score, COUNT(*) as occurrence_count
      FROM seo_insights
      GROUP BY pattern_type, pattern_name, effectiveness_score
      ORDER BY effectiveness_score DESC, occurrence_count DESC
      LIMIT 10
    `);

    if (seoInsights.rows.length > 0) {
      console.log(chalk.white('Top SEO Patterns:\n'));
      seoInsights.rows.forEach((insight, i) => {
        const score = (insight.effectiveness_score * 100).toFixed(0);
        console.log(chalk.yellow(`${i + 1}. ${insight.pattern_name} (${insight.pattern_type})`));
        console.log(chalk.gray(`   Effectiveness: ${score}% | Occurrences: ${insight.occurrence_count}\n`));
      });
    } else {
      console.log(chalk.gray('No SEO insights available yet. Run more article analyses.\n'));
    }

    // Demo 8: Service Package Ideas
    console.log(chalk.cyan.bold('\n📦 DEMO 8: AI-Powered Service Package Ideas\n'));
    
    console.log(chalk.white('Recommended Service Packages Based on Research:\n'));
    
    const packageIdeas = [
      {
        name: 'AI SEO Automation Suite',
        tier: 'Professional',
        features: ['LLM-powered content generation', 'Automated keyword research', 'Smart meta optimization'],
        revenue: 299,
        description: 'Complete SEO automation using AI agents and LLMs'
      },
      {
        name: 'Enterprise AI Agent Platform',
        tier: 'Enterprise',
        features: ['Multi-agent orchestration', 'Custom workflow automation', 'Real-time monitoring'],
        revenue: 999,
        description: 'Advanced AI agent system for enterprise automation'
      },
      {
        name: 'Smart Web Optimization',
        tier: 'Basic',
        features: ['DOM optimization', 'Performance analysis', 'Automated recommendations'],
        revenue: 99,
        description: 'AI-powered website optimization and analysis'
      }
    ];

    packageIdeas.forEach((pkg, i) => {
      console.log(chalk.green(`${i + 1}. ${pkg.name} (${pkg.tier})`));
      console.log(chalk.cyan(`   Revenue: $${pkg.revenue}/month`));
      console.log(chalk.gray(`   ${pkg.description}`));
      console.log(chalk.white(`   Features: ${pkg.features.join(', ')}\n`));
    });

    // Summary
    console.log(chalk.cyan.bold('\n✨ Demo Complete!\n'));
    console.log(chalk.white('The AI Research Pipeline is now:'));
    console.log(chalk.green('  ✓ Scraping AI/ML/LLM articles from dev.to'));
    console.log(chalk.green('  ✓ Analyzing content for actionable features'));
    console.log(chalk.green('  ✓ Extracting code examples for reference'));
    console.log(chalk.green('  ✓ Generating product research papers'));
    console.log(chalk.green('  ✓ Identifying monetization opportunities'));
    console.log(chalk.green('  ✓ Running continuous monitoring campaigns\n'));

    console.log(chalk.white('Next Steps:'));
    console.log(chalk.yellow('  1. Review generated research papers'));
    console.log(chalk.yellow('  2. Prioritize high-revenue features'));
    console.log(chalk.yellow('  3. Implement service packages'));
    console.log(chalk.yellow('  4. Monitor campaign results'));
    console.log(chalk.yellow('  5. Iterate and improve\n'));

    console.log(chalk.white('API Endpoints Available:'));
    console.log(chalk.gray('  GET  /api/research/status'));
    console.log(chalk.gray('  POST /api/research/scrape'));
    console.log(chalk.gray('  GET  /api/research/articles'));
    console.log(chalk.gray('  GET  /api/research/features'));
    console.log(chalk.gray('  POST /api/research/campaigns'));
    console.log(chalk.gray('  POST /api/research/papers/generate'));
    console.log(chalk.gray('  GET  /api/research/dashboard\n'));

    // Cleanup
    await pipeline.cleanup();
    await db.end();

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    console.error(chalk.gray(error.stack));
    await db.end();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default main;
