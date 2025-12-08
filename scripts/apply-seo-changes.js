// Node script to write migration + new files and patch two existing files.
// Run as: node scripts/apply-seo-changes.js
import fs from 'fs/promises';
import path from 'path';

const root = process.cwd();
function join(...parts){ return path.join(root, ...parts); }
async function ensureDir(filePath){
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}
async function backupIfExists(filePath){
  try {
    await fs.access(filePath);
    const stat = await fs.stat(filePath);
    const bak = filePath + '.bak.' + Date.now();
    await fs.copyFile(filePath, bak);
    console.log('Backed up', filePath, '->', bak);
  } catch(e) {
    // doesn't exist -> nothing to back up
  }
}

async function writeSafe(filePath, content){
  await ensureDir(filePath);
  await backupIfExists(filePath);
  await fs.writeFile(filePath, content, 'utf8');
  console.log('Wrote', filePath);
}

// 1) migration SQL
const migrationPath = join('database','migrations','2025-11-25-add-seo-columns-to-crawled-sites.sql');
const migrationSQL = `BEGIN;

ALTER TABLE crawled_sites
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS robots_meta TEXT,
  ADD COLUMN IF NOT EXISTS og_title TEXT,
  ADD COLUMN IF NOT EXISTS og_description TEXT,
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS og_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_card TEXT,
  ADD COLUMN IF NOT EXISTS twitter_title TEXT,
  ADD COLUMN IF NOT EXISTS twitter_description TEXT,
  ADD COLUMN IF NOT EXISTS twitter_image TEXT,
  ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS headings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_analysis JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scripts JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS stylesheets JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS inline_styles JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_crawled_sites_title ON crawled_sites USING gin (coalesce(title,'') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_crawled_sites_keywords ON crawled_sites USING gin (keywords);
CREATE INDEX IF NOT EXISTS idx_crawled_sites_structured_data ON crawled_sites USING gin (structured_data);

COMMIT;
`;

