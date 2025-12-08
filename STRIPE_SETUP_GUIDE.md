# Stripe Payment Integration - Setup Guide

## Overview

This guide walks you through setting up Stripe payment processing for the LightDom SEO platform. Follow these steps to enable subscription payments and manage customer billing.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to Stripe Dashboard
- Node.js environment with Express server
- LightDom platform installed and running

## Step 1: Create Stripe Account

1. Go to https://stripe.com and sign up
2. Complete business verification (required for live payments)
3. Note: You can start with test mode immediately

## Step 2: Get API Keys

1. Log into Stripe Dashboard
2. Go to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_...`)
4. Click "Reveal test key" and copy your **Secret key** (starts with `sk_test_...`)
5. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
   ```

## Step 3: Create Products and Prices

### Option A: Using Stripe Dashboard (Recommended)

1. Go to **Products** in Stripe Dashboard
2. Click **+ Add product**

#### Create Starter Plan
- **Name**: LightDom SEO - Starter
- **Description**: Perfect for small businesses with up to 3 websites
- **Pricing**:
  - Click **+ Add another price**
  - **Monthly**: $49.00 USD, Recurring monthly
  - **Yearly**: $470.00 USD, Recurring yearly
- Save and copy Price IDs (e.g., `price_1234567890abcdef`)

#### Create Professional Plan
- **Name**: LightDom SEO - Professional
- **Description**: Best for growing businesses with up to 10 websites
- **Pricing**:
  - **Monthly**: $149.00 USD, Recurring monthly
  - **Yearly**: $1,430.00 USD, Recurring yearly
- Save and copy Price IDs

#### Create Enterprise Plan
- **Name**: LightDom SEO - Enterprise
- **Description**: For agencies and large organizations
- **Pricing**:
  - **Monthly**: $499.00 USD, Recurring monthly
  - **Yearly**: $4,790.00 USD, Recurring yearly
- Save and copy Price IDs

### Option B: Using Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Create products and prices
stripe products create \
  --name="LightDom SEO - Starter" \
  --description="Perfect for small businesses with up to 3 websites"

stripe prices create \
  --product=prod_XXXXXX \
  --unit-amount=4900 \
  --currency=usd \
  --recurring[interval]=month

stripe prices create \
  --product=prod_XXXXXX \
  --unit-amount=47000 \
  --currency=usd \
  --recurring[interval]=year
```

## Step 4: Configure Environment Variables

Add all Price IDs to your `.env` file:

```env
# Starter Plan
STRIPE_PLAN_STARTER_MONTHLY=price_1abc123xyz
STRIPE_PLAN_STARTER_YEARLY=price_1def456uvw

# Professional Plan
STRIPE_PLAN_PRO_MONTHLY=price_1ghi789rst
STRIPE_PLAN_PRO_YEARLY=price_1jkl012opq

# Enterprise Plan
STRIPE_PLAN_ENTERPRISE_MONTHLY=price_1mno345lmn
STRIPE_PLAN_ENTERPRISE_YEARLY=price_1pqr678ijk

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Step 5: Set Up Webhooks

Webhooks notify your server of payment events (successful payments, failed payments, subscription cancellations, etc.)

### Development (Local Testing)

1. Install Stripe CLI (see Step 3 Option B)
2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```
3. Copy the webhook signing secret (starts with `whsec_...`)
4. Add to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### Production

1. Go to **Developers** > **Webhooks** in Stripe Dashboard
2. Click **+ Add endpoint**
3. Enter your endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the webhook signing secret
6. Add to production `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

## Step 6: Enable Customer Portal

The Customer Portal allows customers to manage their subscriptions, update payment methods, and view invoices.

1. Go to **Settings** > **Billing** > **Customer portal**
2. Click **Activate**
3. Configure portal settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to cancel subscriptions (optional)
4. Save settings

## Step 7: Configure Payment Settings

1. Go to **Settings** > **Payment methods**
2. Enable payment methods:
   - ✅ Cards (Visa, Mastercard, Amex, etc.)
   - ✅ Apple Pay
   - ✅ Google Pay
   - Consider: ACH Direct Debit, SEPA Direct Debit for European customers

## Step 8: Test the Integration

### Test Card Numbers

Use these card numbers in test mode:

| Card | Number | Behavior |
|------|--------|----------|
| **Successful payment** | 4242 4242 4242 4242 | Always succeeds |
| **Requires authentication** | 4000 0027 6000 3184 | 3D Secure authentication |
| **Declined** | 4000 0000 0000 0002 | Always declined |
| **Insufficient funds** | 4000 0000 0000 9995 | Declined - insufficient funds |

- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

### Testing Workflow

1. Start your local server:
   ```bash
   npm run api
   ```

2. In another terminal, start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

3. Go to http://localhost:3000/onboarding

