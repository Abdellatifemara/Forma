'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Dumbbell,
  Apple,
  FileText,
  Image,
  Video,
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

const exercises = [
  { id: '1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', status: 'published' },
  { id: '2', name: 'Squat', muscle: 'Quadriceps', equipment: 'Barbell', status: 'published' },
  { id: '3', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', status: 'published' },
  { id: '4', name: 'Pull-up', muscle: 'Back', equipment: 'Bodyweight', status: 'draft' },
];

const foods = [
  { id: '1', name: 'Foul Medames', category: 'Breakfast', calories: 250, status: 'published' },
  { id: '2', name: 'Koshary', category: 'Main Dish', calories: 450, status: 'published' },
  { id: '3', name: 'Grilled Chicken', category: 'Protein', calories: 280, status: 'published' },
  { id: '4', name: 'Molokhia', category: 'Main Dish', calories: 180, status: 'review' },
];

const articles = [
  { id: '1', title: 'Beginner's Guide to Strength Training', author: 'Admin', status: 'published', views: 2340 },
  { id: '2', title: 'Egyptian Diet for Muscle Building', author: 'Admin', status: 'published', views: 1890 },
  { id: '3', title: 'How to Calculate Your Macros', author: 'Coach Ahmed', status: 'draft', views: 0 },
];

export default function AdminContentPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage exercises, foods, and educational content
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
                <p className="text-2xl font-bold">3,103</p>
                <p className="text-sm text-muted-foreground">Exercises</p>
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
                <p className="text-2xl font-bold">5,420</p>
                <p className="text-sm text-muted-foreground">Foods</p>
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
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-muted-foreground">Articles</p>
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
                <p className="text-2xl font-bold">892</p>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exercises">
        <TabsList>
          <TabsTrigger value="exercises">
            <Dumbbell className="mr-2 h-4 w-4" />
            Exercises
          </TabsTrigger>
          <TabsTrigger value="foods">
            <Apple className="mr-2 h-4 w-4" />
            Foods
          </TabsTrigger>
          <TabsTrigger value="articles">
            <FileText className="mr-2 h-4 w-4" />
            Articles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Exercises</CardTitle>
                <CardDescription>Manage the exercise library</CardDescription>
              </div>
              <Button variant="forma">
                <Plus className="mr-2 h-4 w-4" />
                Add Exercise
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Muscle Group</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Status</TableHead>
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="foods" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Foods</CardTitle>
                <CardDescription>Manage the food database</CardDescription>
              </div>
              <Button variant="forma">
                <Plus className="mr-2 h-4 w-4" />
                Add Food
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Calories</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foods.map((food) => (
                    <TableRow key={food.id}>
                      <TableCell className="font-medium">{food.name}</TableCell>
                      <TableCell>{food.category}</TableCell>
                      <TableCell>{food.calories} kcal</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            food.status === 'published'
                              ? 'forma'
                              : food.status === 'review'
                              ? 'warning'
                              : 'secondary'
                          }
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Articles</CardTitle>
                <CardDescription>Manage blog and educational content</CardDescription>
              </div>
              <Button variant="forma">
                <Plus className="mr-2 h-4 w-4" />
                Write Article
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>{article.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={article.status === 'published' ? 'forma' : 'secondary'}
                        >
                          {article.status}
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
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Preview</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
