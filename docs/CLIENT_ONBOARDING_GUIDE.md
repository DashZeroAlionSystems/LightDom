# Client Onboarding Guide

## 🎯 Overview

This guide documents the LightDom client onboarding process - a secure, step-by-step workflow that collects necessary information, analyzes client needs, and sets up their SEO optimization account.

## 🚀 Onboarding Flow

### Process Overview

```
Start → Business Info → SEO Analysis → Plan Selection → Setup → Configuration → Complete
  1          2              3              4              5          6            7
```

**Total Steps:** 7  
**Estimated Time:** 15-20 minutes  
**Session Duration:** 7 days (auto-expires if not completed)

## 📋 Step-by-Step Breakdown

### Step 1: Welcome
**Purpose:** Introduce LightDom and collect email  
**Duration:** ~30 seconds  
**Component Type:** Welcome screen

**Required Fields:**
- Email address

**Validation:**
- Valid email format
- Email not already registered (optional check)

**UI Elements:**
- Welcome message
- Platform overview video (optional)
- Email input field
- "Get Started" button

---

### Step 2: Business Information
**Purpose:** Understand client's business and goals  
**Duration:** ~2 minutes  
**Component Type:** Form

**Required Fields:**
- Company name
- Website URL
- Industry (dropdown)

**Optional Fields:**
- Business size (Startup / Small / Medium / Enterprise)
- Number of employees
- Target market regions

**Validation:**
- Company name: 2-255 characters
- Website URL: Valid URL format, accessible
- Industry: From predefined list

**UI Elements:**
- Text inputs
- Dropdown selectors
- Industry icons for better UX
- Real-time validation feedback

**Industry Options:**
- E-commerce & Retail
- SaaS & Technology
- Professional Services
- Healthcare & Medical
- Real Estate
- Education
- Finance & Insurance
- Travel & Hospitality
- Manufacturing
- Other

---

### Step 3: SEO Analysis
**Purpose:** Analyze website and identify opportunities  
**Duration:** ~3 minutes (mostly automated)  
**Component Type:** Analysis with progress indicator

**Process:**
1. Crawl homepage and key pages
2. Analyze existing meta tags
3. Check schema markup presence
4. Measure Core Web Vitals
5. Identify optimization opportunities
6. Compare with industry benchmarks

**Optional Inputs:**
- Target keywords (up to 10)
- Competitor URLs (up to 3)

**Output:**
- Current SEO score (0-100)
- Potential improvement estimate
- Key issues identified
- Recommended optimizations

**UI Elements:**
- Progress bar showing analysis stages
- Real-time updates as analysis progresses
- Results dashboard with visualizations
- Before/After comparison preview

---

### Step 4: Plan Selection
**Purpose:** Choose subscription tier  
**Duration:** ~1.5 minutes  
**Component Type:** Plan comparison grid

**Required Fields:**
- Selected plan (Starter / Professional / Business / Enterprise)
- Billing cycle (Monthly / Annual)

**Plans Overview:**

| Feature | Starter | Professional | Business | Enterprise |
|---------|---------|-------------|----------|------------|
| **Price** | $79/mo | $249/mo | $599/mo | Custom |
| **Page Views** | 10,000 | 100,000 | 500,000 | Unlimited |
| **Domains** | 1 | 5 | 20 | Unlimited |
| **Schemas** | 5 types | 15+ types | All types | Custom |
| **Support** | Email | Priority | Dedicated | 24/7 |
| **Reports** | Monthly | Weekly | Daily | Real-time |

**UI Elements:**
- Plan comparison cards
- Feature highlights
- Popular plan badge
- Savings indicator for annual billing
- "Free Trial" availability
- Plan details modal

**Discounts:**
- Annual billing: 20% off (2 months free)
- First month: 50% off (promotional)

---

### Step 5: Setup Method
**Purpose:** Choose integration method  
**Duration:** ~1 minute  
**Component Type:** Selection with technical details

**Required Fields:**
- Integration type (Script Injection / API / Plugin)

**Optional Fields:**
- Technical level (Beginner / Intermediate / Expert)
- Platform (WordPress / Shopify / Custom / Other)