// 2) SEO enrichment service (TypeScript source)
const seoServicePath = join('src','services','SEOEnrichmentService.ts');
const seoServiceTS = `/**
 * SEOEnrichmentService
 * Attempts to enrich missing SEO attributes for crawled_sites rows using:
 *  - Enhanced Web Crawler (AI) via ServiceHub (if available)
 *  - Fallback to WebCrawlerService crawl + result polling
 *  - Fallback to SEOCrawler (simple axios/cheerio crawler)
 */

import { databaseIntegration } from './DatabaseIntegration';
import { serviceHub } from './ServiceHub';
import { seoCrawler } from './SEOCrawler';
import { crawlerPersistence } from './CrawlerPersistenceService';

export class SEOEnrichmentService {
  async enrichSiteById(siteId: string, opts: { useAI?: boolean, timeoutMs?: number } = {}) {
    await databaseIntegration.initialize();
    const q = await databaseIntegration.query('SELECT * FROM crawled_sites WHERE id = $1', [siteId]);
    if (!q || !q.rows || q.rows.length === 0) {
      throw new Error('Site not found: ' + siteId);
    }
    const row = q.rows[0];
    const url = row.url;
    const metadata = row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : {};
    const missing = !metadata.title || !metadata.description || !(metadata.ogTags && Object.keys(metadata.ogTags || {}).length);

    // If nothing missing and not forced, return
    if (!missing && !opts.useAI) return row;

    // Try web crawler via ServiceHub
    let extracted: any = null;
    try {
      const webCrawler: any = serviceHub.getWebCrawler?.() || (serviceHub as any).webCrawler;
      if (webCrawler && typeof webCrawler.crawlWebsiteWithAI === 'function' && opts.useAI) {
        const res = await webCrawler.crawlWebsiteWithAI(url, { useAI: true, extractWithAI: true, extractData: ['html','head','meta','script','link','img'], timeout: opts.timeoutMs || 30000 });
        extracted = res.extractedData || res.websiteData || res.aiResult;
      } else if (webCrawler && typeof webCrawler.crawlWebsite === 'function') {
        const crawlId = await webCrawler.crawlWebsite(url, { waitUntil: 'networkidle2', timeout: opts.timeoutMs || 30000 });
        const deadline = Date.now() + (opts.timeoutMs || 30000);
        while (Date.now() < deadline) {
          const res = await webCrawler.getCrawlResult(crawlId).catch(()=>null);
          if (res) { extracted = res.websiteData || res.extractedData || res; break; }
          await new Promise(r=>setTimeout(r, 1000));
        }
      }
    } catch (err) {
      console.warn('Enhanced/webcrawler enrichment failed, falling back to SEOCrawler:', err?.message || err);
      extracted = null;
    }

    // Fallback simple SEOCrawler
    if (!extracted) {
      try {
        const seoResult = await seoCrawler.crawlUrl(url);
        extracted = {
          title: seoResult.title,
          description: seoResult.description,
          keywords: seoResult.keywords,
          links: { internal: seoResult.links || [], external: [] },
          images: seoResult.images || [],
          headings: { h1: seoResult.h1Tags || [], h2: seoResult.h2Tags || [] },
          performance: { loadTime: seoResult.loadTime },
          content: { wordCount: seoResult.wordCount }
        };
      } catch (err) {
        console.error('SEOCrawler fallback failed:', err);
        throw new Error('All enrichment attempts failed for ' + url);
      }
    }

    const newMetadata = {
      ...metadata,
      title: metadata.title || extracted.title || '',
      description: metadata.description || extracted.description || '',
      keywords: metadata.keywords || extracted.keywords || [],
      ogTags: { ...(metadata.ogTags || {}), ...(extracted.ogTags || { title: extracted.ogTitle, description: extracted.ogDescription, image: extracted.ogImage }) },
      twitter: { ...(metadata.twitter || {}), ...(extracted.twitter || {}) },
      structuredData: metadata.structuredData || extracted.structuredData || [],
      links: metadata.links || extracted.links || {},
      images: metadata.images || extracted.images || [],
      scripts: metadata.scripts || extracted.scripts || [],
      stylesheets: metadata.stylesheets || extracted.stylesheets || [],
      performance: metadata.performance || extracted.performance || {}
    };

    const updatedSite: any = {
      id: row.id,
      url: row.url,
      domain: row.domain,
      lastCrawled: new Date(),
      crawlFrequency: row.crawl_frequency || 24,
      priority: row.priority || 5,
      seoScore: row.seo_score || 0,
      optimizationPotential: row.optimization_potential || 0,
      currentSize: row.current_size || 0,
      optimizedSize: row.optimized_size || 0,
      spaceReclaimed: row.space_reclaimed || 0,
      blockchainRecorded: row.blockchain_recorded || false,

      title: newMetadata.title,
      description: newMetadata.description,
      keywords: newMetadata.keywords,
      canonicalUrl: newMetadata.canonical || newMetadata.canonicalUrl || null,
      robotsMeta: newMetadata.robots || null,

      ogTitle: newMetadata.ogTags?.title || null,
      ogDescription: newMetadata.ogTags?.description || null,
      ogImage: newMetadata.ogTags?.image || null,
      ogUrl: newMetadata.ogTags?.url || row.url,

      twitterCard: (newMetadata.twitter && newMetadata.twitter.card) || null,
      twitterTitle: (newMetadata.twitter && newMetadata.twitter.title) || null,
      twitterDescription: (newMetadata.twitter && newMetadata.twitter.description) || null,
      twitterImage: (newMetadata.twitter && newMetadata.twitter.image) || null,

      structuredData: newMetadata.structuredData || [],
      headings: newMetadata.headings || {},
      contentAnalysis: newMetadata.content || {},
      links: newMetadata.links || {},
      images: newMetadata.images || [],
      scripts: newMetadata.scripts || [],
      stylesheets: newMetadata.stylesheets || [],
      inlineStyles: newMetadata.inlineStyles || {},

      metadata: newMetadata
    };

    // Persist via existing persistence API
    await crawlerPersistence.recordCrawledSite(updatedSite as any);

    const reloaded = await databaseIntegration.query('SELECT * FROM crawled_sites WHERE id = $1', [siteId]);
    return reloaded.rows[0];
  }

  async enrichMissingFieldsBatch(limit = 50) {
    await databaseIntegration.initialize();
    const rows = await databaseIntegration.query(\`
      SELECT id FROM crawled_sites
      WHERE (coalesce(title,'') = '' OR coalesce(description,'') = '' OR coalesce(metadata::text,'') NOT ILIKE '%ogTags%')
      ORDER BY last_crawled ASC
      LIMIT $1
    \`, [limit]);
    for (const r of rows.rows) {
      try {
        await this.enrichSiteById(r.id, { useAI: false, timeoutMs: 25000 });
      } catch (err) {
        console.warn('Enrichment failed for', r.id, err?.message || err);
      }
    }
  }
}

export const seoEnrichmentService = new SEOEnrichmentService();
`;

