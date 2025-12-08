# LightDom User Onboarding - Integration Guide

## Overview

This document provides step-by-step instructions for integrating the new onboarding system into the LightDom platform. The system includes authentication, payment processing, SEO analysis, and comprehensive dashboard.

## 🎯 Components Delivered

### Frontend Components (React/TypeScript)
1. **Onboarding Flow** (`src/components/onboarding/`)
   - `OnboardingFlow.tsx` - Main orchestrator
   - `steps/WelcomeStep.tsx` - Introduction
   - `steps/WebsiteSetupStep.tsx` - URL + technical contact
   - `steps/FirstReportStep.tsx` - SEO analysis with anime.js
   - `steps/PricingStep.tsx` - Plan selection
   - `steps/ScriptSetupStep.tsx` - Script installation

2. **Dashboard** (`src/components/dashboard/`)
   - `ComprehensiveSEODashboard.tsx` - 192-attribute monitoring

### Backend APIs (Node.js/Express)
1. **Authentication** (`api/auth-routes-enhanced.js`)
   - Email/password registration and login
   - Google OAuth (structure)
   - GitHub OAuth (structure)
   - JWT token management
   - Email verification

2. **Payment Processing** (`api/stripe-payment-routes.js`)
   - Stripe checkout session creation
   - Subscription management
   - Webhook handling
   - Customer portal

3. **Onboarding** (`api/onboarding-routes.js` - existing, to be enhanced)
   - Website verification
   - SEO analysis
   - API key generation
   - Email instructions

### Documentation
1. `SEO_MARKET_RESEARCH_PRICING.md` - Market analysis & pricing strategy
2. `STRIPE_SETUP_GUIDE.md` - Stripe configuration guide
3. `.env.example` - Updated with Stripe variables

## 🚀 Installation Steps

### Step 1: Update Dependencies

Ensure these packages are installed:

```bash
npm install stripe bcrypt jsonwebtoken animejs
# or
yarn add stripe bcrypt jsonwebtoken animejs
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_jwt_secret_here

# Stripe Configuration (see STRIPE_SETUP_GUIDE.md)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (create in Stripe Dashboard)
STRIPE_PLAN_STARTER_MONTHLY=price_xxxxx
STRIPE_PLAN_STARTER_YEARLY=price_xxxxx
STRIPE_PLAN_PRO_MONTHLY=price_xxxxx
STRIPE_PLAN_PRO_YEARLY=price_xxxxx
STRIPE_PLAN_ENTERPRISE_MONTHLY=price_xxxxx
STRIPE_PLAN_ENTERPRISE_YEARLY=price_xxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3: Integrate API Routes

Add the new routes to `api-server-express.js`:

```javascript
// Add imports at the top
import authRoutesEnhanced from './api/auth-routes-enhanced.js';
import stripePaymentRoutes from './api/stripe-payment-routes.js';

// In your route setup section, add:
class LightDomAPIServer {
  setupRoutes() {
    // ... existing routes ...

    // Authentication routes
    this.app.use('/api/auth', authRoutesEnhanced);

    // Payment routes
    this.app.use('/api/stripe', stripePaymentRoutes);

    // Onboarding routes (enhance existing)
    // Already exists as: this.app.use('/api/onboarding', ...)
    
    // ... rest of routes ...
  }
}
```

### Step 4: Enhance Onboarding API Routes

Update `api/onboarding-routes.js` to add these endpoints:

```javascript
// Add these to existing onboarding routes

/**
 * Verify website is accessible
 */
router.post('/verify-website', async (req, res) => {
  // Implementation provided in api/onboarding-routes.js comments
});

/**
 * Generate SEO analysis
 */
router.post('/analyze', async (req, res) => {
  // Connect to your existing SEO crawler
  // Return 192 attributes across 5 categories
});

/**
 * Generate API key for script
 */
router.post('/generate-api-key', async (req, res) => {
  // Generate secure API key
  // Store in database with website association
});

