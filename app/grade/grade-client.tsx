'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

interface GradeResult {
  specificity_score: number;
  declarative_score: number;
  payoff_frontload_score: number;
  overall_score: number;
  weaknesses: string[];
  rewrites: string[];
}

function scoreTone(score: number): { bg: string; color: string } {
  if (score < 6) return { bg: 'var(--critical-tint)', color: 'var(--critical)' };
  if (score < 8) return { bg: 'var(--caution-tint)',  color: 'var(--caution)'  };
  return              { bg: 'var(--positive-tint)',  color: 'var(--positive)'  };
}

function scoreBarColor(score: number): string {
  if (score < 6) return 'var(--critical)';
  if (score < 8) return 'var(--caution)';
  return 'var(--positive)';
}

export function GradeClient() {
  const searchParams = useSearchParams();
  const initialHook = searchParams.get('hook') ? decodeURIComponent(searchParams.get('hook')!) : '';

  const [hook, setHook] = useState(initialHook);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

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
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: 'var(--surface-app)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-strong)' }}>Hook Grader</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Grade your hook against top-performing content
          </p>
        </div>

        <form onSubmit={handleGrade} className="mb-6">
          <div
            className="rounded-xl border p-5"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
          >
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Your hook draft
            </label>
            <textarea
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              placeholder="Enter the hook you want to grade..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg text-sm mb-4 resize-none outline-none"
              style={{
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--surface-sunken)',
                color: 'var(--text-body)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = 'var(--shadow-focus)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !hook.trim()}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {loading ? 'Grading…' : 'Grade Hook'}
              </button>
            </div>
          </div>
        </form>

        {error && (
          <div
            className="flex items-center gap-2 p-4 rounded-lg border mb-6 text-sm"
            style={{ backgroundColor: 'var(--critical-tint)', borderColor: 'var(--critical)', color: 'var(--critical)' }}
          >
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-5">
            {/* Overall score */}
            <div
              className="rounded-xl border p-5 flex items-center gap-5"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <div
                className="flex items-center justify-center w-16 h-16 rounded-xl text-2xl font-bold tabular shrink-0"
                style={{ backgroundColor: scoreTone(result.overall_score).bg, color: scoreTone(result.overall_score).color, fontFamily: 'var(--font-mono)' }}
              >
                {result.overall_score}
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Overall Score</p>
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>out of 10</p>
              </div>
            </div>

            {/* Dimension scores */}
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-strong)' }}>Dimensions</h2>
              <div className="space-y-3">
                {[
                  { label: 'Specificity', score: result.specificity_score },
                  { label: 'Declarative', score: result.declarative_score },
                  { label: 'Payoff Frontload', score: result.payoff_frontload_score },
                ].map(({ label, score }) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm" style={{ color: 'var(--text-body)' }}>{label}</span>
                      <span
                        className="text-sm font-semibold tabular"
                        style={{ color: scoreBarColor(score), fontFamily: 'var(--font-mono)' }}
                      >
                        {score}/10
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${(score / 10) * 100}%`, backgroundColor: scoreBarColor(score) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
              >
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-strong)' }}>Weaknesses</h2>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex gap-2 text-sm" style={{ color: 'var(--text-body)' }}>
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--caution)' }} />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rewrites */}
            <div>
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-strong)' }}>Suggested Rewrites</h2>
              <div className="space-y-3">
                {result.rewrites.map((rewrite, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border p-4"
                    style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Option {idx + 1}
                      </span>
                      <button
                        onClick={() => copyToClipboard(rewrite, idx)}
                        className="px-2.5 py-1 rounded-md text-xs font-medium transition hover:opacity-80"
                        style={{
                          backgroundColor: copied === idx ? 'var(--positive-tint)' : 'var(--accent-tint)',
                          color: copied === idx ? 'var(--positive)' : 'var(--accent-text)',
                        }}
                      >
                        {copied === idx ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-body)' }}>{rewrite}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
