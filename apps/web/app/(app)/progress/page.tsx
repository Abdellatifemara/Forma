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
import { useLanguage } from '@/lib/i18n';

function formatDate(dateString: string, lang: string = 'en'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
}

function TrendIcon({ change }: { change: number }) {
  if (change > 0) return <TrendingUp className="h-3 w-3" />;
  if (change < 0) return <TrendingDown className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

export default function ProgressPage() {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
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
        { label: isAr ? 'الوزن' : 'Weight', key: 'weight', value: latestMeasurements.weight, unit: isAr ? 'كجم' : 'kg' },
        { label: isAr ? 'نسبة الدهون' : 'Body Fat', key: 'bodyFat', value: latestMeasurements.bodyFat, unit: '%' },
        { label: isAr ? 'الصدر' : 'Chest', key: 'chest', value: latestMeasurements.chest, unit: isAr ? 'سم' : 'cm' },
        { label: isAr ? 'الوسط' : 'Waist', key: 'waist', value: latestMeasurements.waist, unit: isAr ? 'سم' : 'cm' },
        { label: isAr ? 'الذراع' : 'Arms', key: 'arms', value: latestMeasurements.arms, unit: isAr ? 'سم' : 'cm' },
        { label: isAr ? 'الفخذ' : 'Thighs', key: 'thighs', value: latestMeasurements.thighs, unit: isAr ? 'سم' : 'cm' },
      ].filter((m) => m.value !== undefined && m.value !== null)
    : [];

  // Progress photos — will be populated from R2 uploads
  const progressPhotos: { date: string; label: string; url?: string }[] = [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.progress.title}</h1>
          <p className="text-muted-foreground">{t.progress.startTracking}</p>
        </div>
        <Button variant="forma" onClick={() => setLogDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t.progress.logWeight}
        </Button>
      </div>

      {/* Log Progress Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.progress.logWeight}</DialogTitle>
            <DialogDescription>{t.progress.startTracking}</DialogDescription>
          </DialogHeader>

          <Tabs value={logTab} onValueChange={(v) => setLogTab(v as 'weight' | 'measurements')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="weight">{t.progress.weight}</TabsTrigger>
              <TabsTrigger value="measurements">{t.progress.measurements}</TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="weight">{t.progress.weight} ({t.progress.kg})</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder={isAr ? 'مثلاً ٧٥.٥' : 'e.g., 75.5'}
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
                    {isAr ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  t.progress.logWeight
                )}
              </Button>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="m-weight">{t.progress.weight} ({t.progress.kg})</Label>
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
                  <Label htmlFor="bodyFat">{t.progress.bodyFat} (%)</Label>
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
                  <Label htmlFor="chest">{t.progress.chest} ({t.progress.cm})</Label>
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
                  <Label htmlFor="waist">{t.progress.waist} ({t.progress.cm})</Label>
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
                  <Label htmlFor="hips">{t.progress.hips} ({t.progress.cm})</Label>
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
                  <Label htmlFor="arms">{t.progress.arms} ({t.progress.cm})</Label>
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
                  <Label htmlFor="thighs">{t.progress.thighs} ({t.progress.cm})</Label>
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
                    {isAr ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  t.progress.logMeasurements
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
              <div className="rounded-lg bg-forma-orange/10 p-2">
                <Scale className="h-5 w-5 text-forma-orange" />
              </div>
              {weightChange !== 0 && (
                <Badge variant="forma" className="flex items-center gap-1">
                  <TrendIcon change={weightChange} />
                  {weightChange > 0 ? '+' : ''}
                  {weightChange.toFixed(1)} {isAr ? 'كجم' : 'kg'}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {latestLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : currentWeight ? (
                `${currentWeight} ${isAr ? 'كجم' : 'kg'}`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">{t.progress.weight}</p>
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
                  {(latestMeasurements.waist - measurementsData[1].waist).toFixed(1)} {isAr ? 'سم' : 'cm'}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {measurementsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : latestMeasurements?.waist ? (
                `${latestMeasurements.waist} ${isAr ? 'سم' : 'cm'}`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">{t.progress.waist}</p>
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
                  {isAr ? 'رقم قياسي' : 'PR'}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold">
              {prsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : prsData && prsData.length > 0 ? (
                `${prsData[0].weight} ${isAr ? 'كجم' : 'kg'}`
              ) : (
                '--'
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              {prsData && prsData.length > 0 ? prsData[0].exerciseName : (isAr ? 'أحسن رقم قياسي' : 'Best PR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weight">
        <TabsList>
          <TabsTrigger value="weight">{t.progress.weight}</TabsTrigger>
          <TabsTrigger value="measurements">{t.progress.measurements}</TabsTrigger>
          <TabsTrigger value="strength">{t.progress.strength}</TabsTrigger>
          <TabsTrigger value="photos">{t.progress.photos}</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">{t.progress.weight}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={timeRange === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  {isAr ? 'أسبوع' : 'Week'}
                </Button>
                <Button
                  variant={timeRange === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  {isAr ? 'شهر' : 'Month'}
                </Button>
                <Button
                  variant={timeRange === 'year' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeRange('year')}
                >
                  {isAr ? 'سنة' : 'Year'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {weightLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-orange" />
                </div>
              ) : !weightData || weightData.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                  <Scale className="mb-2 h-12 w-12" />
                  <p>{t.progress.noData}</p>
                  <p className="text-sm">{t.progress.startTracking}</p>
                </div>
              ) : (
                <>
                  <WeightLineChart data={weightData} isAr={isAr} />

                  <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{isAr ? 'البداية' : 'Starting'}</p>
                      <p className="text-lg font-bold">
                        {startingWeight ? `${startingWeight} ${isAr ? 'كجم' : 'kg'}` : '--'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{isAr ? 'الحالي' : 'Current'}</p>
                      <p className="text-lg font-bold text-primary">
                        {currentWeight ? `${currentWeight} ${isAr ? 'كجم' : 'kg'}` : '--'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">{isAr ? 'التغيير' : 'Change'}</p>
                      <p className="text-lg font-bold">
                        {weightChange !== 0 ? `${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} ${isAr ? 'كجم' : 'kg'}` : '--'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{t.progress.weight}</CardTitle>
            </CardHeader>
            <CardContent>
              {weightLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : !weightData || weightData.length === 0 ? (
                <p className="py-4 text-center text-muted-foreground">{isAr ? 'مفيش بيانات وزن لسه' : 'No weight entries yet'}</p>
              ) : (
                <div className="space-y-2">
                  {weightData.slice(0, 10).map((data) => (
                    <div
                      key={data.date}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <span className="text-muted-foreground">{formatDate(data.date, language)}</span>
                      <span className="font-semibold">{data.weight} {isAr ? 'كجم' : 'kg'}</span>
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
              <CardTitle className="text-base font-semibold">{t.progress.measurements}</CardTitle>
            </CardHeader>
            <CardContent>
              {measurementsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-orange" />
                </div>
              ) : measurementFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Ruler className="mb-2 h-12 w-12" />
                  <p>{t.progress.noData}</p>
                  <p className="text-sm">{t.progress.startTracking}</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {measurementFields.map((m) => {
                    // Calculate change from previous measurement
                    const prev = measurementsData?.[1];
                    const prevValue = prev?.[m.key as keyof typeof prev] as number | undefined;
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
              <CardTitle className="text-base font-semibold">{t.progress.strength}</CardTitle>
            </CardHeader>
            <CardContent>
              {prsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-forma-orange" />
                </div>
              ) : !prsData || prsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <TrendingUp className="mb-2 h-12 w-12" />
                  <p>{t.progress.noData}</p>
                  <p className="text-sm">{t.progress.startTracking}</p>
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
                          {pr.reps} {isAr ? (pr.reps > 1 ? 'تكرارات' : 'تكرار') : (pr.reps > 1 ? 'reps' : 'rep')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-forma-orange">{pr.weight} {isAr ? 'كجم' : 'kg'}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(pr.date, language)}</p>
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
              <CardTitle className="text-base font-semibold">{t.progress.photos}</CardTitle>
            </CardHeader>
            <CardContent>
              {progressPhotos.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Camera className="h-12 w-12 mb-3 opacity-40" />
                  <p className="text-sm font-medium">
                    {isAr ? 'لا توجد صور تقدم بعد' : 'No progress photos yet'}
                  </p>
                  <p className="text-xs mt-1">
                    {isAr ? 'ستتمكن من رفع صور التقدم من التطبيق' : 'Upload progress photos from the mobile app'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ---- SVG Line Chart for Weight History ---- */
function WeightLineChart({ data, isAr }: { data: Array<{ date: string; weight: number }>; isAr: boolean }) {
  const points = [...data].reverse().slice(-12); // last 12 entries, oldest first
  if (points.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <p>{isAr ? 'محتاج نقطتين على الأقل للرسم' : 'Need at least 2 entries for chart'}</p>
      </div>
    );
  }

  const weights = points.map(p => p.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;
  const range = maxW - minW || 1;

  const W = 100;
  const H = 50;
  const PAD_X = 2;
  const PAD_Y = 4;
  const chartW = W - PAD_X * 2;
  const chartH = H - PAD_Y * 2;

  const toX = (i: number) => PAD_X + (i / (points.length - 1)) * chartW;
  const toY = (w: number) => PAD_Y + chartH - ((w - minW) / range) * chartH;

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p.weight).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${toX(points.length - 1).toFixed(1)},${(H - PAD_Y).toFixed(1)} L${PAD_X},${(H - PAD_Y).toFixed(1)} Z`;

  // Grid lines (3 horizontal)
  const gridLines = [0.25, 0.5, 0.75].map(pct => {
    const y = PAD_Y + chartH * (1 - pct);
    const val = (minW + range * pct).toFixed(1);
    return { y, val };
  });

  return (
    <div className="h-64 w-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Grid */}
        {gridLines.map((g, i) => (
          <line key={i} x1={PAD_X} y1={g.y} x2={W - PAD_X} y2={g.y} stroke="hsl(var(--muted-foreground))" strokeOpacity="0.1" strokeWidth="0.15" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#weightGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={toX(i)} cy={toY(p.weight)} r="0.8" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="0.35" />
        ))}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between px-2 -mt-2">
        {points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
          <span key={i} className="text-[10px] text-muted-foreground">{formatDate(p.date, isAr ? 'ar' : 'en')}</span>
        ))}
      </div>
    </div>
  );
}
