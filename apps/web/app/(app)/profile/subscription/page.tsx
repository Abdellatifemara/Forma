'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Crown, Sparkles, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n';

const PLANS = {
  en: [
    {
      tier: 'PREMIUM',
      name: 'Premium',
      price: 299,
      period: '/month',
      description: 'Everything you need for your fitness journey',
      features: [
        'AI Coach chat (50 messages/day)',
        'Food & exercise database search',
        'Preset workout programs',
        'Supplement recommendations',
        'Healthy food guide',
        'Progress tracking',
        'Full exercise library (3,400+)',
      ],
      icon: Zap,
      color: 'from-forma-orange to-blue-400',
    },
    {
      tier: 'PREMIUM_PLUS',
      name: 'Premium+',
      price: 999,
      period: '/month',
      description: 'The luxury fitness experience',
      features: [
        'Everything in Premium',
        'Unlimited AI coaching (GPT-powered)',
        'Personalized plans based on your data',
        'Owner reviews your program personally',
        'Pre & post workout guidance',
        'Health stats & analysis (Whoop-style)',
        'InBody analysis & recommendations',
        'Priority support',
      ],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
    },
  ],
  ar: [
    {
      tier: 'PREMIUM',
      name: 'بريميوم',
      price: 299,
      period: '/شهر',
      description: 'كل اللي محتاجه لرحلة اللياقة',
      features: [
        'شات مع كوتش ذكي (50 رسالة/يوم)',
        'بحث في قاعدة بيانات الأكل والتمارين',
        'برامج تمارين جاهزة',
        'توصيات مكملات',
        'دليل الأكل الصحي',
        'متابعة التقدم',
        'مكتبة تمارين كاملة (3,400+)',
      ],
      icon: Zap,
      color: 'from-forma-orange to-blue-400',
    },
    {
      tier: 'PREMIUM_PLUS',
      name: 'بريميوم+',
      price: 999,
      period: '/شهر',
      description: 'تجربة اللياقة الفاخرة',
      features: [
        'كل حاجة في بريميوم',
        'شات ذكي بلا حدود (GPT)',
        'خطط مخصصة حسب بياناتك',
        'المالك يراجع برنامجك شخصياً',
        'إرشادات قبل وبعد التمرين',
        'إحصائيات صحية وتحليلات',
        'تحليل InBody وتوصيات',
        'دعم أولوية',
      ],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
    },
  ],
};

export default function SubscriptionPage() {
  const { data: userData } = useUser();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const plans = PLANS[isAr ? 'ar' : 'en'];

  // Extract tier from subscription object
  const subValue = userData?.user?.subscription;
  const currentTier = subValue?.tier || 'FREE';

  const tierLabel = {
    FREE: isAr ? 'تجربة مجانية' : 'Free Trial',
    PREMIUM: isAr ? 'بريميوم' : 'Premium',
    PREMIUM_PLUS: isAr ? 'بريميوم+' : 'Premium+',
  }[currentTier] || (isAr ? 'تجربة مجانية' : 'Free Trial');

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'الاشتراك' : 'Subscription'}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr ? 'إدارة خطتك' : 'Manage your plan'}
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isAr ? 'خطتك الحالية' : 'Current Plan'}</CardTitle>
              <CardDescription>
                {currentTier === 'FREE'
                  ? (isAr ? 'أنت في الفترة التجريبية المجانية' : 'You are on the free trial')
                  : (isAr ? 'اشتراكك نشط' : 'Your subscription is active')}
              </CardDescription>
            </div>
            <Badge
              className={`text-sm px-3 py-1 ${
                currentTier === 'PREMIUM_PLUS'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : currentTier === 'PREMIUM'
                  ? 'bg-forma-orange text-white'
                  : 'bg-muted'
              }`}
            >
              {currentTier === 'PREMIUM_PLUS' && <Crown className="h-3.5 w-3.5 mr-1" />}
              {currentTier === 'PREMIUM' && <Zap className="h-3.5 w-3.5 mr-1" />}
              {tierLabel}
            </Badge>
          </div>
        </CardHeader>
        {currentTier === 'FREE' && (
          <CardContent>
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {isAr ? 'ترقية للاستفادة الكاملة' : 'Upgrade for full access'}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    {isAr
                      ? 'الفترة التجريبية محدودة. اشترك دلوقتي للحصول على كوتش ذكي، برامج تمارين، وأكتر!'
                      : 'Your trial is limited. Subscribe now for AI coaching, workout programs, and more!'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plan Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentTier === plan.tier;

          return (
            <Card
              key={plan.tier}
              className={`relative overflow-hidden ${
                isCurrent ? 'ring-2 ring-forma-orange' : ''
              }`}
            >
              {plan.tier === 'PREMIUM_PLUS' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  {isAr ? 'الأفضل' : 'BEST VALUE'}
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> {isAr ? 'ج.م' : 'EGP'}{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : 'forma'}
                  className="w-full mt-6"
                  disabled={isCurrent}
                  asChild={!isCurrent}
                >
                  {isCurrent ? (
                    <span>{isAr ? 'خطتك الحالية' : 'Current Plan'}</span>
                  ) : (
                    <Link href={`/checkout?plan=${plan.tier.toLowerCase()}&amount=${plan.price}`}>
                      {isAr ? 'اشترك الآن' : 'Subscribe Now'}
                    </Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'أسئلة شائعة' : 'FAQ'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium">{isAr ? 'هل فيه فترة تجريبية؟' : 'Is there a free trial?'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? 'أيوه! أسبوع تجربة مجانية للباقة المميزة. جرب كل المميزات قبل ما تشترك.'
                : 'Yes! 1 week free trial of Premium. Try all features before subscribing.'}
            </p>
          </div>
          <div>
            <p className="font-medium">{isAr ? 'أقدر ألغي في أي وقت؟' : 'Can I cancel anytime?'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? 'طبعاً! أقدر تلغي اشتراكك في أي وقت. هتفضل تستخدم الخدمة لآخر الفترة المدفوعة.'
                : 'Of course! Cancel anytime. You keep access until the end of your billing period.'}
            </p>
          </div>
          <div>
            <p className="font-medium">{isAr ? 'إيه الفرق بين بريميوم وبريميوم+؟' : 'What\'s the difference between Premium and Premium+?'}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {isAr
                ? 'بريميوم بيديك كوتش ذكي وبحث في قاعدة البيانات. بريميوم+ بيضيف شات ذكي بلا حدود، تحليل InBody، ومتابعة شخصية من المالك.'
                : 'Premium gives you AI coaching and database search. Premium+ adds unlimited smart chat, InBody analysis, and personal program review by the owner.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
