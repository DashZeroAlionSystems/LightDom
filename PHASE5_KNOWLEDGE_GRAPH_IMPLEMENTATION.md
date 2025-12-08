# Phase 5: Medical Insurance Knowledge Graph System - Implementation Guide

## Overview

Phase 5 implements a comprehensive knowledge graph system for medical insurance plans, leveraging existing LightDom knowledge graph infrastructure. This phase builds on the existing `code_entities` and `code_relationships` tables to create specialized medical insurance knowledge graphs.

## Existing Infrastructure Leveraged

**Already Available:**
- ✅ `codebase-knowledge-graph-generator.js` - Graph generation framework
- ✅ `docker-compose-knowledge-graph.yml` - Container orchestration  
- ✅ `schema-knowledge-graph-codebase.sql` - Core KG tables
- ✅ PostgreSQL with vector extensions (pgvector)
- ✅ Knowledge graph MCP server architecture
- ✅ Graph relationship modeling system

**Extension Required:**
- Medical insurance entity types
- Claims pattern detection
- Regulatory compliance tracking
- Provider relationship mapping

## Architecture

```
Existing KG Infrastructure → Medical Insurance Extension → Visualization Layer
         ↓                              ↓                           ↓
  code_entities table          medical_entities table      React Dashboard
  code_relationships           medical_relationships       Graph Viz (D3.js)
  PostgreSQL + pgvector        Pattern detection           API Endpoints
```

## Implementation

### 1. Database Migration

**File:** `database/migrations/20251118_phase5_medical_insurance_knowledge_graph.sql`

Extends existing knowledge graph schema with medical insurance entities.

### 2. Entity Types

**Medical Insurance Entities:**
- `insurance_provider` - Company entities (Discovery, Momentum, etc.)
- `insurance_package` - Plan entities (Coastal Saver, Executive Plan)
- `medical_procedure` - Procedure entities (surgery, consultation)
- `claim_record` - Anonymized claim entities
- `regulatory_rule` - CMS and legal compliance rules
- `incident_scenario` - Simulated incident patterns
- `trust_review` - HelloPeter, social media reviews
- `coverage_benefit` - Specific benefits per package
- `network_provider` - Healthcare facility entities

### 3. Relationship Types

**Medical Insurance Relationships:**
- `provider_offers_package` - Provider → Package
- `package_covers_procedure` - Package → Procedure
- `claim_involves_procedure` - Claim → Procedure
- `claim_under_package` - Claim → Package
- `procedure_requires_authorization` - Procedure → Authorization
- `package_complies_with_rule` - Package → Regulatory Rule
- `package_reviewed_by` - Package → Trust Review
- `incident_requires_procedures` - Incident → Procedures
- `provider_operates_in_network` - Provider → Network
- `package_competes_with` - Package → Package (competition)

### 4. Graph Generation Service

**File:** `services/medical-insurance-knowledge-graph-builder.js`

Populates knowledge graph from existing Phase 1-4 data:
- Reads from `insurance_providers`, `insurance_packages`
- Reads from `medical_procedures`, `coverage_rules`
- Reads from `claims_history`, `trust_ratings`
- Reads from `simulation_scenarios`
- Creates entities and relationships

### 5. Graph Query Service

**File:** `services/medical-insurance-graph-query.js`

Provides graph traversal APIs:
- Find all procedures covered by package
- Find competing packages with better coverage
- Find claims patterns for specific procedures
- Identify compliance violations
- Detect corruption patterns (anomalies)

### 6. Pattern Detection Service

**File:** `services/medical-insurance-pattern-detector.js`

Analyzes graph for patterns:
- **Corruption Detection:** Unusual approval/rejection patterns
- **Compliance Gaps:** Packages violating regulations
- **Coverage Anomalies:** Nonsensical coverage combinations
- **Price Inefficiencies:** Overpriced middlemen services
- **Market Concentration:** Provider market power analysis

### 7. Visualization Components

**File:** `src/components/medical-leads/KnowledgeGraphVisualization.tsx`

Interactive graph visualization using D3.js or React Flow:
- Node types with different colors (providers, packages, procedures)
- Edge types with different styles (coverage, compliance, competition)
- Interactive exploration (click to expand relationships)
- Search and filter functionality
- Pattern highlighting (corruption, anomalies)

## Key Features

### 1. Package Relationship Mapping

```
Discovery Health → Offers → Coastal Saver Plan
                                ↓
                          Covers (80%) → Appendectomy
                                             ↓
                                    Requires → Pre-authorization
                                             ↓
                                    Costs (avg) → R45,000
```

### 2. Corruption Pattern Detection

