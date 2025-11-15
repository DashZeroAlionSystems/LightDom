# API Management & Workflow System - Quick Start Guide

## Overview

This quick start guide provides an overview of the complete API Management and User Workflow System implemented for the LightDom platform. Follow this guide to understand the system architecture and get started quickly.

## 📚 Documentation Index

### Core Documentation (186KB Total)

1. **[API Management Service](./API_MANAGEMENT_SERVICE.md)** (27KB)
   - Automatic API endpoint discovery
   - Service bundling and routing
   - Real-time API monitoring
   - Configuration management

2. **[User Creation Workflow](./USER_CREATION_WORKFLOW.md)** (28KB)
   - User registration and authentication
   - Profile management
   - Session handling
   - Portfolio creation

3. **[SSO Integration Guide](./SSO_INTEGRATION_GUIDE.md)** (22KB)
   - GitHub OAuth setup
   - Google OAuth setup
   - React components
   - Security best practices

4. **[Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md)** (29KB)
   - Payment processing
   - Subscription management
   - Webhook handling
   - Customer portal

5. **[Error Handling Guide](./ERROR_HANDLING_GUIDE.md)** (30KB)
   - Global error interceptor
   - Retry mechanisms
   - Error classification
   - Auto-diagnosis

6. **[n8n Workflow Templates](./N8N_WORKFLOW_TEMPLATES.md)** (27KB)
   - Workflow templates
   - Code generation
   - Variable injection
   - Workflow bundling

7. **[Service Campaigns Guide](./SERVICE_CAMPAIGNS_GUIDE.md)** (23KB)
   - Campaign architecture
   - Component generation
   - DeepSeek integration
   - Campaign deployment

---

## 🚀 Quick Start

### Step 1: Environment Setup

Create `.env` file with required variables:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lightdom
DB_USER=postgres
DB_PASSWORD=postgres

# Authentication
JWT_SECRET=your-secret-key-here
SESSION_SECRET=your-session-secret-here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key

# Application
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
NODE_ENV=development
```

### Step 2: Install Dependencies

```bash
npm install

# Additional packages for the new features
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install passport passport-github2 passport-google-oauth20
npm install express-session connect-pg-simple
npm install chokidar ajv axios
```

### Step 3: Database Setup

Run database migrations:

```bash
# Create database
createdb lightdom

# Run migrations
psql -d lightdom -f migrations/001_api_management.sql
psql -d lightdom -f migrations/002_user_management.sql
psql -d lightdom -f migrations/003_payment_system.sql
psql -d lightdom -f migrations/004_error_handling.sql
psql -d lightdom -f migrations/005_workflow_system.sql
```

### Step 4: Start Services

```bash
# Start all services
npm run start:complete

# Or start individually
npm run dev          # Frontend (port 3000)
npm run api          # API Server (port 3001)
npm run n8n:start    # n8n Workflow Engine (port 5678)
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LightDom Platform                          │
└─────────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │Frontend │         │API Layer│        │Workflow │
   │React+Ant│         │Express  │        │  n8n    │
   └────┬────┘         └────┬────┘        └────┬────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
   │  User   │         │Payment  │        │  Error  │
   │  Mgmt   │         │Stripe   │        │Handling │
   └────┬────┘         └────┬────┘        └────┬────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                       ┌────▼────┐
                       │Database │
                       │PostgreSQL│
                       └─────────┘
```

---

## 📝 Common Tasks

### Create a New User with Email/Password

```javascript
import { UserCreationService } from './services/user-creation-service.js';

const userService = new UserCreationService(db, emailService);

const { user } = await userService.registerWithEmail({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  username: 'johndoe',
  first_name: 'John',
  last_name: 'Doe'
});

console.log('User created:', user.id);
```

### Setup GitHub OAuth Login

```javascript
// Backend: api-server-express.js
import { configurePassport } from './config/passport.js';
import authRoutes from './api/auth-routes.js';

const passport = configurePassport(db);
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);
```

```jsx
// Frontend: Login component
import { SSOButtons } from './components/SSOButtons';

function Login() {
  return (
    <div>
      <h1>Sign In</h1>
      <SSOButtons />
    </div>
  );
}
```

### Create a Stripe Subscription

```javascript
import { StripePaymentService } from './services/stripe-payment-service.js';

const paymentService = new StripePaymentService(db);

const { subscription, clientSecret } = await paymentService.createSubscription(
  userId,
  'price_pro_monthly'
);

// Send clientSecret to frontend for payment confirmation
```

### Discover and Register API Endpoints

```javascript
import { APIDiscoveryService } from './services/api-discovery-service.js';

const discovery = new APIDiscoveryService(db);

// Scan for endpoints
const endpoints = await discovery.scanDirectory('./api');

// Register them
const registered = await discovery.registerEndpoints(endpoints);

console.log(`Registered ${registered.length} endpoints`);
```

### Create a Service Bundle

```javascript
import { ServiceBundler } from './services/service-bundler.js';

