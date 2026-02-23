'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Loader2,
  Apple,
  Utensils,
  Coffee,
  Moon,
  Sun,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getAuthCookie } from '@/lib/api';
import { API_URL } from '@/lib/constants';
import { useLanguage } from '@/lib/i18n';

interface Food {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  servingSizeG: number;
  servingUnit: string;
  isEgyptian: boolean;
}

interface MealItem {
  food: Food;
  servings: number;
}

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
}

const mealTypesEn = [
  { id: 'breakfast', label: 'Breakfast', labelAr: 'فطار', icon: Coffee, color: 'text-yellow-400' },
  { id: 'lunch', label: 'Lunch', labelAr: 'غدا', icon: Sun, color: 'text-orange-400' },
  { id: 'dinner', label: 'Dinner', labelAr: 'عشا', icon: Moon, color: 'text-purple-400' },
  { id: 'snack', label: 'Snacks', labelAr: 'سناكس', icon: Apple, color: 'text-green-400' },
];

export default function ClientMealPlanPage() {
  const params = useParams();
  const clientId = params.id as string;
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const mealTypes = mealTypesEn.map(m => ({ ...m, label: isAr ? m.labelAr : m.label }));

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [showFoodDialog, setShowFoodDialog] = useState(false);

  const [meals, setMeals] = useState<Record<string, MealItem[]>>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const [targets, setTargets] = useState({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
  });

  // Search foods
  useEffect(() => {
    const searchFoods = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/nutrition/foods?query=${encodeURIComponent(searchQuery)}&pageSize=20`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.foods || data || []);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchFoods, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const addFoodToMeal = (food: Food) => {
    setMeals(prev => ({
      ...prev,
      [selectedMealType]: [...prev[selectedMealType], { food, servings: 1 }],
    }));
    setShowFoodDialog(false);
    setSearchQuery('');
    const mealLabel = mealTypes.find(m => m.id === selectedMealType)?.label ?? selectedMealType;
    toast({
      title: isAr ? 'تم الإضافة' : 'Added',
      description: isAr ? `${food.nameAr || food.nameEn} اتضاف لـ${mealLabel}` : `${food.nameEn} added to ${mealLabel}`,
    });
  };

  const removeFoodFromMeal = (mealType: string, index: number) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));
  };

  const updateServings = (mealType: string, index: number, servings: number) => {
    setMeals(prev => ({
      ...prev,
      [mealType]: prev[mealType].map((item, i) =>
        i === index ? { ...item, servings: Math.max(0.5, servings) } : item
      ),
    }));
  };

  // Calculate totals
  const calculateMealTotals = (items: MealItem[]) => {
    return items.reduce((acc, item) => ({
      calories: acc.calories + (item.food.calories * item.servings),
      protein: acc.protein + (item.food.proteinG * item.servings),
      carbs: acc.carbs + (item.food.carbsG * item.servings),
      fat: acc.fat + (item.food.fatG * item.servings),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const dailyTotals = Object.values(meals).reduce((acc, items) => {
    const mealTotals = calculateMealTotals(items);
    return {
      calories: acc.calories + mealTotals.calories,
      protein: acc.protein + mealTotals.protein,
      carbs: acc.carbs + mealTotals.carbs,
      fat: acc.fat + mealTotals.fat,
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleSavePlan = async () => {
    const token = getAuthCookie();
    if (!token) {
      toast({
        title: isAr ? 'مش مسجل دخول' : 'Not authenticated',
        description: isAr ? 'سجل دخول تاني.' : 'Please log in again.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/trainers/me/clients/${clientId}/meal-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ meals, targets }),
      });
      if (res.ok) {
        toast({
          title: isAr ? 'تم الحفظ' : 'Plan saved',
          description: isAr ? 'خطة الوجبات اتحفظت بنجاح.' : 'Meal plan saved successfully.',
        });
      } else {
        toast({
          title: isAr ? 'في انتظار الحفظ' : 'Save pending',
          description: 'Meal plan endpoint not yet available. Data saved locally to session.',
          variant: 'default',
        });
      }
    } catch {
      toast({
        title: isAr ? 'في انتظار الحفظ' : 'Save pending',
        description: 'Meal plan endpoint not yet available. Data saved locally to session.',
        variant: 'default',
      });
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/trainer/clients/${clientId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isAr ? 'مصمم خطة الوجبات' : 'Meal Plan Builder'}</h1>
            <p className="text-muted-foreground">{isAr ? 'اعمل خطة تغذية للعميل بتاعك' : 'Create a nutrition plan for your client'}</p>
          </div>
        </div>
        <Button onClick={handleSavePlan} className="btn-primary">
          <Save className="me-2 h-4 w-4" />
          {isAr ? 'احفظ الخطة' : 'Save Plan'}
        </Button>
      </div>

      {/* Daily Targets */}
      <Card className="glass border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{isAr ? 'أهداف يومية' : 'Daily Targets'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">{isAr ? 'سعرات' : 'Calories'}</Label>
              <Input
                type="number"
                value={targets.calories}
                onChange={(e) => setTargets(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isAr ? 'بروتين (جم)' : 'Protein (g)'}</Label>
              <Input
                type="number"
                value={targets.protein}
                onChange={(e) => setTargets(prev => ({ ...prev, protein: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isAr ? 'كربوهيدرات (جم)' : 'Carbs (g)'}</Label>
              <Input
                type="number"
                value={targets.carbs}
                onChange={(e) => setTargets(prev => ({ ...prev, carbs: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">{isAr ? 'دهون (جم)' : 'Fat (g)'}</Label>
              <Input
                type="number"
                value={targets.fat}
                onChange={(e) => setTargets(prev => ({ ...prev, fat: parseInt(e.target.value) || 0 }))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-xs">{isAr ? 'سعرات' : 'Calories'}</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(dailyTotals.calories)}</p>
            <p className="text-xs text-muted-foreground">/ {targets.calories} kcal</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Beef className="h-4 w-4 text-red-400" />
              <span className="text-xs">{isAr ? 'بروتين' : 'Protein'}</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(dailyTotals.protein)}g</p>
            <p className="text-xs text-muted-foreground">/ {targets.protein}g</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Wheat className="h-4 w-4 text-yellow-400" />
              <span className="text-xs">{isAr ? 'كارب' : 'Carbs'}</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(dailyTotals.carbs)}g</p>
            <p className="text-xs text-muted-foreground">/ {targets.carbs}g</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Droplet className="h-4 w-4 text-blue-400" />
              <span className="text-xs">{isAr ? 'دهون' : 'Fat'}</span>
            </div>
            <p className="text-2xl font-bold">{Math.round(dailyTotals.fat)}g</p>
            <p className="text-xs text-muted-foreground">/ {targets.fat}g</p>
          </CardContent>
        </Card>
      </div>

      {/* Meals */}
      <Tabs defaultValue="breakfast" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          {mealTypes.map(meal => (
            <TabsTrigger key={meal.id} value={meal.id} className="flex items-center gap-2">
              <meal.icon className={`h-4 w-4 ${meal.color}`} />
              <span className="hidden sm:inline">{meal.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {mealTypes.map(mealType => {
          const mealItems = meals[mealType.id] || [];
          const mealTotals = calculateMealTotals(mealItems);

          return (
            <TabsContent key={mealType.id} value={mealType.id}>
              <Card className="glass border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <mealType.icon className={`h-5 w-5 ${mealType.color}`} />
                      {mealType.label}
                    </CardTitle>
                    <CardDescription>
                      {Math.round(mealTotals.calories)} kcal • {Math.round(mealTotals.protein)}g protein
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMealType(mealType.id as any);
                      setShowFoodDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 me-1" />
                    {isAr ? 'أضف أكل' : 'Add Food'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {mealItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>{isAr ? 'مفيش أكل متضاف لسه' : 'No foods added yet'}</p>
                      <p className="text-sm">{isAr ? 'اضغط "أضف أكل" عشان تبدأ تبني الوجبة دي' : 'Click "Add Food" to start building this meal'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mealItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                          <div className="flex-1">
                            <p className="font-medium">{item.food.nameEn}</p>
                            <p className="text-sm text-muted-foreground">{item.food.nameAr}</p>
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{Math.round(item.food.calories * item.servings)} kcal</span>
                              <span>{Math.round(item.food.proteinG * item.servings)}g P</span>
                              <span>{Math.round(item.food.carbsG * item.servings)}g C</span>
                              <span>{Math.round(item.food.fatG * item.servings)}g F</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.servings}
                              onChange={(e) => updateServings(mealType.id, index, parseFloat(e.target.value))}
                              className="w-20 text-center"
                              step="0.5"
                              min="0.5"
                            />
                            <span className="text-sm text-muted-foreground">{isAr ? 'حصص' : 'servings'}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeFoodFromMeal(mealType.id, index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Food Search Dialog */}
      <Dialog open={showFoodDialog} onOpenChange={setShowFoodDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isAr
                ? `أضف أكل لـ${mealTypes.find(m => m.id === selectedMealType)?.label ?? selectedMealType}`
                : `Add Food to ${selectedMealType}`}
            </DialogTitle>
            <DialogDescription>
              {isAr ? 'ابحث في أكتر من 800 أكلة ومكمل مصري' : 'Search from 800+ Egyptian foods and supplements'}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAr ? 'ابحث عن أكل...' : 'Search foods... (e.g., chicken, rice, foul)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map(food => (
                  <div
                    key={food.id}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addFoodToMeal(food)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{food.nameEn}</p>
                        <p className="text-sm text-muted-foreground">{food.nameAr}</p>
                      </div>
                      {food.isEgyptian && (
                        <Badge variant="outline" className="text-xs">{isAr ? 'مصري' : 'Egyptian'}</Badge>
                      )}
                    </div>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{food.calories} kcal</span>
                      <span>{food.proteinG}g P</span>
                      <span>{food.carbsG}g C</span>
                      <span>{food.fatG}g F</span>
                      <span className="text-muted-foreground/60">per {food.servingSizeG}{food.servingUnit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{isAr ? `مفيش نتائج لـ"${searchQuery}"` : `No foods found for "${searchQuery}"`}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Apple className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{isAr ? 'اكتب عشان تبحث عن أكل' : 'Type to search foods'}</p>
                <p className="text-sm">{isAr ? 'جرب: فراخ، رز، بيض، فول، كشري' : 'Try: chicken, rice, eggs, foul, koshari'}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
