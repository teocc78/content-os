# Content OS Documentation

## Automation & Integration Guides

### Daily Automation Workflow

#### TokScript Transcript Fetching
- **File:** `cowork-caption-scrape-prompt.md` (Steps 5B-5C)
- **Purpose:** Automatically fetch Instagram reel transcripts and scrape on-screen/below-video captions
- **Tools:** TokScript API + Cowork (Chrome automation)
- **Output:** Populates transcript, hook, on_screen_caption, and below_caption fields in Supabase

### Setup & Configuration

#### Environment Variables
Required for transcript auto-fetch feature:
```
TOKSCRIPT_API_URL=https://api.tokscript.com/transcript
TOKSCRIPT_API_KEY=your_tokscript_api_key_here
```

#### Supabase Configuration
Ensure your videos table has these fields:
- `transcript` (text)
- `hook` (text)
- `on_screen_caption` (text, nullable)
- `below_caption` (text, nullable)

### API Endpoints

#### POST `/api/transcribe`
Auto-fetch transcript and hook from Instagram reel URL.

**Request:**
```json
{
  "url": "https://instagram.com/reel/ABC123def456/"
}
```

**Response (Success):**
```json
{
  "transcript": "Full video transcript text...",
  "hook": "First sentence or first 15 words of transcript"
}
```

**Response (Error):**
```json
{
  "error": "Could not fetch transcript"
}
```

---

## Feature Documentation

### Add Video Form
- Auto-fetches transcript when Instagram URL is entered and field loses focus
- Shows loading state while fetching
- Displays error message if fetch fails
- Includes "Re-fetch" button to manually trigger transcript refresh
- Both transcript and hook fields remain editable for manual corrections

### Caption Scraping (Cowork Automation)
See `cowork-caption-scrape-prompt.md` for detailed instructions on scraping on-screen and below-video captions using Cowork in Chrome.
