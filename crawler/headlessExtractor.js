/**
 * Headless Extractor
 * Provides a simple headless browser extractor with a safe HTTP fallback.
 *
 * - Tries Playwright -> Puppeteer
 * - If neither is available, fetches HTML and extracts heuristics
 *
 * Exports: HeadlessExtractor (class)
 */

export default class HeadlessExtractor {
  constructor(options = {}) {
    this.options = options;
    this.browser = null;
    this.engine = null; // 'playwright' | 'puppeteer' | null
  }

  async init() {
    if (this.browser) return;

    // Try Playwright first
    try {
      const pw = await import('playwright');
      this.engine = 'playwright';
      this.playwright = pw;
      this.browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox'] });
      return;
    } catch (e) {
      // ignore
    }

    // Try Puppeteer
    try {
      const pp = await import('puppeteer');
      this.engine = 'puppeteer';
      this.puppeteer = pp;
      this.browser = await pp.launch({ headless: true, args: ['--no-sandbox'] });
      return;
    } catch (e) {
      // ignore - we'll fall back to HTTP
    }

    this.engine = null;
  }

  async close() {
    try {
      if (this.browser) await this.browser.close();
    } catch (e) {}
    this.browser = null;
    this.engine = null;
  }

  // Main extraction entrypoint. Returns an `analysis` object shape compatible
  // with SEOCrawlerIntegration.extractFeatures usage.
  async extract(url, opts = {}) {
    await this.init();

    if (this.engine === 'playwright') return this._extractWithPlaywright(url, opts);
    if (this.engine === 'puppeteer') return this._extractWithPuppeteer(url, opts);

    return this._extractWithHttpFallback(url, opts);
  }

