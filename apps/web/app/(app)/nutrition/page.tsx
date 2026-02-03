'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Camera,
  Barcode,
  ChevronRight,
  Droplet,
  Apple,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDailyNutrition, useFoodSearch } from '@/hooks/use-nutrition';

// Default goals if none set
const defaultGoals = {
  calories: 2200,
  protein: 180,
  carbs: 250,
  fat: 75,
  water: 8,
};

// Sample recent foods for quick access
const recentFoods = [
  { name: 'Foul Medames', calories: 280 },
  { name: 'Grilled Chicken', calories: 240 },
  { name: 'Greek Yogurt', calories: 100 },
  { name: 'Koshari', calories: 758 },
  { name: 'Protein Shake', calories: 120 },
];

export default function NutritionPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useDailyNutrition();
  const { data: searchResults, isLoading: searchLoading } = useFoodSearch(searchQuery);

  // Calculate daily totals from API data or use defaults
  const totals = dailyData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goals = dailyData?.goals || defaultGoals;
  const meals = dailyData?.meals || [];

  // Group meals by type
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const mealLabels: Record<string, { label: string; time: string }> = {
    BREAKFAST: { label: 'Breakfast', time: '8:00 AM' },
    LUNCH: { label: 'Lunch', time: '1:00 PM' },
    DINNER: { label: 'Dinner', time: '7:00 PM' },
    SNACK: { label: 'Snack', time: '4:00 PM' },
  };

  const organizedMeals = mealTypes.map((type) => {
    const meal = meals.find((m) => m.mealType?.toUpperCase() === type);
    const info = mealLabels[type];
    return {
      type,
      name: info.label,
      time: info.time,
      calories: meal?.totalCalories || 0,
      foods: meal?.foods || [],
      notLogged: !meal,
    };
  });

  // Water tracking (simulated for now)
  const waterGlasses = 6;

  if (dailyLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center lg:ml-64">
        <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
      </div>
    );
  }

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

              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <div>
                  <p className="mb-2 text-sm font-medium">Search Results</p>
                  {searchLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {searchResults.map((food) => (
                        <div
                          key={food.id}
                          className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted"
                        >
                          <div>
                            <span className="font-medium">{food.name}</span>
                            {food.brand && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({food.brand})
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {food.calories} kcal
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No foods found
                    </p>
                  )}
                </div>
              )}

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

              {searchQuery.length < 2 && (
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
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {dailyError && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600">
              Could not load nutrition data. Showing default goals.
            </p>
          </CardContent>
        </Card>
      )}

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
                    strokeDasharray={`${Math.min((totals.calories / goals.calories) * 251, 251)} 251`}
                    strokeLinecap="round"
                    className="text-forma-teal"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round(totals.calories)}</span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Calories</h3>
                <p className="text-sm text-muted-foreground">
                  {Math.max(0, Math.round(goals.calories - totals.calories))} kcal remaining
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Goal</span>
                    <span>{goals.calories} kcal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Food</span>
                    <span>+{Math.round(totals.calories)} kcal</span>
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
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  Protein
                </span>
                <span>
                  {Math.round(totals.protein)}g / {goals.protein}g
                </span>
              </div>
              <Progress
                value={Math.min((totals.protein / goals.protein) * 100, 100)}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  Carbs
                </span>
                <span>
                  {Math.round(totals.carbs)}g / {goals.carbs}g
                </span>
              </div>
              <Progress
                value={Math.min((totals.carbs / goals.carbs) * 100, 100)}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Fat
                </span>
                <span>
                  {Math.round(totals.fat)}g / {goals.fat}g
                </span>
              </div>
              <Progress
                value={Math.min((totals.fat / goals.fat) * 100, 100)}
                className="mt-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Droplet className="h-3 w-3 text-cyan-500" />
                  Water
                </span>
                <span>
                  {waterGlasses} / {defaultGoals.water} glasses
                </span>
              </div>
              <Progress
                value={(waterGlasses / defaultGoals.water) * 100}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Today&apos;s Meals</h2>
        {organizedMeals.map((meal) => (
          <Card key={meal.type}>
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
                        <p className="font-semibold">{Math.round(meal.calories)} kcal</p>
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
                  {meal.foods.map((foodItem, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{foodItem.food?.name || 'Food'}</span>
                      <span className="text-muted-foreground">
                        {Math.round((foodItem.food?.calories || 0) * (foodItem.servings || 1))} kcal
                      </span>
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
