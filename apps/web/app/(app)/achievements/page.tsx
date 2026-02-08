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
      <div className="flex min-h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
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
                        ? 'bg-forma-teal/20 text-forma-teal'
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
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    {achievement.xpReward > 0 && (
                      <p className="mt-1 text-xs text-forma-teal">
                        +{achievement.xpReward} XP
                      </p>
                    )}
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} / {achievement.total}
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-forma-teal"
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
            <h3 className="mt-4 font-semibold">No achievements available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Achievements are being set up. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            How to Earn Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete workouts, hit your goals, and stay consistent to unlock
            achievements. Each achievement tracks your progress automatically.
            Keep pushing and watch your trophy collection grow!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
