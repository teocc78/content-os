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
        <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#ef4444', color: '#ef4444' }}>
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <p className="mb-6">
            {error.message || 'The video you are looking for could not be loaded.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={reset}
              className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Try Again
            </button>
            <Link
              href="/library"
              className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: '#6b7280' }}
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