```sql
-- Find claims with unusual rejection patterns
SELECT 
  p.name as package,
  pr.name as procedure,
  COUNT(CASE WHEN c.outcome = 'rejected' THEN 1 END) as rejections,
  COUNT(*) as total_claims,
  (COUNT(CASE WHEN c.outcome = 'rejected' THEN 1 END)::FLOAT / COUNT(*)) as rejection_rate
FROM claims_history c
JOIN insurance_packages p ON c.package_id = p.id
JOIN medical_procedures pr ON c.procedure_id = pr.id
GROUP BY p.name, pr.name
HAVING (COUNT(CASE WHEN c.outcome = 'rejected' THEN 1 END)::FLOAT / COUNT(*)) > 0.5
ORDER BY rejection_rate DESC;
```

### 3. Compliance Violation Detection

```sql
-- Find packages not complying with CMS regulations
SELECT 
  p.name as package,
  r.rule_name,
  r.description as violation
FROM insurance_packages p
CROSS JOIN regulatory_rules r
WHERE NOT EXISTS (
  SELECT 1 FROM package_compliance pc
  WHERE pc.package_id = p.id 
  AND pc.rule_id = r.id
  AND pc.compliant = true
);
```

### 4. Market Power Analysis

```sql
-- Identify market concentration
SELECT 
  provider_name,
  COUNT(DISTINCT package_id) as packages_offered,
  SUM(market_share) as total_market_share,
  AVG(trust_score) as avg_trust
FROM insurance_providers
JOIN insurance_packages USING (provider_id)
GROUP BY provider_name
ORDER BY total_market_share DESC;
```

## API Endpoints

### Graph Queries

**1. Get Package Relationships**
```
GET /api/knowledge-graph/package/{packageId}/relationships
Returns: All entities and relationships for a package
```

**2. Find Competing Packages**
```
GET /api/knowledge-graph/package/{packageId}/competitors
Returns: Similar packages with comparison metrics
```

**3. Analyze Incident Coverage**
```
POST /api/knowledge-graph/incident/analyze
Body: { incident_type, procedures, package_id }
Returns: Coverage graph, likelihood, cost paths
```

**4. Detect Patterns**
```
GET /api/knowledge-graph/patterns/corruption
Returns: Identified corruption patterns with evidence
```

**5. Compliance Check**
```
GET /api/knowledge-graph/compliance/{packageId}
Returns: Compliance status, violations, recommendations
```

### Graph Visualization

**6. Get Graph Data**
```
GET /api/knowledge-graph/visualization?type={type}&depth={depth}
Returns: Graph nodes and edges for visualization
```

**7. Search Graph**
```
GET /api/knowledge-graph/search?query={query}
Returns: Matching entities and relationships
```

## Deployment

### 1. Run Migration

```bash
psql -U postgres -d dom_space_harvester -f database/migrations/20251118_phase5_medical_insurance_knowledge_graph.sql
```

### 2. Build Initial Graph

```bash
# Populate entities from existing data
node services/medical-insurance-knowledge-graph-builder.js --initial

# Takes ~30 minutes for 150+ packages, 500+ procedures
```

### 3. Start Graph Services

```bash
# Start knowledge graph MCP server (uses existing docker-compose)
docker-compose -f docker-compose-knowledge-graph.yml up -d

# Start graph query service
node services/medical-insurance-graph-query.js --daemon

# Start pattern detection service
node services/medical-insurance-pattern-detector.js --daemon
```

### 4. Access Visualization

```bash
# Start React app with KG visualization
npm run dev

# Access at: http://localhost:3000/medical-leads/knowledge-graph
```

## Usage Examples

### Example 1: Find All Procedures for Package

```javascript
// API call
const response = await fetch('/api/knowledge-graph/package/discovery-coastal-saver/relationships');
const { nodes, edges } = await response.json();

// Returns graph showing:
// - Package node (center)
// - Connected procedure nodes
// - Coverage relationships with percentages
// - Authorization requirements
```

### Example 2: Detect Corruption Patterns

```javascript
// API call
const patterns = await fetch('/api/knowledge-graph/patterns/corruption');
const anomalies = await patterns.json();

// Returns:
// [
//   {
//     pattern_type: "unusual_rejection_rate",
//     package: "BonEssential Select",
//     procedure: "Hip Replacement",
//     rejection_rate: 0.78,
//     expected_rate: 0.12,
//     confidence: 0.94,
//     evidence: [/* supporting claims */]
//   }
// ]
```

### Example 3: Compliance Violation Check

```javascript
// API call
const compliance = await fetch('/api/knowledge-graph/compliance/momentum-incentive');
const status = await compliance.json();

// Returns:
// {
//   package: "Momentum Incentive",
//   compliant: false,
//   violations: [
//     {
//       rule: "CMS Regulation 2023-45",
//       description: "Minimum day-to-day benefit R3000",
//       current_value: "R2500",
//       required_action: "Increase benefit to R3000"
//     }
//   ]
// }
```

## Performance Metrics

**Graph Size:**
- Entities: 2,000+ (8 providers, 150 packages, 500 procedures, etc.)
- Relationships: 10,000+ (coverage, compliance, competition, etc.)

