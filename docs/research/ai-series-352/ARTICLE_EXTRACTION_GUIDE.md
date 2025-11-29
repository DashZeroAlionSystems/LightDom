# Article Extraction Guide - 352 AI Research Series

## Current Status

**What's Available:**
- ✅ Complete index of all 352 article titles (AI_SERIES_INDEX.md)
- ✅ Categorization into 16 thematic areas
- ✅ Priority ratings for LightDom integration
- ✅ Executive summary with ROI analysis
- ✅ Implementation roadmap

**What's Being Extracted:**
- 🔄 Individual article summaries (in progress)
- 🔄 Article links and metadata
- 🔄 Key findings and takeaways
- 🔄 LightDom-specific applications

## Extraction Challenge

The original dev.to article series is hosted on a domain that is currently blocked for automated access. This means we cannot directly scrape the full article content.

## Alternative Extraction Methods

### Method 1: Web Search for Article Content ✅ (Current Approach)
For each high-priority article, we can:
1. Search for the article title + authors
2. Find the arXiv paper or GitHub repository
3. Extract key insights from available sources
4. Summarize findings for LightDom context

**Status**: Implemented for top-priority articles

### Method 2: Manual Article Links (User Can Provide)
If you have access to the dev.to series, you can provide:
1. Direct links to specific articles
2. Article content or PDFs
3. Key excerpts and findings

**How to help**:
```bash
# Add article links to this file:
echo "Article Title,URL,Priority" >> docs/research/ai-series-352/extraction/article-links.csv
```

### Method 3: Use arXiv/GitHub Sources Directly
Many articles reference research papers that are openly available:
- arXiv.org - Research papers
- Papers with Code - Papers + implementations
- GitHub - Code repositories
- HuggingFace - Models and demos

**Status**: Implemented for articles with known sources

## What We've Extracted So Far

### High-Priority Categories (Detailed Summaries Available)

#### 1. Agent Systems (50+ articles)
**Location**: `categories/agent-systems/`
**Articles with summaries**: 10+ key articles
**Focus**: Multi-agent coordination, autonomous agents, browser agents

#### 2. OCR & Document Understanding (10+ articles)
**Location**: `categories/ocr-document/`
**Articles with summaries**: DeepSeek-OCR (complete), 5+ related articles
**Focus**: Optical compression, document parsing, multilingual OCR

#### 3. RAG & Retrieval Systems (15+ articles)
**Location**: `categories/rag-retrieval/`
**Articles with summaries**: 8+ key articles
**Focus**: Retrieval-augmented generation, knowledge management

#### 4. Reasoning Models (40+ articles)
**Location**: `categories/reasoning/`
**Articles with summaries**: 12+ key articles
**Focus**: Chain-of-thought, logical inference, mathematical reasoning

#### 5. Code Generation (15+ articles)
**Location**: `categories/code-generation/`
**Articles with summaries**: 8+ key articles
**Focus**: Automated coding, code analysis, authorship attribution

### Medium-Priority Categories (Index + Overview)

#### 6-10. Additional Categories
- Reinforcement Learning
- Multimodal Models
- Memory & Context
- Video Generation
- 3D Reconstruction

**Status**: Comprehensive overviews available, individual article summaries in progress

### Low-Priority Categories (Index Only)

#### 11-16. Exploratory Categories
- Image Generation
- Benchmarks
- Training Optimization
- Safety & Alignment
- Specialized Domains
- Miscellaneous

**Status**: Listed in index, extraction on-demand basis

## How to Find Specific Articles

### Using the Index
```bash
# Search for articles by keyword
grep -i "agent" docs/research/ai-series-352/categories/*/README.md

# Find articles by category
ls docs/research/ai-series-352/categories/
```

### Using Web Search
For any article in our index, you can search:
```
"[Article Title]" arXiv
"[Article Title]" site:github.com
"[Article Title]" papers with code
```

### Examples of Searchable Articles

1. **"Agent Learning via Early Experience"**
   - Search: `"Agent Learning via Early Experience" arXiv`
   - Likely sources: arXiv, research labs

2. **"DeepSeek-OCR: Contexts Optical Compression"**
   - ✅ Already extracted (see deepseek-ocr-contexts-optical-compression/)
   - Complete documentation available

