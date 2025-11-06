# Complete API Endpoints Inventory

This document catalogs ALL API endpoints from the monolithic `api-server-express.js` that need migration to the new modular structure.

## Migration Status Legend

- ✅ **Migrated** - Fully migrated to new structure
- 🚧 **In Progress** - Partially migrated
- ⏳ **Pending** - Not yet started
- 📝 **Documented** - Exists in OpenAPI spec

---

## Health & System (✅ COMPLETE)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/health` | ✅ | Health | Basic health check |
| GET | `/api/health` | ✅ | Health | Detailed health |
| GET | `/api/health/database` | ✅ | Health | Database health |
| GET | `/api/health/system` | ✅ | Health | System metrics |

---

## Authentication (✅ COMPLETE)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/auth/signup` | ✅ | Auth | User registration |
| POST | `/api/auth/login` | ✅ | Auth | User login |
| POST | `/api/auth/forgot-password` | ✅ | Auth | Request password reset |
| POST | `/api/auth/reset-password` | ✅ | Auth | Reset password |
| POST | `/api/auth/verify-email` | ✅ | Auth | Verify email |
| GET | `/api/auth/profile` | ✅ | Auth | Get user profile |
| PUT | `/api/auth/profile` | ✅ | Auth | Update profile |
| POST | `/api/auth/logout` | ✅ | Auth | Logout user |

---

## Crawler & Analysis (🚧 PARTIAL)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/crawler/start` | ✅ | Crawler | Start crawling session |
| POST | `/api/crawler/stop` | ✅ | Crawler | Stop crawling |
| GET | `/api/crawler/status` | ✅ | Crawler | Get crawler status |
| POST | `/api/crawler/crawl-once` | ✅ | Crawler | Single page crawl |
| GET | `/api/crawler-admin/config` | ⏳ | Crawler | Get crawler config |
| PUT | `/api/crawler-admin/config` | ⏳ | Crawler | Update config |
| POST | `/api/crawler-admin/start-batch` | ⏳ | Crawler | Batch crawl |
| GET | `/api/crawler-admin/sessions` | ⏳ | Crawler | List sessions |
| GET | `/api/crawler-admin/sessions/:id` | ⏳ | Crawler | Get session details |

---

## Blockchain & Mining (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/blockchain/mine` | ⏳ | Blockchain | Start mining |
| GET | `/api/blockchain/status` | ⏳ | Blockchain | Mining status |
| GET | `/api/blockchain/balance` | ⏳ | Blockchain | Get wallet balance |
| POST | `/api/blockchain/transaction` | ⏳ | Blockchain | Create transaction |
| GET | `/api/blockchain/contracts` | ⏳ | Blockchain | List smart contracts |
| POST | `/api/blockchain/deploy-contract` | ⏳ | Blockchain | Deploy contract |
| POST | `/api/mining/start` | ⏳ | Mining | Start mining process |
| POST | `/api/mining/stop` | ⏳ | Mining | Stop mining |
| GET | `/api/mining/stats` | ⏳ | Mining | Mining statistics |
| GET | `/api/mining/rewards` | ⏳ | Mining | Get rewards |

---

## Space Mining & POO (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/space-mining/optimize` | ⏳ | SpaceMining | Optimize DOM space |
| GET | `/api/space-mining/metrics` | ⏳ | SpaceMining | Space metrics |
| POST | `/api/poo/submit` | ⏳ | POO | Submit proof |
| GET | `/api/poo/verify/:id` | ⏳ | POO | Verify proof |
| GET | `/api/poo/leaderboard` | ⏳ | POO | Optimization leaderboard |

---

## Analytics & Dashboard (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/stats/dashboard` | ⏳ | Analytics | Dashboard stats |
| GET | `/api/stats/optimizations` | ⏳ | Analytics | Optimization stats |
| GET | `/api/stats/user/:id` | ⏳ | Analytics | User statistics |
| GET | `/api/dashboard/complete` | ⏳ | Dashboard | Complete dashboard |
| GET | `/api/analytics/real-time` | ⏳ | Analytics | Real-time metrics |

