'use client';

import { Trophy, Lock, Star, Flame, Dumbbell, Target, Zap, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const achievements = [
  {
    id: '1',
    title: 'First Workout',
    description: 'Complete your first workout',
    icon: Dumbbell,
    unlocked: false,
    progress: 0,
    total: 1,
  },
  {
    id: '2',
    title: '7 Day Streak',
    description: 'Work out 7 days in a row',
    icon: Flame,
    unlocked: false,
    progress: 0,
    total: 7,
  },
  {
    id: '3',
    title: '30 Day Streak',
    description: 'Work out 30 days in a row',
    icon: Star,
    unlocked: false,
    progress: 0,
    total: 30,
  },
  {
    id: '4',
    title: 'Goal Crusher',
    description: 'Hit your calorie goal 7 days in a row',
    icon: Target,
    unlocked: false,
    progress: 0,
    total: 7,
  },
  {
    id: '5',
    title: 'Early Bird',
    description: 'Complete 5 workouts before 8 AM',
    icon: Zap,
    unlocked: false,
    progress: 0,
    total: 5,
  },
  {
    id: '6',
    title: 'Century Club',
    description: 'Complete 100 workouts',
    icon: Medal,
    unlocked: false,
    progress: 0,
    total: 100,
  },
];

export default function AchievementsPage() {
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
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
                    <achievement.icon className="h-6 w-6" />
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
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            How to Earn Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Complete workouts, hit your goals, and stay consistent to unlock achievements.
            Each achievement tracks your progress automatically. Keep pushing and watch
            your trophy collection grow!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
