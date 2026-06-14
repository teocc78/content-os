import { getVideos } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await getVideos();
    return NextResponse.json({ count: videos.length });
  } catch (error) {
    console.error('Video count error:', error);
    return NextResponse.json({ count: 0 });
  }
}