---

## SEO & Optimization (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/seo/models` | ⏳ | SEO | List SEO models |
| POST | `/api/seo/models/train` | ⏳ | SEO | Train model |
| POST | `/api/seo/models/:id/deploy` | ⏳ | SEO | Deploy model |
| GET | `/api/seo/training/stats` | ⏳ | SEO | Training statistics |
| POST | `/api/seo/analyze` | ⏳ | SEO | Analyze page |
| GET | `/api/seo/recommendations/:url` | ⏳ | SEO | Get recommendations |
| POST | `/api/optimization/apply` | ⏳ | Optimization | Apply optimization |
| GET | `/api/optimization/history` | ⏳ | Optimization | Optimization history |

---

## Workflow & Automation (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/workflow-admin/workflows/summary` | ⏳ | Workflow | Workflow summary |
| POST | `/api/workflow/verify-schemas` | ⏳ | Workflow | Verify schemas |
| POST | `/api/workflow/create-schemas` | ⏳ | Workflow | Create schemas |
| GET | `/api/workflow/templates` | ⏳ | Workflow | List templates |
| GET | `/api/workflow/templates/:id/tasks` | ⏳ | Workflow | Template tasks |
| GET | `/api/schema-linking/latest` | ⏳ | Workflow | Latest schemas |
| POST | `/api/workflow/create` | ⏳ | Workflow | Create workflow |
| GET | `/api/workflow-admin/neural` | ⏳ | Workflow | Neural instances |

---

## Component Generator & AI (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/component-generator/bundles` | ⏳ | ComponentGen | List bundles |
| GET | `/api/component-generator/bundles/:id` | ⏳ | ComponentGen | Get bundle |
| POST | `/api/component-generator/bundles` | ⏳ | ComponentGen | Create bundle |
| PUT | `/api/component-generator/bundles/:id` | ⏳ | ComponentGen | Update bundle |
| DELETE | `/api/component-generator/bundles/:id` | ⏳ | ComponentGen | Delete bundle |
| POST | `/api/component-generator/generate` | ⏳ | ComponentGen | AI generation |
| POST | `/api/ai/generate-layout` | ⏳ | AI | Generate layout |
| POST | `/api/ollama/generate-workflow` | ⏳ | AI | Generate workflow |

---

## Component Analyzer (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/component-analyzer/analyze` | ⏳ | Analyzer | Analyze components |
| GET | `/api/component-analyzer/analyses` | ⏳ | Analyzer | List analyses |
| GET | `/api/component-analyzer/components` | ⏳ | Analyzer | List components |
| GET | `/api/component-analyzer/components/statistics` | ⏳ | Analyzer | Component stats |
| GET | `/api/component-analyzer/dashboards` | ⏳ | Analyzer | List dashboards |
| POST | `/api/component-analyzer/dashboards` | ⏳ | Analyzer | Create dashboard |
| GET | `/api/component-analyzer/seo/components` | ⏳ | Analyzer | SEO components |
| GET | `/api/component-analyzer/seo/research` | ⏳ | Analyzer | SEO research |
| GET | `/api/component-analyzer/seo/mappings` | ⏳ | Analyzer | SEO mappings |
| GET | `/api/component-analyzer/library` | ⏳ | Analyzer | Component library |
| POST | `/api/component-analyzer/visualizations` | ⏳ | Analyzer | Create viz |
| GET | `/api/component-analyzer/visualizations` | ⏳ | Analyzer | List visualizations |
| GET | `/api/component-analyzer/health` | ⏳ | Analyzer | Health check |

---

