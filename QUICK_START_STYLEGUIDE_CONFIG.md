# Quick Start Guide: Styleguide Configuration System

## Getting Started in 5 Minutes

### Step 1: Access the Admin Interface

Navigate to one of these URLs:
```
http://localhost:3000/admin/styleguide-config
http://localhost:3000/admin/menu-builder
http://localhost:3000/admin/component-builder
```

### Step 2: Create Your First Category

1. Click **"Categories"** tab
2. Click **"Create Category"** button
3. Fill in the form:
   - **Name**: Typography
   - **Description**: Typography design tokens
   - **Importance**: 8/10
4. Click **"Save"**

### Step 3: Create a Workflow

1. Click **"Workflows"** tab
2. Click **"Create Workflow"** button
3. Fill in:
   - **Name**: Content Publishing
   - **Description**: Automated content publishing
   - **Categories**: Select your Typography category
   - **Enable Automation**: Toggle ON
   - **SEO Goals**: Type "accessibility", "performance"
4. Click **"Save"**

### Step 4: Create an SEO Campaign

1. Click **"Campaigns"** tab
2. Click **"Create Campaign"** button
3. Configure:
   - **Name**: Product Launch Campaign
   - **Type**: SEO
   - **Categories**: Select Typography
   - **Workflows**: Select Content Publishing
   - **Automation Settings**:
     - ✓ Bulk Data Mining
     - ✓ Self Optimization
     - ✓ Search Algorithm Beating
   - **SEO Settings**:
     - ✓ Auto Generate Rich Snippets
     - ✓ Self-Enriching Snippets
     - **Target Ranking**: 5
     - ✓ Competitor Tracking
   - **Simulation Settings**:
     - ✓ Enable Simulation
     - ✓ Low Cost Mode
     - ✓ High Accuracy
4. Click **"Save"**

### Step 5: Configure a Headless Container

1. Click **"Containers"** tab
2. Click **"Create Container"** button
3. Set up:
   - **Name**: SEO Crawler
   - **Node.js Version**: 20
   - **API Port**: 3001
   - ✓ Headless Mode
   - **Electron Settings**:
     - ✓ Enable Electron
     - ✓ Test Mode
4. Click **"Save"**

## Using the Menu Builder

### Create a Custom Admin Menu

1. Navigate to `/admin/menu-builder`
2. **Add a Section**:
   - Click **"Add Section"**
   - Name: "My Tools"
   - Click **"Save"**
3. **Add Menu Items**:
   - Select your new section
   - Click **"Add Menu Item"**
   - Fill in:
     - Label: "Analytics"
     - Icon: Dashboard
     - Path: /admin/analytics
   - Click **"Save"**
4. **Reorder Items**:
   - Drag and drop items to reorder
   - Changes are saved automatically
5. **Export**:
   - Click **"Export Config"**
   - Download your menu configuration

## Using the Component Builder

### Create a Custom Component

1. Navigate to `/admin/component-builder`
2. **Browse Library**:
   - Expand "Basic" category
   - Click on "Button" to add it to canvas
3. **Edit Properties**:
   - Select the button on canvas
   - In properties panel:
     - Text: "Get Started"
     - Type: primary
     - Size: large
     - Disabled: false
4. **Add More Components**:
   - Click "Input" from Form category
   - Click "Card" from Layout category
5. **View Generated Code**:
   - Click "Code" tab
   - See React component code
6. **View Schema**:
   - Click "Schema" tab
   - See Schema.org markup
7. **Export**:
   - Click **"Export"**
   - Download configuration

## Using the API

### Example: Create a Category via API

```javascript
const response = await fetch('/api/styleguide-config/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Colors',
    description: 'Color palette',
    attributes: [
      {
        id: 'primary',
        name: 'Primary Color',
        category: 'colors',
        value: '#1890ff',
        importance: 10,
        relationships: {
          dependsOn: [],
          affects: ['buttons', 'links'],
          exchangesWith: []
        },
        workflow: {
          automatable: true,
          simulationWeight: 1.0
        },
        seo: {
          richSnippetRelevance: 6,
          searchAlgorithmImpact: 5
        }
      }
    ],
    workflows: [],
    campaigns: [],
    importance: 8,
    relationships: {
      parentCategories: [],
      childCategories: [],
      relatedCategories: []
    }
  })
});

const result = await response.json();
console.log('Created category:', result.data);
```

