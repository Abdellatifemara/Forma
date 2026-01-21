'use client';

import {
  TrendingUp,
  Users,
  Star,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const monthlyMetrics = [
  { month: 'Jan', clients: 35, revenue: 8500, sessions: 120 },
  { month: 'Feb', clients: 40, revenue: 9200, sessions: 135 },
  { month: 'Mar', clients: 47, revenue: 12450, sessions: 156 },
];

const clientRetention = [
  { period: '0-3 months', count: 12, percentage: 26 },
  { period: '3-6 months', count: 15, percentage: 32 },
  { period: '6-12 months', count: 12, percentage: 26 },
  { period: '12+ months', count: 8, percentage: 17 },
];

const topPrograms = [
  { name: '12-Week Transformation', clients: 15, rating: 4.9 },
  { name: 'Strength Foundation', clients: 12, rating: 4.8 },
  { name: 'Beginner Bootcamp', clients: 10, rating: 4.7 },
];

const performanceMetrics = [
  { label: 'Client Satisfaction', value: 94, target: 90, unit: '%' },
  { label: 'Session Completion', value: 89, target: 85, unit: '%' },
  { label: 'Response Time', value: 2.3, target: 4, unit: 'hrs' },
  { label: 'Program Completion', value: 78, target: 75, unit: '%' },
];

export default function TrainerAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and growth metrics
          </p>
        </div>
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
                +17%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">47</p>
            <p className="text-sm text-muted-foreground">Active Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +0.2
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">4.9</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +15%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Sessions This Month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +23%
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">89%</p>
            <p className="text-sm text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Client Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Client Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <div className="flex h-full items-end justify-around gap-4">
                {monthlyMetrics.map((data) => (
                  <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-forma-teal transition-all"
                      style={{ height: `${(data.clients / 50) * 100}%` }}
                    />
                    <span className="text-sm text-muted-foreground">{data.month}</span>
                    <span className="text-sm font-medium">{data.clients}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Client Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientRetention.map((item) => (
                <div key={item.period}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.period}</span>
                    <span className="font-medium">{item.count} clients</span>
                  </div>
                  <Progress value={item.percentage} className="mt-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Programs */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPrograms.map((program, index) => (
                <div
                  key={program.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forma-teal/10 text-forma-teal font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{program.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {program.clients} active clients
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{program.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {performanceMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {metric.value}{metric.unit}
                      </span>
                      {metric.value >= metric.target ? (
                        <Badge variant="forma" className="text-xs">
                          On Target
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Below Target
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress
                      value={Math.min((metric.value / metric.target) * 100, 100)}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      Target: {metric.target}{metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
