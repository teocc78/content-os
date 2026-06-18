import Link from 'next/link';
import { getVideos, getLatestMetrics } from '@/lib/supabase';
import { Video, Metrics, RetentionShape } from '@/lib/types';
import { LibraryFilters } from './filters';

interface VideoWithMetrics extends Video {
  latestMetrics: Metrics | null;
}

async function LibraryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  let videos: VideoWithMetrics[] = [];
  let pillars: string[] = [];
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

    // Extract unique pillars
    pillars = Array.from(new Set(videos.map((v) => v.content_pillar).filter((p): p is string => !!p))).sort();

    // Apply filters
    const pillarFilter = searchParams.pillar as string | undefined;
    const retentionFilter = searchParams.retention as string | undefined;
    const sortBy = (searchParams.sort as string) || 'newest';

    if (pillarFilter) {
      videos = videos.filter((v) => v.content_pillar === pillarFilter);
    }

    if (retentionFilter && retentionFilter !== 'all') {
      videos = videos.filter((v) => v.latestMetrics?.retention_shape === retentionFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case 'views':
        videos.sort((a, b) => (b.latestMetrics?.views || 0) - (a.latestMetrics?.views || 0));
        break;
      case 'watch_time':
        videos.sort(
          (a, b) =>
            (b.latestMetrics?.avg_watch_time_seconds || 0) -
            (a.latestMetrics?.avg_watch_time_seconds || 0)
        );
        break;
      case 'saves':
        videos.sort((a, b) => (b.latestMetrics?.shares || 0) - (a.latestMetrics?.shares || 0));
        break;
      case 'newest':
      default:
        videos.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load library';
  }

  const retentionShapeColors: Record<RetentionShape, string> = {
    flat_hold: '#22c55e',
    early_drop: '#eab308',
    rewatch_bump: '#3b82f6',
    cliff: '#ef4444',
    unknown: '#6b7280',
  };

  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Video Library</h1>
          <Link
            href="/library/add"
            className="px-4 py-2 rounded font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: '#3b82f6' }}
          >
            + Add Video
          </Link>
        </div>

        {error ? (
          <div
            className="p-4 rounded border"
            style={{ backgroundColor: '#141414', borderColor: '#222', color: '#ef4444' }}
          >
            Error: {error}
          </div>
        ) : (
          <>
            <LibraryFilters pillars={pillars} />

            {videos.length === 0 ? (
              <div
                className="p-8 rounded border text-center"
                style={{ backgroundColor: '#141414', borderColor: '#222' }}
              >
                <p className="text-gray-400 text-lg">No videos found. Add your first video →</p>
              </div>
            ) : (
              <div
                className="rounded border overflow-hidden"
                style={{ backgroundColor: '#141414', borderColor: '#222' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: '#222' }} className="border-b">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Hook</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Pillar</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Views</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">Saves</th>
                        <th className="text-right py-3 px-4 text-gray-400 font-medium">
                          Watch Time (s)
                        </th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Retention</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Posted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video, idx) => (
                        <tr
                          key={video.id}
                          style={{ borderBottomColor: '#222' }}
                          className="border-b hover:opacity-75 transition cursor-pointer"
                          onClick={() => {
                            window.location.href = `/video/${video.id}`;
                          }}
                        >
                          <td className="py-3 px-4 text-gray-400">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span style={{ color: '#3b82f6' }} className="font-medium">
                              {(video.hook || video.title || video.instagram_reel_id || 'Untitled').substring(0, 60)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{video.content_pillar}</td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {(video.latestMetrics?.views || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {(video.latestMetrics?.shares || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-300">
                            {video.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="px-2 py-1 rounded text-xs text-white font-medium inline-block"
                              style={{
                                backgroundColor: retentionShapeColors[
                                  (video.latestMetrics?.retention_shape || 'flat_hold') as RetentionShape
                                ],
                              }}
                            >
                              {(video.latestMetrics?.retention_shape || 'flat_hold').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(video.posted_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default LibraryPage;
