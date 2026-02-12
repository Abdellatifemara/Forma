'use client';

import { useState } from 'react';
import {
  Camera,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  Ruler,
  Loader2,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  useWeightHistory,
  useMeasurementsHistory,
  useStrengthPRs,
  useLatestProgress,
  useLogWeight,
  useLogMeasurements,
} from '@/hooks/use-progress';
import { useToast } from '@/hooks/use-toast';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TrendIcon({ change }: { change: number }) {
  if (change > 0) return <TrendingUp className="h-3 w-3" />;
  if (change < 0) return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

export default function ProgressPage() {
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [logTab, setLogTab] = useState<'weight' | 'measurements'>('weight');
  const [weightInput, setWeightInput] = useState('');
  const [measurementInputs, setMeasurementInputs] = useState({
    weight: '',
    bodyFat: '',
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
  });

  // Calculate days based on time range
  const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;

  const { data: weightData, isLoading: weightLoading } = useWeightHistory(days);
  const { data: measurementsData, isLoading: measurementsLoading } = useMeasurementsHistory(10);
  const { data: prsData, isLoading: prsLoading } = useStrengthPRs();
  const { data: latestData, isLoading: latestLoading } = useLatestProgress();

  const logWeight = useLogWeight();
  const logMeasurements = useLogMeasurements();

  const isLoading = weightLoading || measurementsLoading || prsLoading || latestLoading;

  const handleLogWeight = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) return;

    try {
      await logWeight.mutateAsync({ weight });
      setWeightInput('');
      setLogDialogOpen(false);
    } catch (error) {
      // Error handled
    }
  };

  const handleLogMeasurements = async () => {
    const data: Record<string, number> = {};

    Object.entries(measurementInputs).forEach(([key, value]) => {
      const num = parseFloat(value);
      if (!isNaN(num) && num > 0) {
        data[key] = num;
      }
    });

    if (Object.keys(data).length === 0) return;

    try {
      await logMeasurements.mutateAsync(data);
      setMeasurementInputs({
        weight: '',
        bodyFat: '',
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
      });
      setLogDialogOpen(false);
    } catch (error) {
      // Error handled
    }
  };

  // Calculate weight stats
  const currentWeight = weightData?.[0]?.weight;
  const startingWeight = weightData?.[weightData.length - 1]?.weight;
  const weightChange = currentWeight && startingWeight ? currentWeight - startingWeight : 0;

  // Get latest measurements for display
  const latestMeasurements = measurementsData?.[0];

  // Prepare measurements display data
  const measurementFields = latestMeasurements
    ? [
        { label: 'Weight', value: latestMeasurements.weight, unit: 'kg' },
        { label: 'Body Fat', value: latestMeasurements.bodyFat, unit: '%' },
        { label: 'Chest', value: latestMeasurements.chest, unit: 'cm' },
        { label: 'Waist', value: latestMeasurements.waist, unit: 'cm' },
        { label: 'Arms', value: latestMeasurements.arms, unit: 'cm' },
        { label: 'Thighs', value: latestMeasurements.thighs, unit: 'cm' },
      ].filter((m) => m.value !== undefined && m.value !== null)
    : [];

  // Progress photos placeholder
  const progressPhotos = [
    { date: 'Coming Soon', label: 'Week 4' },
    { date: 'Coming Soon', label: 'Week 3' },
    { date: 'Coming Soon', label: 'Week 2' },
    { date: 'Coming Soon', label: 'Week 1' },
  ];

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Progress</h1>
          <p className="text-muted-foreground">Track your transformation</p>
        </div>
        <Button variant="forma" onClick={() => setLogDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Progress
        </Button>
      </div>

      {/* Log Progress Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Progress</DialogTitle>
            <DialogDescription>Track your weight and body measurements</DialogDescription>
          </DialogHeader>

          <Tabs value={logTab} onValueChange={(v) => setLogTab(v as 'weight' | 'measurements')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weight">Weight</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 75.5"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                variant="forma"
                onClick={handleLogWeight}
                disabled={logWeight.isPending || !weightInput}
              >
                {logWeight.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Log Weight'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="m-weight">Weight (kg)</Label>
                  <Input
                    id="m-weight"
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={measurementInputs.weight}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, weight: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Body Fat (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="18.5"
                    value={measurementInputs.bodyFat}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, bodyFat: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.5"
                    placeholder="100"
                    value={measurementInputs.chest}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, chest: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.5"
                    placeholder="80"
                    value={measurementInputs.waist}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, waist: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips (cm)</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.5"
                    placeholder="95"
                    value={measurementInputs.hips}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, hips: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Arms (cm)</Label>
                  <Input
                    id="arms"
                    type="number"
                    step="0.5"
                    placeholder="35"
                    value={measurementInputs.arms}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, arms: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs (cm)</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.5"
                    placeholder="55"
                    value={measurementInputs.thighs}
                    onChange={(e) =>
                      setMeasurementInputs({ ...measurementInputs, thighs: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button
                className="w-full"
                variant="forma"
                onClick={handleLogMeasurements}
                disabled={logMeasurements.isPending}
              >
                {logMeasurements.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Log Measurements'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-forma-teal/10 p-2">
                <Scale className="h-5 w-5 text-forma-teal" />
              </div>
              {weightChange !== 0 && (
                <Badge variant="forma" className="flex items-center gap-1">
                  <TrendIcon change={weightChange} />
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)} kg
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {latestLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : currentWeight ? (
                `${currentWeight} kg`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">Current Weight</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Ruler className="h-5 w-5 text-blue-500" />
              </div>
              {latestMeasurements?.waist && measurementsData?.[1]?.waist && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendIcon change={latestMeasurements.waist - measurementsData[1].waist} />
                  {(latestMeasurements.waist - measurementsData[1].waist).toFixed(1)} cm
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {measurementsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : latestMeasurements?.waist ? (
                `${latestMeasurements.waist} cm`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">Waist</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
              {prsData && prsData.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  PR
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {prsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : prsData && prsData.length > 0 ? (
                `${prsData[0].weight} kg`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {prsData && prsData.length > 0 ? prsData[0].exerciseName : 'Best PR'}
            </p>
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
              {weightLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
                </div>
              ) : !weightData || weightData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                  <Scale className="mb-2 h-12 w-12" />
                  <p>No weight data yet</p>
                  <p className="text-sm">Start logging your weight to see trends</p>
                </div>
              ) : (
                <>
                  <div className="h-64 rounded-lg bg-muted/30">
                    <div className="flex h-full items-end justify-around gap-2 p-4">
                      {weightData.slice(0, 8).reverse().map((data) => {
                        const minWeight = Math.min(...weightData.map((d) => d.weight)) - 2;
                        const maxWeight = Math.max(...weightData.map((d) => d.weight)) + 2;
                        const range = maxWeight - minWeight;
                        const heightPercent = ((data.weight - minWeight) / range) * 80 + 10;
                        return (
                          <div key={data.date} className="flex flex-1 flex-col items-center gap-2">
                            <div
                              className="w-full rounded-t-lg bg-forma-teal transition-all"
                              style={{ height: `${heightPercent}%` }}
                              title={`${data.weight} kg`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {formatDate(data.date)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Starting</p>
                      <p className="text-lg font-bold">
                        {startingWeight ? `${startingWeight} kg` : '--'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-lg font-bold text-forma-teal">
                        {currentWeight ? `${currentWeight} kg` : '--'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Change</p>
                      <p className="text-lg font-bold">
                        {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg` : '--'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weight History</CardTitle>
            </CardHeader>
            <CardContent>
              {weightLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !weightData || weightData.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">No weight entries yet</p>
              ) : (
                <div className="space-y-2">
                  {weightData.slice(0, 10).map((data) => (
                    <div
                      key={data.date}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-muted-foreground">{formatDate(data.date)}</span>
                      <span className="font-semibold">{data.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Body Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              {measurementsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
                </div>
              ) : measurementFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Ruler className="mb-2 h-12 w-12" />
                  <p>No measurements logged yet</p>
                  <p className="text-sm">Start tracking your body measurements</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {measurementFields.map((m) => {
                    // Calculate change from previous measurement
                    const prev = measurementsData?.[1];
                    const prevValue = prev?.[m.label.toLowerCase().replace(' ', '') as keyof typeof prev] as number | undefined;
                    const change = prevValue !== undefined && m.value !== undefined ? m.value - prevValue : 0;

                    return (
                      <div
                        key={m.label}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="text-sm text-muted-foreground">{m.label}</p>
                          <p className="text-xl font-bold">
                            {m.value} {m.unit}
                          </p>
                        </div>
                        {change !== 0 && (
                          <Badge
                            variant={change < 0 ? 'forma' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            <TrendIcon change={change} />
                            {change > 0 ? '+' : ''}
                            {change.toFixed(1)} {m.unit}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Personal Records</CardTitle>
            </CardHeader>
            <CardContent>
              {prsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-teal" />
                </div>
              ) : !prsData || prsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <TrendingUp className="mb-2 h-12 w-12" />
                  <p>No personal records yet</p>
                  <p className="text-sm">Complete workouts to track your PRs</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prsData.map((pr) => (
                    <div
                      key={pr.exerciseId}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div>
                        <p className="font-semibold">{pr.exerciseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {pr.reps} rep{pr.reps > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-forma-teal">{pr.weight} kg</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pr.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">Progress Photos</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: 'Coming Soon', description: 'Progress photos will be available soon' })}
              >
                <Camera className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {progressPhotos.map((photo, index) => (
                  <div
                    key={index}
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
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Progress photos feature coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
