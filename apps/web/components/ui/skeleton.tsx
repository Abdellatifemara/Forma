import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-3">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border/60 bg-white dark:bg-card p-5 shadow-card', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function FormaSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const borderSizes = { sm: 'border-2', md: 'border-[3px]', lg: 'border-4' };
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('animate-spin rounded-full border-muted border-t-primary', sizes[size], borderSizes[size])} />
    </div>
  );
}

function FormaPageLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <FormaSpinner size="lg" />
    </div>
  );
}

function SkeletonWorkoutCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

function SkeletonExerciseCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-5 w-5" />
      </div>
    </div>
  );
}

function SkeletonTrainerCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border">
      <div className="border-b p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b p-4 last:border-0">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex h-64 items-end justify-around gap-4">
          {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
            <Skeleton
              key={i}
              className="w-full rounded-t-lg"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonAvatar({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };
  return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-40" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Today's workout */}
      <div className="rounded-2xl border border-border/60 bg-white dark:bg-card p-6 shadow-card border-s-[3px] border-s-muted">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-32 mb-4" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Two cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border/60 bg-white dark:bg-card p-6 shadow-card">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonWorkoutsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Week Schedule */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="mb-4 h-5 w-24" />
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="rounded-lg border p-3 text-center">
              <Skeleton className="mx-auto mb-2 h-3 w-8" />
              <Skeleton className="mx-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Workout Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonWorkoutCard key={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonProfilePage() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonWorkoutCard,
  SkeletonExerciseCard,
  SkeletonTrainerCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonAvatar,
  SkeletonText,
  SkeletonDashboard,
  SkeletonWorkoutsPage,
  SkeletonProfilePage,
  FormaSpinner,
  FormaPageLoader,
};
