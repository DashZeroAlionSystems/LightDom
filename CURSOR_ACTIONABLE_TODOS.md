# Cursor-Friendly Actionable Todo List

## 🎯 **Problem with Current Approach**
- Too many high-level tasks
- No clear starting points
- Missing implementation details
- No validation steps
- Tasks are too complex for single sessions

## ✅ **New Cursor-Friendly Approach**

### **Phase 1: Foundation Setup (Start Here)**

#### Task 1.1: Install Stripe Dependencies
```bash
# Run this command
npm install stripe @types/stripe
```
- [ ] Verify package.json includes stripe dependency
- [ ] Check TypeScript types are available
- [ ] Test import: `import Stripe from 'stripe'`

#### Task 1.2: Create Environment Variables
```bash
# Add to .env file
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
- [ ] Create `.env.example` with these variables
- [ ] Add to `.gitignore` to prevent commits
- [ ] Document in README how to get these keys

#### Task 1.3: Create Basic Payment Service Test
```typescript
// Create: src/services/__tests__/PaymentService.test.ts
import { PaymentService } from '../PaymentService';

describe('PaymentService', () => {
  it('should initialize without errors', () => {
    const service = new PaymentService();
    expect(service).toBeDefined();
  });
});
```
- [ ] Run test: `npm test PaymentService`
- [ ] Verify test passes
- [ ] Add to CI pipeline

### **Phase 2: Core Payment Features (One Task Per Session)**

#### Task 2.1: Create Customer (Single Function)
**Goal**: Create one function that creates a Stripe customer
```typescript
// Add to PaymentService.ts
async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
  // Implementation here
}
```
- [ ] Function compiles without errors
- [ ] Unit test passes
- [ ] Can create customer in Stripe dashboard
- [ ] Error handling works

#### Task 2.2: Add Payment Method (Single Function)
**Goal**: Add one function to attach payment method
```typescript
// Add to PaymentService.ts
async addPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
  // Implementation here
}
```
- [ ] Function compiles without errors
- [ ] Unit test passes
- [ ] Can add card to customer
- [ ] Error handling works

#### Task 2.3: Create Subscription (Single Function)
**Goal**: Create one function for subscriptions
```typescript
// Add to PaymentService.ts
async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
  // Implementation here
}
```
- [ ] Function compiles without errors
- [ ] Unit test passes
- [ ] Can create subscription
- [ ] Error handling works

### **Phase 3: API Integration (One Endpoint Per Session)**

#### Task 3.1: Create Customer API Endpoint
**Goal**: One REST endpoint for customer creation
```typescript
// Add to src/api/billingApi.ts
export const createCustomer = async (req: Request, res: Response) => {
  // Implementation here
};
```
- [ ] Endpoint responds to POST /api/billing/customers
- [ ] Validates input data
- [ ] Returns proper JSON response
- [ ] Error handling works

#### Task 3.2: Get Customer API Endpoint
**Goal**: One REST endpoint for customer retrieval
```typescript
// Add to src/api/billingApi.ts
export const getCustomer = async (req: Request, res: Response) => {
  // Implementation here
};
```
- [ ] Endpoint responds to GET /api/billing/customers/:id
- [ ] Returns customer data
- [ ] Handles not found cases
- [ ] Error handling works

### **Phase 4: Database Integration (One Table Per Session)**

#### Task 4.1: Create Customers Table
**Goal**: One SQL table for customer data
```sql
-- Add to database/billing_schema.sql
CREATE TABLE billing_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Table creates without errors
- [ ] Can insert test data
- [ ] Can query test data
- [ ] Indexes work properly