**Integration Options:**

#### Option 1: Script Injection (Recommended)
**Best For:** Quick setup, non-technical users  
**Setup Time:** 5 minutes  
**Requirements:** Access to website's HTML

**Process:**
```html
<!-- Add to <head> section -->
<script async src="https://cdn.lightdom.io/seo/v1/lightdom-seo.js"
        data-api-key="YOUR_API_KEY"></script>
```

#### Option 2: API Integration
**Best For:** Developers, custom implementations  
**Setup Time:** 30-60 minutes  
**Requirements:** Backend development access

**Process:**
- Receive API credentials
- Install SDK or make REST calls
- Configure optimization triggers
- Test integration

#### Option 3: Plugin (WordPress/Shopify)
**Best For:** Platform-specific users  
**Setup Time:** 10 minutes  
**Requirements:** Plugin installation permissions

**Process:**
- Install plugin from marketplace
- Enter API key in settings
- Configure optimization preferences
- Activate plugin

**UI Elements:**
- Integration method cards with pros/cons
- Difficulty indicators
- Setup time estimates
- Preview of setup instructions

---

### Step 6: Configuration
**Purpose:** Customize SEO optimization preferences  
**Duration:** ~2 minutes  
**Component Type:** Configuration form

**Configuration Options:**

**SEO Goals (select multiple):**
- Increase organic traffic
- Improve keyword rankings
- Boost local SEO
- Enhance conversion rate
- Improve page speed
- Generate more leads
- Increase e-commerce sales

**Optimization Preferences:**
- Auto-apply optimizations (Yes/No)
- Schema types to prioritize
- Meta tag generation (Automatic/Manual review)
- Core Web Vitals monitoring (Enabled/Disabled)
- A/B testing participation (Opt-in/Opt-out)

**Notification Preferences:**
- Email frequency (Daily/Weekly/Monthly)
- Alert types (All/Important only/None)
- Performance reports (Yes/No)

**UI Elements:**
- Checkbox groups
- Toggle switches
- Multi-select dropdowns
- Information tooltips
- "Skip for now" option

---

### Step 7: Completion
**Purpose:** Provide setup instructions and next steps  
**Duration:** ~30 seconds  
**Component Type:** Success screen with instructions

**Provided Information:**
- Client ID
- API Key (shown once, securely)
- Setup instructions specific to chosen integration method
- Links to documentation
- Support contact information
- Quick start guide

**Next Steps:**
1. Install LightDom script/plugin
2. Verify installation (automatic check available)
3. Wait 24 hours for initial data collection
4. View first performance report
5. Explore dashboard features

**UI Elements:**
- Success animation/confetti
- API key display with copy button
- Step-by-step setup instructions
- "Copy Setup Code" button
- "Go to Dashboard" button
- "Schedule Onboarding Call" option

---

## 🔒 Security Considerations

### Session Management
- **Session Token:** 128-character random hex string
- **Expiration:** 7 days from creation
- **Storage:** Server-side only (not in browser localStorage)
- **Validation:** Every API call validates token

### Data Protection
- Email validation prevents spam
- Rate limiting prevents abuse (10 starts per minute per IP)
- Input sanitization prevents XSS
- All data encrypted at rest
- HTTPS required for all requests

### Privacy
- Minimal data collection
- GDPR compliant
- Clear privacy policy link
- Opt-in for marketing communications
- Data deletion available upon request

## 🎨 UI/UX Best Practices

### Design Principles

**1. Progressive Disclosure**
- Show information as needed
- Don't overwhelm with all options at once
- Use expandable sections for advanced options

**2. Clear Progress Indication**
- Step indicator showing current position
- Percentage complete
- Estimated time remaining
- Previous steps always accessible

**3. Helpful Guidance**
- Tooltips for technical terms
- Example data for input fields
- Error messages that explain how to fix issues
- Contextual help links

**4. Mobile Responsive**
- Single column layout on mobile
- Large touch targets (44x44px minimum)
- Simplified forms for smaller screens
- Native mobile inputs (date pickers, etc.)

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation supported
- Screen reader friendly
- Color contrast meets standards (4.5:1 minimum)
- Focus indicators clearly visible

