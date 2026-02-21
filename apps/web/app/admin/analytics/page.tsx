'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle,
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
import { adminApi, type AnalyticsData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminAnalyticsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getAnalytics(period);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل تحميل التحليلات' : 'Failed to load analytics'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{isAr ? 'فشل تحميل التحليلات' : 'Failed to load analytics'}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchAnalytics}>{isAr ? 'حاول تاني' : 'Try Again'}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'التحليلات' : 'Analytics'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'أداء المنصة ومقاييس النمو' : 'Platform performance and growth metrics'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{isAr ? 'الأسبوع ده' : 'This Week'}</SelectItem>
              <SelectItem value="month">{isAr ? 'الشهر ده' : 'This Month'}</SelectItem>
              <SelectItem value="quarter">{isAr ? 'الربع ده' : 'This Quarter'}</SelectItem>
              <SelectItem value="year">{isAr ? 'السنة دي' : 'This Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => toast({ title: isAr ? 'قريباً' : 'Coming Soon', description: isAr ? 'خاصية التصدير هتكون متاحة قريباً' : 'Export feature will be available soon' })}
          >
            <Download className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
            {isAr ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-forma-orange/10 p-2">
                <Users className="h-5 w-5 text-forma-orange" />
              </div>
              <Badge
                variant={analytics?.userChange && analytics.userChange >= 0 ? 'forma' : 'secondary'}
                className="flex items-center gap-1"
              >
                {analytics?.userChange && analytics.userChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {analytics?.userChange ? `${analytics.userChange >= 0 ? '+' : ''}${analytics.userChange}%` : '0%'}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{analytics?.totalUsers?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? 'إجمالي المستخدمين' : 'Total Users'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-green-500/10 p-2">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <Badge
                variant={analytics?.revenueChange && analytics.revenueChange >= 0 ? 'forma' : 'secondary'}
                className="flex items-center gap-1"
              >
                {analytics?.revenueChange && analytics.revenueChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {analytics?.revenueChange ? `${analytics.revenueChange >= 0 ? '+' : ''}${analytics.revenueChange}%` : '0%'}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">
              {analytics?.monthlyRevenue
                ? analytics.monthlyRevenue >= 1000000
                  ? `${(analytics.monthlyRevenue / 1000000).toFixed(1)}M`
                  : `${(analytics.monthlyRevenue / 1000).toFixed(0)}K`
                : '0'} {isAr ? 'ج.م' : 'EGP'}
            </p>
            <p className="text-sm text-muted-foreground">{isAr ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</p>
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
                {isAr ? 'لحظي' : 'Live'}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{analytics?.dailyActiveUsers?.toLocaleString() || 0}</p>
            <p className="text-sm text-muted-foreground">{isAr ? 'المستخدمين النشطين يومياً' : 'Daily Active Users'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <Badge
                variant={analytics?.churnRate && analytics.churnRate <= 5 ? 'forma' : 'secondary'}
                className="flex items-center gap-1"
              >
                {analytics?.churnRate && analytics.churnRate <= 5 ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : (
                  <ArrowUpRight className="h-3 w-3" />
                )}
                {analytics?.churnRate ? `${analytics.churnRate}%` : '0%'}
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">{analytics?.churnRate || 0}%</p>
            <p className="text-sm text-muted-foreground">{isAr ? 'معدل المغادرة' : 'Churn Rate'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'نمو المستخدمين' : 'User Growth'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics?.monthlyGrowth && analytics.monthlyGrowth.length > 0 ? (
                <div className="flex h-full items-end justify-around gap-4">
                  {analytics.monthlyGrowth.map((data) => {
                    const maxUsers = Math.max(...analytics.monthlyGrowth.map((d) => d.users), 1);
                    return (
                      <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-forma-orange transition-all"
                          style={{ height: `${(data.users / maxUsers) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-sm text-muted-foreground">{data.month}</span>
                        <span className="text-sm font-medium">{data.users.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {isAr ? 'مفيش بيانات متاحة' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Growth */}
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'نمو الإيرادات' : 'Revenue Growth'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics?.monthlyGrowth && analytics.monthlyGrowth.length > 0 ? (
                <div className="flex h-full items-end justify-around gap-4">
                  {analytics.monthlyGrowth.map((data) => {
                    const maxRevenue = Math.max(...analytics.monthlyGrowth.map((d) => d.revenue), 1);
                    return (
                      <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg bg-green-500 transition-all"
                          style={{ height: `${(data.revenue / maxRevenue) * 100}%`, minHeight: '4px' }}
                        />
                        <span className="text-sm text-muted-foreground">{data.month}</span>
                        <span className="text-sm font-medium">
                          {(data.revenue / 1000).toFixed(0)}K
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  {isAr ? 'مفيش بيانات متاحة' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'توزيع الباقات' : 'Plan Distribution'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analytics?.planDistribution && analytics.planDistribution.length > 0 ? (
                analytics.planDistribution.map((item) => (
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
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {isAr ? 'مفيش بيانات متاحة' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'استخدام المميزات' : 'Feature Usage'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.featureUsage && analytics.featureUsage.length > 0 ? (
                analytics.featureUsage.map((item) => (
                  <div key={item.feature}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.feature}</span>
                      <span className="font-medium">{item.usage}%</span>
                    </div>
                    <Progress value={item.usage} className="mt-2" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  {isAr ? 'مفيش بيانات متاحة' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Retention Rates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isAr ? 'معدلات الاحتفاظ' : 'Retention Rates'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {analytics?.retentionRates && analytics.retentionRates.length > 0 ? (
                analytics.retentionRates.map((item) => (
                  <div key={item.period} className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forma-orange/10">
                      <span className="text-lg font-bold text-forma-orange">{item.rate}%</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.period}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-4 py-8 text-center text-muted-foreground">
                  {isAr ? 'مفيش بيانات متاحة' : 'No data available'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
