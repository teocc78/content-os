import { getVideoById, updateVideo } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);
    return NextResponse.json(video);
  } catch (error) {
    console.error('Video fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { hook, transcript, on_screen_caption, content_pillar, posted_at } = body;

    // Update video record
    const updated = await updateVideo(id, {
      hook,
      transcript,
      on_screen_caption,
      content_pillar,
      posted_at,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Video update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update video' },
      { status: 500 }
    );
  }
}
