import { gradeHook } from '@/lib/ai';
import { getTopVideosByWatchTime } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { hook } = await request.json();

    if (!hook || typeof hook !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid hook parameter' }, { status: 400 });
    }

    // Get top 15 videos by watch time
    const topVideos = await getTopVideosByWatchTime(15);
    const topHooks = topVideos.map((v) => v.hook).filter((h): h is string => !!h);

    // Grade the hook
    const gradeResult = await gradeHook(hook, topHooks);

    return NextResponse.json(gradeResult);
  } catch (error) {
    console.error('Hook grading error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to grade hook' },
      { status: 500 }
    );
  }
}
