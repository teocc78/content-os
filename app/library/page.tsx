import Link from 'next/link';
import { getVideos, getLatestMetrics } from '@/lib/supabase';
import { Video, Metrics, RetentionShape } from '@/lib/types';
import { LibraryFilters } from './filters';
import { Badge, RETENTION_MAP } from '@/components/Badge';

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

    videos = await Promise.all(
      allVideos.map(async (video) => {
        const latest = await getLatestMetrics(video.id);
        return { ...video, latestMetrics: latest };
      })
    );

    pillars = Array.from(new Set(videos.map((v) => v.content_pillar).filter((p): p is string => !!p))).sort();

    const pillarFilter = searchParams.pillar as string | undefined;
    const retentionFilter = searchParams.retention as string | undefined;
    const sortBy = (searchParams.sort as string) || 'newest';

    if (pillarFilter) {
      videos = videos.filter((v) => v.content_pillar === pillarFilter);
    }
    if (retentionFilter && retentionFilter !== 'all') {
      videos = videos.filter((v) => v.latestMetrics?.retention_shape === retentionFilter);
    }

    switch (sortBy) {
      case 'views':
        videos.sort((a, b) => (b.latestMetrics?.views || 0) - (a.latestMetrics?.views || 0));
        break;
      case 'watch_time':
        videos.sort((a, b) => (b.latestMetrics?.avg_watch_time_seconds || 0) - (a.latestMetrics?.avg_watch_time_seconds || 0));
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

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8" style={{ backgroundColor: 'var(--surface-app)' }}>
      <div className="max-w-7xl mx-auto md:pb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-strong)' }}>
            Video Library
          </h1>
          <Link
            href="/library/add"
            className="px-3 py-1.5 rounded-md text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            + Add Video
          </Link>
        </div>

        {error ? (
          <div
            className="p-4 rounded-lg border text-sm"
            style={{ backgroundColor: 'var(--critical-tint)', borderColor: 'var(--critical)', color: 'var(--critical)' }}
          >
            Error: {error}
          </div>
        ) : (
          <>
            <LibraryFilters pillars={pillars} />

            {videos.length === 0 ? (
              <div
                className="p-12 rounded-xl border text-center"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  No videos found. Add your first video →
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottomColor: 'var(--border-subtle)', backgroundColor: 'var(--surface-sunken)' }} className="border-b">
                        <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>#</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Hook</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pillar</th>
                        <th className="text-right py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Views</th>
                        <th className="text-right py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Saves</th>
                        <th className="text-right py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Watch (s)</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Retention</th>
                        <th className="text-left py-2.5 px-4 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Posted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.map((video, idx) => (
                        <tr
                          key={video.id}
                          style={{ borderBottomColor: 'var(--border-subtle)' }}
                          className="border-b last:border-0 hover:bg-[var(--surface-hover)] transition-colors"
                        >
                          <td className="py-3 px-4 tabular" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                          <td className="py-3 px-4">
                            <Link
                              href={`/video/${video.id}`}
                              className="font-medium hover:underline"
                              style={{ color: 'var(--accent-text)' }}
                            >
                              {(video.hook || video.title || video.instagram_reel_id || 'Untitled').substring(0, 60)}
                            </Link>
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--text-body)' }}>{video.content_pillar || '—'}</td>
                          <td className="py-3 px-4 text-right tabular" style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
                            {(video.latestMetrics?.views || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right tabular" style={{ color: 'var(--text-body)', fontFamily: 'var(--font-mono)' }}>
                            {(video.latestMetrics?.shares || 0).toLocaleString()}
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
                          <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
