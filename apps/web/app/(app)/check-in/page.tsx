'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dumbbell,
  Utensils,
  Moon,
  Battery,
  Brain,
  Smile,
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { checkInsApi, type CreateCheckInData, type DailyCheckIn } from '@/lib/api';
import { cn } from '@/lib/utils';

const ratingLabels: Record<number, string> = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

const ratingColors: Record<number, string> = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-green-500',
  5: 'text-emerald-500',
};

function RatingSlider({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">{label}</span>
        </div>
        <span className={cn('text-sm font-semibold', ratingColors[value])}>
          {ratingLabels[value]}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Form state
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [workoutRating, setWorkoutRating] = useState(3);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [nutritionCompleted, setNutritionCompleted] = useState(false);
  const [nutritionRating, setNutritionRating] = useState(3);
  const [nutritionNotes, setNutritionNotes] = useState('');
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [musclesoreness, setMusclesoreness] = useState(3);
  const [mood, setMood] = useState(3);
  const [notes, setNotes] = useState('');

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateStr = selectedDate.toISOString().split('T')[0];

  // Fetch existing check-in for selected date
  const { data: existingCheckIn, isLoading } = useQuery({
    queryKey: ['check-in', dateStr],
    queryFn: () => checkInsApi.getByDate(dateStr),
  });

  // Fetch weekly stats
  const { data: weeklyStats } = useQuery({
    queryKey: ['check-in-stats'],
    queryFn: () => checkInsApi.getWeeklyStats(),
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingCheckIn) {
      setWorkoutCompleted(existingCheckIn.workoutCompleted || false);
      setWorkoutRating(existingCheckIn.workoutRating || 3);
      setWorkoutNotes(existingCheckIn.workoutNotes || '');
      setNutritionCompleted(existingCheckIn.nutritionCompleted || false);
      setNutritionRating(existingCheckIn.nutritionRating || 3);
      setNutritionNotes(existingCheckIn.nutritionNotes || '');
      setSleepHours(existingCheckIn.sleepHours || 7);
      setSleepQuality(existingCheckIn.sleepQuality || 3);
      setEnergyLevel(existingCheckIn.energyLevel || 3);
      setStressLevel(existingCheckIn.stressLevel || 3);
      setMusclesoreness(existingCheckIn.musclesoreness || 3);
      setMood(existingCheckIn.mood || 3);
      setNotes(existingCheckIn.notes || '');
    } else {
      // Reset form for new date
      setWorkoutCompleted(false);
      setWorkoutRating(3);
      setWorkoutNotes('');
      setNutritionCompleted(false);
      setNutritionRating(3);
      setNutritionNotes('');
      setSleepHours(7);
      setSleepQuality(3);
      setEnergyLevel(3);
      setStressLevel(3);
      setMusclesoreness(3);
      setMood(3);
      setNotes('');
    }
  }, [existingCheckIn]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data: CreateCheckInData) =>
      isToday
        ? checkInsApi.createOrUpdate(data)
        : checkInsApi.createForDate(dateStr, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-in', dateStr] });
      queryClient.invalidateQueries({ queryKey: ['check-in-stats'] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      workoutCompleted,
      workoutRating: workoutCompleted ? workoutRating : undefined,
      workoutNotes: workoutNotes || undefined,
      nutritionCompleted,
      nutritionRating: nutritionCompleted ? nutritionRating : undefined,
      nutritionNotes: nutritionNotes || undefined,
      sleepHours,
      sleepQuality,
      energyLevel,
      stressLevel,
      musclesoreness,
      mood,
      notes: notes || undefined,
    });
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const formatDate = (date: Date) => {
    if (isToday) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Daily Check-In</h1>
          <p className="text-muted-foreground">Track your progress and wellness</p>
        </div>
        {existingCheckIn && (
          <div className="flex items-center gap-2 text-green-500">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Date Navigation */}
      <Card className="glass border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">{formatDate(selectedDate)}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNextDay}
              disabled={isToday}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      {weeklyStats && (
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {weeklyStats.workoutsCompleted}/{weeklyStats.totalCheckIns}
                </div>
                <div className="text-xs text-muted-foreground">Workouts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {weeklyStats.avgSleepHours?.toFixed(1) || '-'}h
                </div>
                <div className="text-xs text-muted-foreground">Avg Sleep</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {weeklyStats.avgMood?.toFixed(1) || '-'}/5
                </div>
                <div className="text-xs text-muted-foreground">Avg Mood</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workout Section */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                Workout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="workout-completed" className="text-base">
                  Did you complete your workout?
                </Label>
                <Switch
                  id="workout-completed"
                  checked={workoutCompleted}
                  onCheckedChange={setWorkoutCompleted}
                />
              </div>
              {workoutCompleted && (
                <>
                  <RatingSlider
                    value={workoutRating}
                    onChange={setWorkoutRating}
                    label="How was your workout?"
                    icon={Sparkles}
                  />
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes (optional)</Label>
                    <Textarea
                      placeholder="Any notes about your workout..."
                      value={workoutNotes}
                      onChange={(e) => setWorkoutNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Section */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                Nutrition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="nutrition-completed" className="text-base">
                  Did you follow your nutrition plan?
                </Label>
                <Switch
                  id="nutrition-completed"
                  checked={nutritionCompleted}
                  onCheckedChange={setNutritionCompleted}
                />
              </div>
              {nutritionCompleted && (
                <>
                  <RatingSlider
                    value={nutritionRating}
                    onChange={setNutritionRating}
                    label="How was your nutrition?"
                    icon={Sparkles}
                  />
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes (optional)</Label>
                    <Textarea
                      placeholder="Any notes about your nutrition..."
                      value={nutritionNotes}
                      onChange={(e) => setNutritionNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Sleep Section */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                Sleep
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hours of sleep</span>
                  <span className="text-lg font-bold text-primary">{sleepHours}h</span>
                </div>
                <Slider
                  value={[sleepHours]}
                  onValueChange={([v]) => setSleepHours(v)}
                  min={3}
                  max={12}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <RatingSlider
                value={sleepQuality}
                onChange={setSleepQuality}
                label="Sleep quality"
                icon={Moon}
              />
            </CardContent>
          </Card>

          {/* Wellness Section */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Battery className="h-5 w-5 text-primary" />
                Wellness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RatingSlider
                value={energyLevel}
                onChange={setEnergyLevel}
                label="Energy level"
                icon={Battery}
              />
              <RatingSlider
                value={stressLevel}
                onChange={setStressLevel}
                label="Stress level"
                icon={Brain}
              />
              <RatingSlider
                value={musclesoreness}
                onChange={setMusclesoreness}
                label="Muscle soreness"
                icon={Dumbbell}
              />
              <RatingSlider
                value={mood}
                onChange={setMood}
                label="Overall mood"
                icon={Smile}
              />
            </CardContent>
          </Card>

          {/* General Notes */}
          <Card className="glass border-border/50">
            <CardHeader className="pb-2">
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Anything else you'd like to note about today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            className="w-full btn-primary"
            size="lg"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : existingCheckIn ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Update Check-In
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Complete Check-In
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