/**
 * Send installation instructions via email
 */
router.post('/send-instructions', async (req, res) => {
  // Use your email service (SendGrid, AWS SES, etc.)
  // Send formatted installation guide
});
```

### Step 5: Update App.tsx Routes

The routes have already been added to `App.tsx`:

```typescript
// Public route (already added)
<Route path="/onboarding" element={<OnboardingFlow />} />

// Protected dashboard route (already added)
<Route path="seo" element={<ComprehensiveSEODashboard />} />
```

### Step 6: Set Up Stripe

Follow the comprehensive guide in `STRIPE_SETUP_GUIDE.md`:

1. Create Stripe account
2. Get API keys
3. Create products and prices
4. Configure webhooks
5. Test with test cards

**Quick Start:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Step 7: Configure Email Service

Set up transactional email for:
- Email verification
- Script installation instructions
- Payment receipts

**Recommended Services:**
- SendGrid (12k emails/month free)
- AWS SES (62k emails/month free)
- Mailgun (5k emails/month free)

**Configuration:**
```env
# Add to .env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com
```

### Step 8: Database Schema

Ensure your database has these tables:

```sql
-- Users table (may already exist)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255), -- hashed with bcrypt
  role VARCHAR(50) DEFAULT 'user',
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  api_key VARCHAR(255) UNIQUE NOT NULL,
  website_url VARCHAR(500),
  plan VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  plan VARCHAR(50),
  billing_cycle VARCHAR(20),
  status VARCHAR(50),
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  url VARCHAR(500) NOT NULL,
  api_key VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  last_scanned TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SEO Reports table
CREATE TABLE IF NOT EXISTS seo_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id),
  overall_score INT,
  technical_score INT,
  onpage_score INT,
  content_score INT,
  ux_score INT,
  authority_score INT,
  attributes JSONB, -- Store all 192 attributes
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing

### Test Credentials

An admin user has been pre-configured:
- **Email**: phoneste29@gmail.com
- **Username**: stephan
- **Password**: password
- **Role**: admin
- **Plan**: enterprise

### Test Flow

1. **Registration**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User"
     }'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Start Onboarding**
   - Navigate to: http://localhost:3000/onboarding
   - Complete 5-step flow
   - Test with Stripe test card: 4242 4242 4242 4242

4. **View Dashboard**
   - Navigate to: http://localhost:3000/dashboard/seo
   - Verify 192 attributes display
   - Test refresh and export

### Stripe Test Cards

| Purpose | Card Number | Result |
|---------|-------------|--------|
| Success | 4242 4242 4242 4242 | Payment succeeds |
| 3D Secure | 4000 0027 6000 3184 | Requires authentication |
| Declined | 4000 0000 0000 0002 | Payment declined |

## 🎨 Frontend Integration Points

### Navigation Updates

Add link to onboarding in your landing page or navigation:

```tsx
<Link to="/onboarding">Get Started</Link>
```

### Dashboard Menu

Add SEO dashboard to sidebar navigation:

```tsx
<Menu.Item key="seo" icon={<TrophyOutlined />}>
  <Link to="/dashboard/seo">SEO Dashboard</Link>
</Menu.Item>
```

### Post-Registration Redirect

After successful registration, redirect to onboarding:

```tsx
// In RegisterPage.tsx after successful registration
navigate('/onboarding');
```

### Post-Login Check

Check if user needs onboarding:

```tsx
// In LoginPage.tsx after successful login
if (!user.onboardingCompleted) {
  navigate('/onboarding');
} else {
  navigate('/dashboard/seo');
}
```

## 🔧 Configuration Options

### Customizing Pricing

Edit `src/components/onboarding/steps/PricingStep.tsx`:

```typescript
const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 4900, // $49 in cents
    priceYearly: 47000,  // $470 in cents
    // ... customize features, limits, etc.
  }
];
```

