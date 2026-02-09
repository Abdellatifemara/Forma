'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Scale,
  Heart,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  Loader2,
  Calendar,
  Target,
  Ruler,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { healthMetricsApi, type HealthMetricType, type CreateHealthMetricData } from '@/lib/api';
import { cn } from '@/lib/utils';

const metricCategories = {
  body: {
    label: 'Body Measurements',
    icon: Scale,
    metrics: [
      { type: 'WEIGHT' as HealthMetricType, label: 'Weight', unit: 'kg', icon: Scale },
      { type: 'BODY_FAT_PERCENTAGE' as HealthMetricType, label: 'Body Fat', unit: '%', icon: Target },
      { type: 'WAIST_CIRCUMFERENCE' as HealthMetricType, label: 'Waist', unit: 'cm', icon: Ruler },
      { type: 'HIP_CIRCUMFERENCE' as HealthMetricType, label: 'Hip', unit: 'cm', icon: Ruler },
    ],
  },
  vitals: {
    label: 'Vital Signs',
    icon: Heart,
    metrics: [
      { type: 'BLOOD_PRESSURE_SYSTOLIC' as HealthMetricType, label: 'Blood Pressure (Sys)', unit: 'mmHg', icon: Heart },
      { type: 'BLOOD_PRESSURE_DIASTOLIC' as HealthMetricType, label: 'Blood Pressure (Dia)', unit: 'mmHg', icon: Heart },
      { type: 'HEART_RATE_RESTING' as HealthMetricType, label: 'Resting Heart Rate', unit: 'bpm', icon: Activity },
    ],
  },
  blood: {
    label: 'Blood Work',
    icon: Droplets,
    metrics: [
      { type: 'BLOOD_GLUCOSE_FASTING' as HealthMetricType, label: 'Fasting Glucose', unit: 'mg/dL', icon: Droplets },
      { type: 'TOTAL_CHOLESTEROL' as HealthMetricType, label: 'Total Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'LDL_CHOLESTEROL' as HealthMetricType, label: 'LDL Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'HDL_CHOLESTEROL' as HealthMetricType, label: 'HDL Cholesterol', unit: 'mg/dL', icon: Droplets },
      { type: 'TRIGLYCERIDES' as HealthMetricType, label: 'Triglycerides', unit: 'mg/dL', icon: Droplets },
    ],
  },
  lifestyle: {
    label: 'Lifestyle',
    icon: Activity,
    metrics: [
      { type: 'SLEEP_HOURS' as HealthMetricType, label: 'Sleep', unit: 'hours', icon: Activity },
      { type: 'WATER_INTAKE_ML' as HealthMetricType, label: 'Water Intake', unit: 'ml', icon: Droplets },
      { type: 'STEPS' as HealthMetricType, label: 'Steps', unit: 'steps', icon: Activity },
    ],
  },
};

