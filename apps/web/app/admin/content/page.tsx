'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  Search,
  Plus,
  MoreHorizontal,
  Dumbbell,
  Apple,
  FileText,
  Video,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminApi, type ContentStats, type ContentExercise, type ContentFood } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AdminContentPage() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [exercises, setExercises] = useState<ContentExercise[]>([]);
  const [foods, setFoods] = useState<ContentFood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('exercises');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, exercisesData, foodsData] = await Promise.all([
        adminApi.getContentStats(),
        adminApi.getExercises({ page: 1, limit: 50, search: searchQuery || undefined }),
        adminApi.getFoods({ page: 1, limit: 50, search: searchQuery || undefined }),
      ]);
      setStats(statsData);
      setExercises(exercisesData.data);
      setFoods(foodsData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : (isAr ? 'فشل تحميل المحتوى' : 'Failed to load content'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddItem = (type: string) => {
    toast({ title: isAr ? 'قريباً' : 'Coming Soon', description: isAr ? `إضافة ${type} هتكون متاحة قريباً` : `Adding ${type} will be available soon` });
  };

  const handleEditItem = (type: string, id: string) => {
    toast({ title: isAr ? 'قريباً' : 'Coming Soon', description: isAr ? `تعديل ${type} هيكون متاح قريباً` : `Editing ${type} will be available soon` });
  };

  const handleDeleteItem = (type: string, id: string) => {
    toast({ title: isAr ? 'قريباً' : 'Coming Soon', description: isAr ? `حذف ${type} هيكون متاح قريباً` : `Deleting ${type} will be available soon` });
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">{isAr ? 'فشل تحميل المحتوى' : 'Failed to load content'}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchData}>{isAr ? 'حاول تاني' : 'Try Again'}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAr ? 'إدارة المحتوى' : 'Content Management'}</h1>
          <p className="text-muted-foreground">
            {isAr ? 'إدارة التمارين والأطعمة والمحتوى التعليمي' : 'Manage exercises, foods, and educational content'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-forma-teal/10 p-2">
                <Dumbbell className="h-5 w-5 text-forma-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.exercises?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">{isAr ? 'التمارين' : 'Exercises'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Apple className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.foods?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">{isAr ? 'الأطعمة' : 'Foods'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.programs?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">{isAr ? 'البرامج' : 'Programs'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <Video className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.videos?.toLocaleString() || 0}</p>
                <p className="text-sm text-muted-foreground">{isAr ? 'الفيديوهات' : 'Videos'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="exercises">
            <Dumbbell className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
            {isAr ? 'التمارين' : 'Exercises'}
          </TabsTrigger>
          <TabsTrigger value="foods">
            <Apple className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
            {isAr ? 'الأطعمة' : 'Foods'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isAr ? 'التمارين' : 'Exercises'}</CardTitle>
                <CardDescription>{isAr ? `إدارة مكتبة التمارين (${exercises.length} معروض)` : `Manage the exercise library (${exercises.length} shown)`}</CardDescription>
              </div>
              <Button variant="forma" onClick={() => handleAddItem(isAr ? 'تمرين' : 'exercise')}>
                <Plus className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                {isAr ? 'إضافة تمرين' : 'Add Exercise'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={isAr ? 'ابحث عن تمارين...' : 'Search exercises...'}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {exercises.length === 0 ? (
                <div className="py-12 text-center">
                  <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">{isAr ? 'مفيش تمارين' : 'No exercises found'}</p>
                  <p className="text-muted-foreground">
                    {searchQuery ? (isAr ? 'جرب كلمة بحث تانية' : 'Try a different search term') : (isAr ? 'أضف تمارين عشان تبدأ' : 'Add exercises to get started')}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead>{isAr ? 'مجموعة العضلات' : 'Muscle Group'}</TableHead>
                      <TableHead>{isAr ? 'المعدات' : 'Equipment'}</TableHead>
                      <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exercises.map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium">{exercise.name}</TableCell>
                        <TableCell>{exercise.muscle}</TableCell>
                        <TableCell>{exercise.equipment}</TableCell>
                        <TableCell>
                          <Badge
                            variant={exercise.status === 'published' ? 'forma' : 'secondary'}
                          >
                            {exercise.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditItem(isAr ? 'تمرين' : 'exercise', exercise.id)}>
                                {isAr ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: isAr ? 'عرض' : 'View', description: exercise.name })}>
                                {isAr ? 'عرض' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteItem(isAr ? 'تمرين' : 'exercise', exercise.id)}
                              >
                                {isAr ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isAr ? 'الأطعمة' : 'Foods'}</CardTitle>
                <CardDescription>{isAr ? `إدارة قاعدة بيانات الأطعمة (${foods.length} معروض)` : `Manage the food database (${foods.length} shown)`}</CardDescription>
              </div>
              <Button variant="forma" onClick={() => handleAddItem(isAr ? 'طعام' : 'food')}>
                <Plus className={isAr ? 'ml-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
                {isAr ? 'إضافة طعام' : 'Add Food'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={isAr ? 'ابحث عن أطعمة...' : 'Search foods...'}
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {foods.length === 0 ? (
                <div className="py-12 text-center">
                  <Apple className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium">{isAr ? 'مفيش أطعمة' : 'No foods found'}</p>
                  <p className="text-muted-foreground">
                    {searchQuery ? (isAr ? 'جرب كلمة بحث تانية' : 'Try a different search term') : (isAr ? 'أضف أطعمة عشان تبدأ' : 'Add foods to get started')}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isAr ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead>{isAr ? 'الفئة' : 'Category'}</TableHead>
                      <TableHead>{isAr ? 'السعرات' : 'Calories'}</TableHead>
                      <TableHead>{isAr ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foods.map((food) => (
                      <TableRow key={food.id}>
                        <TableCell className="font-medium">{food.name}</TableCell>
                        <TableCell>{food.category}</TableCell>
                        <TableCell>{food.calories} {isAr ? 'سعرة' : 'kcal'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={food.status === 'published' ? 'forma' : 'secondary'}
                          >
                            {food.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditItem(isAr ? 'طعام' : 'food', food.id)}>
                                {isAr ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast({ title: isAr ? 'عرض' : 'View', description: food.name })}>
                                {isAr ? 'عرض' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteItem(isAr ? 'طعام' : 'food', food.id)}
                              >
                                {isAr ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
