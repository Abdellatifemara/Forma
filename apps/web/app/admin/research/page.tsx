'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  ThumbsUp,
  AlertTriangle,
  Zap,
  Crown,
  ArrowUpRight,
  RefreshCcw,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import {
  useAIMetrics,
  useLimitAnalysis,
  useQueryPatterns,
  useSeedSurveys,
} from '@/hooks/use-research';

export default function AdminResearchPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [timeRange, setTimeRange] = useState(30);
  const { data: aiMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useAIMetrics(timeRange);
  const { data: limitAnalysis, isLoading: limitLoading } = useLimitAnalysis();
  const { data: patterns, isLoading: patternsLoading } = useQueryPatterns();
  const seedMutation = useSeedSurveys();

  const isLoading = metricsLoading || limitLoading || patternsLoading;

  return (
    <div className="space-y-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isAr ? 'البحث والتحليلات' : 'Research & Analytics'}
          </h1>
          <p className="text-muted-foreground">
            {isAr
              ? 'مقاييس استخدام الذكاء الاصطناعي والاستبيانات وتحليل الحدود'
              : 'AI usage metrics, survey responses, and limit analysis'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-muted border border-border text-sm"
          >
            <option value={7}>{isAr ? 'آخر 7 أيام' : 'Last 7 days'}</option>
            <option value={30}>{isAr ? 'آخر 30 يوم' : 'Last 30 days'}</option>
            <option value={90}>{isAr ? 'آخر 90 يوم' : 'Last 90 days'}</option>
          </select>
          <Button
            variant="outline"
            onClick={() => refetchMetrics()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            {seedMutation.isPending
              ? (isAr ? 'جاري الإنشاء...' : 'Seeding...')
              : (isAr ? 'إنشاء استبيانات' : 'Seed Surveys')}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          label={isAr ? 'إجمالي استعلامات الذكاء الاصطناعي' : 'Total AI Queries'}
          value={aiMetrics?.totalQueries?.toLocaleString() ?? '0'}
          change={null}
          iconColor="text-cyan-400"
          isAr={isAr}
        />
        <StatCard
          icon={Users}
          label={isAr ? 'مستخدمين فريدين' : 'Unique Users'}
          value={aiMetrics?.uniqueUsers?.toLocaleString() ?? '0'}
          change={null}
          iconColor="text-green-400"
          isAr={isAr}
        />
        <StatCard
          icon={Clock}
          label={isAr ? 'متوسط وقت الاستجابة' : 'Avg Response Time'}
          value={`${aiMetrics?.avgResponseTime?.toFixed(0) ?? '0'}ms`}
          change={null}
          iconColor="text-orange-400"
          isAr={isAr}
        />
        <StatCard
          icon={ThumbsUp}
          label={isAr ? 'متوسط الرضا' : 'Avg Satisfaction'}
          value={`${aiMetrics?.avgSatisfaction?.toFixed(1) ?? '0'}/5`}
          change={null}
          iconColor="text-purple-400"
          isAr={isAr}
        />
      </div>

      {/* Limit Hit Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-bold">
                {isAr ? 'تحليل الوصول للحد الأقصى' : 'Limit Hit Analysis'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? 'المستخدمين اللي وصلوا لحد الاستعلامات'
                  : 'Users who hit their AI query limits'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="text-2xl font-bold">
                  {limitAnalysis?.totalLimitHits ?? 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'إجمالي مرات الوصول للحد' : 'Total limit hits'}
                </p>
              </div>
              <div className={isAr ? 'text-left' : 'text-right'}>
                <p className="text-2xl font-bold text-green-400">
                  {((limitAnalysis?.conversionAfterHit ?? 0) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'معدل الترقية' : 'Upgrade conversion'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isAr ? 'حسب الباقة' : 'Hits by Tier'}
              </p>
              {Object.entries(limitAnalysis?.hitsByTier ?? {}).map(([tier, count]) => (
                <div key={tier} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      tier === 'FREE' ? 'bg-gray-400' :
                      tier === 'PREMIUM' ? 'bg-cyan-400' : 'bg-purple-400'
                    )} />
                    <span className="text-sm">{tier}</span>
                  </div>
                  <span className="text-sm font-medium">{count as number}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {isAr ? 'متوسط الاستعلامات قبل الوصول للحد:' : 'Avg queries before hitting limit:'}{' '}
                <span className="text-foreground font-medium">
                  {limitAnalysis?.avgQueriesBeforeHit?.toFixed(1) ?? '0'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Query Patterns */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold">
                {isAr ? 'أنماط الاستعلامات' : 'Query Patterns'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? 'إزاي ومتى المستخدمين بيتفاعلوا مع الذكاء الاصطناعي'
                  : 'When and how users interact with AI'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">
                  {isAr ? 'متوسط استعلامات الجلسة' : 'Avg Session Queries'}
                </p>
                <p className="text-2xl font-bold">
                  {patterns?.avgSessionQueries?.toFixed(1) ?? '0'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">
                  {isAr ? 'ساعة الذروة' : 'Peak Hour'}
                </p>
                <p className="text-2xl font-bold">
                  {patterns?.peakHours?.[0]?.hour ?? 0}:00
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isAr ? 'أكتر فئات الاستعلامات' : 'Top Query Categories'}
              </p>
              {(patterns?.queryCategories ?? []).slice(0, 5).map((cat) => (
                <div key={cat.category} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize">
                        {cat.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Queries by Type */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <MessageSquare className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold">
              {isAr ? 'توزيع أنواع الاستعلامات' : 'Query Types Distribution'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? 'تقسيم استعلامات الذكاء الاصطناعي حسب النوع'
                : 'Breakdown of AI queries by type'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(aiMetrics?.queriesByType ?? {}).map(([type, count]) => (
            <div key={type} className="p-4 rounded-xl bg-muted/50 text-center">
              <p className="text-2xl font-bold mb-1">{count as number}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {type.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Queries by Tier */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Crown className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold">
              {isAr ? 'الاستخدام حسب باقة الاشتراك' : 'Usage by Subscription Tier'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? 'استعلامات الذكاء الاصطناعي مقسمة حسب باقة المستخدم'
                : 'AI queries segmented by user tier'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(aiMetrics?.queriesByTier ?? {}).map(([tier, count]) => {
            const total = Object.values(aiMetrics?.queriesByTier ?? {}).reduce(
              (sum, val) => sum + (val as number),
              0
            ) as number;
            const percentage = total > 0 ? ((count as number) / total) * 100 : 0;

            return (
              <div key={tier} className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      tier === 'FREE' ? 'bg-gray-400' :
                      tier === 'PREMIUM' ? 'bg-cyan-400' : 'bg-purple-400'
                    )} />
                    <span className="font-medium">{tier}</span>
                  </div>
                  <span className="text-lg font-bold">{count as number}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      tier === 'FREE' ? 'bg-gray-400' :
                      tier === 'PREMIUM' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                      'bg-gradient-to-r from-purple-500 to-pink-600'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {percentage.toFixed(1)}% {isAr ? 'من إجمالي الاستعلامات' : 'of total queries'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Research Insights */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">
              {isAr ? 'رؤى مهمة' : 'Key Insights'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? 'نتائج قابلة للتنفيذ من بيانات البحث'
                : 'Actionable findings from research data'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightCard
            title={isAr ? 'التحقق من الحدود' : 'Limit Validation'}
            insight={
              limitAnalysis && limitAnalysis.avgQueriesBeforeHit < 18
                ? (isAr
                    ? 'الحد الحالي (20) ممكن يكون ضيق أوي - المستخدمين بيوصلوا للحد قبل نهاية الشهر'
                    : 'Current limit (20) may be too restrictive - users hit limits before month end')
                : (isAr
                    ? 'الحد الحالي (20) مناسب - معظم المستخدمين مش بيوصلوا للحد'
                    : 'Current limit (20) seems appropriate - most users don\'t hit limits')
            }
            type={limitAnalysis && limitAnalysis.avgQueriesBeforeHit < 18 ? 'warning' : 'success'}
            isAr={isAr}
          />
          <InsightCard
            title={isAr ? 'فرصة التحويل' : 'Conversion Opportunity'}
            insight={
              limitAnalysis && limitAnalysis.conversionAfterHit > 0.15
                ? (isAr
                    ? `${(limitAnalysis.conversionAfterHit * 100).toFixed(0)}% ترقية بعد الوصول للحد - التسعير مناسب`
                    : `${(limitAnalysis.conversionAfterHit * 100).toFixed(0)}% upgrade after limit hit - pricing is well positioned`)
                : (isAr
                    ? 'معدل التحويل بعد الوصول للحد منخفض - ممكن تعدل التسعير أو الحدود'
                    : 'Low conversion after limit hit - consider adjusting pricing or limits')
            }
            type={limitAnalysis && limitAnalysis.conversionAfterHit > 0.15 ? 'success' : 'warning'}
            isAr={isAr}
          />
          <InsightCard
            title={isAr ? 'رضا المستخدمين' : 'User Satisfaction'}
            insight={
              aiMetrics && aiMetrics.avgSatisfaction >= 4
                ? (isAr
                    ? 'رضا عالي (4+/5) - خصائص الذكاء الاصطناعي بتحقق التوقعات'
                    : 'High satisfaction (4+/5) - AI features are meeting expectations')
                : (isAr
                    ? 'الرضا أقل من 4/5 - راجع جودة ردود الذكاء الاصطناعي'
                    : 'Satisfaction below 4/5 - review AI response quality')
            }
            type={aiMetrics && aiMetrics.avgSatisfaction >= 4 ? 'success' : 'warning'}
            isAr={isAr}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  iconColor,
  isAr,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  change: number | null;
  iconColor: string;
  isAr: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2 rounded-lg bg-muted', iconColor.replace('text-', 'bg-').replace('400', '500/10'))}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        {change !== null && (
          <span className={cn(
            'flex items-center gap-1 text-xs font-medium',
            change >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            <ArrowUpRight className={cn('h-3 w-3', change < 0 && 'rotate-180')} />
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function InsightCard({
  title,
  insight,
  type,
  isAr,
}: {
  title: string;
  insight: string;
  type: 'success' | 'warning' | 'info';
  isAr: boolean;
}) {
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      type === 'success' ? 'border-green-500/30 bg-green-500/5' :
      type === 'warning' ? 'border-orange-500/30 bg-orange-500/5' :
      'border-cyan-500/30 bg-cyan-500/5'
    )}>
      <p className="font-medium mb-2">{title}</p>
      <p className="text-sm text-muted-foreground">{insight}</p>
    </div>
  );
}
