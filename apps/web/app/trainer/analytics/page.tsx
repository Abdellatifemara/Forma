'use client';

import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  Clock,
  Target,
  Construction,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';

export default function TrainerAnalyticsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'التحليلات' : 'Analytics'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'تابع أدائك ومقاييس النمو' : 'Track your performance and growth metrics'}
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 w-fit">
          {isAr ? 'قريباً' : 'Coming Soon'}
        </Badge>
      </div>

      {/* Coming Soon Card */}
      <Card className="glass border-amber-500/30 bg-amber-500/5">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
              <Construction className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{isAr ? 'لوحة التحليلات قريباً' : 'Analytics Dashboard Coming Soon'}</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              {isAr
                ? 'بنبني تحليلات قوية عشان تتابع نموك، استبقاء العملاء، ومقاييس الأداء. استنونا!'
                : "We're building powerful analytics to help you track your growth, client retention, and performance metrics. Stay tuned!"}
            </p>

            {/* Preview of what's coming */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl mx-auto">
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <BarChart3 className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'رسوم بيانية للإيرادات' : 'Revenue Charts'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'اتجاهات شهرية وسنوية' : 'Monthly & yearly trends'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'استبقاء العملاء' : 'Client Retention'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'تتبع مقاييس الولاء' : 'Track loyalty metrics'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'نقاط الأداء' : 'Performance Score'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'التقييمات والمراجعات' : 'Ratings & reviews'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'رؤى النمو' : 'Growth Insights'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'مقارنات شهرية' : 'MoM comparisons'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Clock className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'وقت الاستجابة' : 'Response Time'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'التواصل مع العملاء' : 'Client communication'}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <Target className="h-6 w-6 text-pink-400 mx-auto mb-2" />
                <p className="font-medium text-sm">{isAr ? 'إتمام الأهداف' : 'Goal Completion'}</p>
                <p className="text-xs text-muted-foreground">{isAr ? 'معدلات نجاح البرامج' : 'Program success rates'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Show real data when available */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass border-border/50 opacity-60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <span className="text-sm text-muted-foreground">{isAr ? 'إجمالي العملاء' : 'Total Clients'}</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 opacity-60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">{isAr ? 'الشهر ده' : 'This Month'}</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">-- {isAr ? 'ج.م' : 'EGP'}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 opacity-60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-400" />
              </div>
              <span className="text-sm text-muted-foreground">{isAr ? 'متوسط التقييم' : 'Avg Rating'}</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">--</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50 opacity-60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-sm text-muted-foreground">{isAr ? 'الجلسات' : 'Sessions'}</span>
            </div>
            <p className="text-3xl font-bold text-muted-foreground">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
