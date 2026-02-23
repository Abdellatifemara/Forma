'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Camera,
  Barcode,
  ChevronRight,
  Droplet,
  Apple,
  Loader2,
  Coffee,
  UtensilsCrossed,
  Moon,
  Cookie,
  Flame,
  Zap,
  TrendingUp,
  X,
  Sparkles,
  Target,
  ChevronDown,
  Check,
  Pill,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Collapsible removed — using AnimatePresence instead
import { useDailyNutrition, useFoodSearch, useFoodCategories, useLogMeal } from '@/hooks/use-nutrition';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

// Default goals if none set
const defaultGoals = {
  calories: 2200,
  protein: 180,
  carbs: 250,
  fat: 75,
  water: 3, // liters
};

// Default recent foods shown when no meal history exists
const defaultRecentFoods = [
  { name: 'Foul Medames', calories: 280, protein: 15, carbs: 40, fat: 6 },
  { name: 'Grilled Chicken', calories: 240, protein: 35, carbs: 0, fat: 8 },
  { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0 },
  { name: 'Koshari', calories: 758, protein: 18, carbs: 140, fat: 12 },
  { name: 'Protein Shake', calories: 120, protein: 24, carbs: 3, fat: 1 },
];

// Curated food categories for browsing (values use case-insensitive partial match on DB category)
const foodCategories = [
  { label: 'Protein', labelAr: 'بروتين', value: 'PROTEIN', icon: '🥩' },
  { label: 'Dairy', labelAr: 'ألبان', value: 'DAIRY', icon: '🥛' },
  { label: 'Carbs', labelAr: 'كاربز', value: 'CARBS', icon: '🌾' },
  { label: 'Fats', labelAr: 'دهون', value: 'FATS', icon: '🥑' },
  { label: 'Fruit', labelAr: 'فاكهة', value: 'FRUIT', icon: '🍎' },
  { label: 'Vegetables', labelAr: 'خضار', value: 'VEGETABLE', icon: '🥬' },
  { label: 'Snacks', labelAr: 'سناكس', value: 'SNACK', icon: '🍪' },
  { label: 'Egyptian', labelAr: 'أكل مصري', value: 'egyptian', icon: '🇪🇬' },
  { label: 'Fast Food', labelAr: 'فاست فود', value: 'fast_food', icon: '🍔' },
  { label: 'Supplements', labelAr: 'مكملات', value: 'SUPPLEMENT', icon: '💊' },
  { label: 'Desserts', labelAr: 'حلويات', value: 'dessert', icon: '🍰' },
  { label: 'Beverages', labelAr: 'مشروبات', value: 'BEVERAGE', icon: '☕' },
  { label: 'Street Food', labelAr: 'أكل شارع', value: 'street_food', icon: '🌮' },
  { label: 'Traditional', labelAr: 'تقليدي', value: 'TRADITIONAL', icon: '🍲' },
  { label: 'Meal Prep', labelAr: 'تحضير وجبات', value: 'meal_prep', icon: '📦' },
  { label: 'Keto', labelAr: 'كيتو', value: 'keto', icon: '🥓' },
];

const mealIcons = {
  BREAKFAST: Coffee,
  LUNCH: UtensilsCrossed,
  DINNER: Moon,
  SNACK: Cookie,
};

const mealColors = {
  BREAKFAST: 'from-orange-500 to-yellow-500',
  LUNCH: 'from-green-500 to-emerald-500',
  DINNER: 'from-purple-500 to-pink-500',
  SNACK: 'from-blue-500 to-blue-600',
};

