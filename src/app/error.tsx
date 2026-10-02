"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bgSurface p-4 text-center">
      <h2 className="text-2xl font-serif text-textPrimary mb-4">Something went wrong!</h2>
      <p className="text-textSecondary mb-8 max-w-md">
        {error.message || "An unexpected error occurred in the application."}
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
