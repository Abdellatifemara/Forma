import { Suspense } from 'react';
import WorkoutsPage from './workouts-client';
import { SkeletonWorkoutsPage } from '@/components/ui/skeleton';

export default function Page() {
  return (
    <Suspense fallback={<SkeletonWorkoutsPage />}>
      <WorkoutsPage />
    </Suspense>
  );
}