const bundler = new ServiceBundler(db);

const service = await bundler.createService({
  name: 'user-management',
  display_name: 'User Management Service',
  description: 'Complete user CRUD operations',
  base_path: '/services/users',
  endpoints: userEndpoints,
  config: {
    auth_required: true,
    rate_limit: 100
  }
});
```

### Generate Workflow from Template

```javascript
import { WorkflowTemplateGenerator } from './services/workflow-template-generator.js';

const generator = new WorkflowTemplateGenerator(db);

const instance = await generator.generateInstance(
  'user-creation-workflow',
  {
    name: 'User Registration Flow',
    variables_data: {
      email: 'new@example.com',
      password: 'SecurePass123!',
      firstName: 'Jane',
      lastName: 'Doe',
      planType: 'free',
      sendWelcomeEmail: true
    }
  }
);
```

### Deploy a Complete Campaign

```javascript
import { CampaignBuilder } from './services/campaign-builder.js';

const builder = new CampaignBuilder(db);

const campaign = await builder
  .defineCampaign({
    name: 'User Onboarding Campaign',
    description: 'Complete user onboarding with payment',
    type: 'user-management'
  })
  .addService('user-authentication')
  .addService('user-profiles')
  .addService('subscription-management')
  .addService('email-notifications')
  .setConfig({
    registration: {
      requireEmailVerification: true,
      defaultPlan: 'free'
    }
  })
  .build();
```

---

## 🎯 Use Case Examples

### Use Case 1: Complete User Registration Flow

**Scenario**: New user signs up with email, verifies account, and starts free trial

**Implementation**:
1. User submits registration form
2. System creates user account (see USER_CREATION_WORKFLOW.md)
3. Verification email sent automatically
4. User clicks verification link
5. Account activated, free plan assigned
6. Welcome email sent

**Code**:
```javascript
// This is handled by the user-creation-workflow n8n template
// See N8N_WORKFLOW_TEMPLATES.md for the complete workflow definition
```

### Use Case 2: User Upgrades to Paid Plan

**Scenario**: Free user upgrades to Pro plan with Stripe

**Implementation**:
1. User selects Pro plan on pricing page
2. Stripe checkout initiated
3. Payment processed via Stripe
4. Webhook confirms payment
5. Subscription created in database
6. User granted Pro features
7. Confirmation email sent

**Code**:
```javascript
// Frontend
const handleUpgrade = async (priceId) => {
  const response = await fetch('/api/payments/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId })
  });
  
  const { clientSecret } = await response.json();
  
  // Use Stripe Elements to confirm payment
  const { error } = await stripe.confirmCardPayment(clientSecret);
  
  if (!error) {
    // Success - webhook will handle the rest
    showSuccess('Subscription activated!');
  }
};
```

### Use Case 3: GitHub SSO Login

**Scenario**: User logs in with GitHub account

**Implementation**:
1. User clicks "Continue with GitHub"
2. Redirected to GitHub OAuth
3. User authorizes application
4. GitHub redirects back with code
5. System exchanges code for access token
6. System creates or links user account
7. Session created, user logged in

**Code**:
```jsx
// Frontend
<Button onClick={() => window.location.href = '/api/auth/github'}>
  Continue with GitHub
</Button>
```

### Use Case 4: API Endpoint Auto-Discovery

**Scenario**: Developer adds new API routes, system automatically discovers them

**Implementation**:
1. Developer creates new route file
2. File watcher detects change
3. System parses file for endpoints
4. Endpoints registered in database
5. Available for service bundling
6. Documented automatically

**Code**:
```javascript
// System automatically discovers this
router.post('/api/projects', async (req, res) => {
  // Create project
});
```

---

## 🔧 Configuration Examples

### Campaign Configuration Schema

```json
{
  "registration": {
    "requireEmailVerification": true,
    "allowSocialSignup": true,
    "socialProviders": ["github", "google"],
    "passwordPolicy": {
      "minLength": 8,
      "requireUppercase": true,
      "requireNumbers": true,
      "requireSpecialChars": true
    },
    "defaultPlan": "free",
    "trialPeriodDays": 14
  },
  "authentication": {
    "sessionDuration": "7d",
    "mfaEnabled": false,
    "allowedDomains": []
  },
  "email": {
    "provider": "sendgrid",
    "fromEmail": "noreply@lightdom.com",
    "templates": {
      "welcome": "d-template-id",
      "verification": "d-template-id",
      "passwordReset": "d-template-id"
    }
  },
  "payment": {
    "provider": "stripe",
    "billingCycles": ["monthly", "yearly"],
    "gracePeriodDays": 7,
    "autoRetry": true
  }
}
```

### Error Handling Configuration

```javascript
export const errorHandlingConfig = {
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 60000,
    monitoringPeriod: 10000
  },
  notification: {
    criticalErrors: {
      channels: ['slack', 'pagerduty', 'email'],
      recipients: ['oncall@example.com']
    }
  }
};
```

---

## 📊 API Reference Summary

### User Management APIs

```
POST   /api/users/register       - Register new user
POST   /api/users/login          - Login user
GET    /api/users/me             - Get current user
PUT    /api/users/profile        - Update profile
POST   /api/users/verify-email   - Verify email

