# Cursor Session 1: Billing System Foundation Setup

## 🎯 **Session Goal**
Set up the foundation for the automated billing system in 30 minutes.

## 📋 **Tasks to Complete**

### Task 1: Install Stripe Dependencies
```bash
# Run this command in terminal
npm install stripe @types/stripe
```

**Validation Steps:**
1. Check `package.json` includes:
   ```json
   {
     "dependencies": {
       "stripe": "^14.0.0"
     },
     "devDependencies": {
       "@types/stripe": "^8.0.0"
     }
   }
   ```
2. Verify TypeScript can import Stripe:
   ```typescript
   import Stripe from 'stripe';
   console.log('Stripe imported successfully');
   ```

### Task 2: Create Environment Variables
Create `.env` file in project root:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51234567890abcdef
STRIPE_PUBLISHABLE_KEY=pk_test_51234567890abcdef
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef

# Database Configuration (if not already present)
DATABASE_URL=postgresql://username:password@localhost:5432/lightdom
```

Create `.env.example` file:
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/lightdom
```

**Validation Steps:**
1. `.env` file exists and contains Stripe keys
2. `.env.example` file exists with placeholder values
3. `.env` is in `.gitignore` (check this!)
4. Environment variables load correctly:
   ```typescript
   console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing');
   ```

### Task 3: Create Basic Payment Service Test
Create file: `src/services/__tests__/PaymentService.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

// Mock Stripe for testing
const mockStripe = {
  customers: {
    create: jest.fn().mockResolvedValue({
      id: 'cus_test123',
      email: 'test@example.com',
      name: 'Test Customer',
      created: Date.now() / 1000,
    }),
  },
};

// Mock the Stripe module
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

describe('PaymentService', () => {
  let paymentService: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create service instance
    paymentService = {
      createCustomer: async (email: string, name: string) => {
        return await mockStripe.customers.create({
          email,
          name,
        });
      },
    };
  });

  it('should initialize without errors', () => {
    expect(paymentService).toBeDefined();
  });

  it('should create customer with valid data', async () => {
    const customer = await paymentService.createCustomer('test@example.com', 'Test Customer');
    
    expect(customer).toBeDefined();
    expect(customer.id).toBe('cus_test123');
    expect(customer.email).toBe('test@example.com');
    expect(customer.name).toBe('Test Customer');
  });

  it('should handle customer creation errors', async () => {
    mockStripe.customers.create.mockRejectedValueOnce(new Error('Stripe API Error'));
    
    await expect(paymentService.createCustomer('invalid-email', 'Test Customer'))
      .rejects.toThrow('Stripe API Error');
  });
});
```

**Validation Steps:**
1. Test file compiles without TypeScript errors
2. Run test: `npm test PaymentService`
3. All tests pass
4. Test output shows:
   ```
   ✓ PaymentService should initialize without errors
   ✓ PaymentService should create customer with valid data
   ✓ PaymentService should handle customer creation errors
   ```

### Task 4: Update Package.json Scripts
Add test script to `package.json`:
```json
{
  "scripts": {
    "test:billing": "vitest run src/services/__tests__/PaymentService.test.ts",
    "test:billing:watch": "vitest watch src/services/__tests__/PaymentService.test.ts"
  }
}
```

**Validation Steps:**
1. Run `npm run test:billing`
2. Tests execute successfully
3. Run `npm run test:billing:watch`
4. Watch mode starts correctly

## 🔍 **Session Validation Checklist**

### Code Quality
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] All tests pass
- [ ] Code follows existing project patterns

### Dependencies
- [ ] Stripe package installed
- [ ] TypeScript types available
- [ ] Environment variables configured
- [ ] Test framework working

### Project Structure
- [ ] Test file in correct location
- [ ] Environment files properly configured
- [ ] Package.json updated with scripts
- [ ] Git ignore updated

## 🚨 **Common Issues & Solutions**

### Issue 1: Stripe Import Error
**Problem**: `Cannot find module 'stripe'`
**Solution**: 
```bash
npm install stripe
# Verify installation
npm list stripe
```

### Issue 2: Environment Variables Not Loading
**Problem**: `process.env.STRIPE_SECRET_KEY` is undefined
**Solution**:
1. Check `.env` file exists in project root
2. Verify `.env` is not in `.gitignore` (it should be)
3. Restart development server
4. Check file encoding (should be UTF-8)

### Issue 3: Test Framework Issues
**Problem**: Tests not running
**Solution**:
1. Check `vitest.config.js` exists
2. Verify test file extension is `.test.ts`
3. Check import paths are correct
4. Run `npm install` to ensure dependencies

### Issue 4: TypeScript Errors
**Problem**: Type errors in test file
**Solution**:
1. Check `@types/stripe` is installed
2. Verify TypeScript configuration
3. Check import statements
4. Restart TypeScript server

## 📊 **Success Criteria**

### Must Have (Session Fails Without These)
- [ ] Stripe dependencies installed
- [ ] Environment variables configured
- [ ] Basic test file created
- [ ] Tests pass

### Should Have (Important for Next Session)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Test scripts working
- [ ] Environment validation working

### Nice to Have (Extra Credit)
- [ ] Additional test cases
- [ ] Better error messages
- [ ] Documentation updated
- [ ] CI integration ready

## 🎯 **Next Session Preview**

**Session 2 Goal**: Implement the first payment function
**Session 2 Tasks**:
1. Create `PaymentService.ts` class
2. Implement `createCustomer` method
3. Add error handling
4. Test with real Stripe data

**Preparation for Session 2**:
- Get Stripe test API keys from https://dashboard.stripe.com/test/apikeys
- Set up Stripe test account if not already done
- Review Stripe API documentation for customer creation

## 📝 **Session Log Template**

```markdown
## Session 1: Billing System Foundation Setup
**Date**: [Current Date]
**Duration**: [Actual Time Taken]

### Completed Tasks:
- [x] Task 1: Install Stripe Dependencies
- [x] Task 2: Create Environment Variables  
- [x] Task 3: Create Basic Payment Service Test
- [x] Task 4: Update Package.json Scripts

### Validation Results:
- [x] Code compiles without errors
- [x] Tests pass (3/3)
- [x] Environment variables load
- [x] Dependencies installed correctly

### Issues Encountered:
- Issue 1: [Description and how resolved]
- Issue 2: [Description and how resolved]

### Time Breakdown:
- Task 1: [X] minutes
- Task 2: [X] minutes  
- Task 3: [X] minutes
- Task 4: [X] minutes
- Total: [X] minutes

### Next Session Preparation:
- [ ] Stripe test API keys obtained
- [ ] Stripe dashboard access confirmed
- [ ] Test environment ready
- [ ] Session 2 tasks reviewed

### Notes:
[Any additional observations or learnings]
```

## 🚀 **Ready to Start?**

1. **Open terminal** in project root
2. **Run**: `npm install stripe @types/stripe`
3. **Create**: `.env` file with Stripe keys
4. **Create**: Test file as shown above
5. **Run**: `npm run test:billing`
6. **Validate**: All checks pass

**Expected Session Time**: 30 minutes
**Success Indicator**: All validation checklist items completed

Let's build this billing system step by step! 🎉