// 3) frontend status panel (React + AntD)
const statusPanelPath = join('frontend','src','components','ServiceStatusPanel.jsx');
const statusPanelJSX = `// filepath: frontend/src/components/ServiceStatusPanel.jsx
import React, { useEffect, useState } from 'react';
import { Card, Tag, List, Typography, Button, Modal } from 'antd';

const { Text } = Typography;
function statusColor(status){
  if (!status) return 'default';
  if (status.isRunning === true || (status.activeCrawls && status.activeCrawls > 0)) return 'green';
  if (status.isRunning === false && (status.queueStatus && status.queueStatus.waiting > 0)) return 'orange';
  if (status?.lastError) return 'red';
  return 'default';
}

export default function ServiceStatusPanel(){
  const [services, setServices] = useState({});
  const [modal, setModal] = useState({ visible: false, content: '' });

  async function fetchStatuses(){
    try {
      const res = await fetch('/api/system/services');
      const json = await res.json();
      if (json.success) setServices(json.data || {});
    } catch (err) {
      console.warn('Failed to fetch service statuses', err);
    }
  }

  useEffect(()=>{
    fetchStatuses();
    const t = setInterval(fetchStatuses, 5000);
    // optional socket.io live updates
    if (window && window.io) {
      try {
        const s = window.io();
        s.on('serviceStatus', data => setServices(data));
      } catch(e){}
    }
    return ()=>clearInterval(t);
  }, []);

  return (
    <Card title="System Services" style={{ marginBottom: 16 }}>
      <List
        dataSource={Object.keys(services)}
        renderItem={(key) => {
          const s = services[key];
          const color = statusColor(s);
          const statusText = s?.isRunning ? 'running' : s?.status || (s ? 'idle' : 'unavailable');
          return (
            <List.Item actions={[<Button key="view" size="small" onClick={()=>setModal({ visible:true, content: JSON.stringify(s, null, 2) })}>View</Button>]}>
              <List.Item.Meta
                title={<span><Text strong>{key}</Text> <Tag color={color}>{statusText}</Tag></span>}
                description={<div style={{ fontSize:12, color:'#666' }}>{s?.activeCrawls ? ('Active: ' + s.activeCrawls) : ''}{s?.queueStatus ? (' Queue wait: ' + (s.queueStatus.waiting ?? 0)) : ''}</div>}
              />
            </List.Item>
          );
        }}
      />
      <Modal title="Service details" visible={modal.visible} onCancel={()=>setModal({ visible:false, content:'' })} footer={null}>
        <pre>{modal.content}</pre>
      </Modal>
    </Card>
  );
}
`;

