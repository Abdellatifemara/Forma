'use client';

import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Users, Calendar, Copy, Pencil, Trash2 } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const programs = [
  {
    id: '1',
    name: '12-Week Transformation',
    description: 'Complete body transformation program with progressive overload',
    duration: '12 weeks',
    frequency: '5 days/week',
    clients: 15,
    type: 'Fat Loss',
    status: 'active',
  },
  {
    id: '2',
    name: 'Strength Foundation',
    description: 'Build a solid strength base with compound movements',
    duration: '8 weeks',
    frequency: '4 days/week',
    clients: 8,
    type: 'Strength',
    status: 'active',
  },
  {
    id: '3',
    name: 'Beginner Bootcamp',
    description: 'Perfect for fitness newcomers, gradual progression',
    duration: '6 weeks',
    frequency: '3 days/week',
    clients: 12,
    type: 'General Fitness',
    status: 'active',
  },
  {
    id: '4',
    name: 'Advanced Hypertrophy',
    description: 'High volume muscle building for experienced lifters',
    duration: '10 weeks',
    frequency: '6 days/week',
    clients: 5,
    type: 'Muscle Building',
    status: 'draft',
  },
];

const templates = [
  {
    id: '1',
    name: 'Push Pull Legs',
    description: 'Classic 6-day split template',
    downloads: 234,
  },
  {
    id: '2',
    name: 'Upper Lower Split',
    description: '4-day split for balanced development',
    downloads: 189,
  },
  {
    id: '3',
    name: 'Full Body 3x',
    description: 'Efficient 3-day full body routine',
    downloads: 156,
  },
];

export default function ProgramsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPrograms = programs.filter((program) =>
    program.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Programs</h1>
          <p className="text-muted-foreground">
            Create and manage workout programs for your clients
          </p>
        </div>
        <Button variant="forma">
          <Plus className="mr-2 h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-sm text-muted-foreground">Total Programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {programs.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active Programs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {programs.reduce((sum, p) => sum + p.clients, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Clients Enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-sm text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">My Programs</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search programs..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Programs Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredPrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <Badge
                        variant={program.status === 'active' ? 'forma' : 'secondary'}
                      >
                        {program.status}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {program.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {program.duration}
                    </span>
                    <span>{program.frequency}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Badge variant="outline">{program.type}</Badge>
                    <span className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4" />
                      {program.clients} clients
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Program CTA */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-semibold">Create a New Program</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Build custom workout programs for your clients
              </p>
              <Button className="mt-4" variant="forma">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:border-forma-teal/50">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {template.downloads} downloads
                    </span>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
