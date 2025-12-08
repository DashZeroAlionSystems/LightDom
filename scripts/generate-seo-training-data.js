#!/usr/bin/env node
/**
 * CLI tool to generate SEO training datasets from crawled attributes
 * Usage: node scripts/generate-seo-training-data.js [options]
 */

import { program } from 'commander';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { SEOTrainingPipeline } from '../services/seo-training-pipeline.js';

program
  .name('generate-seo-training-data')
  .description('Generate ML training datasets from SEO attributes')
  .option('-n, --name <name>', 'Dataset name', `seo_training_${Date.now()}`)
  .option('--min-score <score>', 'Minimum overall score filter', '0')
  .option('--max-score <score>', 'Maximum overall score filter', '100')
  .option('--hostname <hostnames...>', 'Filter by hostnames')
  .option('--limit <limit>', 'Maximum samples', '10000')
  .option('--output <path>', 'Output directory for JSONL files', './training_data')
  .option('--format <format>', 'Output format: jsonl, csv, tfrecord', 'jsonl')
  .parse();

const options = program.opts();

async function main() {
  console.log('📊 SEO Training Data Generator');
  console.log('━'.repeat(50));

  const pipeline = new SEOTrainingPipeline({
    logger: console,
  });

  try {
    // Generate dataset
    console.log(`\n🔄 Generating dataset: ${options.name}`);
    console.log(`   Min score: ${options.minScore}`);
    console.log(`   Max score: ${options.maxScore}`);
    console.log(`   Limit: ${options.limit}`);
    if (options.hostname) {
      console.log(`   Hostnames: ${options.hostname.join(', ')}`);
    }

    const result = await pipeline.generateTrainingDataset({
      datasetName: options.name,
      minScore: parseFloat(options.minScore),
      maxScore: parseFloat(options.maxScore),
      hostnameFilter: options.hostname || null,
      limit: parseInt(options.limit, 10),
    });

    console.log(`\n✅ Dataset generated successfully!`);
    console.log(`   Dataset ID: ${result.datasetId}`);
    console.log(`   Total samples: ${result.sampleCount}`);
    console.log(`   Train samples: ${result.trainTestSplit.train.features.length}`);
    console.log(`   Test samples: ${result.trainTestSplit.test.features.length}`);

    // Export to files
    const outputDir = path.resolve(options.output);
    await fs.mkdir(outputDir, { recursive: true });

    if (options.format === 'jsonl') {
      // Export train set
      const trainPath = path.join(outputDir, `${options.name}_train.jsonl`);
      const trainLines = result.trainTestSplit.train.features.map((features, i) => {
        const labels = result.trainTestSplit.train.labels[i];
        return JSON.stringify({ features, labels });
      });
      await fs.writeFile(trainPath, trainLines.join('\n'));
      console.log(`   📄 Train set: ${trainPath}`);

      // Export test set
      const testPath = path.join(outputDir, `${options.name}_test.jsonl`);
      const testLines = result.trainTestSplit.test.features.map((features, i) => {
        const labels = result.trainTestSplit.test.labels[i];
        return JSON.stringify({ features, labels });
      });
      await fs.writeFile(testPath, testLines.join('\n'));
      console.log(`   📄 Test set: ${testPath}`);
    } else if (options.format === 'csv') {
      // Export as CSV
      const trainPath = path.join(outputDir, `${options.name}_train.csv`);
      const testPath = path.join(outputDir, `${options.name}_test.csv`);

      const toCSV = (features, labels) => {
        const header = [...Object.keys(features[0]), ...Object.keys(labels[0])].join(',');
        const rows = features.map((f, i) => {
          const l = labels[i];
          const values = [...Object.values(f), ...Object.values(l)];
          return values.join(',');
        });
        return [header, ...rows].join('\n');
      };

      await fs.writeFile(
        trainPath,
        toCSV(result.trainTestSplit.train.features, result.trainTestSplit.train.labels)
      );
      await fs.writeFile(
        testPath,
        toCSV(result.trainTestSplit.test.features, result.trainTestSplit.test.labels)
      );

      console.log(`   📄 Train set: ${trainPath}`);
      console.log(`   📄 Test set: ${testPath}`);
    } else {
      console.warn(`   ⚠️  Format ${options.format} not yet implemented. Use jsonl or csv.`);
    }

    console.log('\n✨ Training data ready for TensorFlow/PyTorch!');
  } catch (error) {
    console.error('\n❌ Error generating training data:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pipeline.close();
  }
}

main();
