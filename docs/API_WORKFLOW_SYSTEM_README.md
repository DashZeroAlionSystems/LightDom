# API Management & Workflow System Documentation

## 🌟 Overview

This comprehensive documentation covers the complete API Management and User Workflow System for the LightDom platform. The system provides:

- **API Discovery & Management** - Automatic endpoint discovery and service bundling
- **User Management** - Complete user lifecycle from registration to subscription
- **Payment Processing** - Stripe integration with subscriptions and webhooks
- **Error Handling** - Intelligent error management with auto-retry and diagnosis
- **Workflow Automation** - n8n workflow templates with code generation
- **Service Campaigns** - Bundle services into complete business solutions

---

## 📚 Complete Documentation (204KB)

### 🚀 Start Here

**[Quick Start Guide](./QUICK_START_GUIDE.md)** (18KB)
- Environment setup
- Common tasks
- Use case examples
- API reference summary
- Troubleshooting

### 🔧 Core Guides

1. **[API Management Service](./API_MANAGEMENT_SERVICE.md)** (27KB)
   - Automatic API endpoint discovery from code
   - Service bundling and dynamic routing
   - Real-time API watcher with file monitoring
   - Configuration management with JSON schemas
   - Campaign orchestration system

2. **[User Creation Workflow](./USER_CREATION_WORKFLOW.md)** (28KB)
   - Email/password registration with validation
   - Session management with JWT tokens
   - User profile and portfolio management
   - Complete workflow automation
   - API reference and examples

3. **[SSO Integration Guide](./SSO_INTEGRATION_GUIDE.md)** (22KB)
   - GitHub OAuth setup and implementation
   - Google OAuth setup and implementation
   - Passport.js configuration
   - React UI components
   - Security best practices

4. **[Stripe Integration Guide](./STRIPE_INTEGRATION_GUIDE.md)** (29KB)
   - Complete Stripe account setup
   - Subscription management (create, update, cancel)
   - Payment method handling
   - Webhook integration with event processing
   - React payment components

5. **[Error Handling Guide](./ERROR_HANDLING_GUIDE.md)** (30KB)
   - Global error interceptor middleware
   - Retry mechanism with exponential backoff
   - Circuit breaker pattern
   - Error classification and delegation
   - Automatic error diagnosis

6. **[n8n Workflow Templates](./N8N_WORKFLOW_TEMPLATES.md)** (27KB)
   - Workflow template schema system
   - Code template generator
   - Variable injection and validation
   - Workflow bundling (sequential, parallel, conditional)
   - n8n API integration

7. **[Service Campaigns Guide](./SERVICE_CAMPAIGNS_GUIDE.md)** (23KB)
   - Campaign architecture and hierarchy
   - Service bundle organization
   - Schema-driven component generation
   - DeepSeek integration
   - Configuration management

---

## 🎯 Key Features

### API Management
✅ Automatic endpoint discovery from code files  
✅ Dynamic service bundling  
✅ Real-time API monitoring  
✅ Schema-driven configuration  
✅ Dynamic route registration  

### User Management
✅ Complete registration and authentication flows  
✅ Multi-provider SSO (GitHub, Google)  
✅ JWT session management  
✅ User profiles and portfolios  
✅ Password validation and security  

### Payment Processing
✅ Stripe subscription management  
✅ Multiple payment methods  
✅ Webhook event handling  
✅ Invoice generation  
✅ Customer portal integration  

### Error Handling
✅ Intelligent error classification  
✅ Automatic retry with exponential backoff  
✅ Circuit breaker for external services  
✅ Error pattern detection  
✅ Auto-remediation  

### Workflow Automation
✅ Reusable n8n workflow templates  
✅ Variable injection system  
✅ Sequential/parallel/conditional execution  
✅ Workflow bundling  
✅ Service campaign integration  

### Service Campaigns
✅ Complete business solution bundling  
✅ Schema-driven component generation  
✅ AI-powered configuration (DeepSeek)  
✅ Modular service organization  
✅ Automated deployment  

---

## 📖 Documentation by Topic