// 4) pm2 ecosystem config
const ecosystemPath = join('ecosystem.config.js');
const ecosystemJS = `module.exports = {
  apps: [
    {
      name: 'lightdom-api',
      script: 'api-server-express.js',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '600M'
    }
  ]
};
`;

// 5) Windows scheduled task helper
const windowsPS = `# filepath: scripts/create-windows-startup-task.ps1
param(
  [string]$TaskName = "LightDom API",
  [string]$NodePath = "C:\\Program Files\\nodejs\\node.exe",
  [string]$AppPath = "$PWD\\api-server-express.js"
)

$action = New-ScheduledTaskAction -Execute $NodePath -Argument $AppPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\\SYSTEM" -RunLevel Highest
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Description "Start LightDom API at system boot"
Write-Host "Scheduled Task created: $TaskName"
`;

// 6) Persist method replacement content for CrawlerPersistenceService
const newPersistMethod = `
  private async persistSite(site: CrawledSite) {
    try {
      await databaseIntegration.query(
        \`INSERT INTO crawled_sites (
          id, url, domain, last_crawled, crawl_frequency, priority,
          seo_score, optimization_potential, current_size, optimized_size,
          space_reclaimed, blockchain_recorded, transaction_hash,
          metaverse_slot_id,
          title, description, keywords, canonical_url, robots_meta,
          og_title, og_description, og_image, og_url,
          twitter_card, twitter_title, twitter_description, twitter_image,
          structured_data, headings, content_analysis, links, images,
          scripts, stylesheets, inline_styles, metadata
        ) VALUES (
          $1,$2,$3,$4,$5,$6,
          $7,$8,$9,$10,
          $11,$12,$13,$14,
          $15,$16,$17,$18,$19,
          $20,$21,$22,$23,
          $24,$25,$26,$27,
          $28,$29,$30,$31,$32,
          $33,$34,$35,$36
        )
        ON CONFLICT (id) DO UPDATE SET
          last_crawled = $4, crawl_frequency = $5, priority = $6,
          seo_score = $7, optimization_potential = $8, current_size = $9,
          optimized_size = $10, space_reclaimed = $11,
          blockchain_recorded = $12, transaction_hash = $13,
          metaverse_slot_id = $14,
          title = $15, description = $16, keywords = $17, canonical_url = $18, robots_meta = $19,
          og_title = $20, og_description = $21, og_image = $22, og_url = $23,
          twitter_card = $24, twitter_title = $25, twitter_description = $26, twitter_image = $27,
          structured_data = $28, headings = $29, content_analysis = $30, links = $31, images = $32,
          scripts = $33, stylesheets = $34, inline_styles = $35, metadata = $36\`,
        [
          site.id,
          site.url,
          site.domain,
          site.lastCrawled,
          site.crawlFrequency,
          site.priority,
          site.seoScore,
          site.optimizationPotential,
          site.currentSize,
          site.optimizedSize,
          site.spaceReclaimed,
          site.blockchainRecorded,
          site.transactionHash || null,
          site.metaverseSlotId || null,

          site.title ?? site.metadata?.title ?? null,
          site.description ?? site.metadata?.description ?? null,
          site.keywords ?? site.metadata?.keywords ?? [],
          site.canonicalUrl ?? site.metadata?.seo?.canonicalUrl ?? null,
          site.robotsMeta ?? site.metadata?.seo?.robots ?? null,

          site.ogTitle ?? site.metadata?.ogTags?.title ?? null,
          site.ogDescription ?? site.metadata?.ogTags?.description ?? null,
          site.ogImage ?? site.metadata?.ogTags?.image ?? null,
          site.ogUrl ?? site.url,

          site.twitterCard ?? site.metadata?.twitter?.card ?? null,
          site.twitterTitle ?? site.metadata?.twitter?.title ?? null,
          site.twitterDescription ?? site.metadata?.twitter?.description ?? null,
          site.twitterImage ?? site.metadata?.twitter?.image ?? null,

          JSON.stringify(site.structuredData ?? site.metadata?.structuredData ?? []),
          JSON.stringify(site.headings ?? { h1: site.metadata?.seo?.h1Count || 0 }),
          JSON.stringify(site.contentAnalysis ?? {}),
          JSON.stringify(site.links ?? site.metadata?.links ?? {}),
          JSON.stringify(site.images ?? site.metadata?.images ?? []),
          JSON.stringify(site.scripts ?? site.metadata?.scripts ?? []),
          JSON.stringify(site.stylesheets ?? site.metadata?.stylesheets ?? []),
          JSON.stringify(site.inlineStyles ?? {}),
          JSON.stringify(site.metadata ?? {})
        ]
      );
    } catch (error) {
      console.error('Failed to persist site:', error);
    }
  }
`;

