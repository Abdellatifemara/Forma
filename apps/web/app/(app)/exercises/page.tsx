import { Suspense } from 'react';
import ExercisesPage from './exercises-client';
import { FormaPageLoader } from '@/components/ui/skeleton';

export default function Page() {
  return (
    <Suspense fallback={<FormaPageLoader />}>
      <ExercisesPage />
    </Suspense>
  );
}