### Getting Started
- [Quick Start Guide](./QUICK_START_GUIDE.md) - Start here for setup and basics
- [System Architecture](#system-architecture) - Understand the overall structure

### User Features
- [User Creation Workflow](./USER_CREATION_WORKFLOW.md) - User registration and management
- [SSO Integration](./SSO_INTEGRATION_GUIDE.md) - Social login setup
- [Stripe Integration](./STRIPE_INTEGRATION_GUIDE.md) - Payment processing

### Developer Features
- [API Management](./API_MANAGEMENT_SERVICE.md) - API discovery and bundling
- [n8n Workflows](./N8N_WORKFLOW_TEMPLATES.md) - Workflow automation
- [Error Handling](./ERROR_HANDLING_GUIDE.md) - Error management

### Advanced Features
- [Service Campaigns](./SERVICE_CAMPAIGNS_GUIDE.md) - Complete solution bundling

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      LightDom Platform                          │
│                                                                 │
│  Frontend (React + Ant Design)    ←→    API Layer (Express)    │
│  - User interfaces                       - REST APIs            │
│  - SSO buttons                           - Endpoints discovery  │
│  - Payment forms                         - Service bundling     │
│  - CRUD components                       - Error handling       │
│                                                                 │
│  Workflow Engine (n8n)            ←→    Database (PostgreSQL)   │
│  - User creation                         - Users & profiles     │
│  - Payment processing                    - Subscriptions        │
│  - Email notifications                   - API endpoints        │
│  - Campaign execution                    - Workflows            │
│                                                                 │
│  External Services                ←→    AI Services             │
│  - Stripe (payments)                     - DeepSeek (AI gen)    │
│  - GitHub (OAuth)                        - Auto-configuration   │
│  - Google (OAuth)                        - Component gen        │
│  - SendGrid (email)                      - Schema generation    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
npm install passport passport-github2 passport-google-oauth20
npm install express-session connect-pg-simple
npm install chokidar ajv axios
```

### 2. Configure Environment

Create `.env` file:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lightdom

# Authentication
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# n8n
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key
```

### 3. Setup Database

```bash
createdb lightdom
psql -d lightdom -f migrations/001_api_management.sql
psql -d lightdom -f migrations/002_user_management.sql
psql -d lightdom -f migrations/003_payment_system.sql
```

### 4. Start Services

```bash
npm run start:complete
```

---

## 📊 Database Schema Overview

### Core Tables

- **Users & Authentication**
  - `users` - User accounts
  - `user_profiles` - Extended user information
  - `user_sessions` - Active sessions
  - `oauth_accounts` - SSO account links
  - `verification_tokens` - Email verification

- **Payments & Subscriptions**
  - `user_plans` - Subscription plans
  - `user_subscriptions` - Active subscriptions
  - `payment_methods` - Stored payment methods
  - `payment_transactions` - Payment history
  - `invoices` - Generated invoices
  - `stripe_events` - Webhook event log

- **API Management**
  - `api_endpoints` - Registered endpoints
  - `service_bundles` - Service collections
  - `service_endpoints` - Endpoint mappings
  - `campaigns` - Service campaigns
  - `campaign_services` - Campaign mappings
  - `endpoint_changelog` - Change history

- **Workflows**
  - `workflow_templates` - Reusable templates
  - `workflow_instances` - Generated workflows
  - `workflow_executions` - Execution logs

- **Error Management**
  - `error_logs` - Error tracking
  - `error_patterns` - Pattern detection
  - `error_resolutions` - Resolution tracking

---

## 🎯 Use Cases

### Complete User Onboarding
1. User registers with email/password or SSO
2. Email verification sent and confirmed
3. User profile created automatically
4. Free plan assigned
5. Welcome email sent
6. User can upgrade to paid plan

### API Service Discovery
1. Developer creates new API route file
2. File watcher detects change
3. Endpoints automatically discovered
4. Registered in database
5. Available for service bundling
6. Documentation auto-generated

### Payment Processing
1. User selects paid plan
2. Stripe checkout initiated
3. Payment processed
4. Webhook confirms success
5. Subscription created
6. User granted premium features
7. Invoice generated and emailed

### Workflow Automation
1. Define workflow template
2. Configure variables
3. Generate workflow instance
4. Deploy to n8n
5. Execute automatically
6. Monitor and log results

---

## 🔧 API Examples

### User Registration

```javascript
POST /api/users/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Create Subscription

```javascript
POST /api/payments/subscriptions
{
  "priceId": "price_pro_monthly",
  "paymentMethodId": "pm_xxx"
}
```

### Discover Endpoints

```javascript
POST /api/management/endpoints/discover
{
  "paths": ["./api", "./services"]
}
```

### Generate Workflow

```javascript
POST /api/workflows/templates/user-creation/instances
{
  "name": "User Registration Flow",
  "variables_data": {
    "email": "new@example.com",
    "password": "SecurePass123!",
    "firstName": "Jane",
    "planType": "free"
  }
}
```

---

## 🧪 Testing

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

---

## 📝 Best Practices

### Security
✅ Use environment variables for secrets  
✅ Validate all user inputs  
✅ Implement rate limiting  
✅ Use HTTPS in production  
✅ Hash passwords with bcrypt  
✅ Verify webhook signatures  

### Error Handling
✅ Classify all errors  
✅ Implement retry logic  
✅ Use circuit breakers  
✅ Log with context  
✅ Monitor error patterns  

### API Management
✅ Version all endpoints  
✅ Use JSON schemas  
✅ Document automatically  
✅ Monitor performance  
✅ Implement caching  

### Workflows
✅ Make operations idempotent  
✅ Handle failures gracefully  
✅ Log all executions  
✅ Version templates  
✅ Test thoroughly  

---

## 🚨 Troubleshooting

### Database Issues
```bash
# Check connection
psql -d lightdom -c "SELECT version();"

# Run migrations
psql -d lightdom -f migrations/xxx.sql
```

### OAuth Issues
- Verify callback URLs match exactly
- Check client ID and secret
- Ensure proper scopes requested

### Stripe Issues
```bash
# Test webhooks locally
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### n8n Issues
- Verify n8n is running
- Check API key is correct
- Review workflow logs

---

## 📚 Additional Resources

### External Documentation
- [Stripe API Docs](https://stripe.com/docs/api)
- [Passport.js Guide](http://www.passportjs.org/)
- [n8n Documentation](https://docs.n8n.io/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

### Related LightDom Docs
- [BLOCKCHAIN_INTEGRATION_SUMMARY.md](../BLOCKCHAIN_INTEGRATION_SUMMARY.md)
- [DEEPSEEK_N8N_COMPLETE_GUIDE.md](../DEEPSEEK_N8N_COMPLETE_GUIDE.md)
- [MINING_SYSTEM_README.md](../MINING_SYSTEM_README.md)

---

## 🤝 Contributing

To add new features or documentation:

1. Follow existing patterns
2. Add comprehensive documentation
3. Include code examples
4. Write tests
5. Update this README

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

For questions or issues:
1. Check the [Quick Start Guide](./QUICK_START_GUIDE.md)
2. Review relevant documentation
3. Check troubleshooting sections
4. Create GitHub issue

---

**🌟 Complete API Management & Workflow System**  
**Built for the LightDom Platform**  
**204KB of comprehensive documentation**  
**7 detailed guides + Quick Start**

---

Last Updated: November 2025  
Documentation Version: 1.0.0