  async _extractWithPlaywright(url, opts = {}) {
    const browser =
      this.browser ||
      (await this.playwright.chromium.launch({ headless: true, args: ['--no-sandbox'] }));
    const context = await browser.newContext({
      userAgent: opts.userAgent || 'Mozilla/5.0 (compatible; LightDomBot/1.0)',
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: opts.timeout || 60000 });

      // Collect metrics and DOM info in page context
      const data = await page.evaluate(() => {
        // Capture basic performance metrics
        const perf = {};
        try {
          const nav = performance.getEntriesByType('navigation')[0];
          if (nav) {
            perf.ttfb = nav.responseStart - nav.startTime;
            perf.pageLoadTime = nav.loadEventEnd - nav.startTime;
          }
          const paints = performance.getEntriesByType('paint') || [];
          paints.forEach(p => {
            if (p.name === 'first-contentful-paint') perf.fcp = Math.round(p.startTime);
          });
        } catch (e) {}

        // LCP/CLS best-effort using buffered entries
        try {
          const lcpEntries =
            performance.getEntriesByType &&
            performance.getEntriesByType('largest-contentful-paint');
          perf.lcp =
            lcpEntries && lcpEntries.length
              ? Math.round(lcpEntries[lcpEntries.length - 1].startTime || 0)
              : 0;
        } catch (e) {
          perf.lcp = 0;
        }
        try {
          const clsEntries =
            performance.getEntriesByType && performance.getEntriesByType('layout-shift');
          perf.cls =
            clsEntries && clsEntries.length
              ? clsEntries.reduce((s, e) => s + (e.value || 0), 0)
              : 0;
        } catch (e) {
          perf.cls = 0;
        }

        // DOM stats and content
        const domStats = {
          totalElements: document.getElementsByTagName('*').length,
          h1Count: document.getElementsByTagName('h1').length,
          images: Array.from(document.images || []).map(i => ({
            src: i.currentSrc || i.src,
            alt: i.alt || '',
          })),
        };

        const pageTitle = document.title || '';
        const metaDescription =
          (document.querySelector('meta[name="description"]') || {}).content || '';

        // Extract JSON-LD
        const jsonld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map(s => {
            try {
              return JSON.parse(s.textContent || '{}');
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: (a.innerText || '').trim().slice(0, 300),
        }));

        return { perf, domStats, pageTitle, metaDescription, jsonld, links };
      });

      const analysis = {
        performance: {
          lcp: data.perf.lcp || 0,
          fcp: data.perf.fcp || 0,
          ttfb: data.perf.ttfb || 0,
          cls: data.perf.cls || 0,
          pageLoadTime: data.perf.pageLoadTime || 0,
        },
        domStats: data.domStats,
        pageTitle: data.pageTitle,
        metaDescription: data.metaDescription,
        schemas: data.jsonld,
        backlinks: data.links,
        optimizations: [],
        spaceSaved: 0,
      };

      await page.close();
      await context.close();
      return analysis;
    } catch (err) {
      try {
        await page.close();
      } catch (e) {}
      try {
        await context.close();
      } catch (e) {}
      throw err;
    }
  }

  async _extractWithPuppeteer(url, opts = {}) {
    const browser =
      this.browser || (await this.puppeteer.launch({ headless: true, args: ['--no-sandbox'] }));
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: opts.timeout || 60000 });

      const data = await page.evaluate(() => {
        const perf = {};
        try {
          const nav = performance.getEntriesByType('navigation')[0];
          if (nav) {
            perf.ttfb = nav.responseStart - nav.startTime;
            perf.pageLoadTime = nav.loadEventEnd - nav.startTime;
          }
          const paints = performance.getEntriesByType('paint') || [];
          paints.forEach(p => {
            if (p.name === 'first-contentful-paint') perf.fcp = Math.round(p.startTime);
          });
        } catch (e) {}

        try {
          const lcpEntries =
            performance.getEntriesByType &&
            performance.getEntriesByType('largest-contentful-paint');
          perf.lcp =
            lcpEntries && lcpEntries.length
              ? Math.round(lcpEntries[lcpEntries.length - 1].startTime || 0)
              : 0;
        } catch (e) {
          perf.lcp = 0;
        }
        try {
          const clsEntries =
            performance.getEntriesByType && performance.getEntriesByType('layout-shift');
          perf.cls =
            clsEntries && clsEntries.length
              ? clsEntries.reduce((s, e) => s + (e.value || 0), 0)
              : 0;
        } catch (e) {
          perf.cls = 0;
        }

        const domStats = {
          totalElements: document.getElementsByTagName('*').length,
          h1Count: document.getElementsByTagName('h1').length,
          images: Array.from(document.images || []).map(i => ({
            src: i.currentSrc || i.src,
            alt: i.alt || '',
          })),
        };

        const pageTitle = document.title || '';
        const metaDescription =
          (document.querySelector('meta[name="description"]') || {}).content || '';

        const jsonld = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
          .map(s => {
            try {
              return JSON.parse(s.textContent || '{}');
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);

        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: (a.innerText || '').trim().slice(0, 300),
        }));

        return { perf, domStats, pageTitle, metaDescription, jsonld, links };
      });

      const analysis = {
        performance: {
          lcp: data.perf.lcp || 0,
          fcp: data.perf.fcp || 0,
          ttfb: data.perf.ttfb || 0,
          cls: data.perf.cls || 0,
          pageLoadTime: data.perf.pageLoadTime || 0,
        },
        domStats: data.domStats,
        pageTitle: data.pageTitle,
        metaDescription: data.metaDescription,
        schemas: data.jsonld,
        backlinks: data.links,
        optimizations: [],
        spaceSaved: 0,
      };

      await page.close();
      return analysis;
    } catch (err) {
      try {
        await page.close();
      } catch (e) {}
      throw err;
    }
  }

  // Simple HTTP fallback parser using fetch + light heuristics
  async _extractWithHttpFallback(url, opts = {}) {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': opts.userAgent || 'Mozilla/5.0 (compatible; LightDomBot/1.0)' },
    });
    const html = await res.text();

    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    const metaMatch =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
      html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
    const metaDescription = metaMatch ? metaMatch[1].trim() : '';

    const totalElements = (html.match(/</g) || []).length;
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const images = (html.match(/<img\b[^>]*>/gi) || []).length;
    const links = Array.from(
      html.matchAll(/<a\b[^>]*href=["']?([^"'\s>]+)["']?[^>]*>([\s\S]*?)<\/a>/gi)
    ).map(m => ({ href: m[1], text: (m[2] || '').trim().slice(0, 300) }));

    // JSON-LD extraction (best-effort)
    const jsonld = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jm;
    while ((jm = re.exec(html)) !== null) {
      try {
        jsonld.push(JSON.parse(jm[1]));
      } catch (e) {
        /* ignore parse errors */
      }
    }

    return {
      performance: { lcp: 0, fcp: 0, ttfb: 0, cls: 0, pageLoadTime: 0 },
      domStats: { totalElements, h1Count, images },
      pageTitle,
      metaDescription,
      schemas: jsonld,
      backlinks: links,
      optimizations: [],
      spaceSaved: 0,
    };
  }
}
