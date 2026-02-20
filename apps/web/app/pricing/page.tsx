'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Check,
  X,
  Zap,
  Crown,
  Dumbbell,
  Apple,
  BarChart3,
  Brain,
  Users,
  GraduationCap,
  PlayCircle,
  Headphones,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import {
  SUBSCRIPTION_TIERS,
  FEATURES,
  CATEGORY_INFO,
  getFeaturesByCategory,
  hasFeature,
  getFeatureLimit,
  type SubscriptionTier,
  type FeatureCategory,
} from '@/lib/subscription-features';

const CATEGORY_ICONS: Record<FeatureCategory, React.ComponentType<{ className?: string }>> = {
  workouts: Dumbbell,
  nutrition: Apple,
  tracking: BarChart3,
  ai: Brain,
  social: Users,
  coaching: GraduationCap,
  content: PlayCircle,
  support: Headphones,
};

const CATEGORY_ORDER: FeatureCategory[] = [
  'workouts',
  'nutrition',
  'tracking',
  'ai',
  'coaching',
  'social',
  'content',
  'support',
];

export default function PricingPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [expandedCategories, setExpandedCategories] = useState<Set<FeatureCategory>>(
    new Set(CATEGORY_ORDER)
  );
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const toggleCategory = (category: FeatureCategory) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setExpandedCategories(newSet);
  };

  const tiers: SubscriptionTier[] = ['FREE', 'PREMIUM', 'PREMIUM_PLUS'];

  const getPrice = (tier: SubscriptionTier) => {
    const pricing = SUBSCRIPTION_TIERS[tier].pricing;
    if (billingPeriod === 'yearly') {
      return pricing.yearly;
    }
    return pricing.monthly;
  };

  const formatLimit = (limit: number | 'unlimited' | null) => {
    if (limit === null) return null;
    if (limit === 'unlimited') return isAr ? 'غير محدود' : 'Unlimited';
    if (limit === 0) return null;
    return isAr ? `${limit}/شهر` : `${limit}/mo`;
  };

  const faqs = isAr
    ? [
        {
          q: 'ممكن أغير باقتي في أي وقت؟',
          a: 'أيوه! تقدر ترقي أو تخفض باقتك في أي وقت. لو رقيت، هتتحسبلك الفرق بالنسبة. لو خفضت، التغيير هيتطبق في دورة الفوترة الجاية.',
        },
        {
          q: 'إيه طرق الدفع المتاحة؟',
          a: 'بنقبل كل الكروت الائتمانية والخصم، فودافون كاش، أورنج كاش، فوري، والتحويل البنكي عن طريق شريكنا الآمن Paymob.',
        },
        {
          q: 'فيه تجربة مجانية لباقة بريميوم؟',
          a: 'بنوفر تجربة مجانية 7 أيام لباقة بريميوم لما تشترك في الباقة السنوية. تقدر تلغي في أي وقت خلال الفترة دي من غير ما تتحسبلك أي فلوس.',
        },
        {
          q: 'إيه اللي بيتضمنه بريميوم+ من حيث التواصل مع المدرب؟',
          a: 'بريميوم+ بيتضمن التواصل مع مدرب مصري معتمد هيعمل برامج تمارين وتغذية مخصوصة ليك، متابعة أسبوعية، و2 استشارة فيديو في الشهر. تقدر تراسل مدربك مباشرة من خلال التطبيق.',
        },
        {
          q: 'ممكن استرجع فلوسي؟',
          a: 'أيوه، بنضمن استرداد كامل خلال 14 يوم على كل الباقات المدفوعة. لو مش راضي، تواصل مع الدعم عشان تسترد فلوسك بالكامل.',
        },
      ]
    : [
        {
          q: 'Can I switch plans anytime?',
          a: "Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at your next billing cycle.",
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit/debit cards, Vodafone Cash, Orange Cash, Fawry, and bank transfers through our secure payment partner Paymob.',
        },
        {
          q: 'Is there a free trial for Premium?',
          a: "We offer a 7-day free trial for Premium when you sign up for a yearly subscription. You can cancel anytime during the trial without being charged.",
        },
        {
          q: "What's included in the Premium+ trainer matching?",
          a: 'Premium+ includes matching with a certified Egyptian trainer who will create custom workout and nutrition plans, provide weekly check-ins, and offer 2 video consultations per month. You can message your trainer directly through the app.',
        },
        {
          q: 'Can I get a refund?',
          a: "Yes, we offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund.",
        },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 container py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {isAr ? 'رجوع للرئيسية' : 'Back to home'}
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            {isAr ? 'قارن' : 'Compare'}{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
              {isAr ? 'الباقات' : 'Plans'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {isAr
              ? 'اختار الباقة المناسبة لأهدافك...'
              : 'Choose the plan that fits your fitness goals. All plans include core features to track your progress.'}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-muted/50 border border-border/50">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isAr ? 'شهري' : 'Monthly'}
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                billingPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isAr ? 'سنوي' : 'Yearly'}
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-500 text-xs">
                {isAr ? 'وفر لحد 38%' : 'Save up to 38%'}
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards header */}
        <div className="grid grid-cols-4 gap-4 mb-8 sticky top-0 z-20 bg-background/80 backdrop-blur-lg py-4 border-b border-border/50">
          <div className="text-sm text-muted-foreground font-medium">
            {isAr ? 'المميزات' : 'Features'}
          </div>
          {tiers.map((tier) => {
            const tierInfo = SUBSCRIPTION_TIERS[tier];
            const isPremium = tier === 'PREMIUM';
            const isPremiumPlus = tier === 'PREMIUM_PLUS';

            return (
              <div
                key={tier}
                className={cn(
                  'text-center p-4 rounded-xl',
                  isPremium && 'bg-cyan-500/10 border border-cyan-500/30',
                  isPremiumPlus && 'bg-purple-500/10 border border-purple-500/30'
                )}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {isPremium && <Zap className="h-5 w-5 text-cyan-500" />}
                  {isPremiumPlus && <Crown className="h-5 w-5 text-purple-500" />}
                  <h3 className="font-bold text-lg">{tierInfo.name}</h3>
                </div>
                <div className="mb-3">
                  {tierInfo.pricing.monthly === 0 ? (
                    <span className="text-2xl font-bold">{isAr ? 'مجاني' : 'Free'}</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold">{getPrice(tier)}</span>
                      <span className="text-muted-foreground text-sm">
                        {' '}{isAr ? 'ج.م' : 'EGP'}/{billingPeriod === 'yearly' ? (isAr ? 'سنة' : 'yr') : (isAr ? 'شهر' : 'mo')}
                      </span>
                    </>
                  )}
                </div>
                <Button
                  size="sm"
                  className={cn(
                    'w-full',
                    isPremium && 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
                    isPremiumPlus && 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  )}
                  variant={!isPremium && !isPremiumPlus ? 'outline' : 'default'}
                  asChild
                >
                  <Link href={`/signup?plan=${tier.toLowerCase()}`}>
                    {tier === 'FREE'
                      ? (isAr ? 'ابدأ مجاناً' : 'Start Free')
                      : (isAr ? 'ابدأ دلوقتي' : 'Get Started')}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div className="space-y-6">
          {CATEGORY_ORDER.map((category) => {
            const features = getFeaturesByCategory(category);
            const categoryInfo = CATEGORY_INFO[category];
            const Icon = CATEGORY_ICONS[category];
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      category === 'ai' && 'bg-purple-500/10 text-purple-500',
                      category === 'coaching' && 'bg-amber-500/10 text-amber-500',
                      category !== 'ai' && category !== 'coaching' && 'bg-primary/10 text-primary'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{categoryInfo.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({features.length} {isAr ? 'مميزات' : 'features'})
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {/* Features list */}
                {isExpanded && (
                  <div className="border-t border-border/50">
                    {features.map((feature, idx) => (
                      <div
                        key={feature.id}
                        className={cn(
                          'grid grid-cols-4 gap-4 p-4 items-center',
                          idx !== features.length - 1 && 'border-b border-border/30'
                        )}
                      >
                        <div>
                          <div className="font-medium text-sm">{feature.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {feature.description}
                          </div>
                        </div>
                        {tiers.map((tier) => {
                          const isAvailable = hasFeature(feature.id, tier);
                          const limit = getFeatureLimit(feature.id, tier);
                          const formattedLimit = formatLimit(limit);
                          const isPremiumPlus = tier === 'PREMIUM_PLUS';
                          const isPremium = tier === 'PREMIUM';

                          return (
                            <div key={tier} className="text-center">
                              {isAvailable ? (
                                <div className="flex flex-col items-center gap-1">
                                  <Check
                                    className={cn(
                                      'h-5 w-5',
                                      isPremiumPlus && 'text-purple-500',
                                      isPremium && 'text-cyan-500',
                                      !isPremium && !isPremiumPlus && 'text-green-500'
                                    )}
                                  />
                                  {formattedLimit && (
                                    <span className="text-xs text-muted-foreground">
                                      {formattedLimit}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="glass rounded-2xl p-8 border border-border/50 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              {isAr ? 'جاهز تغير حياتك الرياضية?' : 'Ready to transform your fitness?'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {isAr
                ? 'انضم لآلاف المصريين...'
                : 'Join thousands of Egyptians already achieving their fitness goals with Forma.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="/signup">{isAr ? 'ابدأ مجاناً' : 'Start Free'}</Link>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                asChild
              >
                <Link href="/signup?plan=premium">
                  {isAr ? 'اشترك في بريميوم' : 'Get Premium'}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            {isAr ? 'أسئلة شائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
