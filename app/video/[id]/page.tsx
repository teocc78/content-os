import Link from 'next/link';
import { getVideoById, getMetricsForVideo } from '@/lib/supabase';
import { Metrics, RetentionShape } from '@/lib/types';
import { MetricsChart } from './metrics-chart';

interface VideoPageProps {
  params: Promise<{
    id: string;
  }>;
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
      <main className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto">
          <div className="p-4 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222', color: '#ef4444' }}>
            {error || 'Video not found'}
          </div>
        </div>
      </main>
    );
  }

  const latestMetrics = allMetrics[0] || null;
  const retentionShapeColors: Record<RetentionShape, string> = {
    flat_hold: '#22c55e',
    early_drop: '#eab308',
    rewatch_bump: '#3b82f6',
    cliff: '#ef4444',
  };

  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/library" style={{ color: '#3b82f6' }} className="hover:underline">
            ← Back to Library
          </Link>
          <Link
            href={`/video/${id}/edit`}
            className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#3b82f6' }}
          >
            Edit
          </Link>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            {/* Hook */}
            <div className="p-6 rounded border" style={{ backgroundColor: '#3b82f6' }}>
              <p className="text-sm text-blue-100 mb-2">Hook</p>
              <h1 className="text-2xl font-bold text-white">{video.hook}</h1>
            </div>

            {/* On-Screen Caption */}
            {video.captions && (
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <p className="text-sm text-gray-400 mb-2">On-Screen Caption</p>
                <p className="text-white">{video.captions}</p>
              </div>
            )}

            {/* Below-Video Caption */}
            {/* Note: We'll need to add a below_caption field to the Video interface */}
            {/* For now, storing in captions - split would be needed */}

            {/* Transcript */}
            <div
              className="p-6 rounded border max-h-96 overflow-y-auto"
              style={{ backgroundColor: '#141414', borderColor: '#222' }}
            >
              <p className="text-sm text-gray-400 mb-3 sticky top-0">Full Transcript</p>
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{video.transcript}</p>
            </div>

            {/* Content Pillar */}
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded text-sm font-medium text-white"
                style={{ backgroundColor: '#3b82f6' }}
              >
                {video.content_pillar}
              </span>
            </div>

            {/* Posted Date */}
            <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
              <p className="text-sm text-gray-400 mb-2">Posted</p>
              <p className="text-white">{new Date(video.posted_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}</p>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Latest Metrics */}
            {latestMetrics ? (
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Latest Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Views</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.views || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Plays</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.plays || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Accounts Reached</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.accounts_reached || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Likes</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.likes || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Comments</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.comments || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Shares</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.shares || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Saves</p>
                    <p className="text-2xl font-bold text-white">{(latestMetrics.saves || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Avg Watch Time</p>
                    <p className="text-2xl font-bold text-white">
                      {latestMetrics.avg_watch_time_seconds?.toFixed(1) || '—'}s
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Retention Shape & Details */}
            {latestMetrics ? (
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Retention</h2>
                <div className="mb-4">
                  <span
                    className="px-3 py-1 rounded text-sm font-medium text-white inline-block"
                    style={{
                      backgroundColor: retentionShapeColors[
                        (latestMetrics.retention_shape || 'flat_hold') as RetentionShape
                      ],
                    }}
                  >
                    {(latestMetrics.retention_shape || 'flat_hold').replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Retention: {(latestMetrics.retention * 100).toFixed(1)}%
                </p>

                {/* Retention Screenshot */}
                {latestMetrics.retention_screenshot_url && (
                  <div className="mt-4">
                    <img
                      src={latestMetrics.retention_screenshot_url}
                      alt="Retention graph"
                      className="w-full rounded border"
                      style={{ borderColor: '#222' }}
                    />
                  </div>
                )}
              </div>
            ) : null}

            {/* Metrics Over Time Chart */}
            {allMetrics.length > 0 && (
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
                <h2 className="text-lg font-semibold text-white mb-4">Views Over Time</h2>
                <MetricsChart metrics={allMetrics} />
              </div>
            )}

            {/* Hook Grade */}
            <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222' }}>
              <h2 className="text-lg font-semibold text-white mb-4">Hook Grade</h2>
              {video.hook_grade ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Overall Score</span>
                      <span className="text-2xl font-bold text-white">{video.hook_grade.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${video.hook_grade.score}%`, backgroundColor: '#3b82f6' }}
                      />
                    </div>
                  </div>

                  {video.hook_grade.feedback && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Feedback</p>
                      <p className="text-gray-300 text-sm">{video.hook_grade.feedback}</p>
                    </div>
                  )}

                  {video.hook_grade.rewrite_suggestion && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Suggested Rewrite</p>
                      <p className="text-gray-300 text-sm italic">{video.hook_grade.rewrite_suggestion}</p>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/grade?hook=${encodeURIComponent(video.hook)}`}
                  className="inline-block px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: '#3b82f6' }}
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
