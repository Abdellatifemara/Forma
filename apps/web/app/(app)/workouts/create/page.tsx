'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Dummy exercises for the sake of the placeholder
const allExercises = [
  { id: '1', name: 'Bench Press' },
  { id: '2', name: 'Deadlift' },
  { id: '3', name: 'Squat' },
  { id: '4', name: 'Pull-ups' },
  { id: '5', name: 'Shoulder Press' },
];

export default function CreateWorkoutPlanPage() {
  const [planName, setPlanName] = useState('');
  const [workouts, setWorkouts] = useState([{ id: 1, name: 'Day 1', exercises: [] }]);

  const addWorkoutDay = () => {
    setWorkouts([...workouts, { id: Date.now(), name: `Day ${workouts.length + 1}`, exercises: [] }]);
  };

  const removeWorkoutDay = (id: number) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };
  
  const addExerciseToWorkout = (workoutId, exercise) => {
      const newWorkouts = workouts.map(w => {
          if (w.id === workoutId) {
              return {...w, exercises: [...w.exercises, exercise]};
          }
          return w;
      });
      setWorkouts(newWorkouts);
  }

  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">Create Workout Plan</h1>
        <p className="text-muted-foreground">Build your own custom training program from scratch.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label>Plan Name</label>
            <Input 
              placeholder="e.g., My Awesome Strength Plan" 
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          {workouts.map((workout, wIndex) => (
            <Card key={workout.id} className="bg-muted/50">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  <Input 
                    value={workout.name} 
                    className="border-none bg-transparent text-lg font-semibold p-0"
                  />
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => removeWorkoutDay(workout.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {workout.exercises.map((ex, exIndex) => (
                    <div key={exIndex} className="flex items-center justify-between rounded-md border bg-background p-2">
                        <span>{ex.name}</span>
                        <Button variant="ghost" size="icon"><X className="h-4 w-4" /></Button>
                    </div>
                ))}
                
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed">
                          <Plus className="mr-2 h-4 w-4" /> Add Exercise
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Exercise to {workout.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                           {/* A real implementation would have a searchable list here */}
                           {allExercises.map(ex => (
                               <div key={ex.id} className="flex items-center justify-between">
                                   <span>{ex.name}</span>
                                   <Button size="sm" onClick={() => addExerciseToWorkout(workout.id, ex)}>Add</Button>
                               </div>
                           ))}
                        </div>
                    </DialogContent>
                </Dialog>

              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addWorkoutDay}>
            <Plus className="mr-2 h-4 w-4" /> Add Day / Workout
          </Button>
          
          <Button size="lg" className="w-full">Save Plan</Button>
        </CardContent>
      </Card>
    </div>
  );
}
