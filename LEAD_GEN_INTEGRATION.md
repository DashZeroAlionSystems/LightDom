# Complete System Integration Guide - Lead Generation Focus

## Overview

This guide shows how all the recent PRs work together to create a complete lead generation pipeline from crawling to conversion.

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User Creates Campaign                          │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Crawler Campaign Service                           │
│  • Creates campaign from prompt (DeepSeek AI)                        │
│  • Generates URL seeds                                               │
│  • Configures crawler instances                                      │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Enterprise Crawler (PR #165)                      │
│  • Cluster-based crawling                                            │
│  • Advanced caching (PR #170)                                        │
│  • Neural network integration (PR #167)                              │
│  • Real-time BiDi events                                             │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Campaign-Lead Integration                            │
│  • Listens to campaign events                                        │
│  • Processes crawler results                                         │
│  • Extracts contact information                                      │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Lead Generation Service                            │
│  • Email extraction from content                                     │
│  • Lead scoring (0-100)                                              │
│  • Quality classification                                            │
│  • Duplicate detection                                               │
│  • Activity tracking                                                 │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Database (PostgreSQL)                          │
│  • leads table with scoring                                          │
│  • lead_activities tracking                                          │
│  • lead_sources performance                                          │
│  • Statistical views                                                 │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       REST API + WebSocket                            │
│  • /api/leads endpoints                                              │
│  • Real-time updates via Socket.io                                   │
│  • Campaign integration                                              │
└───────────────────────────────┬───────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Lead Management Dashboard (UI)                       │
│  • View and filter leads                                             │
│  • Update status and assign                                          │
│  • Track activities                                                  │
│  • View statistics                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## End-to-End Workflow Example

### Step 1: Create a Campaign (PR #165)

```bash
POST /api/campaigns/create-from-prompt
{
  "prompt": "Find tech companies hiring software engineers in San Francisco",
  "clientSiteUrl": "https://example.com"
}
```

**What Happens:**
1. DeepSeek AI (PR #169) generates campaign configuration
2. URL seeds are created
3. Crawler instances are allocated
4. Campaign is stored in database

### Step 2: Campaign Executes (PR #165, #170, #167)

```bash
POST /api/campaigns/{campaignId}/start
```

**What Happens:**
1. Multiple crawler instances start (cluster-based)
2. Advanced caching (PR #170) optimizes performance
3. Neural networks (PR #167) help identify relevant pages
4. Pages are crawled and content extracted
5. Results are stored

### Step 3: Leads Captured Automatically (New)

**What Happens:**
1. `CampaignLeadIntegration` receives campaign events
2. For each crawled page:
   - Email addresses are extracted via regex
   - Names extracted from contact patterns
   - Company names extracted from domain/content
3. `LeadGenerationService` processes each potential lead:
   - Calculates score (0-100)
   - Classifies quality (high/medium/low)
   - Checks for duplicates
   - Stores in database
4. Real-time WebSocket updates sent to dashboard
5. Lead source statistics updated

### Step 4: View Leads in Dashboard (New)

Navigate to: `http://localhost:3000/admin/leads`

**What You See:**
- Statistics cards (total, new, qualified, converted)
- Filterable table of all leads
- Lead scores with visual indicators
- Source attribution
- Quick status updates

## Quick Reference

### All Routes Connected

**N8N & Workflows (PR #169):**
- `/api/n8n-workflows` - Enhanced workflow management
- `/api/deepseek-workflows` - DeepSeek workflow integration

**RAG & AI (PR #168):**
- `/api/rag` - RAG endpoints
- `/api/enhanced-rag` - Enhanced features

**Neural Networks (PR #167):**
- `/api/neural-networks` - Neural network management
- `/api/tensorflow` - TensorFlow workflows

**Campaigns (PR #165):**
- `/api/campaigns` - Campaign management
- `/api/pattern-mining` - Pattern detection

**Leads (New):**
- `/api/leads` - Lead management
- `/admin/leads` - Dashboard UI

See `LEAD_GENERATION_README.md` for complete API documentation.
