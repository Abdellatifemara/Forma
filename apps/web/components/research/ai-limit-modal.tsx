'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Crown, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSurveyTrigger } from './survey-provider';

interface AILimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentTier: 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
  usedQueries: number;
  queryLimit: number;
  language?: 'en' | 'ar';
}

export function AILimitModal({
  isOpen,
  onClose,
  onUpgrade,
  currentTier,
  usedQueries,
  queryLimit,
  language = 'en',
}: AILimitModalProps) {
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const { triggerSurvey } = useSurveyTrigger();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (isOpen) {
      // After 2 seconds, show feedback prompt
      const timer = setTimeout(() => {
        setShowFeedbackPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFeedback = () => {
    // Trigger the limit hit survey
    triggerSurvey('ai_limit_hit');
    onClose();
  };

  const upgradeOptions = currentTier === 'FREE'
    ? [
        {
          tier: 'PREMIUM',
          name: isRTL ? 'بريميوم' : 'Premium',
          price: '79',
          queries: '20',
          badge: isRTL ? 'أفضل قيمة' : 'Best Value',
          color: 'from-cyan-500 to-blue-600',
        },
        {
          tier: 'PREMIUM_PLUS',
          name: isRTL ? 'بريميوم+' : 'Premium+',
          price: '449',
          queries: isRTL ? 'غير محدود' : 'Unlimited',
          badge: 'VIP',
          color: 'from-purple-500 to-pink-600',
        },
      ]
    : [
        {
          tier: 'PREMIUM_PLUS',
          name: isRTL ? 'بريميوم+' : 'Premium+',
          price: '449',
          queries: isRTL ? 'غير محدود' : 'Unlimited',
          badge: 'VIP',
          color: 'from-purple-500 to-pink-600',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className={cn(
        'w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden',
        isRTL && 'text-right'
      )}>
        {/* Header with animation */}
        <div className="relative p-6 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.15),transparent_50%)]" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex flex-col items-center text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/30 to-red-500/20 mb-4">
              <Zap className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {isRTL ? 'وصلت للحد الأقصى!' : 'You\'ve Hit Your Limit!'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? `استخدمت ${usedQueries} من ${queryLimit} استفسار AI هذا الشهر`
                : `You've used ${usedQueries} of ${queryLimit} AI queries this month`}
            </p>
          </div>
        </div>

        {/* Usage bar */}
        <div className="px-6 py-4 border-b border-border/50">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {isRTL ? 'الاستخدام' : 'Usage'}
            </span>
            <span className="font-medium text-orange-400">
              {usedQueries}/{queryLimit}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isRTL
              ? 'يتم تجديد الرصيد في بداية كل شهر'
              : 'Resets at the beginning of each month'}
          </p>
        </div>

        {/* Upgrade options */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            {isRTL
              ? 'ترقّى للحصول على المزيد من استفسارات AI'
              : 'Upgrade to get more AI queries'}
          </p>

          {upgradeOptions.map((option) => (
            <button
              key={option.tier}
              onClick={onUpgrade}
              className={cn(
                'w-full p-4 rounded-xl border transition-all',
                'hover:scale-[1.02] hover:shadow-lg',
                'bg-gradient-to-br',
                option.tier === 'PREMIUM'
                  ? 'border-cyan-500/30 hover:border-cyan-500/60'
                  : 'border-purple-500/30 hover:border-purple-500/60'
              )}
            >
              <div className={cn('flex items-center gap-4', isRTL && 'flex-row-reverse')}>
                <div className={cn(
                  'p-2 rounded-lg bg-gradient-to-br',
                  option.color
                )}>
                  {option.tier === 'PREMIUM' ? (
                    <TrendingUp className="h-5 w-5 text-white" />
                  ) : (
                    <Crown className="h-5 w-5 text-white" />
                  )}
                </div>
                <div className={cn('flex-1', isRTL ? 'text-right' : 'text-left')}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{option.name}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      option.tier === 'PREMIUM'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-purple-500/20 text-purple-400'
                    )}>
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL
                      ? `${option.queries} استفسار/شهر`
                      : `${option.queries} queries/month`}
                  </p>
                </div>
                <div className={cn('text-right', isRTL && 'text-left')}>
                  <div className="font-bold">{option.price}</div>
                  <div className="text-xs text-muted-foreground">
                    {isRTL ? 'جنيه/شهر' : 'EGP/mo'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Feedback prompt */}
        {showFeedbackPrompt && (
          <div className="px-6 pb-6">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className={cn('flex items-start gap-3', isRTL && 'flex-row-reverse')}>
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">
                    {isRTL
                      ? 'ساعدنا نحسّن التجربة!'
                      : 'Help us improve!'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {isRTL
                      ? 'شاركنا رأيك عن حدود AI في 30 ثانية'
                      : 'Share your feedback about AI limits in 30 seconds'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFeedback}
                  >
                    {isRTL ? 'شارك رأيك' : 'Give Feedback'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
