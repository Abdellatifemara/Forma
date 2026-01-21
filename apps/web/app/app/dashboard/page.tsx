'use client';

import Link from 'next/link';
import {
  Flame,
  Footprints,
  Timer,
  TrendingUp,
  ChevronRight,
  Play,
  Dumbbell,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const quickStats = [
  { label: 'Calories', value: '1,847', target: '2,200', icon: Flame, color: 'text-orange-500' },
  { label: 'Steps', value: '6,234', target: '10,000', icon: Footprints, color: 'text-blue-500' },
  { label: 'Active Min', value: '45', target: '60', icon: Timer, color: 'text-green-500' },
  { label: 'Streak', value: '12', target: 'days', icon: TrendingUp, color: 'text-forma-teal' },
];

const todayWorkout = {
  name: 'Push Day - Chest & Triceps',
  duration: '45 min',
  exercises: 6,
  muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
};

const upcomingMeals = [
  { name: 'Breakfast', time: '8:00 AM', calories: 450, logged: true },
  { name: 'Lunch', time: '1:00 PM', calories: 650, logged: true },
  { name: 'Snack', time: '4:00 PM', calories: 200, logged: false },
  { name: 'Dinner', time: '7:00 PM', calories: 700, logged: false },
];

const recentAchievements = [
  { title: '7 Day Streak', description: 'Worked out for 7 days in a row', date: '2 days ago' },
  { title: 'First 5K', description: 'Completed your first 5K run', date: '1 week ago' },
];

export default function AppDashboardPage() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold">{greeting}, Ahmed!</h1>
        <p className="text-muted-foreground">Let's crush your goals today.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.target}</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Workout */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-forma-teal/20 to-forma-teal/5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="forma" className="mb-2">
                Today's Workout
              </Badge>
              <h2 className="text-xl font-bold">{todayWorkout.name}</h2>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Timer className="h-4 w-4" />
                  {todayWorkout.duration}
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  {todayWorkout.exercises} exercises
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {todayWorkout.muscleGroups.map((muscle) => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant="forma" size="lg" asChild>
              <Link href="/app/workouts/today">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nutrition Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Today's Nutrition</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/nutrition">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {/* Calorie Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Calories</span>
                <span className="text-muted-foreground">1,847 / 2,200</span>
              </div>
              <Progress value={84} className="mt-2" />
            </div>

            {/* Macros */}
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Protein</div>
                <div className="font-bold text-chart-protein">145g</div>
                <Progress value={72} className="mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Carbs</div>
                <div className="font-bold text-chart-carbs">180g</div>
                <Progress value={60} className="mt-1 h-1" />
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Fat</div>
                <div className="font-bold text-chart-fat">65g</div>
                <Progress value={81} className="mt-1 h-1" />
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-2">
              {upcomingMeals.map((meal) => (
                <div
                  key={meal.name}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{meal.name}</p>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{meal.calories} kcal</p>
                    {meal.logged ? (
                      <Badge variant="forma" className="text-xs">
                        Logged
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="h-6 text-xs">
                        Log
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Progress & Achievements */}
        <div className="space-y-6">
          {/* Weekly Goal Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-forma-teal" />
                      Workouts
                    </span>
                    <span className="text-muted-foreground">4 / 5</span>
                  </div>
                  <Progress value={80} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Calorie Goal
                    </span>
                    <span className="text-muted-foreground">5 / 7 days</span>
                  </div>
                  <Progress value={71} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Footprints className="h-4 w-4 text-blue-500" />
                      Step Goal
                    </span>
                    <span className="text-muted-foreground">3 / 7 days</span>
                  </div>
                  <Progress value={43} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Recent Achievements</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/achievements">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.title}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forma-teal/20">
                      <TrendingUp className="h-5 w-5 text-forma-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{achievement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{achievement.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