## 📊 Analytics & Optimization

### Metrics to Track

**Conversion Funnel:**
- Starts: Users who begin onboarding
- Step completions: % reaching each step
- Abandonments: Where users drop off
- Completions: % who finish all steps
- Time per step: Average and median
- Overall completion time

**Drop-off Analysis:**
- Identify high-drop-off steps
- A/B test improvements
- Optimize form fields
- Simplify complex steps

**Success Metrics:**
- Onboarding completion rate: Target 65%+
- Average completion time: Target <20 minutes
- Setup success rate: Users who successfully integrate
- 7-day activation: Users active after 7 days

## 🔧 Technical Implementation

### API Endpoints

**Start Onboarding:**
```bash
POST /api/v1/onboarding/start
Content-Type: application/json

{
  "email": "user@example.com",
  "metadata": {
    "referralSource": "google_ads",
    "utmCampaign": "summer_promo"
  }
}

Response:
{
  "sessionToken": "abc123...",
  "currentStep": 1,
  "totalSteps": 7,
  "expiresAt": "2024-11-09T12:00:00Z"
}
```

**Update Step Data:**
```bash
POST /api/v1/onboarding/steps/2
X-Session-Token: abc123...
Content-Type: application/json

{
  "companyName": "Tech Startup Inc",
  "websiteUrl": "https://example.com",
  "industry": "saas"
}

Response:
{
  "success": true
}
```

**Move to Next Step:**
```bash
POST /api/v1/onboarding/next
X-Session-Token: abc123...

Response:
{
  "success": true,
  "nextStep": 3
}
```

**Complete Onboarding:**
```bash
POST /api/v1/onboarding/complete
X-Session-Token: abc123...

Response:
{
  "success": true,
  "clientId": "client_123",
  "apiKey": "ld_live_abcdef...",
  "message": "Onboarding completed successfully"
}
```

### React Component Usage

```tsx
import { useState } from 'react';
import { TimelineStep } from '@/components/ui/infographics';

function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { number: 1, title: 'Welcome', icon: UserPlus },
    { number: 2, title: 'Business Info', icon: Building },
    { number: 3, title: 'SEO Analysis', icon: Search },
    // ... more steps
  ];

  return (
    <div className="space-y-6">
      {steps.map(step => (
        <TimelineStep
          key={step.number}
          stepNumber={step.number}
          title={step.title}
          completed={step.number < currentStep}
          active={step.number === currentStep}
          icon={step.icon}
        />
      ))}
    </div>
  );
}
```

## 🆘 Support & Troubleshooting

### Common Issues

**Issue: Email already registered**
- **Solution:** Provide "Login instead" link
- **Alternative:** Offer password reset flow

**Issue: Website analysis fails**
- **Reason:** Website not accessible, robots.txt blocking
- **Solution:** Allow manual entry of basic info, analyze later

**Issue: Session expired**
- **Solution:** Offer to resume where they left off
- **Implementation:** Store partial data, new session inherits progress

**Issue: Payment processing fails**
- **Solution:** Multiple payment methods, clear error messages
- **Alternative:** Offer to complete setup, add payment later

### Support Resources
- **Live Chat:** Available during business hours
- **Email Support:** support@lightdom.io (24-hour response)
- **Documentation:** https://docs.lightdom.io/onboarding
- **Video Tutorials:** https://lightdom.io/tutorials
- **Community Forum:** https://community.lightdom.io

## 📈 Future Enhancements

### Planned Features
- [ ] AI-powered plan recommendation
- [ ] Video call scheduling integration
- [ ] Competitor benchmarking during analysis
- [ ] Multi-language support
- [ ] Social proof (testimonials, case studies)
- [ ] Guided tour of dashboard after completion
- [ ] Integration templates for popular platforms
- [ ] Bulk onboarding for agencies

### A/B Testing Ideas
- Step order optimization
- Form field reduction
- Plan presentation variations
- Pricing display experiments
- CTA button copy testing

---

**Document Version:** 1.0.0  
**Last Updated:** 2024-11-02  
**Maintained By:** LightDom Product Team
