'use client';

import { useState } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  Ruler,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const weightData = [
  { date: 'Mar 1', weight: 85.2 },
  { date: 'Mar 8', weight: 84.5 },
  { date: 'Mar 15', weight: 84.0 },
  { date: 'Mar 22', weight: 83.2 },
];

const measurements = [
  { label: 'Weight', value: '83.2 kg', change: -2.0, unit: 'kg' },
  { label: 'Body Fat', value: '18%', change: -1.5, unit: '%' },
  { label: 'Chest', value: '102 cm', change: 1.0, unit: 'cm' },
  { label: 'Waist', value: '84 cm', change: -3.0, unit: 'cm' },
  { label: 'Arms', value: '38 cm', change: 0.5, unit: 'cm' },
  { label: 'Thighs', value: '58 cm', change: 1.5, unit: 'cm' },
];

const strengthPRs = [
  { exercise: 'Bench Press', current: '100 kg', previous: '90 kg', date: 'Mar 20' },
  { exercise: 'Squat', current: '140 kg', previous: '130 kg', date: 'Mar 18' },
  { exercise: 'Deadlift', current: '160 kg', previous: '150 kg', date: 'Mar 15' },
  { exercise: 'Overhead Press', current: '60 kg', previous: '55 kg', date: 'Mar 12' },
];

const progressPhotos = [
  { date: 'Mar 22', label: 'Week 4' },
  { date: 'Mar 15', label: 'Week 3' },
  { date: 'Mar 8', label: 'Week 2' },
  { date: 'Mar 1', label: 'Week 1' },
];

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState('month');

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">Track your transformation</p>
        </div>
        <Button variant="forma">
          <Plus className="mr-2 h-4 w-4" />
          Log Progress
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-forma-teal/10 p-2">
                <Scale className="h-5 w-5 text-forma-teal" />
              </div>
              <Badge variant="forma" className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -2.0 kg
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">83.2 kg</p>
            <p className="text-sm text-muted-foreground">Current Weight</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Ruler className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -3 cm
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">84 cm</p>
            <p className="text-sm text-muted-foreground">Waist</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +10 kg
              </Badge>
            </div>
            <p className="mt-3 text-2xl font-bold">100 kg</p>
            <p className="text-sm text-muted-foreground">Bench PR</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weight">
        <TabsList>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="strength">Strength</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Weight Trend</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={timeRange === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
                <Button
                  variant={timeRange === 'year' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                >
                  Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Placeholder for chart */}
              <div className="h-64 rounded-lg bg-muted/30">
                <div className="flex h-full items-end justify-around gap-2 p-4">
                  {weightData.map((data, index) => (
                    <div key={data.date} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-lg bg-forma-teal transition-all"
                        style={{ height: `${(1 - (data.weight - 80) / 10) * 100 + 50}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{data.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Starting</p>
                  <p className="text-lg font-bold">85.2 kg</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current</p>
                  <p className="text-lg font-bold text-forma-teal">83.2 kg</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="text-lg font-bold">78 kg</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weight History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {weightData.reverse().map((data) => (
                  <div
                    key={data.date}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-muted-foreground">{data.date}</span>
                    <span className="font-semibold">{data.weight} kg</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {measurements.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="text-sm text-muted-foreground">{m.label}</p>
                      <p className="text-xl font-bold">{m.value}</p>
                    </div>
                    <Badge
                      variant={m.change < 0 ? 'forma' : 'secondary'}
                      className="flex items-center gap-1"
                    >
                      {m.change > 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {m.change > 0 ? '+' : ''}
                      {m.change} {m.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Personal Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strengthPRs.map((pr) => (
                  <div
                    key={pr.exercise}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-semibold">{pr.exercise}</p>
                      <p className="text-sm text-muted-foreground">
                        Previous: {pr.previous}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-forma-teal">{pr.current}</p>
                      <p className="text-xs text-muted-foreground">{pr.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Progress Photos</CardTitle>
              <Button variant="outline" size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {progressPhotos.map((photo) => (
                  <div
                    key={photo.date}
                    className="aspect-[3/4] cursor-pointer rounded-lg bg-muted transition-transform hover:scale-105"
                  >
                    <div className="flex h-full flex-col items-center justify-center">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">{photo.label}</p>
                      <p className="text-xs text-muted-foreground">{photo.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
