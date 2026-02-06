'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Star,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Clock,
  Award,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const monthlyMetrics = [
  { month: 'Aug', clients: 28, revenue: 6200, sessions: 85 },
  { month: 'Sep', clients: 32, revenue: 7100, sessions: 98 },
  { month: 'Oct', clients: 35, revenue: 8500, sessions: 120 },
  { month: 'Nov', clients: 40, revenue: 9200, sessions: 135 },
  { month: 'Dec', clients: 44, revenue: 11200, sessions: 148 },
  { month: 'Jan', clients: 47, revenue: 12450, sessions: 156 },
];

const clientRetention = [
  { period: '0-3 months', count: 12, percentage: 26, color: 'bg-cyan-500' },
  { period: '3-6 months', count: 15, percentage: 32, color: 'bg-purple-500' },
  { period: '6-12 months', count: 12, percentage: 26, color: 'bg-green-500' },
  { period: '12+ months', count: 8, percentage: 17, color: 'bg-yellow-500' },
];

const topPrograms = [
  { name: '12-Week Transformation', clients: 15, rating: 4.9, trend: 'up', change: '+3' },
  { name: 'Strength Foundation', clients: 12, rating: 4.8, trend: 'up', change: '+2' },
  { name: 'Beginner Bootcamp', clients: 10, rating: 4.7, trend: 'same', change: '0' },
  { name: 'Advanced Hypertrophy', clients: 6, rating: 4.6, trend: 'down', change: '-1' },
];

const performanceMetrics = [
  { label: 'Client Satisfaction', value: 94, target: 90, unit: '%', icon: Star, color: 'yellow' },
  { label: 'Session Completion', value: 89, target: 85, unit: '%', icon: Target, color: 'green' },
  { label: 'Response Time', value: 2.3, target: 4, unit: 'hrs', icon: Clock, color: 'cyan', inverse: true },
  { label: 'Program Completion', value: 78, target: 75, unit: '%', icon: Award, color: 'purple' },
];

const revenueBreakdown = [
  { source: 'Subscriptions', amount: 8200, percentage: 66, color: 'bg-cyan-500' },
  { source: 'One-time Programs', amount: 3100, percentage: 25, color: 'bg-purple-500' },
  { source: 'Tips', amount: 1150, percentage: 9, color: 'bg-green-500' },
];

