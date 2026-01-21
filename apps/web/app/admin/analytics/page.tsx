'use client';

import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monthlyGrowth = [
  { month: 'Jan', users: 8500, revenue: 420000 },
  { month: 'Feb', users: 9800, revenue: 580000 },
  { month: 'Mar', users: 12847, revenue: 1200000 },
];

const userAcquisition = [
  { source: 'Organic Search', users: 4200, percentage: 33 },
  { source: 'Social Media', users: 3800, percentage: 30 },
  { source: 'Referrals', users: 2600, percentage: 20 },
  { source: 'Paid Ads', users: 1400, percentage: 11 },
  { source: 'Direct', users: 847, percentage: 7 },
];

const planDistribution = [
  { plan: 'Free', users: 8500, percentage: 66 },
  { plan: 'Pro', users: 3500, percentage: 27 },
  { plan: 'Elite', users: 847, percentage: 7 },
];

const topFeatures = [
  { feature: 'Workout Tracking', usage: 92 },
  { feature: 'Food Logging', usage: 78 },
  { feature: 'Progress Photos', usage: 65 },
  { feature: 'AI Coach', usage: 45 },
  { feature: 'Trainer Marketplace', usage: 23 },
];

const retentionRates = [
  { period: 'Day 1', rate: 85 },
  { period: 'Day 7', rate: 62 },
  { period: 'Day 30', rate: 45 },
  { period: 'Day 90', rate: 32 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Platform performance and growth metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="month">
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-forma-teal/10 p-2">
                <Users className="h-5 w-5 text-forma-teal" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +31%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">12,847</p>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500/10 p-2">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +107%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">1.2M EGP</p>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +12%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">3,421</p>
            <p className="text-sm text-muted-foreground">Daily Active Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                -0.5%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">2.1%</p>
            <p className="text-sm text-muted-foreground">Churn Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="flex h-full items-end justify-around gap-4">
                {monthlyGrowth.map((data) => (
                  <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-forma-teal transition-all"
                      style={{ height: `${(data.users / 15000) * 100}%` }}
                    />
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                    <span className="text-sm font-medium">{data.users.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="flex h-full items-end justify-around gap-4">
                {monthlyGrowth.map((data) => (
                  <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-green-500 transition-all"
                      style={{ height: `${(data.revenue / 1500000) * 100}%` }}
                    />
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                    <span className="text-sm font-medium">
                      {(data.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Acquisition */}
        <Card>
          <CardHeader>
            <CardTitle>User Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userAcquisition.map((item) => (
                <div key={item.source}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.source}</span>
                    <span className="font-medium">{item.users.toLocaleString()} users</span>
                  </div>
                  <Progress value={item.percentage} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {planDistribution.map((item) => (
                <div key={item.plan} className="flex items-center gap-4">
                  <div className="w-20">
                    <p className="font-medium">{item.plan}</p>
                  </div>
                  <Progress value={item.percentage} className="flex-1" />
                  <div className="w-24 text-right">
                    <p className="text-sm font-medium">{item.users.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topFeatures.map((item) => (
                <div key={item.feature}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.feature}</span>
                    <span className="font-medium">{item.usage}%</span>
                  </div>
                  <Progress value={item.usage} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Retention Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {retentionRates.map((item) => (
                <div key={item.period} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forma-teal/10">
                    <span className="text-lg font-bold text-forma-teal">{item.rate}%</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.period}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
