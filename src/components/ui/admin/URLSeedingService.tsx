/**
 * URLSeedingService
 * 
 * Service that generates URL seeds for crawlers based on AI prompts.
 * Automatically configures schema attributes, categories, and crawler settings.
 */

import React, { useState, useCallback } from 'react';
import { Button, Input, Badge } from '@/components/ui';
import { Card as DSCard } from '../../../utils/AdvancedReusableComponents';
import { TextArea, SeedItem, TagInput, ConfigPanel, ToggleSwitch } from '@/components/ui/atoms';
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
  const [editedConfig, setEditedConfig] = useState<GeneratedConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [autoStart, setAutoStart] = useState(false);
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

  // Keep an editable copy when a generated config is present
  React.useEffect(() => {
    if (generatedConfig) {
      try {
        setEditedConfig(JSON.parse(JSON.stringify(generatedConfig)));
      } catch (e) {
        setEditedConfig(generatedConfig);
      }
    } else {
      setEditedConfig(null);
    }
    setIsEditing(false);
  }, [generatedConfig]);

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

  const startCrawling = useCallback(async (overrideConfig?: GeneratedConfig | null) => {
    const hasSeeds = (overrideConfig && overrideConfig.seeds && overrideConfig.seeds.length > 0)
      || (generatedConfig && generatedConfig.seeds && generatedConfig.seeds.length > 0)
      || (manualSeeds && manualSeeds.length > 0);
    if (!hasSeeds) return;

    try {
      // Submit crawl job to backend; allow passing an override config (edited but not saved)
      const seeds = overrideConfig
        ? overrideConfig.seeds.map(s => s.url)
        : generatedConfig
          ? generatedConfig.seeds.map(s => s.url)
          : manualSeeds;

      const response = await fetch('/api/crawler/start-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seeds,
          config: overrideConfig?.crawlerConfig || generatedConfig?.crawlerConfig || {},
          schemaKey: overrideConfig?.schemaKey || generatedConfig?.schemaKey || 'general',
          attributes: overrideConfig?.attributes || generatedConfig?.attributes || [],
        }),
      });

      const result = await response.json();
      console.log('Crawl job started:', result);

      // Reset state
      setPrompt('');
      setGeneratedConfig(null);
      setManualSeeds([]);
      setEditedConfig(null);
    } catch (error) {
      console.error('Failed to start crawl job:', error);
    }
  }, [generatedConfig, manualSeeds]);

  return (
    <div className="space-y-6">
      {/* AI Prompt Section */}
      <DSCard.Root>
        <DSCard.Header title="AI-Powered URL Seeding" />
        <DSCard.Body className="space-y-4">
          <div>
            <TextArea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Crawl top 10 SaaS landing pages and extract their pricing tables, feature lists, and testimonials for competitive analysis"
              rows={6}
              label="Describe what you want to crawl"
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
      </DSCard.Body>
      </DSCard.Root>

      {/* Generated Configuration Display */}
      {generatedConfig && (
        <DSCard.Root>
          <DSCard.Header
            title="Generated Configuration"
            action={(
              <div className="flex items-center gap-3">
                <LiveBadge variant="success" icon={<CheckCircle className="w-3 h-3" />}>Ready</LiveBadge>
                <ToggleSwitch checked={autoStart} onChange={(v) => setAutoStart(v)} />
                <Button
                  variant="outlined"
                  className="px-3 py-1 text-sm"
                  onClick={() => setIsEditing((s) => !s)}
                >
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
              </div>
            )}
          />
          <DSCard.Body className="space-y-4">
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
                // LiveCounter is a React element - cast to any so we can render animated counter inside the metric card
                value={(<LiveCounter value={generatedConfig.estimatedPages} format="compact" />) as any}
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
                {isEditing ? (
                  <TagInput
                    value={editedConfig?.attributes || []}
                    onChange={(tags) => setEditedConfig((s) => s ? { ...s, attributes: tags } : s)}
                    placeholder="Add attributes and press Enter"
                  />
                ) : (
                  (generatedConfig.attributes || []).map((attr, i) => (
                    <Badge key={i} variant="outlined">{attr}</Badge>
                  ))
                )}
              </div>
            </div>

            {/* URL Seeds List */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">URL Seeds</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedConfig.seeds.map((seed, i) => (
                  <SeedItem
                    key={i}
                    url={seed.url}
                    domain={seed.domain}
                    priority={seed.priority}
                    cadence={seed.cadence}
                  />
                ))}
              </div>
            </div>

            {/* Crawler Config */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Crawler Settings</h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {isEditing ? (
                  <div>
                    <ConfigPanel
                      value={editedConfig?.crawlerConfig}
                      onChange={(cfg) => setEditedConfig((s) => s ? { ...s, crawlerConfig: cfg } : s)}
                      title="Crawler Settings"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
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
                )}
              </div>
            </div>
          </DSCard.Body>
          <DSCard.Footer>
            {isEditing ? (
              <div className="flex gap-2 w-full">
                <Button variant="outlined" className="flex-1" onClick={() => {
                  // cancel edits
                  setEditedConfig(generatedConfig ? JSON.parse(JSON.stringify(generatedConfig)) : null);
                  setIsEditing(false);
                }}>
                  Cancel
                </Button>
                <Button variant="filled" className="flex-1" onClick={() => {
                  if (editedConfig) {
                    setGeneratedConfig(editedConfig);
                    setIsEditing(false);
                    if (autoStart) startCrawling(editedConfig);
                  }
                }}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button variant="filled" onClick={() => startCrawling(editedConfig || generatedConfig)} fullWidth>
                <Send className="w-4 h-4 mr-2" />
                Start Crawling with Configuration
              </Button>
            )}
          </DSCard.Footer>
        </DSCard.Root>
      )}

      {/* Manual Seed Entry */}
      <DSCard.Root>
        <DSCard.Header title="Manual URL Seeds" />
        <DSCard.Body className="space-y-4">
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
                <div key={i} className="flex items-center justify-between">
                  <SeedItem url={url} domain={new URL(url).hostname} />
                  <div className="ml-3">
                    <Button variant="text" size="sm" onClick={() => removeManualSeed(i)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DSCard.Body>
        {manualSeeds.length > 0 && !generatedConfig && (
          <DSCard.Footer>
            <Button variant="filled" onClick={startCrawling} fullWidth>
              Start Crawling Manual Seeds
            </Button>
          </DSCard.Footer>
        )}
      </DSCard.Root>
    </div>
  );
};

export default URLSeedingService;
