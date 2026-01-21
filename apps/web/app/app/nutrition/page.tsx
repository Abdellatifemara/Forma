'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Camera,
  Barcode,
  ChevronRight,
  Flame,
  Droplet,
  Apple,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const dailyGoals = {
  calories: { current: 1847, target: 2200 },
  protein: { current: 145, target: 180 },
  carbs: { current: 180, target: 250 },
  fat: { current: 65, target: 75 },
  water: { current: 6, target: 8 },
};

const meals = [
  {
    name: 'Breakfast',
    time: '8:30 AM',
    calories: 450,
    foods: [
      { name: 'Foul Medames', calories: 250, protein: 15, carbs: 35, fat: 5 },
      { name: 'Egyptian Bread (Aish Baladi)', calories: 120, protein: 4, carbs: 25, fat: 1 },
      { name: 'Boiled Eggs (2)', calories: 80, protein: 12, carbs: 0, fat: 5 },
    ],
  },
  {
    name: 'Lunch',
    time: '1:00 PM',
    calories: 650,
    foods: [
      { name: 'Grilled Chicken Breast', calories: 280, protein: 52, carbs: 0, fat: 6 },
      { name: 'Rice', calories: 220, protein: 4, carbs: 45, fat: 1 },
      { name: 'Mixed Vegetables', calories: 80, protein: 3, carbs: 15, fat: 1 },
      { name: 'Tahini Salad', calories: 70, protein: 2, carbs: 5, fat: 5 },
    ],
  },
  {
    name: 'Snack',
    time: '4:00 PM',
    calories: 200,
    foods: [
      { name: 'Greek Yogurt', calories: 120, protein: 15, carbs: 8, fat: 3 },
      { name: 'Almonds (handful)', calories: 80, protein: 3, carbs: 3, fat: 7 },
    ],
  },
  {
    name: 'Dinner',
    time: '7:30 PM',
    calories: 0,
    foods: [],
    notLogged: true,
  },
];

const recentFoods = [
  { name: 'Foul Medames', calories: 250 },
  { name: 'Grilled Chicken', calories: 280 },
  { name: 'Greek Yogurt', calories: 120 },
  { name: 'Koshary', calories: 450 },
  { name: 'Protein Shake', calories: 180 },
];

export default function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Nutrition</h1>
          <p className="text-muted-foreground">Track your daily intake</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="forma">
              <Plus className="mr-2 h-4 w-4" />
              Log Food
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Food</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search foods..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Camera className="mb-2 h-5 w-5" />
                  <span className="text-xs">Scan Food</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col py-4">
                  <Barcode className="mb-2 h-5 w-5" />
                  <span className="text-xs">Scan Barcode</span>
                </Button>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Recent Foods</p>
                <div className="space-y-2">
                  {recentFoods.map((food) => (
                    <div
                      key={food.name}
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted"
                    >
                      <span>{food.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {food.calories} kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Calorie Ring */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${(dailyGoals.calories.current / dailyGoals.calories.target) * 251} 251`}
                    strokeLinecap="round"
                    className="text-forma-teal"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{dailyGoals.calories.current}</span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Calories</h3>
                <p className="text-sm text-muted-foreground">
                  {dailyGoals.calories.target - dailyGoals.calories.current} kcal remaining
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal</span>
                    <span>{dailyGoals.calories.target} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Food</span>
                    <span>+{dailyGoals.calories.current} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm text-forma-teal">
                    <span>Exercise</span>
                    <span>-320 kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Macros */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Macronutrients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-protein" />
                  Protein
                </span>
                <span>
                  {dailyGoals.protein.current}g / {dailyGoals.protein.target}g
                </span>
              </div>
              <Progress
                value={(dailyGoals.protein.current / dailyGoals.protein.target) * 100}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-carbs" />
                  Carbs
                </span>
                <span>
                  {dailyGoals.carbs.current}g / {dailyGoals.carbs.target}g
                </span>
              </div>
              <Progress
                value={(dailyGoals.carbs.current / dailyGoals.carbs.target) * 100}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-fat" />
                  Fat
                </span>
                <span>
                  {dailyGoals.fat.current}g / {dailyGoals.fat.target}g
                </span>
              </div>
              <Progress
                value={(dailyGoals.fat.current / dailyGoals.fat.target) * 100}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Droplet className="h-3 w-3 text-blue-500" />
                  Water
                </span>
                <span>
                  {dailyGoals.water.current} / {dailyGoals.water.target} glasses
                </span>
              </div>
              <Progress
                value={(dailyGoals.water.current / dailyGoals.water.target) * 100}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today's Meals</h2>
        {meals.map((meal) => (
          <Card key={meal.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-forma-teal/10 p-2">
                    <Apple className="h-5 w-5 text-forma-teal" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{meal.name}</h3>
                    <p className="text-sm text-muted-foreground">{meal.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {meal.notLogged ? (
                    <Button variant="outline" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Log
                    </Button>
                  ) : (
                    <>
                      <div className="text-right">
                        <p className="font-semibold">{meal.calories} kcal</p>
                        <p className="text-xs text-muted-foreground">
                          {meal.foods.length} items
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </>
                  )}
                </div>
              </div>

              {meal.foods.length > 0 && (
                <div className="mt-4 space-y-2 border-t pt-4">
                  {meal.foods.map((food, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{food.name}</span>
                      <span className="text-muted-foreground">{food.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
