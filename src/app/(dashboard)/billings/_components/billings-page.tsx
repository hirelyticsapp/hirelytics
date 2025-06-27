'use client';

import { Calendar, CreditCard, DollarSign, Download, Plus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const mockSubscription = {
  plan: 'Pro',
  status: 'active',
  amount: 29.99,
  currency: 'USD',
  interval: 'month',
  nextBilling: '2024-02-15',
};

const mockPaymentMethods = [
  {
    id: 1,
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
  },
];

const mockBillingHistory = [
  {
    id: 1,
    date: '2024-01-15',
    description: 'Pro Plan - Monthly',
    amount: 29.99,
    status: 'paid',
    invoice: 'INV-001',
  },
  {
    id: 2,
    date: '2023-12-15',
    description: 'Pro Plan - Monthly',
    amount: 29.99,
    status: 'paid',
    invoice: 'INV-002',
  },
  {
    id: 3,
    date: '2023-11-15',
    description: 'Pro Plan - Monthly',
    amount: 29.99,
    status: 'paid',
    invoice: 'INV-003',
  },
];

export function BillingPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleAddPaymentMethod = () => {
    console.log('Add payment method');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Subscription */}
        <Card className="border shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  {mockSubscription.plan} Plan
                </h3>
                <p className="text-muted-foreground">
                  ${mockSubscription.amount}/{mockSubscription.interval}
                </p>
              </div>
              <Badge className="bg-success text-success-foreground">
                {mockSubscription.status.charAt(0).toUpperCase() + mockSubscription.status.slice(1)}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                <p className="flex items-center gap-2 mt-1 text-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(mockSubscription.nextBilling).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="mt-1 text-foreground font-semibold">
                  ${mockSubscription.amount} {mockSubscription.currency.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline">Change Plan</Button>
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Cancel Subscription'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your payment methods</CardDescription>
              </div>
              <Button onClick={handleAddPaymentMethod} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Method
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPaymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">
                        {method.brand} ending in {method.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge className="bg-primary text-primary-foreground">Default</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card className="border shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBillingHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>${item.amount}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          item.status === 'paid' ? 'bg-success text-success-foreground' : 'bg-muted'
                        }
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                        {item.invoice}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
