# LightDom Lead Generation System Architecture

## High-Level Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
│                                                                      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Campaign UI   │  │  Crawler Status  │  │  Lead Dashboard  │  │
│  │   (PR #165)     │  │                  │  │      (NEW)       │  │
│  └────────┬────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                    │                       │             │
└───────────┼────────────────────┼───────────────────────┼────────────┘
            │                    │                       │
            ▼                    ▼                       ▼
┌────────────────────────────────────────────────────────────────────┐
│                         REST API LAYER                              │
│                                                                      │
│  /api/campaigns      /api/crawler         /api/leads               │
│  /api/n8n-workflows  /api/neural-networks /api/leads/statistics    │
│  /api/deepseek       /api/tensorflow      /api/leads/:id           │
│                                                                      │
└───────────┬────────────────────┬───────────────────────┬────────────┘
            │                    │                       │
            ▼                    ▼                       ▼
┌────────────────────────────────────────────────────────────────────┐
│                        SERVICE LAYER                                │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │ Campaign Service │  │  Crawler Service │  │  Lead Service   │  │
│  │   (PR #165)      │  │    (PR #165)     │  │     (NEW)       │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘  │
│           │                     │                       │            │
│  ┌────────┴─────────┐  ┌───────┴──────────┐  ┌────────┴────────┐  │
│  │  Cache Manager   │  │ Neural Networks  │  │   Campaign-Lead │  │
│  │   (PR #170)      │  │   (PR #167)      │  │   Integration   │  │
│  └──────────────────┘  └──────────────────┘  └────────┬────────┘  │
│                                                         │            │
└─────────────────────────────────────────────────────────┼───────────┘
                                                          │
                                                          ▼
┌────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                 │
│                                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │  campaigns   │  │   crawls    │  │    leads     │              │
│  └──────────────┘  └─────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐              │
│  │ lead_sources │  │ activities  │  │  lead_tags   │              │
│  └──────────────┘  └─────────────┘  └──────────────┘              │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

## Lead Generation Flow

```
┌──────────────────────┐
│ 1. User Input        │
│ "Find tech companies │
│  hiring engineers"   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. DeepSeek AI       │
│ Generates campaign   │
│ configuration        │
│ (PR #169)            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. Campaign Created  │
│ - URL seeds          │
│ - Crawler config     │
│ (PR #165)            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. Crawlers Execute  │
│ - Cluster-based      │
│ - Cached results     │
│ - Neural targeting   │
│ (PR #165, #170, #167)│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 5. Pages Crawled     │
│ - HTML content       │
│ - Contact info       │
│ - Company data       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 6. Campaign-Lead Integration     │
│ - Listens to campaign events     │
│ - Processes results automatically│
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 7. Lead Extraction               │
│ - Email: /[a-z0-9]+@[a-z0-9]+/   │
│ - Name: Pattern matching         │
│ - Company: Domain extraction     │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 8. Lead Scoring                  │
│ - Email: 10 pts                  │
│ - Name: 15 pts                   │
│ - Company: 20 pts                │
│ - Phone: 15 pts                  │
│ - Website: 15 pts                │
│ - Job title: 15 pts              │
│ - Pro email: +10 bonus           │
│ = Total: 0-100                   │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 9. Quality Classification        │
│ - High: ≥75 (green)              │
│ - Medium: ≥50 (orange)           │
│ - Low: <50 (red)                 │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 10. Duplicate Check              │
│ - Check by email                 │
│ - Merge if exists                │
│ - Create if new                  │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 11. Database Storage             │
│ INSERT INTO leads (...)          │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 12. Real-time Update             │
│ WebSocket: lead:captured event   │
│ (NEW)                            │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│ 13. Dashboard Update             │
│ - Statistics refresh             │
│ - Table updates                  │
│ - Notifications                  │
│ (NEW)                            │
└──────────────────────────────────┘
```

## Data Flow

```
Campaign Results
       ↓
  ┌────────────────────────────────┐
  │ Crawled Page                   │
  │ {                              │
  │   url: "company.com/about"     │
  │   content: "Contact us at...   │
  │            info@company.com"   │
  │   title: "About Company"       │
  │ }                              │
  └────────┬───────────────────────┘
           │
           ▼
  ┌────────────────────────────────┐
  │ Email Extraction               │
  │ Regex: /[a-zA-Z0-9._-]+@...    │
  │ Found: info@company.com        │
  └────────┬───────────────────────┘
           │
           ▼
  ┌────────────────────────────────┐
  │ Lead Information               │
  │ {                              │
  │   email: "info@company.com"    │
  │   company: "Company"           │
  │   website: "company.com"       │
  │   source: "campaign_123"       │
  │ }                              │
  └────────┬───────────────────────┘
           │
           ▼
  ┌────────────────────────────────┐
  │ Scoring                        │
  │ - Email: 10                    │
  │ - Company: 20                  │
  │ - Website: 15                  │
  │ - Pro domain: 10               │
  │ = Score: 55                    │
  │ = Quality: Medium              │
  └────────┬───────────────────────┘
           │
           ▼
  ┌────────────────────────────────┐
  │ Database Record                │
  │ {                              │
  │   id: 1,                       │
  │   email: "info@company.com",   │
  │   score: 55,                   │
  │   quality: "medium",           │
  │   status: "new",               │
  │   source_type: "crawler",      │
  │   source_id: "campaign_123",   │
  │   created_at: "2025-11-20..."  │
  │ }                              │
  └────────────────────────────────┘
```

## Component Interactions

```
┌─────────────────────────────────────────────────────────────┐
│                     LeadManagementDashboard                  │
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │Statistics │  │  Filters  │  │   Table   │              │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘              │
│        │              │              │                      │
│        └──────────────┴──────────────┘                      │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼ fetch()
┌─────────────────────────────────────────────────────────────┐
│                    Lead Routes (/api/leads)                  │
│                                                              │
│  GET /                    → List leads                       │
│  GET /:id                 → Get lead details                │
│  POST /                   → Create lead                      │
│  PATCH /:id/status        → Update status                   │
│  POST /:id/assign         → Assign lead                     │
│  GET /statistics          → Get stats                       │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  LeadGenerationService                       │
│                                                              │
│  captureLead()            → Capture & score                 │
│  getLeads()               → List with filters               │
│  getLead()                → Get single lead                 │
│  updateStatus()           → Change status                   │
│  assignLead()             → Assign to user                  │
│  logActivity()            → Track activity                  │
│  getStatistics()          → Calculate metrics               │
│                                                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│                                                              │
│  leads              → Main leads table                       │
│  lead_activities    → Activity history                      │
│  lead_sources       → Source tracking                       │
│  lead_tags          → Tag system                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### PR #170: Advanced Caching
- Used by: Crawler Service
- Benefits: Reduces redundant crawling, faster lead capture
- Integration: Internal service, no API

### PR #169: N8N Workflows
- Routes: `/api/n8n-workflows`, `/api/deepseek-workflows`
- Benefits: Automate lead nurturing, follow-up sequences
- Integration: Can trigger workflows when leads captured

### PR #168: RAG
- Routes: `/api/rag`, `/api/enhanced-rag`
- Benefits: AI-powered lead enrichment and analysis
- Integration: Can enhance lead data with AI insights

### PR #167: Neural Networks
- Routes: `/api/neural-networks`, `/api/tensorflow`
- Benefits: Predict lead quality, optimize targeting
- Integration: Can train on conversion data

### PR #165: Enterprise Crawler
- Routes: `/api/campaigns`
- Benefits: Source of all leads
- Integration: Event-driven automatic capture

---

**Legend:**
- (NEW) = New in this PR
- PR #XXX = From previous PR
