import Link from 'next/link';
import { getVideoById, getMetricsForVideo } from '@/lib/supabase';
import { Metrics } from '@/lib/types';
import { MetricsChart } from './metrics-chart';
import { Badge, RETENTION_MAP } from '@/components/Badge';

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  let video = null;
  let allMetrics: Metrics[] = [];
  let error: string | null = null;

  try {
    const videoData = await getVideoById(id);
    video = videoData;
    allMetrics = videoData.metrics || [];
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load video';
  }

  if (error || !video) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: 'var(--surface-app)' }}>
        <div
          className="p-4 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--critical-tint)', borderColor: 'var(--critical)', color: 'var(--critical)' }}
        >
          {error || 'Video not found'}
        </div>
      </main>
    );
  }

  const latestMetrics = allMetrics[0] || null;

  const metricItems = [
    { label: 'Views', value: (latestMetrics?.views || 0).toLocaleString() },
    { label: 'Plays', value: (latestMetrics?.plays || 0).toLocaleString() },
    { label: 'Reached', value: (latestMetrics?.accounts_reached || 0).toLocaleString() },
    { label: 'Likes', value: (latestMetrics?.likes || 0).toLocaleString() },
    { label: 'Comments', value: (latestMetrics?.comments || 0).toLocaleString() },
    { label: 'Shares', value: (latestMetrics?.shares || 0).toLocaleString() },
    { label: 'Saves', value: (latestMetrics?.saves || 0).toLocaleString() },
    { label: 'Watch Time', value: latestMetrics?.avg_watch_time_seconds?.toFixed(1) ? `${latestMetrics.avg_watch_time_seconds.toFixed(1)}s` : '—' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/library"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent-text)' }}
          >
            ← Back to Library
          </Link>
          <Link
            href={`/video/${id}/edit`}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-4">
            {/* Phone-style hook preview */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ aspectRatio: '9/16', maxHeight: '400px', background: 'linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', position: 'relative' }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                {video.content_pillar && (
                  <Badge
                    label={video.content_pillar}
                    tone="accent"
                    className="mb-2 self-start"
                  />
                )}
                <p className="text-white text-base font-semibold leading-snug">
                  {video.hook || video.title || 'Untitled'}
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {new Date(video.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Transcript */}
            <div
              className="rounded-xl border p-4 max-h-64 overflow-y-auto"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Transcript
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-body)' }}>
                {video.transcript || 'No transcript available.'}
              </p>
            </div>

            {/* On-screen caption */}
            {video.on_screen_caption && (
              <div
                className="rounded-xl border p-4"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  On-Screen Caption
                </p>
                <p className="text-sm" style={{ color: 'var(--text-body)' }}>{video.on_screen_caption}</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-5">
            {/* Performance metrics grid */}
            {latestMetrics && (
              <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
              >
                <div className="px-5 py-3 border-b" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}>
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Performance</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                  {metricItems.map(({ label, value }) => (
                    <div key={label} className="p-4">
                      <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-xl font-semibold tabular" style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Retention */}
            {latestMetrics && (
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
              >
                <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-strong)' }}>Retention</h2>
                <div className="flex items-center gap-3">
                  <Badge
                    label={(latestMetrics.retention_shape || 'unknown').replace(/_/g, ' ')}
                    tone={RETENTION_MAP[latestMetrics.retention_shape || 'unknown']}
                  />
                  {latestMetrics.retention_drop_point_pct != null && (
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      50% drop at {latestMetrics.retention_drop_point_pct}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Metrics chart */}
            {allMetrics.length > 0 && (
              <div
                className="rounded-xl border p-5"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
              >
                <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-strong)' }}>Views Over Time</h2>
                <MetricsChart metrics={allMetrics} />
              </div>
            )}

            {/* Hook grade */}
            <div
              className="rounded-xl border p-5"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-strong)' }}>Hook Grade</h2>
              {video.hook_grade ? (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Overall Score</span>
                      <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>
                        {video.hook_grade.score}/100
                      </span>
                    </div>
                    <div className="w-full rounded-full h-1.5" style={{ backgroundColor: 'var(--surface-sunken)' }}>
                      <div
                        className="h-1.5 rounded-full"
                        style={{ width: `${video.hook_grade.score}%`, backgroundColor: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                  {video.hook_grade.feedback && (
                    <p className="text-sm" style={{ color: 'var(--text-body)' }}>{video.hook_grade.feedback}</p>
                  )}
                  {video.hook_grade.rewrite_suggestion && (
                    <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>
                      &ldquo;{video.hook_grade.rewrite_suggestion}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <Link
                  href={`/grade?hook=${encodeURIComponent(video.hook || '')}`}
                  className="inline-block px-3 py-1.5 rounded-md text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Grade this hook →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