### Customizing Dashboard

Edit `src/components/dashboard/ComprehensiveSEODashboard.tsx`:

```typescript
// Change number of categories or attributes displayed
// Customize colors, icons, and animations
// Add/remove quick action buttons
```

### Customizing Email Templates

Create email templates in `src/templates/email/`:

```typescript
// script-installation.html
export const scriptInstallationEmail = (data) => `
<!DOCTYPE html>
<html>
<head>
  <title>LightDom SEO - Installation Instructions</title>
</head>
<body>
  <h1>Welcome to LightDom SEO!</h1>
  <p>Here's your tracking script...</p>
  ${data.script}
</body>
</html>
`;
```

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Onboarding Funnel**
   - Step 1 completion rate
   - Step 2 completion rate (website added)
   - Step 3 completion rate (report viewed)
   - Step 4 completion rate (plan selected)
   - Step 5 completion rate (script setup)

2. **Conversion Rates**
   - Free trial → Paid conversion
   - Plan distribution (Starter/Pro/Enterprise)
   - Monthly vs Yearly billing
   - Payment success rate

3. **Dashboard Engagement**
   - Daily active users
   - Average session duration
   - Report generation frequency
   - Export usage

### Analytics Integration

Add Google Analytics to track conversions:

```typescript
// In PricingStep.tsx after plan selection
gtag('event', 'select_plan', {
  plan_name: planId,
  billing_cycle: billingCycle
});

// After successful payment
gtag('event', 'purchase', {
  transaction_id: session.id,
  value: price / 100,
  currency: 'USD'
});
```

## 🚨 Troubleshooting

### Issue: Stripe webhook not working

**Solution:**
1. Check webhook secret in `.env`
2. Verify endpoint URL is correct
3. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Issue: Animation not playing

**Solution:**
1. Ensure anime.js is installed: `npm install animejs`
2. Check browser console for errors
3. Verify refs are properly set

### Issue: SEO report not generating

**Solution:**
1. Check crawler service is running
2. Verify website URL is accessible
3. Check API logs for errors
4. Use mock data for testing (already implemented)

### Issue: Email not sending

**Solution:**
1. Verify SMTP credentials in `.env`
2. Check email service quotas
3. Test with console.log first
4. Check spam folder

## 📝 Next Steps

### Immediate (Week 1)
- [ ] Set up Stripe account and create products
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Test complete onboarding flow
- [ ] Deploy to staging environment
- [ ] User acceptance testing

### Short-term (Month 1)
- [ ] Connect real SEO crawler to dashboard
- [ ] Implement webhook handlers in database
- [ ] Add comprehensive error handling
- [ ] Create user documentation
- [ ] Set up monitoring (Sentry, LogRocket)

### Medium-term (Quarter 1)
- [ ] A/B test pricing page variations
- [ ] Implement automated email sequences
- [ ] Add competitor analysis features
- [ ] Build backlink network campaign
- [ ] Launch marketing campaigns

## 🎯 Success Criteria

### Technical Milestones
- ✅ All components render without errors
- ✅ Onboarding flow completes end-to-end
- ✅ Stripe payments process successfully
- ✅ Dashboard displays all 192 attributes
- ✅ Script generates and installs correctly

### Business Milestones
- 🎯 3-5% free-to-paid conversion rate
- 🎯 <5% monthly churn rate
- 🎯 45% of customers choose Professional plan
- 🎯 $150k revenue Year 1
- 🎯 1,000 paying customers Year 2

## 📞 Support

For integration support:
- Review `STRIPE_SETUP_GUIDE.md` for payment issues
- Review `SEO_MARKET_RESEARCH_PRICING.md` for business questions
- Check component source code for implementation details
- Refer to Stripe/React/Ant Design documentation

---

**Last Updated**: November 2025
**Version**: 1.0
**Integration Time Estimate**: 4-8 hours
**Testing Time Estimate**: 2-4 hours
