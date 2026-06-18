import { GoogleGenerativeAI } from '@google/generative-ai';
import { Video } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
const chatModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Generate embedding for text
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

// Grade a hook against top performers with detailed dimensions
export async function gradeHook(
  hookDraft: string,
  topPerformerHooks: string[]
): Promise<{
  specificity_score: number;
  declarative_score: number;
  payoff_frontload_score: number;
  overall_score: number;
  weaknesses: string[];
  rewrites: string[];
}> {
  const topHooksText = topPerformerHooks.map((hook, idx) => `${idx + 1}. "${hook}"`).join('\n');

  const prompt = `You are an expert Instagram content strategist. Grade this hook across multiple dimensions and provide rewrite suggestions based on top performing hooks.

Hook to grade: "${hookDraft}"

Top performing hooks for reference:
${topHooksText}

Evaluate the hook on these dimensions (each 1-10):
1. Specificity: How specific and concrete is the hook? (Vague hooks score low, specific ones score high)
2. Declarative: How much does it declare value/benefit upfront? (Questions/teasers score lower than value statements)
3. Payoff Frontload: How much is the emotional payoff concentrated at the beginning? (Delayed payoffs score lower)

Also provide:
- 2-3 specific weaknesses as bullet points
- 3 rewritten versions of the hook that improve on the original

Respond with ONLY a valid JSON object (no markdown, no extra text) with these exact fields:
{
  "specificity_score": <number 1-10>,
  "declarative_score": <number 1-10>,
  "payoff_frontload_score": <number 1-10>,
  "overall_score": <number 1-10>,
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "rewrites": ["rewrite 1", "rewrite 2", "rewrite 3"]
}`;

  const response = await chatModel.generateContent(prompt);
  const text = response.response.text();

  // Parse JSON response
  const parsed = JSON.parse(text);
  return {
    specificity_score: Math.max(1, Math.min(10, parsed.specificity_score)),
    declarative_score: Math.max(1, Math.min(10, parsed.declarative_score)),
    payoff_frontload_score: Math.max(1, Math.min(10, parsed.payoff_frontload_score)),
    overall_score: Math.max(1, Math.min(10, parsed.overall_score)),
    weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 3) : [],
    rewrites: Array.isArray(parsed.rewrites) ? parsed.rewrites.slice(0, 3) : [],
  };
}

// Query content library with context
export async function queryContentLibrary(
  question: string,
  relevantVideos: Video[]
): Promise<string> {
  const videoContext = relevantVideos
    .map(
      (video) =>
        `- Title/Hook: "${video.hook || video.title || 'Untitled'}"\n  Pillar: ${video.content_pillar || 'Unknown'}\n  Transcript preview: ${(video.transcript || '').substring(0, 200)}...`
    )
    .join('\n\n');

  const prompt = `You are an Instagram content analyst. Answer the user's question based on the provided video library data.

User question: "${question}"

Relevant videos from library:
${videoContext}

Provide a helpful, concise answer that references specific videos and their characteristics. Focus on actionable insights.`;

  const response = await chatModel.generateContent(prompt);
  return response.response.text();
}
