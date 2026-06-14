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
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        <div className="p-6 rounded border text-center" style={{ backgroundColor: '#141414', borderColor: '#ef4444' }}>
          <h2 className="text-2xl font-bold text-white mb-4">Failed to load library</h2>
          <p className="text-gray-400 mb-6">
            {error.message || 'An error occurred while loading your video library.'}
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
      </div>
    </main>
  );
}
