'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#6b7280' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
