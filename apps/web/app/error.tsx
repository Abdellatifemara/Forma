'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-red-500">500</h1>
      <h2 className="mt-4 text-2xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-md bg-forma-teal px-6 py-2 text-white hover:bg-forma-teal/90"
      >
        Try again
      </button>
    </div>
  );
}
