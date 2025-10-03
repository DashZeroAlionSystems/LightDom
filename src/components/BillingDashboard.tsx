import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Settings,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { BillingPlan, Subscription, Invoice, UsageRecord, PaymentMethod } from '../types/BillingTypes';

interface BillingDashboardProps {
  userId: string;
  onPlanChange?: (planId: string) => void;
  onPaymentMethodUpdate?: (paymentMethod: PaymentMethod) => void;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  userId,
  onPlanChange,
  onPaymentMethodUpdate
}) => {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<BillingPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setLoading(true);
        
        // Mock subscription data
        const mockSubscription: Subscription = {
          id: 'sub_123',
          userId,
          planId: 'pro',
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false,
          stripeSubscriptionId: 'sub_stripe123',
          stripeCustomerId: 'cus_stripe123',
          metadata: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Mock plans data
        const mockPlans: BillingPlan[] = [
          {
            id: 'basic',
            name: 'Basic',
            description: 'Perfect for small projects',
            price: 2900, // $29.00
            currency: 'usd',
            interval: 'month',
            features: [
              '1,000 optimizations/month',
              '10,000 API calls/month',
              '1GB storage',
              '5GB bandwidth',
              '5 domains',
              'Email support'
            ],
            limits: {
              optimizations: 1000,
              storage: 1000,
              apiCalls: 10000,
              users: 1,
              domains: 5
            },
            metadata: { popular: false },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'pro',
            name: 'Professional',
            description: 'Ideal for growing businesses',
            price: 9900, // $99.00
            currency: 'usd',
            interval: 'month',
            features: [
              '10,000 optimizations/month',
              '100,000 API calls/month',
              '10GB storage',
              '50GB bandwidth',
              '25 domains',
              'Priority support',
              'Advanced analytics',
              'Custom integrations'
            ],
            limits: {
              optimizations: 10000,
              storage: 10000,
              apiCalls: 100000,
              users: 5,
              domains: 25
            },
            metadata: { popular: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            description: 'For large organizations',
            price: 29900, // $299.00
            currency: 'usd',
            interval: 'month',
            features: [
              'Unlimited optimizations',
              'Unlimited API calls',
              '100GB storage',
              '500GB bandwidth',
              'Unlimited domains',
              '24/7 phone support',
              'Advanced analytics',
              'Custom integrations',
              'SSO integration',
              'Dedicated account manager'
            ],
            limits: {
              optimizations: -1, // Unlimited
              storage: 100000,
              apiCalls: -1, // Unlimited
              users: -1, // Unlimited
              domains: -1 // Unlimited
            },
            metadata: { recommended: true },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Mock invoices data
        const mockInvoices: Invoice[] = [
          {
            id: 'inv_1',
            userId,
            subscriptionId: 'sub_123',
            number: 'INV-001',
            status: 'paid',
            amount: 9900,
            currency: 'usd',
            description: 'Professional Plan - Monthly',
            periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            periodEnd: new Date().toISOString(),
            dueDate: new Date().toISOString(),
            paidAt: new Date().toISOString(),
            items: [{
              id: 'item_1',
              invoiceId: 'inv_1',
              description: 'Professional Plan',
              amount: 9900,
              quantity: 1,
              unitPrice: 9900,
              metadata: {}
            }],
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Mock usage data
        const mockUsage: UsageRecord = {
          id: 'usage_1',
          userId,
          subscriptionId: 'sub_123',
          period: '2024-01',
          metrics: {
            optimizations: 7500,
            apiCalls: 85000,
            storageUsed: 7500,
            bandwidthUsed: 35000,
            domainsScanned: 20
          },
          limits: {
            optimizations: 10000,
            apiCalls: 100000,
            storage: 10000,
            bandwidth: 50000,
            domains: 25
          },
          overages: {
            optimizations: 0,
            apiCalls: 0,
            storage: 0,
            bandwidth: 0,
            domains: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Mock payment methods
        const mockPaymentMethods: PaymentMethod[] = [
          {
            id: 'pm_1',
            userId,
            type: 'card',
            brand: 'Visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
            isDefault: true,
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setCurrentSubscription(mockSubscription);
        setAvailablePlans(mockPlans);
        setInvoices(mockInvoices);
        setUsageRecords([mockUsage]);
        setPaymentMethods(mockPaymentMethods);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [userId]);

  const handlePlanChange = async (newPlanId: string) => {
    try {
      // In a real implementation, you would call your API to change the plan
      console.log(`Changing plan to ${newPlanId}`);
      onPlanChange?.(newPlanId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      // In a real implementation, you would call your API to cancel the subscription
      console.log('Canceling subscription');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'trialing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'canceled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      trialing: 'secondary',
      past_due: 'destructive',
      canceled: 'outline'
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const currentPlan = availablePlans.find(plan => plan.id === currentSubscription?.planId);
  const currentUsage = usageRecords[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(currentSubscription?.status || '')}
          {getStatusBadge(currentSubscription?.status || '')}
        </div>
      </div>

      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Current Plan</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan?.name}</h3>
              <p className="text-gray-600">{currentPlan?.description}</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(currentPlan?.price || 0, currentPlan?.currency)}
                <span className="text-sm font-normal text-gray-500">/{currentPlan?.interval}</span>
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Usage This Month</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Optimizations</span>
                    <span>{currentUsage?.metrics.optimizations}/{currentUsage?.limits.optimizations === -1 ? '∞' : currentUsage?.limits.optimizations}</span>
                  </div>
                  <Progress 
                    value={(currentUsage?.metrics.optimizations || 0) / (currentUsage?.limits.optimizations || 1) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>{currentUsage?.metrics.apiCalls}/{currentUsage?.limits.apiCalls === -1 ? '∞' : currentUsage?.limits.apiCalls}</span>
                  </div>
                  <Progress 
                    value={(currentUsage?.metrics.apiCalls || 0) / (currentUsage?.limits.apiCalls || 1) * 100} 
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>{currentUsage?.metrics.storageUsed}MB/{currentUsage?.limits.storage}MB</span>
                  </div>
                  <Progress 
                    value={(currentUsage?.metrics.storageUsed || 0) / (currentUsage?.limits.storage || 1) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Next Billing Date</h4>
              <p className="text-lg font-semibold">
                {new Date(currentSubscription?.currentPeriodEnd || '').toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                {currentSubscription?.cancelAtPeriodEnd ? 'Subscription will cancel' : 'Auto-renewal enabled'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {availablePlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.metadata.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.metadata.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="text-3xl font-bold">
                    {formatCurrency(plan.price, plan.currency)}
                    <span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.id === currentSubscription?.planId ? "outline" : "default"}
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={plan.id === currentSubscription?.planId}
                  >
                    {plan.id === currentSubscription?.planId ? 'Current Plan' : 'Change Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Your usage for the current billing period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentUsage?.metrics.optimizations}</div>
                  <div className="text-sm text-gray-600">Optimizations</div>
                  <div className="text-xs text-gray-500">
                    Limit: {currentUsage?.limits.optimizations === -1 ? 'Unlimited' : currentUsage?.limits.optimizations}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentUsage?.metrics.apiCalls}</div>
                  <div className="text-sm text-gray-600">API Calls</div>
                  <div className="text-xs text-gray-500">
                    Limit: {currentUsage?.limits.apiCalls === -1 ? 'Unlimited' : currentUsage?.limits.apiCalls}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentUsage?.metrics.storageUsed}MB</div>
                  <div className="text-sm text-gray-600">Storage Used</div>
                  <div className="text-xs text-gray-500">
                    Limit: {currentUsage?.limits.storage}MB
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentUsage?.metrics.bandwidthUsed}MB</div>
                  <div className="text-sm text-gray-600">Bandwidth</div>
                  <div className="text-xs text-gray-500">
                    Limit: {currentUsage?.limits.bandwidth}MB
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>Download your invoices and receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <div className="font-medium">
                          {method.brand} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-600">
                          Expires {method.expMonth}/{method.expYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your subscription? You will lose access to all premium features at the end of your current billing period.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button variant="outline">Keep Subscription</Button>
                <Button variant="destructive" onClick={handleCancelSubscription}>
                  Cancel Subscription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;