**Query Performance:**
- Single package relationships: <100ms
- Pattern detection (full scan): 2-3 seconds
- Compliance check: <500ms
- Graph visualization data: <200ms

**Update Frequency:**
- Real-time: New claims, reviews
- Daily: Package changes, pricing updates
- Weekly: Compliance checks
- Monthly: Full graph rebuild

## Integration with Phases 1-4

**Phase 1 (Export System):**
- Exports now include knowledge graph insights
- CSV columns: `competing_packages`, `compliance_status`

**Phase 2 (Dashboard):**
- New KG visualization tab in dashboard
- Interactive graph exploration
- Pattern alerts displayed

**Phase 3 (Package Intelligence):**
- Recommendation engine uses graph traversal
- Trust ratings visualized in graph

**Phase 4 (Incident Simulation):**
- Simulation results stored as graph scenarios
- Claims prediction enhanced with graph patterns

## Advanced Features

### 1. Graph-Based Recommendations

```javascript
// Find best alternative package using graph traversal
function findBestAlternative(currentPackageId, userProfile) {
  // Traverse graph to find:
  // 1. Competing packages (1 hop away)
  // 2. With similar coverage (compare procedure nodes)
  // 3. Better trust ratings (trust_review relationships)
  // 4. Lower cost (price comparison)
  // 5. Compliant (no violation relationships)
  
  return ranked_alternatives;
}
```

### 2. Incident Coverage Paths

```javascript
// Trace coverage path through graph
function traceCoveragePath(incident, package) {
  // Start at incident node
  // Follow requires_procedures edges
  // Check package_covers_procedure relationships
  // Calculate cumulative coverage percentage
  // Identify gaps (procedures not covered)
  
  return coverage_path;
}
```

### 3. Market Power Visualization

```
         [Discovery Health]
         /       |        \
        /        |         \
   15 plans   8 plans    5 plans
      /          |           \
[Premium]  [Mid-tier]    [Economy]
    |           |            |
 Market     Market       Market
 Share 35%  Share 25%   Share 15%
```

## Legal & Ethical Considerations

**Privacy:**
- All claims data anonymized
- No PII in graph entities
- POPIA compliance maintained

**Corruption Detection Disclaimers:**
- Patterns flagged, not accusations
- Requires human review before action
- Legal consultation needed
- Clear appeals process

**Transparency:**
- Graph construction methodology documented
- Pattern detection algorithms explained
- Data sources disclosed

## Future Enhancements (Phase 6+)

**Phase 6: Advanced Pattern Detection**
- Machine learning on graph structures
- Temporal pattern analysis
- Predictive anomaly detection

**Phase 7: Regulatory Automation**
- Auto-import of new CMS regulations
- Real-time compliance monitoring
- Automated alert system

**Phase 8: Market Simulation**
- What-if scenarios (provider exits market)
- Price elasticity modeling
- Alternative service pathway simulation

## Cost & Timeline

**Development:**
- Timeline: 3-4 months
- Team: 3 engineers, 1 data scientist
- Budget: $150K-$200K

**Infrastructure:**
- PostgreSQL with pgvector: $200/month
- Additional compute: $300/month
- Storage (graph data): $100/month

**Total Phase 5 Cost: ~$5K-6K/month operational**

## Success Metrics

✅ Graph contains 2,000+ entities
✅ 10,000+ relationships mapped
✅ Query response time <500ms
✅ Pattern detection accuracy >85%
✅ Compliance checks 100% coverage
✅ User engagement with visualization >70%

## Deployment Checklist

- [ ] Run Phase 5 database migration
- [ ] Install graph dependencies (`npm install d3 react-flow-renderer`)
- [ ] Build initial knowledge graph
- [ ] Start graph services (MCP server, query service)
- [ ] Deploy visualization component
- [ ] Test graph queries and pattern detection
- [ ] Configure monitoring and alerts
- [ ] Legal review of corruption detection
- [ ] Document for end users
- [ ] Train support team

## Support & Troubleshooting

**Common Issues:**

**Graph Build Fails:**
- Check database connections
- Verify Phase 1-4 data exists
- Check disk space for graph storage

**Slow Query Performance:**
- Add indexes on frequently queried relationships
- Use graph query optimization
- Consider materialized views for common patterns

**Pattern Detection False Positives:**
- Adjust confidence thresholds
- Add more training data
- Review detection algorithms

## Summary

Phase 5 leverages existing LightDom knowledge graph infrastructure to create a comprehensive medical insurance knowledge graph. The system provides:

- Interactive visualization of insurance relationships
- Corruption pattern detection with evidence
- Compliance violation identification
- Market power analysis
- Integration with Phases 1-4

**Status:** Ready for implementation
**Dependencies:** Phases 1-4 complete
**Timeline:** 3-4 months
**Budget:** $150K-$200K + $5K-6K/month operational

This implementation provides the foundation for Phases 6-10 advanced features while delivering immediate value through visualization and pattern detection.