GET    /api/auth/github          - GitHub OAuth login
GET    /api/auth/google          - Google OAuth login
POST   /api/auth/logout          - Logout user
```

### Payment APIs

```
POST   /api/payments/subscriptions              - Create subscription
PUT    /api/payments/subscriptions/:id          - Update subscription
DELETE /api/payments/subscriptions/:id          - Cancel subscription
POST   /api/payments/payment-methods            - Add payment method
POST   /api/payments/portal                     - Get customer portal URL
POST   /api/stripe/webhook                      - Stripe webhook endpoint
```

### API Management APIs

```
GET    /api/management/endpoints                - List all endpoints
POST   /api/management/endpoints/discover       - Discover endpoints
POST   /api/management/services                 - Create service bundle
GET    /api/management/services/:id/router      - Get service router config
POST   /api/management/campaigns                - Create campaign
POST   /api/management/campaigns/:id/execute    - Execute campaign
```

### Workflow APIs

```
POST   /api/workflows/templates                 - Create template
POST   /api/workflows/templates/:id/instances   - Generate instance
POST   /api/workflows/instances/:id/execute     - Execute workflow
POST   /api/workflows/bundles/execute           - Execute bundle
```

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Example Test

```javascript
// test/user-creation.test.js
import { expect } from 'chai';
import { UserCreationService } from '../services/user-creation-service.js';

describe('User Creation', () => {
  it('should create user with valid email and password', async () => {
    const userService = new UserCreationService(db, emailService);
    
    const { user } = await userService.registerWithEmail({
      email: 'test@example.com',
      password: 'SecurePass123!',
      username: 'testuser'
    });

    expect(user).to.have.property('id');
    expect(user.email).to.equal('test@example.com');
  });
});
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `ECONNREFUSED` when connecting to PostgreSQL

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql
# or
sudo service postgresql start
```

#### 2. OAuth Callback Error

**Error**: `redirect_uri_mismatch`

**Solution**:
- Verify callback URL in OAuth app settings matches `.env`
- Ensure URL includes protocol (`http://` or `https://`)

#### 3. Stripe Webhook Not Working

**Error**: Webhook signature verification failed

**Solution**:
```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Update STRIPE_WEBHOOK_SECRET in .env with the secret from CLI
```

#### 4. n8n Workflow Execution Failed

**Error**: Workflow execution timeout

**Solution**:
- Check n8n server is running
- Verify N8N_API_KEY is correct
- Increase timeout in workflow configuration

---

## 📚 Learning Resources

### Documentation

- [API Management Service](./API_MANAGEMENT_SERVICE.md) - Complete API management guide
- [User Creation Workflow](./USER_CREATION_WORKFLOW.md) - User registration and authentication
- [SSO Integration](./SSO_INTEGRATION_GUIDE.md) - OAuth setup and implementation
- [Stripe Integration](./STRIPE_INTEGRATION_GUIDE.md) - Payment processing
- [Error Handling](./ERROR_HANDLING_GUIDE.md) - Error management
- [n8n Workflows](./N8N_WORKFLOW_TEMPLATES.md) - Workflow automation
- [Service Campaigns](./SERVICE_CAMPAIGNS_GUIDE.md) - Campaign creation

### External Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Passport.js Guide](http://www.passportjs.org/docs/)
- [n8n Documentation](https://docs.n8n.io/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

---

## 🎓 Next Steps

1. **Review Documentation**: Read through all 7 comprehensive guides
2. **Setup Environment**: Configure `.env` with all required credentials
3. **Run Migrations**: Setup database schemas
4. **Test Features**: Try out user registration, SSO, and payments
5. **Create Campaign**: Build your first service campaign
6. **Deploy**: Deploy to production

---

## 💡 Tips & Best Practices

1. **Always validate configuration** against JSON schemas
2. **Use environment variables** for all secrets
3. **Implement proper error handling** at all layers
4. **Log all critical operations** for debugging
5. **Test thoroughly** before deployment
6. **Monitor performance** and errors
7. **Keep documentation updated**
8. **Version all templates and campaigns**
9. **Use TypeScript** for type safety
10. **Follow security best practices**

---

## 🤝 Contributing

When adding new features:

1. **Document thoroughly** - Add to relevant guide
2. **Include examples** - Show real-world usage
3. **Add tests** - Unit, integration, and E2E
4. **Update schemas** - Keep database schemas current
5. **Follow conventions** - Use existing patterns

---

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review relevant documentation
3. Check existing issues on GitHub
4. Create new issue with detailed description

---

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the LightDom Platform**
