// Lightweight triage stub for WebCrawlerService
export default class WebCrawlerService {
  constructor(...args: any[]) {}
  public async initialize(options?: any): Promise<void> {
    // triage init
    return;
  }
  public async crawl(url: string): Promise<any> {
    return { links: [], assets: [] };
  }

  public async crawlWebsite(url: string, options?: any): Promise<string> {
    return 'crawl-1';
  }

  public async getCrawlStatus(crawlId: string): Promise<any> {
    return { status: 'running' };
  }

  public async getCrawlResult(crawlId: string): Promise<any> {
    return { links: [], assets: [] };
  }

  public getStatus(): any {
    return { ready: true };
  }

  public async cleanup(): Promise<void> {
    // triage stub
  }
}

// Named export for backward compatibility
export { WebCrawlerService };
