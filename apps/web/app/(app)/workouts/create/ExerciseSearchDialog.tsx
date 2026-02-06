'use client';

import { useState, useEffect } from 'react';
import { exercisesApi, type Exercise } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ExerciseSearchDialogProps {
  onAddExercise: (exercise: Exercise) => void;
  children: React.ReactNode;
}

export function ExerciseSearchDialog({ onAddExercise, children }: ExerciseSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return; // Don't search when dialog is closed

    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await exercisesApi.search({ query: searchQuery });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, open]);
  
  const handleAdd = (exercise: Exercise) => {
    onAddExercise(exercise);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
          {isLoading && <p>Loading...</p>}
          {searchResults && searchResults.length > 0 && searchResults.map(ex => (
            <div key={ex.id} className="flex items-center justify-between rounded-md border p-2">
              <div>
                <p className="font-semibold">{ex.name || ex.nameEn}</p>
                <p className="text-sm text-muted-foreground">{ex.muscleGroup || ex.primaryMuscle}</p>
              </div>
              <Button size="sm" onClick={() => handleAdd(ex)}>Add</Button>
            </div>
          ))}
          {!isLoading && searchQuery.length > 1 && (!searchResults || searchResults.length === 0) && (
            <p className="text-center text-muted-foreground">No results found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