function MetricCard({
  type,
  label,
  unit,
  icon: Icon,
  onAdd,
}: {
  type: HealthMetricType;
  label: string;
  unit: string;
  icon: React.ElementType;
  onAdd: (type: HealthMetricType) => void;
}) {
  const { data: latest, isLoading } = useQuery({
    queryKey: ['health-metric-latest', type],
    queryFn: () => healthMetricsApi.getLatest(type),
  });

  const { data: history } = useQuery({
    queryKey: ['health-metric-history', type],
    queryFn: () => healthMetricsApi.getByType(type, 30),
  });

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  let trendValue = 0;
  if (history && history.length >= 2) {
    const recent = history[history.length - 1].value;
    const previous = history[0].value;
    trendValue = recent - previous;
    if (trendValue > 0) trend = 'up';
    else if (trendValue < 0) trend = 'down';
  }

  return (
    <Card className="glass border-border/50 hover:border-primary/30 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mt-1" />
              ) : latest ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{latest.value}</span>
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">No data</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {trend !== 'stable' && trendValue !== 0 && (
              <div className={cn(
                'flex items-center gap-1 text-xs',
                trend === 'up' ? 'text-red-500' : 'text-green-500'
              )}>
                {trend === 'up' ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trendValue).toFixed(1)}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onAdd(type)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {latest && (
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {new Date(latest.date).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AddMetricDialog({
  open,
  onOpenChange,
  selectedType,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: HealthMetricType | null;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState<HealthMetricType | ''>(selectedType || '');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const allMetrics = Object.values(metricCategories).flatMap((cat) => cat.metrics);
  const selectedMetric = allMetrics.find((m) => m.type === type);

  const addMutation = useMutation({
    mutationFn: (data: CreateHealthMetricData) => healthMetricsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metric-latest', type] });
      queryClient.invalidateQueries({ queryKey: ['health-metric-history', type] });
      queryClient.invalidateQueries({ queryKey: ['health-metrics-dashboard'] });
      onOpenChange(false);
      setValue('');
    },
  });

  const handleSubmit = () => {
    if (!type || !value) return;
    addMutation.mutate({
      type: type as HealthMetricType,
      value: parseFloat(value),
      unit: selectedMetric?.unit || '',
      date,
    });
  };

  // Update type when selectedType changes
  if (selectedType && type !== selectedType) {
    setType(selectedType);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Health Metric</DialogTitle>
          <DialogDescription>
            Record a new health measurement
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Metric Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as HealthMetricType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(metricCategories).map(([key, category]) => (
                  <div key={key}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {category.label}
                    </div>
                    {category.metrics.map((metric) => (
                      <SelectItem key={metric.type} value={metric.type}>
                        {metric.label} ({metric.unit})
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Value {selectedMetric && `(${selectedMetric.unit})`}</Label>
            <Input
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${selectedMetric?.label.toLowerCase() || 'value'}`}
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button
            className="w-full btn-primary"
            onClick={handleSubmit}
            disabled={!type || !value || addMutation.isPending}
          >
            {addMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Metric
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WeightChart() {
  const { data: history, isLoading } = useQuery({
    queryKey: ['health-metric-history', 'WEIGHT'],
    queryFn: () => healthMetricsApi.getByType('WEIGHT', 90),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No weight data yet. Start tracking to see your progress!
      </div>
    );
  }

  const minWeight = Math.min(...history.map((h) => h.value)) - 2;
  const maxWeight = Math.max(...history.map((h) => h.value)) + 2;
  const range = maxWeight - minWeight;

  return (
    <div className="h-48 relative">
      <div className="absolute inset-0 flex items-end gap-1">
        {history.map((entry, i) => {
          const height = ((entry.value - minWeight) / range) * 100;
          return (
            <div
              key={i}
              className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors cursor-pointer group relative"
              style={{ height: `${height}%` }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card border rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {entry.value} kg
                <br />
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="absolute left-0 top-0 text-xs text-muted-foreground">{maxWeight.toFixed(1)} kg</div>
      <div className="absolute left-0 bottom-0 text-xs text-muted-foreground">{minWeight.toFixed(1)} kg</div>
    </div>
  );
}

export default function HealthPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<HealthMetricType | null>(null);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['health-metrics-dashboard'],
    queryFn: () => healthMetricsApi.getDashboard(),
  });

  const handleAddMetric = (type: HealthMetricType) => {
    setSelectedMetricType(type);
    setAddDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Health Metrics</h1>
          <p className="text-muted-foreground">Track your health and body measurements</p>
        </div>
        <Button className="btn-primary" onClick={() => {
          setSelectedMetricType(null);
          setAddDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Metric
        </Button>
      </div>

      {/* Dashboard Summary */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Scale className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.weight?.value || '-'} kg
                  </p>
                </div>
              </div>
              {dashboard.trends.weightChange !== null && (
                <p className={cn(
                  'text-xs mt-2',
                  dashboard.trends.weightChange > 0 ? 'text-red-500' : 'text-green-500'
                )}>
                  {dashboard.trends.weightChange > 0 ? '+' : ''}
                  {dashboard.trends.weightChange.toFixed(1)} kg (90 days)
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  <Target className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Body Fat</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.bodyFat?.value || '-'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.bloodPressure?.value || '-'} mmHg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Droplets className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Glucose</p>
                  <p className="text-xl font-bold">
                    {dashboard.current.glucose?.value || '-'} mg/dL
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Trend Chart */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Weight Trend (90 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeightChart />
        </CardContent>
      </Card>

      {/* All Metrics by Category */}
      <Tabs defaultValue="body" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
          <TabsTrigger value="blood">Blood Work</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>

        {Object.entries(metricCategories).map(([key, category]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {category.metrics.map((metric) => (
                <MetricCard
                  key={metric.type}
                  type={metric.type}
                  label={metric.label}
                  unit={metric.unit}
                  icon={metric.icon}
                  onAdd={handleAddMetric}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Metric Dialog */}
      <AddMetricDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        selectedType={selectedMetricType}
      />
    </div>
  );
}
