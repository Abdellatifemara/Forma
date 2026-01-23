'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function LogWorkoutPage() {
  const [exercises, setExercises] = useState([{ id: 1, name: '', sets: [{ reps: '', weight: '' }] }]);

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const removeExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const addSet = (exerciseId: number) => {
    const newExercises = exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...ex.sets, { reps: '', weight: '' }] };
      }
      return ex;
    });
    setExercises(newExercises);
  };


  return (
    <div className="space-y-6 pb-20 lg:ml-64 lg:pb-6">
      <div>
        <h1 className="text-2xl font-bold">Log a Workout</h1>
        <p className="text-muted-foreground">Manually enter the details of your training session.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label>Workout Name</label>
            <Input placeholder="e.g., Morning Run, Chest Day" />
          </div>
          <div className="space-y-2">
            <label>Duration (minutes)</label>
            <Input type="number" placeholder="e.g., 60" />
          </div>

          {exercises.map((exercise, exIndex) => (
            <div key={exercise.id} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Exercise #{exIndex + 1}</h3>
                <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input placeholder="Exercise Name, e.g., Bench Press" />
              {exercise.sets.map((set, setIndex) => (
                <div key={setIndex} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Set {setIndex + 1}</span>
                  <Input type="number" placeholder="Reps" />
                  <Input type="number" placeholder="Weight (kg)" />
                </div>
              ))}
               <Button variant="outline" size="sm" onClick={() => addSet(exercise.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add Set
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addExercise}>
            <Plus className="mr-2 h-4 w-4" /> Add Exercise
          </Button>

          <div className="space-y-2">
            <label>Notes</label>
            <textarea
              className="w-full rounded-md border p-2"
              placeholder="Any thoughts on your workout?"
            />
          </div>

          <Button size="lg" className="w-full">Save Workout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