// 7) api-server-express.js insert blocks
const serviceHubInitBlock = `
// ---- SERVICEHUB INIT (inserted by apply-seo-changes) ----
      try {
        const { serviceHub } = await import('./src/services/ServiceHub.js');
        console.log('🔧 Initializing ServiceHub (web crawler, background workers, monitor)...');
        await serviceHub.initialize();
        console.log('✅ ServiceHub ready');

        const broadcastStatuses = async () => {
          try {
            const webCrawler = serviceHub.getWebCrawler?.() || (serviceHub as any).webCrawler;
            const status = {
              webCrawler: webCrawler ? (webCrawler.getStatus ? webCrawler.getStatus() : { isRunning: true }) : null,
              enhancedCrawler: webCrawler && webCrawler.getEnhancedStatus ? webCrawler.getEnhancedStatus() : null,
              backgroundWorker: serviceHub.backgroundWorker?.getStatus ? serviceHub.backgroundWorker.getStatus() : null,
              monitoring: serviceHub.monitoring?.getStatus ? serviceHub.monitoring.getStatus() : null,
              db: this.db ? { connected: true } : { connected: false }
            };
            this.io.emit('serviceStatus', status);
          } catch (err) {
            console.warn('Failed to broadcast service status:', err?.message || err);
          }
        };
        await broadcastStatuses();
        setInterval(broadcastStatuses, 5000);
      } catch (err) {
        console.warn('⚠️ ServiceHub initialization failed at server start:', err?.message || err);
      }
// ---- END SERVICEHUB INIT ----
`;

const enrichmentEndpointsBlock = `
// ---- SEO ENRICHMENT & SERVICE STATUS ENDPOINTS (added by apply-seo-changes) ----
    this.app.get('/api/system/services', async (req, res) => {
      try {
        const { serviceHub } = await import('./src/services/ServiceHub.js');
        const webCrawler = serviceHub.getWebCrawler?.() || (serviceHub as any).webCrawler;
        const result = {
          webCrawler: webCrawler ? (webCrawler.getStatus ? webCrawler.getStatus() : { isRunning: true }) : null,
          enhancedCrawler: webCrawler && webCrawler.getEnhancedStatus ? webCrawler.getEnhancedStatus() : null,
          backgroundWorker: serviceHub.backgroundWorker?.getStatus ? serviceHub.backgroundWorker.getStatus() : null,
          monitoring: serviceHub.monitoring?.getStatus ? serviceHub.monitoring.getStatus() : null,
          db: this.db ? { connected: true } : { connected: false }
        };
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/crawler/enrich/:siteId', async (req, res) => {
      try {
        const { seoEnrichmentService } = await import('./src/services/SEOEnrichmentService.js');
        const siteId = req.params.siteId;
        const updated = await seoEnrichmentService.enrichSiteById(siteId, { useAI: !!req.body.useAI, timeoutMs: req.body.timeoutMs || 30000 });
        res.json({ success: true, data: updated });
      } catch (error) {
        console.error('Enrichment error:', error);
        res.status(500).json({ success: false, error: error.message || 'Enrichment failed' });
      }
    });
// ---- END SEO ENRICHMENT ----
`;

