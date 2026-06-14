import { createClient } from '@supabase/supabase-js';
import { Video, Metrics, HookGrade } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize with placeholder values if not available (for build time)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Video queries
export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVideoById(id: string): Promise<Video & { metrics?: Metrics[]; hook_grade?: HookGrade | null }> {
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (videoError) throw videoError;

  const { data: metrics, error: metricsError } = await supabase
    .from('metrics')
    .select('*')
    .eq('video_id', id)
    .order('date', { ascending: false });

  if (metricsError) throw metricsError;

  const { data: hookGrade, error: hookError } = await supabase
    .from('hook_grades')
    .select('*')
    .eq('video_id', id)
    .single();

  if (hookError && hookError.code !== 'PGRST116') throw hookError; // PGRST116 = no rows returned

  return {
    ...video,
    metrics: metrics || [],
    hook_grade: hookGrade || null,
  };
}

export async function createVideo(data: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
  const { data: video, error } = await supabase
    .from('videos')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return video;
}

export async function updateVideo(id: string, data: Partial<Omit<Video, 'id' | 'created_at' | 'updated_at'>>): Promise<Video> {
  const { data: video, error } = await supabase
    .from('videos')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return video;
}

// Metrics queries
export async function getMetricsForVideo(videoId: string): Promise<Metrics[]> {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('video_id', videoId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLatestMetrics(videoId: string): Promise<Metrics | null> {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('video_id', videoId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function insertMetrics(data: Omit<Metrics, 'id' | 'created_at' | 'updated_at'>): Promise<Metrics> {
  const { data: metrics, error } = await supabase
    .from('metrics')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return metrics;
}

// Top videos queries
export async function getTopVideosByWatchTime(limit: number = 10): Promise<(Video & { latest_metrics: Metrics | null })[]> {
  const { data, error } = await supabase
    .from('videos')
    .select(
      `
      *,
      metrics!inner(
        id,
        avg_watch_time_seconds,
        date,
        created_at
      )
    `
    )
    .order('metrics(avg_watch_time_seconds)', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Fetch latest metrics for each video
  const videosWithMetrics = await Promise.all(
    (data || []).map(async (video) => {
      const latest = await getLatestMetrics(video.id);
      return { ...video, latest_metrics: latest };
    })
  );

  return videosWithMetrics;
}

export async function getTopVideosByViews(limit: number = 10): Promise<(Video & { latest_metrics: Metrics | null })[]> {
  const { data, error } = await supabase
    .from('videos')
    .select(
      `
      *,
      metrics!inner(
        id,
        views,
        date,
        created_at
      )
    `
    )
    .order('metrics(views)', { ascending: false })
    .limit(limit);

  if (error) throw error;

  // Fetch latest metrics for each video
  const videosWithMetrics = await Promise.all(
    (data || []).map(async (video) => {
      const latest = await getLatestMetrics(video.id);
      return { ...video, latest_metrics: latest };
    })
  );

  return videosWithMetrics;
}

// Vector similarity search
export async function searchVideosByEmbedding(embedding: number[], limit: number = 10): Promise<Video[]> {
  const { data, error } = await supabase
    .rpc('match_videos', {
      query_embedding: embedding,
      match_count: limit,
    });

  if (error) throw error;
  return data || [];
}
