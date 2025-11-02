/**
 * URLSeedingService
 * 
 * Service that generates URL seeds for crawlers based on AI prompts.
 * Automatically configures schema attributes, categories, and crawler settings.
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge
} from '@/components/ui';
import {
  LiveStatusIndicator,
  LiveMetricCard
} from '@/components/ui/atoms/LiveStatusIndicator';
import {
  LiveBadge,
  LiveCounter
} from '@/components/ui/atoms/LiveDataDisplay';
import { Sparkles, Plus, Trash2, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface URLSeed {
  url: string;
  domain: string;
  priority: number;
  cadence: 'hourly' | 'daily' | 'weekly' | 'monthly';
  tags: string[];
  schemaAttributes: string[];
}

interface CrawlerConfig {
  parallelCrawlers: number;
  maxDepth: number;
  respectRobotsTxt: boolean;
  rateLimit: number;
  timeout: number;
}

interface GeneratedConfig {
  seeds: URLSeed[];
  crawlerConfig: CrawlerConfig;
  schemaKey: string;
  attributes: string[];
  categories: string[];
  estimatedPages: number;
  estimatedTime: string;
}

export const URLSeedingService: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [manualSeeds, setManualSeeds] = useState<string[]>([]);
  const [newSeedUrl, setNewSeedUrl] = useState('');

  const generateFromPrompt = useCallback(async () => {
    if (!prompt.trim()) return;

    setGenerating(true);
    try {
      // Call AI service to generate configuration
      const response = await fetch('/api/crawler/generate-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      // Transform AI response to configuration
      const config: GeneratedConfig = {
        seeds: data.seeds || [],
        crawlerConfig: {
          parallelCrawlers: data.parallelCrawlers || 3,
          maxDepth: data.maxDepth || 3,
          respectRobotsTxt: true,
          rateLimit: data.rateLimit || 10,
          timeout: data.timeout || 30000,
        },
        schemaKey: data.schemaKey || 'seo-content',
        attributes: data.attributes || [],
        categories: data.categories || [],
        estimatedPages: data.estimatedPages || 1000,
        estimatedTime: data.estimatedTime || '2 hours',
      };

      setGeneratedConfig(config);
    } catch (error) {
      console.error('Failed to generate config:', error);
    } finally {
      setGenerating(false);
    }
  }, [prompt]);

  const addManualSeed = useCallback(() => {
    if (!newSeedUrl.trim()) return;
    
    try {
      const url = new URL(newSeedUrl);
      setManualSeeds(prev => [...prev, url.href]);
      setNewSeedUrl('');
    } catch (error) {
      console.error('Invalid URL:', error);
    }
  }, [newSeedUrl]);

  const removeManualSeed = useCallback((index: number) => {
    setManualSeeds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const startCrawling = useCallback(async () => {
    if (!generatedConfig && manualSeeds.length === 0) return;

    try {
      // Submit crawl job to backend
      const seeds = generatedConfig 
        ? generatedConfig.seeds.map(s => s.url)
        : manualSeeds;

      const response = await fetch('/api/crawler/start-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seeds,
          config: generatedConfig?.crawlerConfig || {},
          schemaKey: generatedConfig?.schemaKey || 'general',
          attributes: generatedConfig?.attributes || [],
        }),
      });

      const result = await response.json();
      console.log('Crawl job started:', result);
      
      // Reset state
      setPrompt('');
      setGeneratedConfig(null);
      setManualSeeds([]);
    } catch (error) {
      console.error('Failed to start crawl job:', error);
    }
  }, [generatedConfig, manualSeeds]);

  return (
    <div className="space-y-6">
      {/* AI Prompt Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI-Powered URL Seeding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to crawl
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Crawl top 10 SaaS landing pages and extract their pricing tables, feature lists, and testimonials for competitive analysis"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={generating}
            />
          </div>
          <Button
            variant="filled"
            onClick={generateFromPrompt}
            disabled={!prompt.trim() || generating}
            fullWidth
          >
            {generating ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Generating Configuration...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Crawler Configuration
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Configuration Display */}
      {generatedConfig && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Configuration</span>
              <LiveBadge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                Ready
              </LiveBadge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <LiveMetricCard
                label="URL Seeds"
                value={generatedConfig.seeds.length}
                icon={<Send className="w-4 h-4" />}
              />
              <LiveMetricCard
                label="Crawlers"
                value={generatedConfig.crawlerConfig.parallelCrawlers}
                icon={<Sparkles className="w-4 h-4" />}
              />
              <LiveMetricCard
                label="Est. Pages"
                value={<LiveCounter value={generatedConfig.estimatedPages} format="compact" />}
                icon={<CheckCircle className="w-4 h-4" />}
              />
              <LiveMetricCard
                label="Est. Time"
                value={generatedConfig.estimatedTime}
                icon={<AlertCircle className="w-4 h-4" />}
              />
            </div>

            {/* Schema & Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Schema</h4>
                <LiveBadge variant="primary" size="lg">
                  {generatedConfig.schemaKey}
                </LiveBadge>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedConfig.categories.map((cat, i) => (
                    <LiveBadge key={i} variant="info">
                      {cat}
                    </LiveBadge>
                  ))}
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Attributes to Extract</h4>
              <div className="flex flex-wrap gap-2">
                {generatedConfig.attributes.map((attr, i) => (
                  <Badge key={i} variant="outlined">
                    {attr}
                  </Badge>
                ))}
              </div>
            </div>

            {/* URL Seeds List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">URL Seeds</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedConfig.seeds.map((seed, i) => (
                  <div
                    key={i}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {seed.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <LiveBadge variant="default" size="sm">
                          {seed.domain}
                        </LiveBadge>
                        <LiveBadge 
                          variant={seed.priority > 7 ? 'error' : seed.priority > 4 ? 'warning' : 'success'} 
                          size="sm"
                        >
                          P{seed.priority}
                        </LiveBadge>
                        <LiveBadge variant="info" size="sm">
                          {seed.cadence}
                        </LiveBadge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Crawler Config */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Crawler Settings</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Depth:</span>
                  <span className="font-medium">{generatedConfig.crawlerConfig.maxDepth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate Limit:</span>
                  <span className="font-medium">{generatedConfig.crawlerConfig.rateLimit}/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeout:</span>
                  <span className="font-medium">{generatedConfig.crawlerConfig.timeout}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Robots.txt:</span>
                  <span className="font-medium">
                    {generatedConfig.crawlerConfig.respectRobotsTxt ? 'Respect' : 'Ignore'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="filled" onClick={startCrawling} fullWidth>
              <Send className="w-4 h-4 mr-2" />
              Start Crawling with Configuration
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Manual Seed Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Manual URL Seeds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSeedUrl}
              onChange={(e) => setNewSeedUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === 'Enter' && addManualSeed()}
            />
            <Button variant="outlined" onClick={addManualSeed}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {manualSeeds.length > 0 && (
            <div className="space-y-2">
              {manualSeeds.map((url, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <span className="text-sm truncate flex-1">{url}</span>
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => removeManualSeed(i)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {manualSeeds.length > 0 && !generatedConfig && (
          <CardFooter>
            <Button variant="filled" onClick={startCrawling} fullWidth>
              Start Crawling Manual Seeds
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default URLSeedingService;
