import { writeFileSync } from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import { ensureBatchDirectories, resolveBatchPath } from './utils/fileSystem.js';

interface CrawlResult {
  screenshotPath: string;
  htmlPath: string;
}

export class CrawlerService {
  private browser: Browser | null = null;

  async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({ headless: true });
    }
    return this.browser;
  }

  async crawl(url: string, batchId: string): Promise<CrawlResult> {
    ensureBatchDirectories(batchId);
    const browser = await this.ensureBrowser();
    const page: Page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    const batchPath = resolveBatchPath(batchId, 'processed/screenshots');
    const htmlDir = resolveBatchPath(batchId, 'processed/stories');
    const screenshotPath = `${batchPath}/main.png`;
    const htmlPath = `${htmlDir}/dom.html`;

    await page.screenshot({ path: screenshotPath, fullPage: true });
    const html = await page.content();

    writeFileSync(htmlPath, html, 'utf8');

    await page.close();

    return { screenshotPath, htmlPath };
  }

  async shutdown(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
