'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Dumbbell,
  Play,
  ChevronRight,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const muscleGroups = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Core',
  'Glutes',
];

const equipmentTypes = [
  'All',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Bodyweight',
  'Kettlebell',
  'Resistance Band',
];

const difficultyLevels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const exercises = [
  {
    id: '1',
    name: 'Bench Press',
    nameAr: 'تمرين الصدر',
    muscleGroup: 'Chest',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'A compound exercise that targets the chest, shoulders, and triceps.',
    instructions: [
      'Lie flat on a bench with feet firmly on the ground',
      'Grip the bar slightly wider than shoulder-width',
      'Unrack and lower the bar to mid-chest',
      'Press the bar back up to the starting position',
    ],
    tips: ['Keep your shoulder blades retracted', 'Maintain a slight arch in your lower back'],
    videoUrl: '/exercises/bench-press.mp4',
    imageUrl: '/exercises/bench-press.jpg',
  },
  {
    id: '2',
    name: 'Deadlift',
    nameAr: 'الرفعة الميتة',
    muscleGroup: 'Back',
    secondaryMuscles: ['Glutes', 'Legs', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Advanced',
    description: 'A compound exercise that works the entire posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep back flat and chest up',
      'Drive through heels to stand up with the weight',
    ],
    tips: ['Keep the bar close to your body', 'Engage your lats throughout the lift'],
    videoUrl: '/exercises/deadlift.mp4',
    imageUrl: '/exercises/deadlift.jpg',
  },
  {
    id: '3',
    name: 'Squat',
    nameAr: 'القرفصاء',
    muscleGroup: 'Legs',
    secondaryMuscles: ['Glutes', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The king of leg exercises, targeting quads, hamstrings, and glutes.',
    instructions: [
      'Position the bar on your upper back',
      'Stand with feet shoulder-width apart',
      'Bend knees and hips to lower down',
      'Keep knees tracking over toes',
    ],
    tips: ['Keep your core tight', 'Go as deep as mobility allows'],
    videoUrl: '/exercises/squat.mp4',
    imageUrl: '/exercises/squat.jpg',
  },
  {
    id: '4',
    name: 'Pull-ups',
    nameAr: 'السحب للأعلى',
    muscleGroup: 'Back',
    secondaryMuscles: ['Biceps', 'Core'],
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    description: 'A bodyweight exercise for building a wide, strong back.',
    instructions: [
      'Hang from a bar with hands wider than shoulder-width',
      'Pull your body up until chin clears the bar',
      'Lower yourself with control',
      'Repeat for desired reps',
    ],
    tips: ['Initiate the pull with your lats', 'Avoid swinging or kipping'],
    videoUrl: '/exercises/pull-ups.mp4',
    imageUrl: '/exercises/pull-ups.jpg',
  },
  {
    id: '5',
    name: 'Shoulder Press',
    nameAr: 'ضغط الكتف',
    muscleGroup: 'Shoulders',
    secondaryMuscles: ['Triceps'],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    description: 'An overhead pressing movement for shoulder development.',
    instructions: [
      'Sit or stand with dumbbells at shoulder height',
      'Press the weights overhead',
      'Lower with control to starting position',
      'Keep core engaged throughout',
    ],
    tips: ['Avoid arching your back excessively', 'Press in a slight arc'],
    videoUrl: '/exercises/shoulder-press.mp4',
    imageUrl: '/exercises/shoulder-press.jpg',
  },
  {
    id: '6',
    name: 'Bicep Curl',
    nameAr: 'تمرين الباي',
    muscleGroup: 'Biceps',
    secondaryMuscles: [],
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    description: 'An isolation exercise for bicep development.',
    instructions: [
      'Stand with dumbbells at your sides',
      'Curl the weights up to shoulder level',
      'Squeeze at the top',
      'Lower with control',
    ],
    tips: ['Keep your elbows stationary', 'Avoid swinging the weights'],
    videoUrl: '/exercises/bicep-curl.mp4',
    imageUrl: '/exercises/bicep-curl.jpg',
  },
  {
    id: '7',
    name: 'Tricep Pushdown',
    nameAr: 'دفع التراي',
    muscleGroup: 'Triceps',
    secondaryMuscles: [],
    equipment: 'Cable',
    difficulty: 'Beginner',
    description: 'An isolation exercise for tricep development using cables.',
    instructions: [
      'Stand facing a cable machine with a rope attachment',
      'Grip the rope and keep elbows at your sides',
      'Push down until arms are fully extended',
      'Return to starting position with control',
    ],
    tips: ['Keep your elbows pinned to your sides', 'Fully extend at the bottom'],
    videoUrl: '/exercises/tricep-pushdown.mp4',
    imageUrl: '/exercises/tricep-pushdown.jpg',
  },
  {
    id: '8',
    name: 'Plank',
    nameAr: 'البلانك',
    muscleGroup: 'Core',
    secondaryMuscles: ['Shoulders'],
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    description: 'An isometric core exercise for building stability.',
    instructions: [
      'Start in a push-up position on forearms',
      'Keep body in a straight line from head to heels',
      'Engage your core and hold',
      'Maintain neutral spine position',
    ],
    tips: ['Do not let your hips sag', 'Breathe steadily throughout'],
    videoUrl: '/exercises/plank.mp4',
    imageUrl: '/exercises/plank.jpg',
  },
  {
    id: '9',
    name: 'Hip Thrust',
    nameAr: 'رفع الورك',
    muscleGroup: 'Glutes',
    secondaryMuscles: ['Legs', 'Core'],
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    description: 'The best exercise for glute development and strength.',
    instructions: [
      'Sit on the ground with upper back against a bench',
      'Roll a barbell over your hips',
      'Drive through your heels to lift hips',
      'Squeeze glutes at the top',
    ],
    tips: ['Keep chin tucked', 'Pause at the top for maximum contraction'],
    videoUrl: '/exercises/hip-thrust.mp4',
    imageUrl: '/exercises/hip-thrust.jpg',
  },
];

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [equipmentFilter, setEquipmentFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<typeof exercises[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.nameAr?.includes(searchQuery);
    const matchesMuscle = muscleFilter === 'All' || exercise.muscleGroup === muscleFilter;
    const matchesEquipment =
      equipmentFilter === 'All' || exercise.equipment === equipmentFilter;
    const matchesDifficulty =
      difficultyFilter === 'All' || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
  });

  const activeFilters = [muscleFilter, equipmentFilter, difficultyFilter].filter(
    (f) => f !== 'All'
  );

  const clearFilters = () => {
    setMuscleFilter('All');
    setEquipmentFilter('All');
    setDifficultyFilter('All');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/10 text-green-500';
      case 'Intermediate':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'Advanced':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Exercise Library</h1>
        <p className="text-muted-foreground">
          Browse our collection of exercises with detailed instructions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={activeFilters.length > 0 ? 'border-forma-teal' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="forma" className="ml-2">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Muscle Group
                  </label>
                  <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {muscleGroups.map((muscle) => (
                        <SelectItem key={muscle} value={muscle}>
                          {muscle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Equipment
                  </label>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map((equipment) => (
                        <SelectItem key={equipment} value={equipment}>
                          {equipment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Difficulty
                  </label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {activeFilters.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {muscleFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {muscleFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setMuscleFilter('All')}
                />
              </Badge>
            )}
            {equipmentFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {equipmentFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setEquipmentFilter('All')}
                />
              </Badge>
            )}
            {difficultyFilter !== 'All' && (
              <Badge variant="secondary" className="gap-1">
                {difficultyFilter}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setDifficultyFilter('All')}
                />
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredExercises.length} of {exercises.length} exercises
      </p>

      {/* Exercise Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="cursor-pointer transition-colors hover:border-forma-teal/50"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-forma-teal/10">
                  <Dumbbell className="h-6 w-6 text-forma-teal" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <p className="text-sm text-muted-foreground">{exercise.nameAr}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {exercise.muscleGroup}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}
                    >
                      {exercise.difficulty}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No exercises found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters} className="mt-4">
            Clear all filters
          </Button>
        </div>
      )}

      {/* Exercise Detail Dialog */}
      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedExercise.name}
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {selectedExercise.nameAr}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Video Placeholder */}
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <Button variant="forma" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{selectedExercise.muscleGroup}</Badge>
                  <Badge variant="outline">{selectedExercise.equipment}</Badge>
                  <Badge
                    className={getDifficultyColor(selectedExercise.difficulty)}
                  >
                    {selectedExercise.difficulty}
                  </Badge>
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondaryMuscles.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Secondary Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondaryMuscles.map((muscle) => (
                        <Badge key={muscle} variant="secondary">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="mb-2 font-semibold">Description</h4>
                  <p className="text-muted-foreground">
                    {selectedExercise.description}
                  </p>
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="mb-2 font-semibold">Instructions</h4>
                  <ol className="space-y-2">
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forma-teal/10 text-sm font-medium text-forma-teal">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tips */}
                {selectedExercise.tips && selectedExercise.tips.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold">Tips</h4>
                    <ul className="space-y-2">
                      {selectedExercise.tips.map((tip, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forma-teal" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Button */}
                <Button variant="forma" className="w-full">
                  Add to Workout
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
