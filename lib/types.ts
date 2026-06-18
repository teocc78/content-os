export interface Video {
  id: string;
  instagram_reel_id?: string | null;
  title?: string | null;
  transcript?: string | null;
  hook?: string | null;
  on_screen_caption?: string | null;
  below_caption?: string | null;
  content_pillar?: string | null;
  embedding?: number[] | null;
  posted_at: string;
  created_at: string;
}

export type RetentionShape = 'flat_hold' | 'early_drop' | 'rewatch_bump' | 'cliff' | 'unknown';

export interface Metrics {
  id: string;
  video_id: string;
  captured_at: string;
  views?: number | null;
  plays?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  accounts_reached?: number | null;
  avg_watch_time_seconds?: number | null;
  retention_shape?: RetentionShape | null;
  retention_drop_point_pct?: number | null;
  created_at?: string;
}

export interface HookGrade {
  id: string;
  video_id: string;
  score: number;
  feedback: string;
  rewrite_suggestion: string;
  created_at: string;
  updated_at: string;
}