## Metaverse & Marketplace (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/metaverse/marketplace/items` | ⏳ | Metaverse | List items |
| GET | `/api/metaverse/marketplace/items/:id` | ⏳ | Metaverse | Get item |
| POST | `/api/metaverse/marketplace/items` | ⏳ | Metaverse | Create item |
| PUT | `/api/metaverse/marketplace/items/:id` | ⏳ | Metaverse | Update item |
| POST | `/api/metaverse/marketplace/purchase` | ⏳ | Metaverse | Purchase item |
| GET | `/api/metaverse/mining/status` | ⏳ | Metaverse | Mining status |
| GET | `/api/metaverse/rewards` | ⏳ | Metaverse | Mining rewards |

---

## Wallet & Transactions (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/wallet/balance` | ⏳ | Wallet | Get balance |
| GET | `/api/wallet/transactions` | ⏳ | Wallet | Transaction history |
| POST | `/api/wallet/send` | ⏳ | Wallet | Send tokens |
| GET | `/api/wallet/address` | ⏳ | Wallet | Get address |

---

## Data Integration (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/data/import` | ⏳ | Data | Import data |
| POST | `/api/data/export` | ⏳ | Data | Export data |
| GET | `/api/data/sources` | ⏳ | Data | List sources |
| POST | `/api/data/sync` | ⏳ | Data | Sync data |

---

## Training & AI Models (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/training/models` | ⏳ | Training | List models |
| POST | `/api/training/start` | ⏳ | Training | Start training |
| GET | `/api/training/status/:id` | ⏳ | Training | Training status |
| POST | `/api/training/stop/:id` | ⏳ | Training | Stop training |

---

## Testing & Debug (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| GET | `/api/test/ping` | ⏳ | Test | Ping test |
| POST | `/api/test/echo` | ⏳ | Test | Echo test |
| GET | `/api/debug/logs` | ⏳ | Debug | Get logs |
| POST | `/api/debug/simulate-error` | ⏳ | Debug | Simulate error |

---

## Advanced Node Operations (⏳ PENDING)

| Method | Endpoint | Status | Module | Description |
|--------|----------|--------|---------|-------------|
| POST | `/api/advanced/node/create` | ⏳ | AdvancedNode | Create node |
| GET | `/api/advanced/node/list` | ⏳ | AdvancedNode | List nodes |
| PUT | `/api/advanced/node/:id` | ⏳ | AdvancedNode | Update node |
| DELETE | `/api/advanced/node/:id` | ⏳ | AdvancedNode | Delete node |

---

## Summary Statistics

**Total Endpoints**: ~248
**Migrated**: 15 (✅)
**In Progress**: 0 (🚧)
**Pending**: 233 (⏳)

**Completion**: 6%

---

## Migration Priority Order

1. ✅ **Health & System** - COMPLETE
2. ✅ **Authentication** - COMPLETE  
3. ✅ **Crawler** (Basic) - COMPLETE
4. ⏳ **Analytics & Dashboard** - HIGH PRIORITY
5. ⏳ **Blockchain & Mining** - HIGH PRIORITY
6. ⏳ **SEO & Optimization** - HIGH PRIORITY
7. ⏳ **Workflow & Automation** - MEDIUM PRIORITY
8. ⏳ **Crawler** (Advanced) - MEDIUM PRIORITY
9. ⏳ **Component Generator** - MEDIUM PRIORITY
10. ⏳ **Metaverse & Marketplace** - MEDIUM PRIORITY
11. ⏳ **Wallet & Transactions** - LOW PRIORITY
12. ⏳ **Data Integration** - LOW PRIORITY
13. ⏳ **Training & AI** - LOW PRIORITY
14. ⏳ **Testing & Debug** - LOW PRIORITY

---

## Notes

- All endpoints follow REST conventions
- Authentication required where marked
- Validation schemas defined in OpenAPI spec
- WebSocket events documented separately
- Rate limiting applied to all endpoints
- CORS enabled for frontend integration

## Next Steps

1. Prioritize high-value endpoints first
2. Create route/controller/service for each module
3. Update OpenAPI spec as we go
4. Test each endpoint thoroughly
5. Update frontend integration
6. Monitor and optimize

---

**Last Updated**: 2025-11-02
**Maintained By**: LightDom Team
