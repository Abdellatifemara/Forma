'use client';

import {
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  Dumbbell,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const recentActivity = [
  { action: 'New user signup', user: 'Ahmed Mohamed', time: '2 minutes ago', type: 'user' },
  { action: 'Trainer application', user: 'Fatma Ali', time: '15 minutes ago', type: 'trainer' },
  { action: 'Subscription upgrade', user: 'Omar Hassan', time: '1 hour ago', type: 'payment' },
  { action: 'Content report', user: 'System', time: '2 hours ago', type: 'alert' },
  { action: 'New trainer approved', user: 'Admin', time: '3 hours ago', type: 'trainer' },
];

const pendingApprovals = [
  { name: 'Fatma Ali', type: 'Trainer Application', submitted: '2 days ago' },
  { name: 'Karim Ahmed', type: 'Trainer Application', submitted: '3 days ago' },
  { name: 'Layla Mahmoud', type: 'Content Review', submitted: '1 day ago' },
];

const systemHealth = [
  { name: 'API Response Time', value: 45, unit: 'ms', status: 'healthy' },
  { name: 'Database Load', value: 23, unit: '%', status: 'healthy' },
  { name: 'Storage Used', value: 67, unit: '%', status: 'warning' },
  { name: 'Active Sessions', value: 1247, unit: '', status: 'healthy' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management controls.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="12,847"
          change="+523 this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Trainers"
          value="156"
          change="+12 this month"
          changeType="positive"
          icon={UserCheck}
        />
        <StatCard
          title="Monthly Revenue"
          value="1.2M EGP"
          change="+18% vs last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Active Sessions"
          value="1,247"
          change="Real-time"
          changeType="neutral"
          icon={Activity}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full p-2 ${
                        activity.type === 'user'
                          ? 'bg-blue-500/10 text-blue-500'
                          : activity.type === 'trainer'
                          ? 'bg-forma-teal/10 text-forma-teal'
                          : activity.type === 'payment'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {activity.type === 'user' && <Users className="h-4 w-4" />}
                      {activity.type === 'trainer' && <Dumbbell className="h-4 w-4" />}
                      {activity.type === 'payment' && <DollarSign className="h-4 w-4" />}
                      {activity.type === 'alert' && <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>{pendingApprovals.length} items need review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{item.name}</p>
                    <Badge variant="warning">{item.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Submitted {item.submitted}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="forma">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Infrastructure monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {systemHealth.map((metric) => (
                <div
                  key={metric.name}
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <Badge
                      variant={metric.status === 'healthy' ? 'forma' : 'warning'}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-2xl font-bold">
                    {metric.value}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}{metric.unit}
                    </span>
                  </p>
                  {metric.unit === '%' && (
                    <Progress
                      value={metric.value}
                      className="mt-2"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Daily Active Users</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">3,421</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Avg Session Duration</span>
              <span className="font-medium">12m 34s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="font-medium">4.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Churn Rate</span>
              <span className="font-medium">2.1%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">NPS Score</span>
              <span className="font-medium text-forma-teal">72</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
