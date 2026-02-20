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
import { useLanguage } from '@/lib/i18n';

interface ExerciseSearchDialogProps {
  onAddExercise: (exercise: Exercise) => void;
  children: React.ReactNode;
}

export function ExerciseSearchDialog({ onAddExercise, children }: ExerciseSearchDialogProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
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
        // Handle both old format (exercises) and new format (data)
        const exerciseData = response.data || (response as any).exercises || [];
        setSearchResults(exerciseData);
      } catch (error) {
        // Error handled
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
          <DialogTitle>{isAr ? 'إضافة تمرين' : 'Add Exercise'}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isAr ? 'ابحث عن تمارين...' : 'Search exercises...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
          {isLoading && <p>{isAr ? 'جاري التحميل...' : 'Loading...'}</p>}
          {searchResults && searchResults.length > 0 && searchResults.map(ex => (
            <div key={ex.id} className="flex items-center justify-between rounded-md border p-2">
              <div>
                <p className="font-semibold">{isAr ? (ex.nameAr || ex.nameEn || ex.name) : (ex.nameEn || ex.name)}</p>
                <p className="text-sm text-muted-foreground">{ex.primaryMuscle || ex.muscleGroup}</p>
              </div>
              <Button size="sm" onClick={() => handleAdd(ex)}>{isAr ? 'أضف' : 'Add'}</Button>
            </div>
          ))}
          {!isLoading && searchQuery.length > 1 && (!searchResults || searchResults.length === 0) && (
            <p className="text-center text-muted-foreground">{isAr ? 'مفيش نتائج.' : 'No results found.'}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
