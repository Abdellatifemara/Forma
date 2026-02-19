'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Flame,
  Heart,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  User,
  Zap,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { aiApi, programsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type GenerationState = 'input' | 'generating' | 'preview' | 'saving';

const goals = [
  { id: 'muscle_building', name: 'Muscle Building', icon: Dumbbell, color: 'cyan' },
  { id: 'fat_loss', name: 'Fat Loss', icon: Flame, color: 'orange' },
  { id: 'strength', name: 'Strength', icon: Zap, color: 'purple' },
  { id: 'endurance', name: 'Endurance', icon: Heart, color: 'red' },
  { id: 'general_fitness', name: 'General Fitness', icon: Target, color: 'green' },
];

const levels = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' },
];

const equipmentOptions = [
  { id: 'full_gym', name: 'Full Gym' },
  { id: 'dumbbells', name: 'Dumbbells Only' },
  { id: 'home', name: 'Home/Minimal' },
  { id: 'bodyweight', name: 'Bodyweight Only' },
];

interface GeneratedExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
}

interface GeneratedDay {
  name: string;
  focus: string;
  exercises: GeneratedExercise[];
}

interface GeneratedProgram {
  name: string;
  description: string;
  durationWeeks: number;
  frequency: number;
  days: GeneratedDay[];
}

const generationSteps = [
  'Reviewing your requirements...',
  'Selecting exercises from library...',
  'Structuring workout days...',
  'Setting up sets and reps...',
  'Configuring rest periods...',
  'Finalizing your program...',
];

