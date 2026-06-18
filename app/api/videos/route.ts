import { createVideo } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      instagramUrl,
      shortcode,
      postedDate,
      title,
      contentPillar,
      transcript,
      hook,
      onScreenCaption,
      belowCaption,
      embedding,
    } = body;

    // Validate required fields
    if (!transcript || !hook || !embedding) {
      return NextResponse.json(
        { error: 'Missing required fields: transcript, hook, embedding' },
        { status: 400 }
      );
    }

    // Create video record
    const video = await createVideo({
      transcript,
      hook,
      on_screen_caption: onScreenCaption || '',
      content_pillar: contentPillar || 'other',
      embedding,
      posted_at: new Date(postedDate).toISOString(),
    });

    return NextResponse.json({ id: video.id, video });
  } catch (error) {
    console.error('Video creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video' },
      { status: 500 }
    );
  }
}
