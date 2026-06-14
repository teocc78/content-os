export interface Video {
  id: string;
  transcript: string;
  hook: string;
  captions: string;
  content_pillar: string;
  embedding: number[];
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export type RetentionShape = 'flat_hold' | 'early_drop' | 'rewatch_bump' | 'cliff';

export interface Metrics {
  id: string;
  video_id: string;
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  retention: number;
  retention_shape?: RetentionShape;
  retention_screenshot_url?: string;
  plays?: number;
  accounts_reached?: number;
  saves?: number;
  avg_watch_time_seconds?: number;
  created_at: string;
  updated_at: string;
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
