import { NextRequest, NextResponse } from 'next/server';

interface TranscriptResponse {
  transcript: string;
  hook: string;
}

interface TranscriptError {
  error: string;
}

function extractHook(transcript: string): string {
  if (!transcript) return '';

  // Try to get first sentence (ends with . ! or ?)
  const sentenceMatch = transcript.match(/^[^.!?]*[.!?]/);
  if (sentenceMatch) {
    const firstSentence = sentenceMatch[0].trim();
    if (firstSentence.length > 0) {
      return firstSentence;
    }
  }

  // Fallback: first 15 words
  const words = transcript.split(/\s+/).slice(0, 15);
  return words.join(' ');
}

export async function POST(request: NextRequest): Promise<NextResponse<TranscriptResponse | TranscriptError>> {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
    }

    // Extract shortcode from Instagram URL
    const shortcodeMatch = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    if (!shortcodeMatch) {
      return NextResponse.json({ error: 'Invalid Instagram URL format' }, { status: 400 });
    }

    const shortcode = shortcodeMatch[1];

    // Call TokScript or transcript service
    // For now, we'll use a placeholder that can be configured with your TokScript endpoint
    const tokScriptUrl = process.env.TOKSCRIPT_API_URL || 'https://api.tokscript.com/transcript';

    const transcriptResponse = await fetch(tokScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.TOKSCRIPT_API_KEY && { 'Authorization': `Bearer ${process.env.TOKSCRIPT_API_KEY}` }),
      },
      body: JSON.stringify({
        url,
        shortcode,
        platform: 'instagram',
      }),
    });

    if (!transcriptResponse.ok) {
      console.error('TokScript API error:', transcriptResponse.status, transcriptResponse.statusText);
      return NextResponse.json({ error: 'Could not fetch transcript' }, { status: 400 });
    }

    const data = await transcriptResponse.json();
    const transcript = data.transcript || data.text || '';

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript found in response' }, { status: 400 });
    }

    // Extract hook from transcript
    const hook = extractHook(transcript);

    return NextResponse.json({
      transcript: transcript.trim(),
      hook: hook.trim(),
    });
  } catch (error) {
    console.error('Transcribe error:', error);
    return NextResponse.json({ error: 'Could not fetch transcript' }, { status: 400 });
  }
}