### Example: Run a Simulation

```javascript
const response = await fetch('/api/styleguide-config/simulate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attributeIds: ['primary', 'font-family'],
    config: {
      iterations: 10000,
      costOptimized: true,
      highAccuracy: true,
      liveExchange: true
    }
  })
});

const result = await response.json();
console.log('Simulation results:', result.data);
/*
{
  optimizedValues: { ... },
  seoImpact: 0.85,
  costEfficiency: 0.95,
  accuracy: 0.98
}
*/
```

### Example: Generate Rich Snippets

```javascript
const campaignId = 'campaign_123';
const response = await fetch(
  `/api/styleguide-config/campaigns/${campaignId}/rich-snippets`
);

const result = await response.json();
console.log('Rich snippets:', result.data);
/*
{
  "@context": "https://schema.org",
  "@type": "Product",
  "schemas": [
    {
      "attributeId": "primary",
      "schemaProperty": "Primary Color",
      "value": "#1890ff",
      "importance": 10
    }
  ]
}
*/
```

## Common Workflows

### Workflow 1: Design System Setup

1. Create categories for:
   - Typography
   - Colors
   - Spacing
   - Components
2. Add attributes to each category
3. Create workflow: "Design Token Extraction"
4. Link categories to workflow
5. Enable automation
6. Export configuration

### Workflow 2: SEO Campaign Launch

1. Create SEO campaign
2. Select relevant categories
3. Enable all automation features:
   - Bulk data mining
   - Self-optimization
   - Algorithm beating
4. Configure rich snippets:
   - Auto-generate
   - Self-enriching
5. Set target ranking (e.g., #3)
6. Enable simulation
7. Launch campaign

### Workflow 3: Component Library Integration

1. Open component builder
2. Add components from library
3. Configure properties
4. Generate code
5. Generate schema
6. Export configuration
7. Import into your codebase

### Workflow 4: Custom Admin Menu

1. Open menu builder
2. Create sections
3. Add menu items
4. Drag to reorder
5. Export configuration
6. Apply to admin panel

## Tips & Best Practices

### Categories
- Use clear, descriptive names
- Set importance based on impact
- Group related attributes
- Document relationships

### Workflows
- Keep workflows focused (3-5 steps)
- Use clear trigger conditions
- Set realistic automation goals
- Monitor workflow execution

### Campaigns
- Start with conservative target rankings
- Enable automation gradually
- Monitor simulation results
- Track competitor changes

### Containers
- Use headless mode for production
- Enable Electron for testing
- Configure appropriate ports
- Test thoroughly before deployment

### Simulations
- Start with fewer iterations for testing
- Use high-accuracy mode for decisions
- Monitor cost efficiency
- Adjust weights based on results

### Rich Snippets
- Set relevance threshold > 7
- Include all required properties
- Validate schema.org compliance
- Test with Google's Rich Results Test

## Troubleshooting

### Issue: Category not appearing in workflow
**Solution**: Refresh the page, categories are loaded on component mount

### Issue: Drag and drop not working
**Solution**: Ensure @dnd-kit packages are installed (`npm install`)

### Issue: API endpoint returns 404
**Solution**: Check that Express server is running and routes are registered

### Issue: Simulation runs slowly
**Solution**: Reduce iteration count or enable low-cost mode

### Issue: Rich snippets not generating
**Solution**: Ensure campaign has categories with attributes that have richSnippetRelevance > 5

## Next Steps

1. **Explore** - Try all three admin interfaces
2. **Create** - Set up your first category and workflow
3. **Test** - Run a simulation
4. **Integrate** - Use the API in your application
5. **Customize** - Build your own components
6. **Deploy** - Configure headless containers
7. **Optimize** - Launch SEO campaigns

## Support

- Documentation: `STYLEGUIDE_CONFIG_SYSTEM_README.md`
- Demo: `node demo-styleguide-config-system.js`
- API Health: `GET /api/styleguide-config/health`

## Resources

- [Ant Design Components](https://ant.design/components/overview/)
- [Schema.org Documentation](https://schema.org/)
- [React DnD Kit](https://dndkit.com/)
- [SEO Best Practices](https://developers.google.com/search/docs)

---

**Ready to get started? Navigate to `/admin/styleguide-config` now!**
