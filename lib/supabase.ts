import { createClient } from '@supabase/supabase-js';
import { Video, Metrics, HookGrade } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Server-only key — bypasses RLS, never exposed to the browser
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client (anon key) — for client-side / public reads
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Admin client (service role key) — for all server-side data queries
const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || supabaseAnonKey || 'placeholder-key'
);

// Video queries
export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select('*')
    .order('posted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVideoById(id: string): Promise<Video & { metrics?: Metrics[]; hook_grade?: HookGrade | null }> {
  const { data: video, error: videoError } = await supabaseAdmin
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();

  if (videoError) throw videoError;

  const { data: metrics, error: metricsError } = await supabaseAdmin
    .from('metrics')
    .select('*')
    .eq('video_id', id)
    .order('captured_at', { ascending: false });

  if (metricsError) throw metricsError;

  const { data: hookGrade, error: hookError } = await supabaseAdmin
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

export async function createVideo(data: Omit<Video, 'id' | 'created_at'>): Promise<Video> {
  const { data: video, error } = await supabaseAdmin
    .from('videos')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return video;
}

export async function updateVideo(id: string, data: Partial<Omit<Video, 'id' | 'created_at'>>): Promise<Video> {
  const { data: video, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
    .from('metrics')
    .select('*')
    .eq('video_id', videoId)
    .order('captured_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLatestMetrics(videoId: string): Promise<Metrics | null> {
  const { data, error } = await supabaseAdmin
    .from('metrics')
    .select('*')
    .eq('video_id', videoId)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function insertMetrics(data: Omit<Metrics, 'id' | 'created_at'>): Promise<Metrics> {
  const { data: metrics, error } = await supabaseAdmin
    .from('metrics')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return metrics;
}

// Top videos queries
export async function getTopVideosByWatchTime(limit: number = 10): Promise<(Video & { latest_metrics: Metrics | null })[]> {
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select(
      `
      *,
      metrics!inner(
        id,
        avg_watch_time_seconds,
        captured_at
      )
    `
    )
    .order('avg_watch_time_seconds', { ascending: false, referencedTable: 'metrics' })
    .limit(limit);

  if (error) throw error;

  const videosWithMetrics = await Promise.all(
    (data || []).map(async (video) => {
      const latest = await getLatestMetrics(video.id);
      return { ...video, latest_metrics: latest };
    })
  );

  return videosWithMetrics;
}

export async function getTopVideosByViews(limit: number = 10): Promise<(Video & { latest_metrics: Metrics | null })[]> {
  const { data, error } = await supabaseAdmin
    .from('videos')
    .select(
      `
      *,
      metrics!inner(
        id,
        views,
        captured_at
      )
    `
    )
    .order('views', { ascending: false, referencedTable: 'metrics' })
    .limit(limit);

  if (error) throw error;

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
  const { data, error } = await supabaseAdmin
    .rpc('match_videos', {
      query_embedding: embedding,
      match_count: limit,
    });

  if (error) throw error;
  return data || [];
}
