# COWORK CAPTION SCRAPING ADD-ON

Add these steps to the existing daily automation, after Step 5B (TokScript transcript fetch).

## STEP 5C — Scrape on-screen caption and below-video caption

For each reel being processed:

### a) Chrome Navigation
The reel should already be open in Chrome from the metrics scrape.
If it is not, navigate to the reel URL: `instagram.com/reel/{SHORTCODE}/`

### b) BELOW-VIDEO CAPTION
Look at the text below the video in the reel post.
- This is the caption the creator wrote when posting
- It may have hashtags and line breaks
- Read the full caption text
- If there is a "more" link, tap it to expand the full caption first

### c) ON-SCREEN CAPTION
Play the video or scrub through it.
- Look for any bold text overlays, sticker text, or caption text that appears ON the video itself
- This is usually large text placed on top of the video by the creator
- Read what it says — it is typically the hook or a bold accusatory statement
- If there are multiple text overlays at different points, capture the first one that appears (usually in the first 2 seconds)
- If you cannot see on-screen text clearly, write "could not read"

### d) PATCH the video row in Supabase

Send a PATCH request with the captions you found:

```
PATCH {SUPABASE_URL}/rest/v1/videos?id=eq.{VIDEO_ID}
Headers:
  apikey: {SUPABASE_KEY}
  Content-Type: application/json
  Authorization: Bearer {JWT_TOKEN}

Body:
{
  "on_screen_caption": "{ON_SCREEN_TEXT}",
  "below_caption": "{BELOW_VIDEO_CAPTION}"
}
```

**Important:** Only overwrite these fields if they are currently null or empty.
If a field already has content, skip the PATCH for that field (the user may have manually edited it).

## NOTES

- **On-screen caption reading is best-effort.** Instagram reels play automatically so Chrome should be able to pause and read the frame
- **Below-video caption is reliable** — it is always visible as static text
- **Hashtags in the below-video caption are fine to include** — do not strip them
- This automation assumes you already have a Supabase client set up with proper authentication
