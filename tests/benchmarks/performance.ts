/**
 * Performance Benchmarks for Headless API Workers
 * Measures throughput, latency, and resource usage
 */

import { performance } from 'perf_hooks';
import WorkerPoolManager from '../../src/services/WorkerPoolManager';
import SchemaComponentMapper from '../../src/schema/SchemaComponentMapper';
import NeuralComponentBuilder from '../../src/schema/NeuralComponentBuilder';
import SchemaServiceFactory from '../../src/services/SchemaServiceFactory';
import ServiceLinker from '../../src/services/ServiceLinker';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  throughput: number;
  memoryUsed: number;
}

class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  async runBenchmark(
    name: string,
    iterations: number,
    fn: () => Promise<void>
  ): Promise<BenchmarkResult> {
    console.log(`\n🔬 Running benchmark: ${name} (${iterations} iterations)`);

    const times: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    // Warmup
    await fn();

    // Actual benchmark
    const startTotal = performance.now();

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      times.push(end - start);

      if ((i + 1) % Math.ceil(iterations / 10) === 0) {
        process.stdout.write(`.`);
      }
    }

    const endTotal = performance.now();
    const memAfter = process.memoryUsage().heapUsed;

    const totalTime = endTotal - startTotal;
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const throughput = (iterations / totalTime) * 1000; // ops/sec
    const memoryUsed = (memAfter - memBefore) / 1024 / 1024; // MB

    const result: BenchmarkResult = {
      name,
      iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
      throughput,
      memoryUsed,
    };

    this.results.push(result);

    console.log(`\n✅ Completed`);
    console.log(`   Avg: ${avgTime.toFixed(2)}ms`);
    console.log(`   Min: ${minTime.toFixed(2)}ms`);
    console.log(`   Max: ${maxTime.toFixed(2)}ms`);
    console.log(`   Throughput: ${throughput.toFixed(2)} ops/sec`);
    console.log(`   Memory: ${memoryUsed.toFixed(2)} MB`);

    return result;
  }

  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('BENCHMARK SUMMARY');
    console.log('='.repeat(80));

    this.results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Iterations: ${result.iterations}`);
      console.log(`  Total Time: ${result.totalTime.toFixed(2)}ms`);
      console.log(`  Avg Time: ${result.avgTime.toFixed(2)}ms`);
      console.log(`  Min/Max: ${result.minTime.toFixed(2)}ms / ${result.maxTime.toFixed(2)}ms`);
      console.log(`  Throughput: ${result.throughput.toFixed(2)} ops/sec`);
      console.log(`  Memory: ${result.memoryUsed.toFixed(2)} MB`);
    });

    console.log('\n' + '='.repeat(80));
  }

  exportResults(filename: string = 'benchmark-results.json') {
    const fs = require('fs');
    const data = {
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length,
      },
      results: this.results,
    };

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n📊 Results exported to ${filename}`);
  }
}

async function main() {
  const benchmark = new PerformanceBenchmark();

  console.log('🚀 Starting Performance Benchmarks\n');
  console.log('Environment:');
  console.log(`  Node: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  CPUs: ${require('os').cpus().length}`);

  // Benchmark 1: Schema Component Mapper
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Schema Component Mapper Benchmarks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const mapper = new SchemaComponentMapper();
  await mapper.initialize();

  await benchmark.runBenchmark(
    'Component Selection',
    1000,
    async () => {
      await mapper.selectComponent('dashboard with analytics');
    }
  );

  await benchmark.runBenchmark(
    'Schema Filtering by Type',
    5000,
    async () => {
      mapper.getComponentsByType('organism');
    }
  );

  await benchmark.runBenchmark(
    'Schema Retrieval by ID',
    10000,
    async () => {
      mapper.getComponentById('lightdom:dashboard-page');
    }
  );

  // Benchmark 2: Neural Component Builder
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Neural Component Builder Benchmarks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const builder = new NeuralComponentBuilder(mapper);
  await builder.initialize();

  await benchmark.runBenchmark(
    'Component Generation',
    50,
    async () => {
      await builder.generateComponent({
        useCase: 'simple button',
        context: { typescript: true },
      });
    }
  );

  await benchmark.runBenchmark(
    'Component Validation',
    100,
    async () => {
      const component = await builder.generateComponent({
        useCase: 'button',
        context: { typescript: true },
      });
      await builder.validateComponent(component);
    }
  );

  // Benchmark 3: Service Orchestration
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Service Orchestration Benchmarks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const factory = new SchemaServiceFactory();
  await factory.initialize();

  const linker = new ServiceLinker(factory);
  await linker.initialize();

  await benchmark.runBenchmark(
    'Dependency Graph Build',
    1000,
    async () => {
      linker.buildDependencyGraph();
    }
  );

  await benchmark.runBenchmark(
    'Service Health Check',
    500,
    async () => {
      linker.getServiceHealth('lightdom:optimization-service');
    }
  );

  await benchmark.runBenchmark(
    'Service Statistics',
    2000,
    async () => {
      factory.getStatistics();
      linker.getStatistics();
    }
  );

  // Benchmark 4: Worker Pool
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Worker Pool Benchmarks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const pool = new WorkerPoolManager({
    type: 'puppeteer',
    maxWorkers: 2,
    minWorkers: 1,
    poolingStrategy: 'round-robin',
  });

  await pool.initialize();

  await benchmark.runBenchmark(
    'Task Queue Addition',
    500,
    async () => {
      await pool.addTask({
        type: 'test',
        data: { value: 'benchmark' },
        priority: 5,
      });
    }
  );

  await benchmark.runBenchmark(
    'Pool Status Retrieval',
    5000,
    async () => {
      pool.getStatus();
    }
  );

  await pool.shutdown();
  await factory.shutdown();

  // Print summary and export
  benchmark.printSummary();
  benchmark.exportResults('tests/benchmarks/benchmark-results.json');

  console.log('\n✨ All benchmarks complete!\n');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Benchmark error:', error);
  process.exit(1);
});
