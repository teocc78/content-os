import { generateEmbedding, queryContentLibrary } from '@/lib/ai';
import { searchVideosByEmbedding, getLatestMetrics } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid message' }, { status: 400 });
    }

    // Generate embedding of the user message
    const embedding = await generateEmbedding(message);

    // Search for semantically relevant videos
    const relevantVideos = await searchVideosByEmbedding(embedding, 8);

    // Fetch latest metrics for each video
    const videosWithMetrics = await Promise.all(
      relevantVideos.map(async (video) => {
        const metrics = await getLatestMetrics(video.id);
        return {
          ...video,
          latestMetrics: metrics,
        };
      })
    );

    // Build context string
    const contextString = videosWithMetrics
      .map(
        (v) =>
          `- Hook: "${v.hook || v.title || 'Untitled'}"\n  Pillar: ${v.content_pillar || 'Unknown'}\n  Transcript: ${(v.transcript || '').substring(0, 500)}${(v.transcript || '').length > 500 ? '...' : ''}\n  Views: ${v.latestMetrics?.views || 0}, Watch Time: ${v.latestMetrics?.avg_watch_time_seconds?.toFixed(1) || '0'}s, Saves: ${v.latestMetrics?.saves || 0}`
      )
      .join('\n\n');

    // Use queryContentLibrary to get the response
    const response = await queryContentLibrary(message, relevantVideos);

    return NextResponse.json({ response, context: contextString });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process message' },
      { status: 500 }
    );
  }
}