3. **"MM-HELIX: Boosting Multimodal Long-Chain Reflective Reasoning"**
   - Search: `"MM-HELIX" multimodal reasoning arXiv`
   - Research paper + code likely available

## Article Summary Format

Each extracted article includes:

```markdown
# Article Title

## Metadata
- **Category**: [Category Name]
- **Priority**: High/Medium/Low
- **LightDom Relevance**: [Specific use cases]
- **Sources**: [Links to papers, code, demos]

## Summary
Brief overview of the research

## Key Innovations
- Innovation 1
- Innovation 2
- Innovation 3

## Technical Details
Architecture, approach, methodology

## Results & Benchmarks
Performance metrics, comparisons

## LightDom Applications
Specific integration opportunities

## Implementation Considerations
Practical deployment notes

## Resources
- Paper: [link]
- Code: [link]
- Demo: [link]
```

## Extraction Progress Tracker

### Completed (60+ articles)
- [x] DeepSeek-OCR (complete documentation)
- [x] Top 10 agent systems articles (summaries)
- [x] Top 8 RAG articles (summaries)
- [x] Top 12 reasoning articles (summaries)
- [x] Top 8 code generation articles (summaries)
- [x] Top 10 multimodal articles (overviews)

### In Progress (100+ articles)
- [ ] Reinforcement learning category (detailed summaries)
- [ ] Video generation category (detailed summaries)
- [ ] 3D reconstruction category (detailed summaries)
- [ ] Memory/context category (detailed summaries)

### Pending (200+ articles)
- [ ] Medium-priority articles (basic summaries)
- [ ] Low-priority articles (index only, extract on-demand)

## How to Request Specific Articles

If you need detailed information on a specific article:

1. **Check the index**: See if it's listed in AI_SERIES_INDEX.md
2. **Check the category**: Look in the relevant category folder
3. **Request extraction**: Open an issue or comment with:
   - Article number (1-352)
   - Article title
   - Specific information needed
   - Use case for LightDom

Example request:
```
Please extract article #42: "SViM3D: Stable Video Material Diffusion"
Needed for: Metaverse 3D asset generation feature
Priority: High for Q2 roadmap
```

## Automated Extraction Script

The extraction script (`scripts/extract-ai-research-series.js`) can be enhanced to:

1. **Search arXiv** for papers by title
2. **Query GitHub** for related repositories
3. **Check Papers with Code** for implementations
4. **Generate summaries** using available abstracts
5. **Map to LightDom** use cases automatically

### Running the Enhanced Extractor

```bash
# Extract specific articles by number
node scripts/extract-ai-research-series.js --articles 1,2,3,42

# Extract by category
node scripts/extract-ai-research-series.js --category agent-systems

# Extract high-priority only
node scripts/extract-ai-research-series.js --priority high

# Full extraction (may take time)
node scripts/extract-ai-research-series.js --all
```

## Contributing Article Content

If you have access to the articles or related content:

### Option 1: Provide Links
Create a CSV file with article information:
```csv
Article Number,Title,URL,Category,Notes
1,Agent Learning via Early Experience,https://...,agent-systems,Foundational work
302,DeepSeek-OCR,https://...,ocr-document,Already documented
```

### Option 2: Share PDFs
Place PDFs in the extraction folder:
```bash
docs/research/ai-series-352/extraction/pdfs/
├── article-001-agent-learning.pdf
├── article-302-deepseek-ocr.pdf
└── ...
```

### Option 3: Provide Summaries
Create markdown summaries following our template:
```bash
docs/research/ai-series-352/categories/[category]/article-[number].md
```

## Next Steps

1. **Continue extraction** of high-priority articles
2. **Enhance automation** for arXiv/GitHub integration
3. **Validate summaries** with available sources
4. **Map to LightDom** use cases more specifically
5. **Track implementation** of extracted research

## Questions?

- **Where are the full articles?** Most are research papers on arXiv or pre-prints
- **How do I access them?** Search by title on arXiv, Google Scholar, or GitHub
- **Are summaries accurate?** Derived from multiple sources, best-effort accuracy
- **Can I contribute?** Yes! Follow the contributing guidelines above
- **How often updated?** Continuous as new articles are processed

---

*Extraction Guide v1.0*
*Last Updated: November 2024*
*Status: Active Extraction in Progress*
