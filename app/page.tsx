import Link from 'next/link';
import { Video, Metrics, RetentionShape } from '@/lib/types';
import { getVideos, getLatestMetrics } from '@/lib/supabase';
import { Badge, RETENTION_MAP } from '@/components/Badge';

interface VideoWithMetrics extends Video {
  latestMetrics: Metrics | null;
}

interface DashboardStats {
  totalVideos: number;
  avgViews: number;
  avgWatchTime: number;
  bestPillar: string;
}

interface RetentionBreakdown {
  flat_hold: number;
  early_drop: number;
  rewatch_bump: number;
  cliff: number;
  unknown: number;
}

export default async function Page() {
  let videos: VideoWithMetrics[] = [];
  let stats: DashboardStats = { totalVideos: 0, avgViews: 0, avgWatchTime: 0, bestPillar: '' };
  let retentionBreakdown: RetentionBreakdown = {
    flat_hold: 0, early_drop: 0, rewatch_bump: 0, cliff: 0, unknown: 0,
  };
  let error: string | null = null;

  try {
    const allVideos = await getVideos();
    videos = await Promise.all(
      allVideos.map(async (video) => {
        const latest = await getLatestMetrics(video.id);
        return { ...video, latestMetrics: latest };
      })
    );

    if (videos.length > 0) {
      const viewsWithData = videos.filter((v) => v.latestMetrics?.views);
      const watchTimeData = videos.filter((v) => v.latestMetrics?.avg_watch_time_seconds);

      const avgViews =
        viewsWithData.length > 0
          ? viewsWithData.reduce((sum, v) => sum + (v.latestMetrics?.views || 0), 0) / viewsWithData.length
          : 0;
      const avgWatchTime =
        watchTimeData.length > 0
          ? watchTimeData.reduce((sum, v) => sum + (v.latestMetrics?.avg_watch_time_seconds || 0), 0) / watchTimeData.length
          : 0;

      const pillarViews: Record<string, number[]> = {};
      viewsWithData.forEach((v) => {
        const pillar = v.content_pillar || 'Unknown';
        if (!pillarViews[pillar]) pillarViews[pillar] = [];
        pillarViews[pillar].push(v.latestMetrics?.views || 0);
      });

      let bestPillar = '';
      let bestAvgViews = 0;
      Object.entries(pillarViews).forEach(([pillar, views]) => {
        const avg = views.reduce((a, b) => a + b, 0) / views.length;
        if (avg > bestAvgViews) { bestAvgViews = avg; bestPillar = pillar; }
      });

      stats = {
        totalVideos: videos.length,
        avgViews: Math.round(avgViews),
        avgWatchTime: Math.round(avgWatchTime * 10) / 10,
        bestPillar,
      };

      videos.forEach((v) => {
        const shape = (v.latestMetrics?.retention_shape || 'unknown') as RetentionShape;
        retentionBreakdown[shape]++;
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load dashboard';
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div
          className="p-4 rounded-lg border text-sm"
          style={{ backgroundColor: 'var(--critical-tint)', borderColor: 'var(--critical)', color: 'var(--critical)' }}
        >
          Error: {error}
        </div>
      </main>
    );
  }

  const recentVideos = videos.slice(0, 10);
  const topByWatchTime = [...videos]
    .sort((a, b) => (b.latestMetrics?.avg_watch_time_seconds || 0) - (a.latestMetrics?.avg_watch_time_seconds || 0))
    .slice(0, 5);

  const RETENTION_LABELS: Record<string, string> = {
    flat_hold: 'Flat Hold',
    early_drop: 'Early Drop',
    rewatch_bump: 'Rewatch Bump',
    cliff: 'Cliff',
    unknown: 'Unknown',
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-strong)' }}>
            Dashboard
          </h1>
          <Link
            href="/library/add"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + Add Video
          </Link>
        </div>

        {videos.length === 0 ? (
          <div
            className="p-12 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
          >
            <p className="text-base mb-4" style={{ color: 'var(--text-secondary)' }}>
              No videos logged yet.
            </p>
            <Link
              href="/library/add"
              className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Add your first video →
            </Link>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Videos', value: stats.totalVideos.toString() },
                { label: 'Avg Views', value: stats.avgViews.toLocaleString() },
                { label: 'Avg Watch Time', value: `${stats.avgWatchTime}s` },
                { label: 'Best Pillar', value: stats.bestPillar || '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="p-5 rounded-xl border"
                  style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
                >
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    {label}
                  </p>
                  <p className="text-2xl font-semibold tabular" style={{ color: 'var(--text-strong)', fontFamily: 'var(--font-mono)' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Retention breakdown */}
            <div
              className="p-5 rounded-xl border mb-6"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-strong)' }}>
                Retention Shape Breakdown
              </h2>
              <div className="flex flex-wrap gap-2">
                {Object.entries(retentionBreakdown).map(([shape, count]) => (
                  <div key={shape} className="flex items-center gap-1.5">
                    <Badge label={RETENTION_LABELS[shape] || shape} tone={RETENTION_MAP[shape]} />
                    <span className="text-sm font-semibold tabular" style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent videos */}
            <div
              className="rounded-xl border mb-6 overflow-hidden"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <div className="px-5 py-3 border-b" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Recent Videos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: 'var(--border-subtle)' }} className="border-b">
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Hook</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pillar</th>
                      <th className="text-right py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Views</th>
                      <th className="text-right py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Watch (s)</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVideos.map((video) => (
                      <tr
                        key={video.id}
                        style={{ borderBottomColor: 'var(--border-subtle)' }}
                        className="border-b last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link
                            href={`/video/${video.id}`}
                            className="font-medium hover:underline"
                            style={{ color: 'var(--accent-text)' }}
                          >
                            {(video.hook || video.title || video.instagram_reel_id || 'Untitled').substring(0, 55)}
                          </Link>
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--text-body)' }}>{video.content_pillar || '—'}</td>
                        <td className="py-3 px-4 text-right tabular" style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
                          {(video.latestMetrics?.views || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular" style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
                          {video.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            label={(video.latestMetrics?.retention_shape || 'unknown').replace(/_/g, ' ')}
                            tone={RETENTION_MAP[video.latestMetrics?.retention_shape || 'unknown']}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 by watch time */}
            <div
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
            >
              <div className="px-5 py-3 border-b" style={{ backgroundColor: 'var(--surface-sunken)', borderColor: 'var(--border-subtle)' }}>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>Top 5 by Watch Time</h2>
              </div>
              <ol className="divide-y" style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
                {topByWatchTime.map((video, idx) => (
                  <li key={video.id} className="flex items-center gap-4 px-5 py-3">
                    <span
                      className="w-6 text-center text-sm font-semibold tabular shrink-0"
                      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/video/${video.id}`}
                        className="text-sm font-medium hover:underline block truncate"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {video.hook || video.title || video.instagram_reel_id || 'Untitled'}
                      </Link>
                    </div>
                    <span
                      className="text-sm tabular shrink-0"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
                    >
                      {video.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '0'}s
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