export default function TrainerAnalyticsPage() {
  const [period, setPeriod] = useState('month');

  const maxRevenue = Math.max(...monthlyMetrics.map(m => m.revenue));

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and growth metrics
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px] bg-muted/50 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +17%
              </Badge>
            </div>
            <p className="mt-3 text-3xl font-bold">47</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +0.2
              </Badge>
            </div>
            <p className="mt-3 text-3xl font-bold">4.9</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15%
              </Badge>
            </div>
            <p className="mt-3 text-3xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Sessions This Month</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-green-500/20">
                <Target className="h-5 w-5 text-green-400" />
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +4%
              </Badge>
            </div>
            <p className="mt-3 text-3xl font-bold text-green-400">89%</p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Client Growth Chart */}
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Growth</CardTitle>
                    <CardDescription>Active clients over time</CardDescription>
                  </div>
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <div className="flex h-full items-end justify-around gap-2">
                    {monthlyMetrics.map((data, index) => (
                      <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-purple-500 transition-all hover:opacity-80"
                          style={{ height: `${(data.clients / 50) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">+68% growth over 6 months</span>
                </div>
              </CardContent>
            </Card>

            {/* Client Retention */}
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Retention</CardTitle>
                    <CardDescription>Distribution by tenure</CardDescription>
                  </div>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-40 h-40">
                    {/* Simple donut chart visualization */}
                    <div className="absolute inset-0 rounded-full border-8 border-cyan-500/30" />
                    <div className="absolute inset-2 rounded-full border-8 border-purple-500/30" />
                    <div className="absolute inset-4 rounded-full border-8 border-green-500/30" />
                    <div className="absolute inset-6 rounded-full border-8 border-yellow-500/30" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">47</p>
                        <p className="text-xs text-muted-foreground">clients</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {clientRetention.map((item) => (
                    <div key={item.period} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-3 w-3 rounded-full', item.color)} />
                        <span className="text-sm">{item.period}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{item.count} clients</span>
                        <span className="text-sm font-medium w-10 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly earnings (EGP)</CardDescription>
                  </div>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <div className="flex h-full items-end justify-around gap-2">
                    {monthlyMetrics.map((data) => (
                      <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                        <span className="text-xs font-medium">{(data.revenue / 1000).toFixed(1)}k</span>
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-green-500 to-cyan-500 transition-all hover:opacity-80"
                          style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold text-green-400">12,450</p>
                    <p className="text-xs text-muted-foreground">This Month (EGP)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/30">
                    <p className="text-2xl font-bold">+35%</p>
                    <p className="text-xs text-muted-foreground">vs Last Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="glass border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>By source this month</CardDescription>
                  </div>
                  <PieChart className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {revenueBreakdown.map((item) => (
                    <div key={item.source}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={cn('h-3 w-3 rounded-full', item.color)} />
                          <span className="font-medium">{item.source}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{item.amount.toLocaleString()} EGP</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Revenue</span>
                    <span className="text-2xl font-bold text-gradient">12,450 EGP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Performance Metrics */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>How you compare to your targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {performanceMetrics.map((metric) => {
                    const Icon = metric.icon;
                    const isOnTarget = metric.inverse
                      ? metric.value <= metric.target
                      : metric.value >= metric.target;
                    const progressValue = metric.inverse
                      ? Math.max(0, 100 - ((metric.value / metric.target) * 100 - 100))
                      : Math.min((metric.value / metric.target) * 100, 100);

                    return (
                      <div key={metric.label} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', `bg-${metric.color}-500/20`)}>
                              <Icon className={cn('h-4 w-4', `text-${metric.color}-400`)} />
                            </div>
                            <span className="font-medium">{metric.label}</span>
                          </div>
                          <Badge className={isOnTarget
                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                          }>
                            {isOnTarget ? 'On Target' : 'Below Target'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={progressValue} className="flex-1 h-2" />
                          <div className="text-right min-w-[80px]">
                            <span className="font-bold">{metric.value}{metric.unit}</span>
                            <span className="text-xs text-muted-foreground ml-1">
                              / {metric.target}{metric.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Activity Overview */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
                <CardDescription>Your engagement metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <Activity className="h-5 w-5 text-cyan-400 mb-2" />
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Messages sent today</p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Clock className="h-5 w-5 text-purple-400 mb-2" />
                    <p className="text-2xl font-bold">4.2h</p>
                    <p className="text-sm text-muted-foreground">Avg. daily active</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <Users className="h-5 w-5 text-green-400 mb-2" />
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-muted-foreground">Clients checked in</p>
                  </div>
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <Star className="h-5 w-5 text-yellow-400 mb-2" />
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">New reviews</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Weekly Activity Score</span>
                    <span className="text-2xl font-bold text-primary">92</span>
                  </div>
                  <Progress value={92} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    You're in the top 10% of trainers this week
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle>Top Performing Programs</CardTitle>
              <CardDescription>Programs ranked by client enrollment and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPrograms.map((program, index) => (
                  <div
                    key={program.name}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl font-bold",
                        index === 0 && 'bg-yellow-500/20 text-yellow-400',
                        index === 1 && 'bg-gray-400/20 text-gray-400',
                        index === 2 && 'bg-orange-500/20 text-orange-400',
                        index > 2 && 'bg-muted text-muted-foreground'
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{program.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {program.clients} active clients
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        {program.trend === 'up' && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            {program.change}
                          </Badge>
                        )}
                        {program.trend === 'down' && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                            {program.change}
                          </Badge>
                        )}
                        {program.trend === 'same' && (
                          <Badge variant="outline" className="text-muted-foreground">
                            No change
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold">{program.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