4. Complete onboarding flow:
   - Welcome → Website Setup → Report → Pricing
   - Select a paid plan
   - Click "Continue" to checkout

5. On Stripe checkout page:
   - Use test card: 4242 4242 4242 4242
   - Enter any future date, CVC, and ZIP
   - Complete payment

6. Verify:
   - You're redirected to success page
   - Webhook events received in terminal
   - Check Stripe Dashboard > **Payments** for successful payment

## Step 9: Going Live

### Before Activating Live Mode

1. **Business Verification**
   - Complete identity verification
   - Provide business information
   - Add bank account for payouts

2. **Update Environment Variables**
   - Replace test keys with live keys (`sk_live_...`, `pk_live_...`)
   - Update webhook secret for production endpoint
   - Update price IDs (create products in live mode)

3. **Update Frontend**
   - Ensure `VITE_STRIPE_PUBLISHABLE_KEY` uses live key in production build

4. **Security Checklist**
   - ✅ HTTPS enabled for all pages
   - ✅ Webhook endpoint secured and validated
   - ✅ Secrets stored securely (environment variables, not in code)
   - ✅ PCI compliance (Stripe handles card data, never touch it)

### Activate Live Mode

1. Go to **Developers** > **API keys**
2. Toggle to **Live mode**
3. Copy live API keys
4. Update production `.env` file
5. Redeploy application

## Step 10: Monitor and Maintain

### Stripe Dashboard

Monitor these sections regularly:

1. **Home** - Overview of payments, customers, MRR
2. **Payments** - All successful/failed payments
3. **Customers** - Customer list, subscription status
4. **Subscriptions** - Active/cancelled subscriptions
5. **Logs** - API requests and webhook events
6. **Radar** - Fraud detection and prevention

### Key Metrics to Track

- Monthly Recurring Revenue (MRR)
- Churn rate
- Failed payment rate
- Average revenue per customer (ARPC)
- Customer lifetime value (LTV)

### Webhooks Status

Check webhook health at **Developers** > **Webhooks**:
- Successful deliveries (should be >99%)
- Failed deliveries (investigate and fix)
- Response times (should be <1 second)

## Troubleshooting

### "No such price" Error

**Problem**: Stripe can't find the price ID
**Solution**: 
- Verify price ID in Stripe Dashboard
- Ensure correct mode (test vs live)
- Check `.env` file for typos

### Webhook Not Receiving Events

**Problem**: Server not receiving webhook notifications
**Solution**:
- Check webhook URL is correct
- Verify webhook secret matches
- Test with `stripe trigger` command
- Check server firewall/security groups

### Payment Declined

**Problem**: Customer's payment fails
**Solution**:
- Check card details are valid
- Verify sufficient funds
- Try different payment method
- Check Stripe Dashboard > **Logs** for details

### Subscription Not Created

**Problem**: Payment succeeds but no subscription
**Solution**:
- Check `checkout.session.completed` webhook is handled
- Verify database is updating correctly
- Check server logs for errors
- Manually create subscription via Stripe Dashboard

## API Endpoints

### Payment Routes (`/api/stripe`)

```
GET    /api/stripe/plans                    - Get all pricing plans
POST   /api/stripe/create-checkout-session  - Create Stripe checkout
GET    /api/stripe/verify-session/:sessionId - Verify payment
GET    /api/stripe/subscriptions            - Get customer subscriptions
POST   /api/stripe/subscriptions/:id/cancel - Cancel subscription
POST   /api/stripe/create-portal-session    - Create customer portal
POST   /api/stripe/webhook                  - Stripe webhook handler
```

### Required Headers

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [PCI Compliance](https://stripe.com/docs/security/guide)

## Support

If you need help:
1. Check [Stripe Dashboard logs](https://dashboard.stripe.com/logs)
2. Review [Stripe Webhook events](https://dashboard.stripe.com/webhooks)
3. Contact Stripe Support: https://support.stripe.com
4. LightDom internal docs: See `/docs/payment-integration.md`

## Costs and Fees

### Stripe Fees
- **Card payments**: 2.9% + $0.30 per successful charge
- **International cards**: +1.5%
- **Currency conversion**: +1%
- **Disputes (chargebacks)**: $15 per dispute

### Example Cost Calculation

For $149/month subscription:
- Stripe fee: $149 × 2.9% + $0.30 = $4.62
- Net revenue: $149 - $4.62 = $144.38 (96.9%)

For 1,000 customers at $149/month:
- Gross revenue: $149,000
- Stripe fees: ~$4,620
- Net revenue: ~$144,380

### Tips to Reduce Fees
1. Encourage annual billing (fewer transactions)
2. Use ACH/bank transfers for enterprise ($5 flat fee vs 2.9%)
3. Apply for negotiated rates (contact Stripe at $100k+ MRR)

---

**Last Updated**: November 2025
**Version**: 1.0
**Author**: LightDom Development Team
