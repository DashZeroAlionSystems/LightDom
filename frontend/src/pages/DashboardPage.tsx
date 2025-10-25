import React from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Total Balance</span>
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">$45,290.50</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            +12.5% this month
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">LightDom Coins</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">15,420 LDC</div>
          <div className="text-sm text-green-500 flex items-center">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            +8.2% this week
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Staking Rewards</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-3xl font-bold mb-1">234 LDC</div>
          <div className="text-sm text-muted-foreground">Last 30 days</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-background rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gradient-exodus" />
                <div>
                  <div className="font-semibold">Transaction #{i}</div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">+100 LDC</div>
                <div className="text-sm text-muted-foreground">$210.00</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