export default function NutritionPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [foodCategoryFilter, setFoodCategoryFilter] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [waterMl, setWaterMl] = useState(() => {
    if (typeof window !== 'undefined') {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`forma_water_ml_${today}`);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [isLogging, setIsLogging] = useState(false);
  const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useDailyNutrition();
  const { data: searchResults, isLoading: searchLoading } = useFoodSearch(debouncedSearch, foodCategoryFilter || undefined);
  const logMealMutation = useLogMeal();

  // Custom goals from localStorage (editable by user)
  const [customGoals, setCustomGoals] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('forma_nutrition_goals');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);

  const saveCustomGoals = (newGoals: typeof defaultGoals) => {
    setCustomGoals(newGoals);
    localStorage.setItem('forma_nutrition_goals', JSON.stringify(newGoals));
    setGoalsDialogOpen(false);
  };

  // Calculate daily totals from API data or use defaults
  const totals = dailyData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const goals = customGoals || dailyData?.goals || defaultGoals;

  // Water tracking in ml — add/subtract 250ml at a time
  const waterGoalMl = (goals.water || defaultGoals.water) * 1000; // convert L to ml
  const waterLiters = (waterMl / 1000).toFixed(1);
  const addWater = (ml: number) => {
    const newVal = Math.max(0, Math.min(waterMl + ml, 10000));
    setWaterMl(newVal);
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem(`forma_water_ml_${today}`, String(newVal));
  };
  const meals = dailyData?.meals || [];

  // Group meals by type
  const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const;
  const mealLabels: Record<string, { label: string; time: string }> = {
    BREAKFAST: { label: t.nutrition.breakfast, time: isAr ? '٨:٠٠ ص' : '8:00 AM' },
    LUNCH: { label: t.nutrition.lunch, time: isAr ? '١:٠٠ م' : '1:00 PM' },
    DINNER: { label: t.nutrition.dinner, time: isAr ? '٧:٠٠ م' : '7:00 PM' },
    SNACK: { label: t.nutrition.snack, time: isAr ? 'أي وقت' : 'Anytime' },
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

  // Recent foods from today's logged meals, fallback to defaults
  const recentFoods = (() => {
    const loggedFoods = meals.flatMap((m) =>
      (m.foods || []).map((f: any) => ({
        name: f.name || f.food?.name || (isAr ? 'طعام' : 'Food'),
        calories: f.calories || 0,
        protein: f.protein || 0,
        carbs: f.carbs || 0,
        fat: f.fat || 0,
      }))
    );
    // Deduplicate by name, take up to 5
    const seen = new Set<string>();
    const unique = loggedFoods.filter((f) => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });
    return unique.slice(0, 5);
  })();

  // Progress calculations
  const calorieProgress = Math.min((totals.calories / goals.calories) * 100, 100);
  const proteinProgress = Math.min((totals.protein / goals.protein) * 100, 100);
  const carbsProgress = Math.min((totals.carbs / goals.carbs) * 100, 100);
  const fatProgress = Math.min((totals.fat / goals.fat) * 100, 100);
  const waterProgress = Math.min((waterMl / waterGoalMl) * 100, 100);

  const caloriesRemaining = Math.max(0, goals.calories - totals.calories);

  if (dailyLoading) {
    return (
      <div className="space-y-4 pb-20">
        {/* Calorie ring skeleton */}
        <div className="rounded-2xl border border-border/60 bg-white dark:bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 rounded-lg animate-shimmer" />
              <div className="h-8 w-20 rounded-lg animate-shimmer" />
              <div className="h-3 w-32 rounded-lg animate-shimmer" />
            </div>
            <div className="h-28 w-28 rounded-full animate-shimmer" />
          </div>
        </div>
        {/* Macro bars skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-border/60 bg-white dark:bg-card p-4">
              <div className="h-3 w-12 rounded animate-shimmer mb-2" />
              <div className="h-5 w-16 rounded animate-shimmer mb-2" />
              <div className="h-2 w-full rounded-full animate-shimmer" />
            </div>
          ))}
        </div>
        {/* Meal sections skeleton */}
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border/60 bg-white dark:bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl animate-shimmer" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 rounded animate-shimmer" />
                <div className="h-3 w-16 rounded animate-shimmer" />
              </div>
              <div className="h-8 w-8 rounded-lg animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.nutrition.title}</h1>
          <p className="text-muted-foreground">{isAr ? 'تابع أكلك اليومي' : 'Track your daily intake'}</p>
        </div>
        <Dialog open={logDialogOpen} onOpenChange={(open) => { setLogDialogOpen(open); if (!open) { setSelectedMealType(null); setFoodCategoryFilter(null); setSearchQuery(''); } }}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              {t.nutrition.logMeal}
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl border border-border/50 bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-primary" />
                {t.nutrition.add}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isAr ? 'سجّل أكل في متابعة التغذية اليومية' : 'Log a food item to your daily nutrition tracker'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Meal Type Selection */}
              {!selectedMealType ? (
                <div className="grid grid-cols-2 gap-3">
                  {mealTypes.map((type) => {
                    const Icon = mealIcons[type];
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedMealType(type)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border/50 transition-all hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-xl bg-gradient-to-br",
                          mealColors[type]
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{mealLabels[type].label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedMealType(null); setFoodCategoryFilter(null); setSearchQuery(''); }}>
                      {isAr ? 'رجوع ←' : '← Back'}
                    </Button>
                    <Badge variant="outline">{mealLabels[selectedMealType].label}</Badge>
                  </div>

                  <div className="relative">
                    <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isAr ? "right-3" : "left-3")} />
                    <Input
                      placeholder={t.nutrition.searchFoods}
                      className={cn("bg-muted/50 border-border/50", isAr ? "pr-10" : "pl-10")}
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setFoodCategoryFilter(null); }}
                    />
                  </div>

                  {/* Food Category Pills */}
                  {searchQuery.length < 2 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                      {foodCategories.map((cat) => {
                        const isActive = foodCategoryFilter === cat.value;
                        return (
                          <button
                            key={cat.value}
                            onClick={() => {
                              setFoodCategoryFilter(isActive ? null : cat.value);
                              setSearchQuery('');
                            }}
                            className={cn(
                              'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1',
                              isActive
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <span>{cat.icon}</span>
                            {isAr ? cat.labelAr : cat.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Search Results / Category Browse Results */}
                  {(searchQuery.length >= 2 || foodCategoryFilter) && (
                    <div>
                      <p className="mb-2 text-sm font-medium">{isAr ? 'نتايج البحث' : 'Search Results'}</p>
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      ) : (() => {
                        const rawFoods = Array.isArray(searchResults) ? searchResults : searchResults?.foods || [];
                        // Deduplicate by name — DB may have duplicate entries
                        const seenNames = new Set<string>();
                        const foods = rawFoods.filter((f: any) => {
                          const key = (f.nameEn || f.name || '').toLowerCase().trim();
                          if (seenNames.has(key)) return false;
                          seenNames.add(key);
                          return true;
                        });
                        return foods.length > 0 ? (
                        <div className="max-h-64 space-y-2 overflow-y-auto">
                          {foods.map((food: any) => (
                            <div
                              key={food.id}
                              onClick={() => setSelectedFood(food)}
                              className="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 p-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                {food.imageUrl ? (
                                  <img src={food.imageUrl} alt={food.nameEn} className="h-10 w-10 rounded-lg object-cover" />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Apple className="h-5 w-5 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium text-sm">{isAr ? (food.nameAr || food.nameEn || food.name) : (food.nameEn || food.name)}</span>
                                  {(food.brandEn || food.brand) && (
                                    <p className="text-xs text-muted-foreground">{food.brandEn || food.brand}</p>
                                  )}
                                  <div className="flex gap-2 mt-0.5">
                                    <span className="text-[10px] text-muted-foreground">P: {Math.round(food.proteinG || 0)}g</span>
                                    <span className="text-[10px] text-muted-foreground">C: {Math.round(food.carbsG || 0)}g</span>
                                    <span className="text-[10px] text-muted-foreground">F: {Math.round(food.fatG || 0)}g</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(food.calories)} kcal
                                </Badge>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{food.servingSizeG}g</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          {t.nutrition.noResults}
                        </p>
                      );
                      })()}
                    </div>
                  )}

                  {/* Scan buttons — requires mobile app camera, hidden on web */}

                  {searchQuery.length < 2 && !foodCategoryFilter && recentFoods.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium">{t.nutrition.recentFoods}</p>
                      <div className="space-y-2">
                        {recentFoods.map((food) => (
                          <div
                            key={food.name}
                            className="flex cursor-pointer items-center justify-between rounded-xl border border-border/50 p-3 hover:bg-primary/5 hover:border-primary/30 transition-all"
                          >
                            <div>
                              <span className="font-medium">{food.name}</span>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">P: {food.protein}g</span>
                                <span className="text-xs text-muted-foreground">C: {food.carbs}g</span>
                                <span className="text-xs text-muted-foreground">F: {food.fat}g</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {food.calories} kcal
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchQuery.length < 2 && !foodCategoryFilter && recentFoods.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {isAr ? 'ابحث عن طعام لإضافته إلى وجبتك' : 'Search for a food to add to your meal'}
                    </p>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {dailyError && (
        <Card className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-500" />
            <p className="text-sm text-yellow-500">
              {isAr ? 'مقدرناش نحمّل بيانات التغذية. بنعرض الأهداف الافتراضية.' : 'Could not load nutrition data. Showing default goals.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Calorie Ring */}
        <Card className="rounded-2xl border border-border/50 bg-card md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#calorieGradient)"
                    strokeWidth="12"
                    strokeDasharray={`${calorieProgress * 3.52} 352`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{Math.round(totals.calories)}</span>
                  <span className="text-xs text-muted-foreground">kcal</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-lg">{t.nutrition.calories}</h3>
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  caloriesRemaining > 0 ? "text-green-400" : "text-red-400"
                )}>
                  {caloriesRemaining > 0 ? caloriesRemaining : Math.abs(caloriesRemaining - goals.calories)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {caloriesRemaining > 0 ? (isAr ? 'متبقي' : 'remaining') : (isAr ? 'زيادة' : 'over')}
                  </span>
                </p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{isAr ? `الهدف: ${goals.calories}` : `Goal: ${goals.calories}`}</span>
                  </div>
                  <button
                    onClick={() => setGoalsDialogOpen(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    {isAr ? 'تعديل' : 'Edit'}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="rounded-2xl border border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{t.nutrition.protein}</span>
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                {Math.round(totals.protein)}g / {goals.protein}g
              </Badge>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${proteinProgress}%` }}
                transition={{ duration: 1, delay: 0.1 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isAr ? `${Math.max(0, goals.protein - Math.round(totals.protein))}جم متبقي` : `${Math.max(0, goals.protein - Math.round(totals.protein))}g remaining`}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{t.nutrition.carbs}</span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                {Math.round(totals.carbs)}g / {goals.carbs}g
              </Badge>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${carbsProgress}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isAr ? `${Math.max(0, goals.carbs - Math.round(totals.carbs))}جم متبقي` : `${Math.max(0, goals.carbs - Math.round(totals.carbs))}g remaining`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fat & Water Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Zap className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-medium">{t.nutrition.fat}</span>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {Math.round(totals.fat)}g / {goals.fat}g
              </Badge>
            </div>
            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${fatProgress}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border/50 bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Droplet className="h-4 w-4 text-blue-400" />
                </div>
                <span className="font-medium">{t.health.water}</span>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                {waterLiters} / {goals.water || defaultGoals.water} {isAr ? 'لتر' : 'L'}
              </Badge>
            </div>
            {/* Progress bar */}
            <div className="h-3 rounded-full bg-muted/30 mb-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
            {/* Quick add buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => addWater(250)}
                className="flex-1 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-colors"
              >
                +250{isAr ? ' مل' : 'ml'}
              </button>
              <button
                onClick={() => addWater(500)}
                className="flex-1 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-colors"
              >
                +500{isAr ? ' مل' : 'ml'}
              </button>
              <button
                onClick={() => addWater(1000)}
                className="flex-1 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-medium transition-colors"
              >
                +1{isAr ? ' لتر' : 'L'}
              </button>
              <button
                onClick={() => addWater(-250)}
                className="h-10 w-10 rounded-xl bg-muted/30 hover:bg-muted/50 text-muted-foreground text-xs font-medium transition-colors flex items-center justify-center"
              >
                -
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Meals — Timeline Style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.nutrition.today}</h2>
          <Badge variant="outline" className="text-xs">
            {organizedMeals.filter(m => !m.notLogged).length} / {organizedMeals.length} {isAr ? 'مسجّل' : 'logged'}
          </Badge>
        </div>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-orange-500/50 via-green-500/30 via-purple-500/30 to-blue-500/30 hidden sm:block" />

          {organizedMeals.map((meal, index) => {
            const Icon = mealIcons[meal.type as keyof typeof mealIcons];
            const colorClass = mealColors[meal.type as keyof typeof mealColors];
            const isExpanded = expandedMeal === meal.type;

            return (
              <motion.div
                key={meal.type}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: index * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
                className="relative sm:ps-14 mb-3 last:mb-0"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "hidden sm:flex absolute left-3 top-5 w-7 h-7 items-center justify-center rounded-full ring-4 ring-background z-10 bg-gradient-to-br shadow-lg transition-all duration-300",
                  colorClass,
                  !meal.notLogged && "scale-110"
                )}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>

                <div
                  onClick={() => setExpandedMeal(isExpanded ? null : meal.type)}
                  className={cn(
                    "group relative rounded-2xl border bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg",
                    !meal.notLogged ? "border-green-500/20 shadow-sm" : "border-border/40",
                    isExpanded && "ring-1 ring-primary/20"
                  )}
                >
                  {/* Subtle gradient overlay */}
                  <div className={cn("absolute inset-0 opacity-[0.03] bg-gradient-to-br pointer-events-none", colorClass)} />

                  <div className="relative p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "sm:hidden p-2.5 rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-105",
                          colorClass
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{meal.name}</h3>
                            {!meal.notLogged && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: index * 0.1 + 0.3 }}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{meal.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {meal.notLogged ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 rounded-xl transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMealType(meal.type);
                              setLogDialogOpen(true);
                            }}
                          >
                            <Plus className="me-1 h-4 w-4" />
                            {isAr ? 'سجّل' : 'Log'}
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-end">
                              <motion.p
                                className="font-bold text-lg tabular-nums"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                              >
                                {Math.round(meal.calories)}
                              </motion.p>
                              <p className="text-[10px] text-muted-foreground -mt-0.5">kcal</p>
                            </div>
                            {meal.foods.length > 0 && (
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded foods */}
                  <AnimatePresence>
                    {isExpanded && meal.foods.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 border-t border-border/20 pt-3">
                          {meal.foods.map((foodItem: any, foodIndex: number) => (
                            <motion.div
                              key={foodIndex}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: foodIndex * 0.04 }}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-r", colorClass)} />
                                <span className="text-sm font-medium">{foodItem.food?.name || foodItem.food?.nameEn || (isAr ? 'طعام' : 'Food')}</span>
                              </div>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {Math.round((foodItem.food?.calories || 0) * (foodItem.servings || 1))} kcal
                              </span>
                            </motion.div>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMealType(meal.type);
                              setLogDialogOpen(true);
                            }}
                            className="w-full py-2 border border-dashed border-border/40 hover:border-primary/40 rounded-xl text-xs text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1.5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {t.nutrition.add}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Supplements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Pill className="h-5 w-5 text-forma-orange" />
            {isAr ? 'المكملات' : 'Supplements'}
          </h2>
          <Link href="/chat" className="text-xs text-primary hover:underline">
            {isAr ? 'اسأل الكوتش' : 'Ask Coach'}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '💪', label: isAr ? 'بروتين' : 'Protein', desc: isAr ? 'بعد التمرين — 25-40جم' : 'Post-workout — 25-40g', color: 'bg-blue-500/10 border-blue-500/20' },
            { icon: '⚡', label: isAr ? 'كرياتين' : 'Creatine', desc: isAr ? 'يومياً — 5جم' : 'Daily — 5g', color: 'bg-purple-500/10 border-purple-500/20' },
            { icon: '🔥', label: isAr ? 'بري وركاوت' : 'Pre-Workout', desc: isAr ? 'قبل التمرين ب30 دقيقة' : '30min before training', color: 'bg-orange-500/10 border-orange-500/20' },
            { icon: '🐟', label: isAr ? 'أوميجا 3' : 'Omega 3', desc: isAr ? 'يومياً — 2-3جم' : 'Daily — 2-3g', color: 'bg-green-500/10 border-green-500/20' },
          ].map((supp) => (
            <Link
              key={supp.label}
              href="/chat"
              className={`rounded-2xl border p-4 transition-all hover:shadow-sm ${supp.color}`}
            >
              <span className="text-2xl">{supp.icon}</span>
              <h3 className="font-semibold text-sm mt-2">{supp.label}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{supp.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Daily Insight */}
      <Card className="rounded-2xl border border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{isAr ? 'نصيحة اليوم' : 'Daily Insight'}</h3>
              {totals.protein >= goals.protein * 0.8 ? (
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? 'بروتين ممتاز النهارده! انت ماشي صح على هدف بناء العضلات. لو جعت قبل ما تنام، كُل سناك خفيف.'
                    : "Great protein intake today! You're on track to hit your muscle-building goals. Consider having a light snack if you're feeling hungry before bed."}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? `ناقصك ${Math.round(goals.protein - totals.protein)}جم بروتين النهارده. جرّب تشرب بروتين شيك أو تاكل زبادي يوناني عشان توصل لهدفك.`
                    : `You're ${Math.round(goals.protein - totals.protein)}g short on protein today. Try adding a protein shake or some Greek yogurt to reach your goal.`}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Detail Dialog */}
      <Dialog open={!!selectedFood} onOpenChange={(open) => { if (!open) setSelectedFood(null); }}>
        <DialogContent className="rounded-2xl border border-border/50 bg-card sm:max-w-md">
          {selectedFood && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedFood.imageUrl ? (
                    <img src={selectedFood.imageUrl} alt={selectedFood.nameEn} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Apple className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <span>{selectedFood.nameEn || selectedFood.name}</span>
                    {selectedFood.nameAr && (
                      <p className="text-sm font-normal text-muted-foreground">{selectedFood.nameAr}</p>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {isAr ? 'تفاصيل الغذاء' : 'Food details'}
                </DialogDescription>
              </DialogHeader>

              {/* Brand & Category */}
              <div className="flex flex-wrap gap-2">
                {(selectedFood.brandEn || selectedFood.brand) && (
                  <Badge variant="outline" className="text-xs">{selectedFood.brandEn || selectedFood.brand}</Badge>
                )}
                {selectedFood.category && (
                  <Badge variant="secondary" className="text-xs">{selectedFood.category}</Badge>
                )}
                {selectedFood.isEgyptian && (
                  <Badge className="text-xs bg-green-500/10 text-green-600">Egyptian</Badge>
                )}
              </div>

              {/* Serving info */}
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {isAr ? 'لكل حصة' : 'Per serving'} ({selectedFood.servingSizeG}{selectedFood.servingUnit || 'g'})
                </p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-primary">{Math.round(selectedFood.calories)}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-500">{Math.round(selectedFood.proteinG || 0)}g</p>
                    <p className="text-[10px] text-muted-foreground">{isAr ? 'بروتين' : 'Protein'}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-500">{Math.round(selectedFood.carbsG || 0)}g</p>
                    <p className="text-[10px] text-muted-foreground">{isAr ? 'كربو' : 'Carbs'}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-red-400">{Math.round(selectedFood.fatG || 0)}g</p>
                    <p className="text-[10px] text-muted-foreground">{isAr ? 'دهون' : 'Fat'}</p>
                  </div>
                </div>
              </div>

              {/* Micronutrients (if available) */}
              {(selectedFood.fiberG || selectedFood.sugarG || selectedFood.sodiumMg) && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">{isAr ? 'تفاصيل إضافية' : 'Additional Details'}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFood.fiberG != null && (
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-sm font-semibold">{Math.round(selectedFood.fiberG)}g</p>
                        <p className="text-[10px] text-muted-foreground">{isAr ? 'ألياف' : 'Fiber'}</p>
                      </div>
                    )}
                    {selectedFood.sugarG != null && (
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-sm font-semibold">{Math.round(selectedFood.sugarG)}g</p>
                        <p className="text-[10px] text-muted-foreground">{isAr ? 'سكر' : 'Sugar'}</p>
                      </div>
                    )}
                    {selectedFood.sodiumMg != null && (
                      <div className="rounded-lg bg-muted/20 p-2 text-center">
                        <p className="text-sm font-semibold">{Math.round(selectedFood.sodiumMg)}mg</p>
                        <p className="text-[10px] text-muted-foreground">{isAr ? 'صوديوم' : 'Sodium'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add to meal button */}
              {selectedMealType && (
                <Button
                  className="w-full btn-primary"
                  disabled={isLogging}
                  onClick={async () => {
                    setIsLogging(true);
                    try {
                      await logMealMutation.mutateAsync({
                        mealType: selectedMealType.toUpperCase() as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
                        foods: [{ foodId: selectedFood.id, servings: 1 }],
                      });
                      toast({ title: isAr ? 'تم إضافة الطعام' : 'Food added', description: selectedFood.nameEn || selectedFood.name });
                      setSelectedFood(null);
                      setSearchQuery('');
                      setLogDialogOpen(false);
                      setSelectedMealType(null);
                    } catch {
                      toast({ title: isAr ? 'حصل مشكلة' : 'Error', description: isAr ? 'مقدرناش نضيف الأكل' : 'Could not log food', variant: 'destructive' });
                    } finally {
                      setIsLogging(false);
                    }
                  }}
                >
                  {isLogging ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isAr ? 'أضف للوجبة' : 'Add to Meal'}
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Goals Editor Dialog */}
      <Dialog open={goalsDialogOpen} onOpenChange={setGoalsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'تعديل الأهداف اليومية' : 'Edit Daily Goals'}</DialogTitle>
            <DialogDescription>
              {isAr ? 'حدد أهدافك اليومية من السعرات والمغذيات' : 'Set your daily calorie and nutrient targets'}
            </DialogDescription>
          </DialogHeader>
          <GoalsForm
            initial={goals}
            onSave={saveCustomGoals}
            isAr={isAr}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalsForm({
  initial,
  onSave,
  isAr,
}: {
  initial: typeof defaultGoals;
  onSave: (goals: typeof defaultGoals) => void;
  isAr: boolean;
}) {
  const [cal, setCal] = useState(String(initial.calories));
  const [pro, setPro] = useState(String(initial.protein));
  const [carb, setCarb] = useState(String(initial.carbs));
  const [fat, setFat] = useState(String(initial.fat));
  const [water, setWater] = useState(String(initial.water));

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>{isAr ? 'السعرات (kcal)' : 'Calories (kcal)'}</Label>
          <Input type="number" value={cal} onChange={(e) => setCal(e.target.value)} />
        </div>
        <div>
          <Label>{isAr ? 'بروتين (جم)' : 'Protein (g)'}</Label>
          <Input type="number" value={pro} onChange={(e) => setPro(e.target.value)} />
        </div>
        <div>
          <Label>{isAr ? 'كاربز (جم)' : 'Carbs (g)'}</Label>
          <Input type="number" value={carb} onChange={(e) => setCarb(e.target.value)} />
        </div>
        <div>
          <Label>{isAr ? 'دهون (جم)' : 'Fat (g)'}</Label>
          <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
        <div>
          <Label>{isAr ? 'ماء (لتر)' : 'Water (liters)'}</Label>
          <Input type="number" step="0.5" value={water} onChange={(e) => setWater(e.target.value)} />
        </div>
      </div>
      <Button
        className="w-full"
        onClick={() => onSave({
          calories: parseInt(cal) || defaultGoals.calories,
          protein: parseInt(pro) || defaultGoals.protein,
          carbs: parseInt(carb) || defaultGoals.carbs,
          fat: parseInt(fat) || defaultGoals.fat,
          water: parseFloat(water) || defaultGoals.water,
        })}
      >
        {isAr ? 'حفظ الأهداف' : 'Save Goals'}
      </Button>
    </div>
  );
}
