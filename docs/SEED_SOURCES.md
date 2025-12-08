# Recommended Open-Source URL Seed Sources

This document lists reputable open-source or freely available URL sources you can use to seed crawlers. Use these responsibly and respect robots.txt and site's terms of service.

1. Common Crawl (CC)

- Notes: Massive web crawl archives (WARC/CDX/WET). Use CC indices (CDX) to select domains/URLs. Data volumes are huge; prefer curated subsets.
- How to use: download a CDX index or use Common Crawl Index Server (CC-MAIN) and extract top domains or previously-crawled paths.
- Links: https://commoncrawl.org/

2. Tranco / Top sites lists

- Notes: Tranco provides reproducible top-sites lists (replacement to Alexa). Good for high-authority domain seeds.
- How to use: download the latest Tranco list, filter by domain patterns you care about, then expand via sitemaps.
- Links: https://tranco-list.eu/

3. WebDataCommons / Sitemaps

- Notes: Extracts structured data and sitemaps from Common Crawl; includes lists of pages with specific schema.org types.
- How to use: query dataset or use the sitemap extracts to seed crawlers for sites likely to contain structured data.
- Links: http://webdatacommons.org/

4. GitHub Topics & Repositories

- Notes: For developer/technical topics (React, Node.js, libraries), query GitHub Topics and Repo READMEs for URLs.
- How to use: use GitHub REST API or `github` CLI to fetch repositories for a topic and extract homepage URLs and docs pages.
- Links: https://docs.github.com/en/rest

5. Reddit / Relevant Subreddits

- Notes: Subreddits often link to topical resources and community pages. Use Reddit's API to find frequently linked URLs.
- How to use: use the Reddit API to fetch top posts in a subreddit and extract external links. Respect API rate limits.
- Links: https://www.reddit.com/dev/api/

6. Wikipedia Categories

- Notes: Wikipedia category pages link to authoritative external resources and topic hubs. Good for knowledge-oriented seeding.
- How to use: crawl category pages and extract external links, or use DB dumps via Wikimedia.
- Links: https://www.wikipedia.org/ and https://dumps.wikimedia.org/

7. Web Directories / Archives (DMOZ archives, Internet Archive)

- Notes: Useful for historical data and content-rich seeds. DMOZ is archived; Internet Archive has curated lists and sitemaps.
- How to use: use archived lists or Internet Archive APIs to obtain lists of pages.
- Links: https://archive.org/

8. Public Datasets (Kaggle, Academic)

- Notes: Some datasets provide URL lists for research. Use these for experiments.
- How to use: curate CSVs of URLs and feed them into the seeder script.

9. Sitemap discovery

- Notes: For any domain, use '/sitemap.xml' or robots.txt to find sitemap locations and enumerate pages to seed.
- How to use: request robots.txt, find 'Sitemap:' entries, and fetch sitemap XMLs.

10. Publisher / Industry lists

- Notes: For vertical campaigns (e-commerce, travel), authoritative publisher lists (best-of articles, price-comparison sites) often contain high-quality link graphs.

Practical tips

- Respect robots.txt and rate limits. Implement polite crawling (delays, concurrency limits, UA header).
- Always check copyright and terms for data reuse.
- Use domain whitelists and blacklists to avoid crawling disallowed sites.
- For large-scale seeding from Common Crawl, prefer sampling and using CDX queries.

Example quick pipeline:

1. Fetch Tranco top-1M list.
2. Filter to domains relevant to your topic.
3. For each domain, request robots.txt and sitemap(s).
4. Expand sitemaps to individual URLs and insert into `url_seeds` or `crawl_targets`.

This file can be extended with scripts and examples for each source.
