import { Suspense } from 'react';
import ExercisesPage from './exercises-client';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <ExercisesPage />
    </Suspense>
  );
}
