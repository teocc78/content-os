# Content OS

## What This Is
A personal Instagram content analytics dashboard. Tracks videos, transcripts, captions, and performance metrics. Has an AI chat layer for querying content patterns.

## Stack
- Next.js 14 App Router + TypeScript + Tailwind
- Supabase (Postgres + pgvector) for database
- Gemini 1.5 Flash for AI features
- Deployed on Vercel

## Environment Variables Needed
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- GEMINI_API_KEY

## Key Commands
- `npm run dev` — start dev server
- `npm run build` — build for production
- `npm run lint` — lint

## Database Tables
- videos — stores transcript, hook, captions, content pillar, embedding
- metrics — daily scraped Instagram metrics + retention data per video
- hook_grades — AI scores and rewrite suggestions per hook

## Code Conventions
- All API routes go in /app/api/
- All database queries go in /lib/supabase.ts
- All AI calls go in /lib/ai.ts
- Use server components by default, client components only when needed (forms, charts)
- Always handle loading and error states