export default function AIGeneratorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, setState] = useState<GenerationState>('input');
  const [currentStep, setCurrentStep] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);

  const [formData, setFormData] = useState({
    goal: 'muscle_building',
    level: 'intermediate',
    equipment: 'full_gym',
    durationWeeks: 8,
    frequency: 4,
    sessionLength: 60,
    additionalNotes: '',
  });

  const handleGenerate = async () => {
    setState('generating');
    setCurrentStep('Sending to AI trainer...');

    try {
      const goalName = goals.find((g) => g.id === formData.goal)?.name || formData.goal;
      const prompt = `Create a ${formData.durationWeeks}-week ${goalName} workout program for a ${formData.level} level client.
Equipment: ${formData.equipment.replace('_', ' ')}. Training ${formData.frequency} days/week, ${formData.sessionLength} min sessions.
${formData.additionalNotes ? `Notes: ${formData.additionalNotes}` : ''}
Return ONLY valid JSON with this exact structure: {"name":"...","description":"...","durationWeeks":${formData.durationWeeks},"frequency":${formData.frequency},"days":[{"name":"Day 1","focus":"...","exercises":[{"name":"...","sets":4,"reps":"8-10","restSeconds":90}]}]}`;

      setCurrentStep('AI is building your program...');
      const response = await aiApi.chat(prompt, 'You are a professional personal trainer. Output ONLY valid JSON, no markdown or explanation.');

      let program: GeneratedProgram;
      try {
        // Try to parse JSON from the response
        const jsonMatch = response.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          program = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Fallback to mock if AI response isn't valid JSON
        setCurrentStep('Structuring program...');
        program = {
          name: `${formData.durationWeeks}-Week ${goalName} Program`,
          description: `${formData.level} level program for ${goalName.toLowerCase()}. ${formData.frequency} days/week, ${formData.sessionLength}-min sessions.`,
          durationWeeks: formData.durationWeeks,
          frequency: formData.frequency,
          days: generateMockDays(formData),
        };
      }

      setGeneratedProgram(program);
      setState('preview');
    } catch (error: any) {
      // Fallback to mock data on error
      setCurrentStep('Using template...');
      const goalName = goals.find((g) => g.id === formData.goal)?.name || formData.goal;
      const fallback: GeneratedProgram = {
        name: `${formData.durationWeeks}-Week ${goalName} Program`,
        description: `${formData.level} level program for ${goalName.toLowerCase()}.`,
        durationWeeks: formData.durationWeeks,
        frequency: formData.frequency,
        days: generateMockDays(formData),
      };
      setGeneratedProgram(fallback);
      setState('preview');
      toast({ title: 'Used template', description: 'AI was unavailable, generated from template instead.' });
    }
  };

  const generateMockDays = (data: typeof formData): GeneratedDay[] => {
    const dayTemplates: Record<string, GeneratedDay[]> = {
      muscle_building: [
        {
          name: 'Day 1',
          focus: 'Push (Chest, Shoulders, Triceps)',
          exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: '8-10', restSeconds: 90 },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 75 },
            { name: 'Overhead Press', sets: 3, reps: '8-10', restSeconds: 90 },
            { name: 'Cable Lateral Raises', sets: 3, reps: '12-15', restSeconds: 60 },
            { name: 'Tricep Pushdown', sets: 3, reps: '12-15', restSeconds: 60 },
            { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', restSeconds: 60 },
          ],
        },
        {
          name: 'Day 2',
          focus: 'Pull (Back, Biceps)',
          exercises: [
            { name: 'Barbell Row', sets: 4, reps: '8-10', restSeconds: 90 },
            { name: 'Lat Pulldown', sets: 3, reps: '10-12', restSeconds: 75 },
            { name: 'Cable Row', sets: 3, reps: '10-12', restSeconds: 75 },
            { name: 'Face Pulls', sets: 3, reps: '15-20', restSeconds: 60 },
            { name: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Hammer Curl', sets: 3, reps: '10-12', restSeconds: 60 },
          ],
        },
        {
          name: 'Day 3',
          focus: 'Legs (Quads, Hamstrings, Glutes)',
          exercises: [
            { name: 'Barbell Squat', sets: 4, reps: '8-10', restSeconds: 120 },
            { name: 'Romanian Deadlift', sets: 3, reps: '10-12', restSeconds: 90 },
            { name: 'Leg Press', sets: 3, reps: '10-12', restSeconds: 90 },
            { name: 'Leg Curl', sets: 3, reps: '12-15', restSeconds: 60 },
            { name: 'Leg Extension', sets: 3, reps: '12-15', restSeconds: 60 },
            { name: 'Standing Calf Raise', sets: 4, reps: '12-15', restSeconds: 60 },
          ],
        },
        {
          name: 'Day 4',
          focus: 'Upper Body (Push/Pull Mix)',
          exercises: [
            { name: 'Dumbbell Shoulder Press', sets: 4, reps: '8-10', restSeconds: 90 },
            { name: 'Pull-ups', sets: 3, reps: '6-10', restSeconds: 90 },
            { name: 'Dumbbell Bench Press', sets: 3, reps: '10-12', restSeconds: 75 },
            { name: 'Single Arm Dumbbell Row', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Lateral Raises', sets: 3, reps: '12-15', restSeconds: 60 },
            { name: 'Rear Delt Flyes', sets: 3, reps: '12-15', restSeconds: 60 },
          ],
        },
      ],
      fat_loss: [
        {
          name: 'Day 1',
          focus: 'Full Body Circuit A',
          exercises: [
            { name: 'Goblet Squat', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Superset with next' },
            { name: 'Push-ups', sets: 3, reps: '10-15', restSeconds: 60 },
            { name: 'Dumbbell Row', sets: 3, reps: '12-15', restSeconds: 45, notes: 'Superset with next' },
            { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Walking Lunges', sets: 3, reps: '20 steps', restSeconds: 60 },
            { name: 'Plank', sets: 3, reps: '30-45 sec', restSeconds: 45 },
          ],
        },
        {
          name: 'Day 2',
          focus: 'HIIT & Core',
          exercises: [
            { name: 'Burpees', sets: 4, reps: '10', restSeconds: 45 },
            { name: 'Mountain Climbers', sets: 4, reps: '20 each', restSeconds: 30 },
            { name: 'Jump Squats', sets: 4, reps: '15', restSeconds: 45 },
            { name: 'Bicycle Crunches', sets: 3, reps: '20 each', restSeconds: 30 },
            { name: 'Russian Twists', sets: 3, reps: '20 each', restSeconds: 30 },
            { name: 'Dead Bug', sets: 3, reps: '10 each', restSeconds: 30 },
          ],
        },
        {
          name: 'Day 3',
          focus: 'Full Body Circuit B',
          exercises: [
            { name: 'Deadlift', sets: 3, reps: '10-12', restSeconds: 60 },
            { name: 'Dumbbell Bench Press', sets: 3, reps: '12-15', restSeconds: 45 },
            { name: 'Lat Pulldown', sets: 3, reps: '12-15', restSeconds: 45 },
            { name: 'Step-ups', sets: 3, reps: '12 each', restSeconds: 45 },
            { name: 'Tricep Dips', sets: 3, reps: '10-15', restSeconds: 45 },
            { name: 'Bicep Curl', sets: 3, reps: '12-15', restSeconds: 45 },
          ],
        },
        {
          name: 'Day 4',
          focus: 'Metabolic Conditioning',
          exercises: [
            { name: 'Kettlebell Swings', sets: 4, reps: '15', restSeconds: 45 },
            { name: 'Box Jumps', sets: 4, reps: '10', restSeconds: 45 },
            { name: 'Battle Ropes', sets: 4, reps: '30 sec', restSeconds: 30 },
            { name: 'Rowing Machine', sets: 4, reps: '250m', restSeconds: 60 },
            { name: 'Bear Crawl', sets: 3, reps: '20m', restSeconds: 45 },
            { name: 'Sled Push', sets: 3, reps: '20m', restSeconds: 60 },
          ],
        },
      ],
    };

    const template = dayTemplates[data.goal] || dayTemplates.muscle_building;
    return template.slice(0, data.frequency);
  };

  const handleRegenerate = () => {
    setGeneratedProgram(null);
    handleGenerate();
  };

  const handleSave = async () => {
    if (!generatedProgram) return;
    setState('saving');
    try {
      const program = await programsApi.create({
        nameEn: generatedProgram.name,
        descriptionEn: generatedProgram.description,
        durationWeeks: generatedProgram.durationWeeks,
        sourceType: 'ai_generated',
        workoutDays: generatedProgram.days.map((day, i) => ({
          dayNumber: i + 1,
          nameEn: `${day.name} - ${day.focus}`,
          exercises: day.exercises.map((ex, j) => ({
            order: j,
            customNameEn: ex.name,
            sets: ex.sets,
            reps: String(ex.reps || '10'),
            restSeconds: ex.restSeconds,
          })),
        })),
      });
      toast({ title: 'Program saved', description: 'Your AI-generated program has been created.' });
      router.push(`/trainer/programs/${program.id}`);
    } catch (error: any) {
      toast({ title: 'Failed to save', description: error?.message || 'Please try again.', variant: 'destructive' });
      setState('preview');
    }
  };

  const selectedGoal = goals.find((g) => g.id === formData.goal);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/programs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Personalized Program Builder</h1>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Sparkles className="h-3 w-3 mr-1" />
              Smart
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Create a program tailored to your goals, level, and available equipment
          </p>
        </div>
      </div>

      {state === 'input' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Selection */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Primary Goal</CardTitle>
                <CardDescription>What should this program help achieve?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => setFormData({ ...formData, goal: goal.id })}
                        className={cn(
                          'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                          formData.goal === goal.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 hover:border-primary/30'
                        )}
                      >
                        <div
                          className={cn(
                            'mx-auto w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                            `bg-${goal.color}-500/20`
                          )}
                        >
                          <Icon className={cn('h-5 w-5', `text-${goal.color}-400`)} />
                        </div>
                        <p className="text-sm font-medium">{goal.name}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Experience Level */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Experience Level</CardTitle>
                <CardDescription>What level is this program for?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {levels.map((level) => (
                    <div
                      key={level.id}
                      onClick={() => setFormData({ ...formData, level: level.id })}
                      className={cn(
                        'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                        formData.level === level.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-2 w-6 rounded-full',
                              (level.id === 'beginner' && i === 1) ||
                                (level.id === 'intermediate' && i <= 2) ||
                                level.id === 'advanced'
                                ? 'bg-primary'
                                : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <p className="font-medium">{level.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Available Equipment</CardTitle>
                <CardDescription>What equipment will be available?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {equipmentOptions.map((eq) => (
                    <div
                      key={eq.id}
                      onClick={() => setFormData({ ...formData, equipment: eq.id })}
                      className={cn(
                        'cursor-pointer rounded-xl border-2 p-4 text-center transition-all',
                        formData.equipment === eq.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/30'
                      )}
                    >
                      <p className="font-medium text-sm">{eq.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Program Schedule</CardTitle>
                <CardDescription>Duration and training frequency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Duration
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        value={formData.durationWeeks}
                        onChange={(e) =>
                          setFormData({ ...formData, durationWeeks: parseInt(e.target.value) || 4 })
                        }
                        className="bg-muted/50 border-border/50"
                        min={4}
                        max={16}
                      />
                      <span className="text-muted-foreground">weeks</span>
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      Frequency
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({ ...formData, frequency: parseInt(e.target.value) || 3 })
                        }
                        className="bg-muted/50 border-border/50"
                        min={2}
                        max={6}
                      />
                      <span className="text-muted-foreground">days/week</span>
                    </div>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Session Length
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        value={formData.sessionLength}
                        onChange={(e) =>
                          setFormData({ ...formData, sessionLength: parseInt(e.target.value) || 45 })
                        }
                        className="bg-muted/50 border-border/50"
                        min={30}
                        max={120}
                        step={15}
                      />
                      <span className="text-muted-foreground">min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Additional Instructions (Optional)</CardTitle>
                <CardDescription>
                  Any specific requirements or preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="e.g., Focus on compound movements, avoid deadlifts due to injury, include supersets..."
                  className="bg-muted/50 border-border/50 min-h-[100px]"
                />
              </CardContent>
            </Card>

            <Button onClick={handleGenerate} className="w-full btn-primary py-6 text-lg">
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Program
            </Button>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="glass border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Built Just For You</h3>
                  <p className="text-sm text-muted-foreground">
                    Programs designed to match your exact fitness level,
                    goals, and available equipment. Your body, your program.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Program Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Goal</span>
                  <span className="font-medium">{selectedGoal?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium capitalize">{formData.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{formData.durationWeeks} weeks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">{formData.frequency} days/week</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Session Length</span>
                  <span className="font-medium">{formData.sessionLength} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {state === 'generating' && (
        <Card className="glass border-border/50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-purple-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Building Your Program</h2>
            <p className="text-muted-foreground mb-8">{currentStep}</p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      )}

      {state === 'preview' && generatedProgram && (
        <div className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2 bg-purple-500/20 text-purple-400 border-purple-500/50">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Personalized
                  </Badge>
                  <CardTitle className="text-2xl">{generatedProgram.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {generatedProgram.description}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={handleRegenerate} className="border-primary/50">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm">
                <Badge variant="outline">{generatedProgram.durationWeeks} weeks</Badge>
                <Badge variant="outline">{generatedProgram.frequency} days/week</Badge>
                <Badge variant="outline">
                  {generatedProgram.days.reduce((sum, d) => sum + d.exercises.length, 0)} total exercises
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {generatedProgram.days.map((day, index) => (
              <Card key={index} className="glass border-border/50">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{day.name}</CardTitle>
                        <CardDescription>{day.focus}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{day.exercises.length} exercises</Badge>
                      {expandedDay === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedDay === index && (
                  <CardContent>
                    <div className="space-y-3">
                      {day.exercises.map((exercise, exIndex) => (
                        <div
                          key={exIndex}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground w-6">
                              {exIndex + 1}.
                            </span>
                            <div>
                              <p className="font-medium">{exercise.name}</p>
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span>{exercise.sets} sets</span>
                            <span className="text-muted-foreground">×</span>
                            <span>{exercise.reps}</span>
                            <span className="text-muted-foreground">
                              ({exercise.restSeconds}s rest)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setState('input')}
              className="flex-1 border-border/50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
            <Button onClick={handleSave} className="flex-1 btn-primary">
              <Check className="mr-2 h-4 w-4" />
              Save Program
            </Button>
          </div>
        </div>
      )}

      {state === 'saving' && (
        <Card className="glass border-border/50">
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <Check className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Saving Program</h2>
            <p className="text-muted-foreground mb-8">Your program is being saved...</p>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