#### Task 4.2: Create Subscriptions Table
**Goal**: One SQL table for subscription data
```sql
-- Add to database/billing_schema.sql
CREATE TABLE billing_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES billing_customers(id),
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
- [ ] Table creates without errors
- [ ] Foreign key works
- [ ] Can insert test data
- [ ] Can join with customers table

### **Phase 5: UI Components (One Component Per Session)**

#### Task 5.1: Create Basic Billing Page
**Goal**: One React page showing billing info
```typescript
// Create: src/pages/BillingPage.tsx
export const BillingPage: React.FC = () => {
  return (
    <div>
      <h1>Billing Dashboard</h1>
      <p>Customer billing information will appear here</p>
    </div>
  );
};
```
- [ ] Page renders without errors
- [ ] Accessible via /billing route
- [ ] Shows basic layout
- [ ] No TypeScript errors

#### Task 5.2: Add Customer Info Display
**Goal**: Show customer data on billing page
```typescript
// Modify: src/pages/BillingPage.tsx
const [customer, setCustomer] = useState(null);

useEffect(() => {
  // Fetch customer data
}, []);
```
- [ ] Displays customer email and name
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Updates when data changes

### **Phase 6: Integration Testing (One Test Per Session)**

#### Task 6.1: End-to-End Customer Creation
**Goal**: Test complete customer creation flow
```typescript
// Create: test/e2e/billing.test.ts
describe('Billing E2E', () => {
  it('should create customer end-to-end', async () => {
    // Test API call
    // Test database storage
    // Test UI display
  });
});
```
- [ ] Test creates customer via API
- [ ] Test stores data in database
- [ ] Test displays in UI
- [ ] All assertions pass

## 🚀 **Cursor Execution Strategy**

### **Session 1: Setup (30 minutes)**
1. Run Task 1.1 (Install dependencies)
2. Run Task 1.2 (Environment variables)
3. Run Task 1.3 (Basic test)
4. **Validation**: All tests pass, no TypeScript errors

### **Session 2: First Payment Function (45 minutes)**
1. Implement Task 2.1 (Create customer function)
2. Write unit test
3. Test with real Stripe data
4. **Validation**: Can create customer in Stripe dashboard

### **Session 3: First API Endpoint (45 minutes)**
1. Implement Task 3.1 (Create customer API)
2. Test with Postman/curl
3. Add error handling
4. **Validation**: API responds correctly

### **Session 4: Database Integration (45 minutes)**
1. Implement Task 4.1 (Customers table)
2. Test table creation
3. Test data insertion
4. **Validation**: Can store and retrieve customer data

### **Session 5: UI Integration (45 minutes)**
1. Implement Task 5.1 (Basic billing page)
2. Add routing
3. Test page loads
4. **Validation**: Page accessible and renders

### **Session 6: End-to-End Test (30 minutes)**
1. Implement Task 6.1 (E2E test)
2. Run complete flow
3. Fix any issues
4. **Validation**: Complete customer creation flow works

## 📋 **Validation Checklist for Each Task**

### **Code Quality Checks**
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All tests pass
- [ ] Code follows existing patterns

### **Functionality Checks**
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] Input validation works
- [ ] Output format is correct

### **Integration Checks**
- [ ] Works with existing codebase
- [ ] Database operations work
- [ ] API endpoints respond
- [ ] UI components render

## 🎯 **Success Metrics**

### **After Session 1**: Dependencies installed, basic test passes
### **After Session 2**: Can create Stripe customers programmatically
### **After Session 3**: Can create customers via API
### **After Session 4**: Customer data persists in database
### **After Session 5**: Billing page displays customer info
### **After Session 6**: Complete customer creation flow works

## 🔄 **Iterative Approach Benefits**

1. **Immediate Feedback**: Each session produces working functionality
2. **Clear Progress**: Easy to see what's been completed
3. **Reduced Complexity**: One task per session is manageable
4. **Early Validation**: Issues caught early, not at the end
5. **Momentum Building**: Success breeds success
6. **Easy Debugging**: Problems isolated to specific sessions

## 📝 **Session Log Template**

```markdown
## Session [X]: [Task Name]

### Completed:
- [ ] Task 1: [Description]
- [ ] Task 2: [Description]

### Validation Results:
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] Feature works as expected
- [ ] Integration works

### Issues Found:
- Issue 1: [Description and resolution]
- Issue 2: [Description and resolution]

### Next Session:
- [ ] Task 1: [Next task description]
- [ ] Task 2: [Next task description]
```

This approach ensures that Cursor can make meaningful progress in each session while building toward a complete, working billing system. Each task is specific, measurable, and produces immediate value.