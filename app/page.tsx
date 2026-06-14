import Link from 'next/link';
import { Video, Metrics, RetentionShape } from '@/lib/types';
import { getVideos, getLatestMetrics } from '@/lib/supabase';

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
}

export default async function Page() {
  let videos: VideoWithMetrics[] = [];
  let stats: DashboardStats = {
    totalVideos: 0,
    avgViews: 0,
    avgWatchTime: 0,
    bestPillar: '',
  };
  let retentionBreakdown: RetentionBreakdown = {
    flat_hold: 0,
    early_drop: 0,
    rewatch_bump: 0,
    cliff: 0,
  };
  let error: string | null = null;

  try {
    const allVideos = await getVideos();

    // Fetch metrics for each video
    videos = await Promise.all(
      allVideos.map(async (video) => {
        const latest = await getLatestMetrics(video.id);
        return {
          ...video,
          latestMetrics: latest,
        };
      })
    );

    // Calculate stats
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

      // Best pillar by avg views
      const pillarViews: Record<string, number[]> = {};
      viewsWithData.forEach((v) => {
        const pillar = v.content_pillar || 'Unknown';
        if (!pillarViews[pillar]) pillarViews[pillar] = [];
        pillarViews[pillar].push(v.latestMetrics?.views || 0);
      });

      let bestPillar = '';
      let bestAvgViews = 0;
      Object.entries(pillarViews).forEach(([pillar, views]) => {
        const avgPillarViews = views.reduce((a, b) => a + b, 0) / views.length;
        if (avgPillarViews > bestAvgViews) {
          bestAvgViews = avgPillarViews;
          bestPillar = pillar;
        }
      });

      stats = {
        totalVideos: videos.length,
        avgViews: Math.round(avgViews),
        avgWatchTime: Math.round(avgWatchTime * 10) / 10,
        bestPillar,
      };

      // Retention breakdown
      videos.forEach((v) => {
        const shape = (v.latestMetrics?.retention_shape || 'flat_hold') as RetentionShape;
        retentionBreakdown[shape]++;
      });
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load dashboard';
  }

  if (error) {
    return (
      <main className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto">
          <div className="p-4 rounded border" style={{ backgroundColor: '#141414', borderColor: '#222', color: '#ef4444' }}>
            Error: {error}
          </div>
        </div>
      </main>
    );
  }

  const recentVideos = videos.slice(0, 10);
  const topByWatchTime = [...videos]
    .sort((a, b) => (b.latestMetrics?.avg_watch_time_seconds || 0) - (a.latestMetrics?.avg_watch_time_seconds || 0))
    .slice(0, 5);

  const retentionShapeColors: Record<RetentionShape, string> = {
    flat_hold: '#6b7280',
    early_drop: '#ef4444',
    rewatch_bump: '#3b82f6',
    cliff: '#f97316',
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>

        {/* Summary Cards */}
        {videos.length === 0 ? (
          <div className="p-10 rounded-lg border text-center" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
            <p className="text-gray-300 text-lg mb-4">No videos logged yet.</p>
            <Link
              href="/library/add"
              className="inline-block px-5 py-2.5 rounded-md font-semibold text-white text-sm transition hover:opacity-90"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Add your first video →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Videos */}
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Total Videos</p>
                <p className="text-3xl font-bold text-white">{stats.totalVideos}</p>
              </div>

              {/* Avg Views */}
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Avg Views</p>
                <p className="text-3xl font-bold text-white">{stats.avgViews.toLocaleString()}</p>
              </div>

              {/* Avg Watch Time */}
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Avg Watch Time</p>
                <p className="text-3xl font-bold text-white">{stats.avgWatchTime}s</p>
              </div>

              {/* Best Pillar */}
              <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-2">Best Content Pillar</p>
                <p className="text-3xl font-bold" style={{ color: '#3b82f6' }}>
                  {stats.bestPillar || '—'}
                </p>
              </div>
            </div>

            {/* Retention Breakdown */}
            <div className="p-6 rounded border mb-8" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
              <h2 className="text-lg font-semibold text-white mb-4">Retention Shape Breakdown</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries(retentionBreakdown).map(([shape, count]) => (
                  <div
                    key={shape}
                    className="px-3 py-2 rounded text-white text-sm font-medium"
                    style={{ backgroundColor: retentionShapeColors[shape as RetentionShape] }}
                  >
                    {shape.replace(/_/g, ' ')} <span className="ml-2 font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Videos Table */}
            <div className="p-6 rounded border mb-8" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
              <h2 className="text-lg font-semibold text-white mb-4">Recent Videos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottomColor: '#2a2a2a' }} className="border-b">
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wide">Hook</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wide">Pillar</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wide">Views</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wide">Watch Time (s)</th>
                      <th className="text-left py-3 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wide">Retention Shape</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentVideos.map((video) => (
                      <tr
                        key={video.id}
                        style={{ borderBottomColor: '#2a2a2a' }}
                        className="border-b hover:opacity-75 transition"
                      >
                        <td className="py-3 px-4">
                          <Link href={`/video/${video.id}`} style={{ color: '#3b82f6' }} className="hover:underline">
                            {video.hook.substring(0, 50)}...
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-100">{video.content_pillar}</td>
                        <td className="py-3 px-4 text-right text-gray-100">
                          {(video.latestMetrics?.views || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-100">
                          {video.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{
                              backgroundColor: retentionShapeColors[
                                (video.latestMetrics?.retention_shape || 'flat_hold') as RetentionShape
                              ],
                            }}
                          >
                            {(video.latestMetrics?.retention_shape || 'flat_hold').replace(/_/g, ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 5 by Watch Time */}
            <div className="p-6 rounded border" style={{ backgroundColor: '#141414', borderColor: '#2a2a2a' }}>
              <h2 className="text-lg font-semibold text-white mb-4">Top 5 by Watch Time</h2>
              <ol className="space-y-3">
                {topByWatchTime.map((video, idx) => (
                  <li key={video.id} className="flex items-start gap-4">
                    <span className="text-2xl font-bold" style={{ color: '#3b82f6' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <Link href={`/video/${video.id}`} style={{ color: '#3b82f6' }} className="hover:underline font-medium">
                        {video.hook}
                      </Link>
                      <p className="text-gray-300 text-sm mt-1">
                        {video.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '0'}s avg watch time
                      </p>
                    </div>
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
