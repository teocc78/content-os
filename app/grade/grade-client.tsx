'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface GradeResult {
  specificity_score: number;
  declarative_score: number;
  payoff_frontload_score: number;
  overall_score: number;
  weaknesses: string[];
  rewrites: string[];
}

export function GradeClient() {
  const searchParams = useSearchParams();
  const initialHook = searchParams.get('hook') ? decodeURIComponent(searchParams.get('hook')!) : '';

  const [hook, setHook] = useState(initialHook);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hook }),
      });

      if (!res.ok) throw new Error('Failed to grade hook');

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score < 6) return '#ef4444'; // red
    if (score < 8) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Hook Grader</h1>
        <p className="text-gray-400 mb-8">Grade your Instagram hook against top-performing content</p>

        <form onSubmit={handleGrade} className="mb-8">
          <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
            <label className="block text-sm font-medium text-gray-400 mb-3">Paste your hook draft</label>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Enter the hook you want to grade..."
              rows={4}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border mb-4"
              style={{ borderColor: '#333' }}
            />
            <button
              type="submit"
              disabled={loading || !hook.trim()}
              className="w-full py-2 rounded font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#3b82f6' }}
            >
              {loading ? 'Grading...' : 'Grade It'}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="p-4 rounded border mb-8"
            style={{ backgroundColor: '#141414', borderColor: '#ef4444', color: '#ef4444' }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Overall Score Badge */}
            <div
              className="p-8 rounded border text-center"
              style={{
                backgroundColor: '#141414',
                borderColor: '#222',
              }}
            >
              <p className="text-gray-400 text-sm mb-2">Overall Score</p>
              <div
                className="inline-block px-6 py-3 rounded text-4xl font-bold text-white"
                style={{
                  backgroundColor: getScoreColor(result.overall_score),
                }}
              >
                {result.overall_score}/10
              </div>
            </div>

            {/* Score Dimensions */}
            <div
              className="p-6 rounded border"
              style={{ backgroundColor: '#141414', borderColor: '#222' }}
            >
              <h2 className="text-lg font-semibold text-white mb-6">Dimension Scores</h2>
              <div className="space-y-4">
                {[
                  { label: 'Specificity', score: result.specificity_score },
                  { label: 'Declarative', score: result.declarative_score },
                  { label: 'Payoff Frontload', score: result.payoff_frontload_score },
                ].map((dim) => (
                  <div key={dim.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">{dim.label}</span>
                      <span className="text-sm font-semibold text-white">{dim.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(dim.score / 10) * 100}%`,
                          backgroundColor: getScoreColor(dim.score),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <div
                className="p-6 rounded border"
                style={{ backgroundColor: '#141414', borderColor: '#222' }}
              >
                <h2 className="text-lg font-semibold text-white mb-4">Weaknesses</h2>
                <ul className="space-y-2">
                  {result.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-gray-300 text-sm flex gap-3">
                      <span className="text-red-400 font-bold">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewrites */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Suggested Rewrites</h2>
              <div className="space-y-4">
                {result.rewrites.map((rewrite, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded border"
                    style={{ backgroundColor: '#141414', borderColor: '#222' }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className="text-sm text-gray-400">Rewrite {idx + 1}</span>
                      <button
                        onClick={() => copyToClipboard(rewrite)}
                        className="px-3 py-1 rounded text-sm font-medium text-white transition hover:opacity-90"
                        style={{ backgroundColor: '#3b82f6' }}
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-white">{rewrite}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save as new hook */}
            <div
              className="p-6 rounded border"
              style={{ backgroundColor: '#141414', borderColor: '#222' }}
            >
              <p className="text-gray-400 text-sm">
                💡 Liked one of these rewrites? You can use it as the hook when adding or editing a video.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
