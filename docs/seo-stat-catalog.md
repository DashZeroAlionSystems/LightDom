# SEO Stat Catalog

The enhanced crawler collects a unified feature catalog for every page. These metrics feed the TensorFlow pipelines and schema suggestion models.

| Stat ID                               | Category    | Description                       | Extraction Method                                                                     |
| ------------------------------------- | ----------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| metadata_title_length                 | metadata    | Characters in the `<title>` tag   | `document.title.length`                                                               |
| metadata_description_length           | metadata    | Characters in meta description    | `meta[name="description"]` content length                                             |
| metadata_title_keyword_coverage       | metadata    | Keywords appearing in title       | Compare configured `meta[name="keywords"]` entries against lowercased title           |
| metadata_description_keyword_coverage | metadata    | Keywords appearing in description | Compare keywords list against meta description                                        |
| metadata_canonical_present            | metadata    | Canonical link exists             | `link[rel="canonical"]` presence                                                      |
| metadata_canonical_self               | metadata    | Canonical host matches page host  | Compare canonical hostname to `location.hostname`                                     |
| metadata_robots_indexable             | metadata    | Page indexable                    | Check `meta[name="robots"]` for `noindex`                                             |
| metadata_viewport_present             | metadata    | Mobile viewport defined           | `meta[name="viewport"]` contains `width=device-width`                                 |
| metadata_lang_present                 | metadata    | HTML language attribute set       | `document.documentElement.lang`                                                       |
| metadata_hreflang_count               | metadata    | Alternate hreflang entries        | Count `link[rel="alternate"][hreflang]`                                               |
| headings_h1_count                     | structure   | H1 count                          | `document.querySelectorAll('h1')`                                                     |
| headings_h2_count                     | structure   | H2 count                          | `document.querySelectorAll('h2')`                                                     |
| headings_h3_count                     | structure   | H3 count                          | `document.querySelectorAll('h3')`                                                     |
| headings_keyword_coverage             | structure   | Keywords used in headings         | Compare keyword list against concatenated H1-H3 text                                  |
| content_word_count                    | content     | Visible word count                | `document.body.innerText` split into words (50k char cap)                             |
| content_paragraph_count               | content     | Paragraph count                   | `document.querySelectorAll('p')`                                                      |
| content_readability_flesch            | content     | Flesch Reading Ease score         | Tokenize body text into sentences/words and apply formula                             |
| content_sentence_length_avg           | content     | Average words per sentence        | Total words ÷ sentence count                                                          |
| content_keyword_density               | content     | Keyword density                   | Count keyword occurrences ÷ body word count                                           |
| media_image_count                     | media       | `<img>` elements                  | `document.querySelectorAll('img')`                                                    |
| media_image_alt_ratio                 | media       | Alt text coverage                 | Ratio of images with non-empty `alt`                                                  |
| media_image_lazy_ratio                | media       | Lazy loading ratio                | Ratio of images with `loading="lazy"`                                                 |
| links_total                           | links       | Total anchors sampled             | `document.querySelectorAll('a[href]')` (max 200)                                      |
| links_internal_ratio                  | links       | Internal link ratio               | Compare link host against page host                                                   |
| links_external_ratio                  | links       | External link ratio               | Complement of internal ratio                                                          |
| links_nofollow_ratio                  | links       | Nofollow share                    | Ratio of links whose `rel` contains `nofollow`                                        |
| schemas_total                         | structured  | Number of JSON-LD blocks          | Count `script[type="application/ld+json"]`                                            |
| schemas_unique_types                  | structured  | Unique schema types               | Collect `@type` values from JSON-LD                                                   |
| schemas_article_present               | structured  | Article schema flag               | JSON-LD contains `Article`/`BlogPosting`                                              |
| schemas_product_present               | structured  | Product schema flag               | JSON-LD contains `Product`                                                            |
| schemas_faq_present                   | structured  | FAQ schema flag                   | JSON-LD contains `FAQPage`                                                            |
| schemas_howto_present                 | structured  | HowTo schema flag                 | JSON-LD contains `HowTo`                                                              |
| schemas_breadcrumb_present            | structured  | Breadcrumb schema flag            | JSON-LD contains `BreadcrumbList`                                                     |
| social_open_graph_present             | social      | Open Graph tags exist             | Detect `og:title`/`og:description`/`og:image`                                         |
| social_twitter_card_present           | social      | Twitter card tags exist           | `meta[name="twitter:card"]`                                                           |
| performance_dom_size                  | performance | HTML size in bytes                | `document.documentElement.outerHTML.length`                                           |
| performance_dom_elements              | performance | DOM element count                 | `document.querySelectorAll('*').length`                                               |
| performance_scripts_count             | performance | External scripts                  | `script[src]` count                                                                   |
| performance_inline_styles             | performance | Inline `<style>` blocks           | `document.querySelectorAll('style')`                                                  |
| performance_resource_js               | performance | JS requests                       | DevTools `performance.getEntriesByType('resource')` filter (`initiatorType='script'`) |
| performance_resource_css              | performance | CSS requests                      | Same resource entries (`link`/`stylesheet`)                                           |
| performance_resource_img              | performance | Image requests                    | Same resource entries (`initiatorType='img'/'image'`)                                 |
| performance_transfer_kb               | performance | Transfer size (KB)                | Sum of `transferSize` ÷ 1024                                                          |
| performance_ttfb_ms                   | performance | Time-to-first-byte                | Navigation timing `responseStart`                                                     |
| performance_first_contentful_paint    | performance | FCP timing                        | Navigation timings fallback to `domContentLoaded`                                     |
| performance_layout_duration           | performance | Layout duration metric            | `page.metrics()` LayoutDuration                                                       |
| seo_score_overall                     | scores      | Crawler heuristic overall         | Output of `calculateSEOScore`                                                         |
| seo_score_content                     | scores      | Content score                     | Heuristic breakdown                                                                   |
| seo_score_technical                   | scores      | Technical score                   | Heuristic breakdown                                                                   |
| seo_score_performance                 | scores      | Performance score                 | Heuristic breakdown                                                                   |
| core_web_vitals_lcp                   | web vitals  | Largest Contentful Paint          | Analytics ingest (if available)                                                       |
| core_web_vitals_cls                   | web vitals  | Cumulative Layout Shift           | Analytics ingest                                                                      |
| core_web_vitals_inp                   | web vitals  | Interaction to Next Paint         | Analytics ingest                                                                      |
| core_web_vitals_fid                   | web vitals  | First Input Delay                 | Analytics ingest                                                                      |
| core_web_vitals_ttfb                  | web vitals  | TTFB (analytics)                  | Analytics ingest                                                                      |
| core_web_vitals_fcp                   | web vitals  | FCP (analytics)                   | Analytics ingest                                                                      |
| engagement_time_on_page               | engagement  | Average time on page              | Analytics ingest                                                                      |
| engagement_scroll_depth               | engagement  | Average scroll depth              | Analytics ingest                                                                      |
| engagement_interactions               | engagement  | Interaction count                 | Analytics ingest                                                                      |

The crawler stores the full metrics map, aligned feature names, and feature vectors in `crawled_sites` to keep the neural pipelines in sync with the catalog version `seo-stats-v1`.