// Write files and patch
async function apply() {
  try {
    await writeSafe(migrationPath, migrationSQL);
    await writeSafe(seoServicePath, seoServiceTS);
    await writeSafe(statusPanelPath, statusPanelJSX);
    await writeSafe(ecosystemPath, ecosystemJS);
    await writeSafe(join('scripts','create-windows-startup-task.ps1'), windowsPS);

    // Patch CrawlerPersistenceService.ts
    const crawlerPath = join('src','services','CrawlerPersistenceService.ts');
    let crawlerText = await fs.readFile(crawlerPath, 'utf8');
    const startToken = 'private async persistSite(site: CrawledSite)';
    const startIdx = crawlerText.indexOf(startToken);
    if (startIdx === -1) {
      console.warn('persistSite method anchor not found in', crawlerPath);
    } else {
      const nextAnchorIdx = crawlerText.indexOf('\\n  /**', startIdx);
      if (nextAnchorIdx === -1) {
        console.warn('next method anchor not found; aborting persistSite replacement');
      } else {
        const head = crawlerText.slice(0, startIdx);
        const tail = crawlerText.slice(nextAnchorIdx);
        const newText = head + newPersistMethod + '\\n\\n' + tail;
        await backupIfExists(crawlerPath);
        await fs.writeFile(crawlerPath, newText, 'utf8');
        console.log('Patched', crawlerPath);
      }
    }

    // Patch api-server-express.js: insert after this.startRealtimeUpdates();
    const apiPath = join('api-server-express.js');
    let apiText = await fs.readFile(apiPath, 'utf8');
    const anchor = 'this.startRealtimeUpdates();';
    const anchorIdx = apiText.indexOf(anchor);
    if (anchorIdx === -1) {
      console.warn('startRealtimeUpdates anchor not found in api-server-express.js; skipping ServiceHub init insertion');
    } else {
      const insertPos = apiText.indexOf('\\n', anchorIdx) + 1;
      const patched = apiText.slice(0, insertPos) + serviceHubInitBlock + apiText.slice(insertPos);
      await backupIfExists(apiPath);
      await fs.writeFile(apiPath, patched, 'utf8');
      apiText = patched;
      console.log('Inserted ServiceHub init block into api-server-express.js');
    }

    // Insert enrichment endpoints before the "Crawler Persistence API connected" log (if present)
    const logAnchor = \"console.log('   - Crawler Persistence API connected at /api/crawler');\";
    const logIdx = apiText.indexOf(logAnchor);
    if (logIdx === -1) {
      console.warn('Crawler persistence log anchor not found; will attempt alternative insertion next to record-site endpoint');
      const recordAnchor = \"this.app.post('/api/crawler/record-site'\";
      const recordIdx = apiText.indexOf(recordAnchor);
      if (recordIdx !== -1) {
        // find next newline after the record-site block - simpler: insert after the record-site occurrence
        const afterRecord = apiText.indexOf('\\n', recordIdx) + 1;
        const newApiText = apiText.slice(0, afterRecord) + enrichmentEndpointsBlock + apiText.slice(afterRecord);
        await fs.writeFile(apiPath, newApiText, 'utf8');
        console.log('Inserted enrichment endpoints near record-site endpoint');
      } else {
        console.warn('record-site anchor not found either; enrichment endpoints not inserted automatically.');
      }
    } else {
      const newApiText = apiText.slice(0, logIdx) + enrichmentEndpointsBlock + apiText.slice(logIdx);
      await fs.writeFile(apiPath, newApiText, 'utf8');
      console.log('Inserted enrichment endpoints before crawler persistence log');
    }

    console.log('\\nDONE: apply-seo-changes applied. Please run tests and restart the server.');
  } catch (err) {
    console.error('apply-seo-changes failed:', err);
  }
}

apply();