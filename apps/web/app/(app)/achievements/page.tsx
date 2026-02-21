'use client';

import { useEffect, useState } from 'react';
import {
  Trophy,
  Lock,
  Star,
  Flame,
  Dumbbell,
  Target,
  Zap,
  Medal,
  Loader2,
  Scale,
  Utensils,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { achievementsApi, type Achievement } from '@/lib/api';
import { useLanguage } from '@/lib/i18n';

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  flame: Flame,
  star: Star,
  target: Target,
  zap: Zap,
  medal: Medal,
  trophy: Trophy,
  scale: Scale,
  utensils: Utensils,
};

export default function AchievementsPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAchievements() {
      setIsLoading(true);
      try {
        const data = await achievementsApi.getAll();
        setAchievements(data);
      } catch (error) {
        // Error handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="space-y-2">
          <div className="h-8 w-40 rounded-lg animate-shimmer" />
          <div className="h-4 w-56 rounded-lg animate-shimmer" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-white dark:bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl animate-shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 rounded animate-shimmer" />
              <div className="h-2 w-full rounded-full animate-shimmer" />
            </div>
          </div>
        </div>
        <div className="grid gap-3 grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl border border-border/60 bg-white dark:bg-card p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 rounded-full animate-shimmer" />
                <div className="h-4 w-20 rounded animate-shimmer" />
                <div className="h-3 w-16 rounded animate-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">{t.achievements.title}</h1>
        <p className="text-muted-foreground">
          {isAr ? `${unlockedCount} من ${achievements.length} مفتوحين` : `${unlockedCount} of ${achievements.length} unlocked`}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const IconComponent = iconMap[achievement.icon] || Trophy;

          return (
            <Card
              key={achievement.id}
              className={achievement.unlocked ? '' : 'opacity-60'}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      achievement.unlocked
                        ? 'bg-forma-orange/20 text-forma-orange'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {achievement.unlocked ? (
                      <IconComponent className="h-6 w-6" />
                    ) : (
                      <Lock className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Badge variant="forma" className="text-xs">
                          {t.achievements.unlocked}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.xpReward > 0 && (
                      <p className="mt-1 text-xs text-forma-orange">
                        +{achievement.xpReward} XP
                      </p>
                    )}
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t.achievements.progress}</span>
                          <span>
                            {achievement.progress} / {achievement.total}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-forma-orange"
                            style={{
                              width: `${(achievement.progress / achievement.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">{isAr ? 'مفيش إنجازات متاحة' : 'No achievements available'}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAr ? 'الإنجازات بيتم إعدادها. ارجع تاني قريباً!' : 'Achievements are being set up. Check back soon!'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {isAr ? 'إزاي تكسب إنجازات' : 'How to Earn Achievements'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {isAr
              ? 'كمّل تمارينك، حقق أهدافك، واستمر بانتظام عشان تفتح إنجازات. كل إنجاز بيتابع تقدمك تلقائياً. كمّل وشوف مجموعة الكؤوس بتكبر!'
              : 'Complete workouts, hit your goals, and stay consistent to unlock achievements. Each achievement tracks your progress automatically. Keep pushing and watch your trophy collection grow!'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
