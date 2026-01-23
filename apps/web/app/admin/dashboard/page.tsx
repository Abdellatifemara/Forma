'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  DollarSign,
  TrendingUp,
  Users,
  UserCheck,
  Dumbbell,
  AlertCircle,
  Loader2,
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
import { adminApi, type AdminDashboardStats, type AdminActivity, type AdminApproval, type SystemHealthMetric } from '@/lib/api';


export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [approvals, setApprovals] = useState<AdminApproval[]>([]);
  const [health, setHealth] = useState<SystemHealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      setIsLoading(true);
      try {
        // These will fail for now, until the backend is implemented
        const [statsRes, activityRes, approvalsRes, healthRes] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivity(),
          adminApi.getPendingApprovals(),
          adminApi.getSystemHealth(),
        ]);
        setStats(statsRes);
        setActivity(activityRes);
        setApprovals(approvalsRes);
        setHealth(healthRes);
      } catch (error) {
        console.error("Could not fetch admin data, API endpoints likely need to be implemented.", error);
        // In a real app, you'd show an error message. For now, we'll show an empty state.
        setStats(null);
        setActivity([]);
        setApprovals([]);
        setHealth([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }
  
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
          value={stats ? stats.totalUsers.value.toLocaleString() : 'N/A'}
          change={stats ? `${stats.totalUsers.change >= 0 ? '+' : ''}${stats.totalUsers.change} this month` : ''}
          changeType={stats && stats.totalUsers.change >= 0 ? 'positive' : 'negative'}
          icon={Users}
        />
        <StatCard
          title="Active Trainers"
          value={stats ? stats.activeTrainers.value.toLocaleString() : 'N/A'}
          change={stats ? `${stats.activeTrainers.change >= 0 ? '+' : ''}${stats.activeTrainers.change} this month` : ''}
          changeType={stats && stats.activeTrainers.change >= 0 ? 'positive' : 'negative'}
          icon={UserCheck}
        />
        <StatCard
          title="Monthly Revenue"
          value={stats ? `${(stats.monthlyRevenue.value / 1000000).toFixed(1)}M EGP` : 'N/A'}
          change={stats ? `${stats.monthlyRevenue.change >= 0 ? '+' : ''}${stats.monthlyRevenue.change}% vs last month` : ''}
          changeType={stats && stats.monthlyRevenue.change >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
        <StatCard
          title="Active Sessions"
          value={stats ? stats.activeSessions.value.toLocaleString() : 'N/A'}
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
              {activity.length > 0 ? (
                activity.map((activityItem) => (
                  <div
                    key={activityItem.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-2 ${
                          activityItem.type === 'user'
                            ? 'bg-blue-500/10 text-blue-500'
                            : activityItem.type === 'trainer'
                            ? 'bg-forma-teal/10 text-forma-teal'
                            : activityItem.type === 'payment'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {activityItem.type === 'user' && <Users className="h-4 w-4" />}
                        {activityItem.type === 'trainer' && <Dumbbell className="h-4 w-4" />}
                        {activityItem.type === 'payment' && <DollarSign className="h-4 w-4" />}
                        {activityItem.type === 'system' && <AlertCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{activityItem.action}</p>
                        <p className="text-sm text-muted-foreground">{activityItem.user}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{new Date(activityItem.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No recent activity found.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>
              {approvals.length > 0 ? `${approvals.length} items need review` : 'No items to review'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approvals.length > 0 ? (
                approvals.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="warning">{item.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Submitted {new Date(item.submittedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="forma">
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>The approval queue is empty.</p>
                </div>
              )}
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
            {health.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {health.map((metric) => (
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
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>System health data is not available.</p>
              </div>
            )}
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
