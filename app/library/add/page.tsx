'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PILLARS = ['health', 'wealth', 'AI', 'mindset', 'other'];

export default function AddVideoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    instagramUrl: '',
    shortcode: '',
    postedDate: new Date().toISOString().split('T')[0],
    title: '',
    contentPillar: 'health',
    transcript: '',
    hook: '',
    onScreenCaption: '',
    belowCaption: '',
  });
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const extractShortcode = (url: string): string => {
    const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  const fetchTranscript = async (url: string) => {
    if (!url || !url.includes('instagram')) {
      setTranscriptError('Please enter a valid Instagram URL');
      return;
    }

    setTranscriptLoading(true);
    setTranscriptError(null);

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Could not fetch transcript');
      }

      const data = await res.json();
      handleInputChange('transcript', data.transcript);
      handleInputChange('hook', data.hook);
      setTranscriptError(null);
    } catch (err) {
      setTranscriptError(err instanceof Error ? err.message : 'Failed to fetch transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleUrlBlur = () => {
    const shortcode = extractShortcode(formData.instagramUrl);
    handleInputChange('shortcode', shortcode);

    // Auto-fetch transcript if URL is valid
    if (shortcode) {
      fetchTranscript(formData.instagramUrl);
    }
  };

  const handleTranscriptChange = (value: string) => {
    handleInputChange('transcript', value);
    // Auto-populate hook from first line if hook is empty
    if (!formData.hook && value) {
      const firstLine = value.split('\n')[0].trim();
      handleInputChange('hook', firstLine);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.transcript || !formData.transcript.trim()) {
        throw new Error('Transcript is required');
      }
      if (!formData.hook || !formData.hook.trim()) {
        throw new Error('Hook is required');
      }

      // Validate Instagram URL format if provided
      if (formData.instagramUrl && !formData.shortcode) {
        throw new Error('Invalid Instagram URL format. Expected: instagram.com/reel/[shortcode]');
      }

      // Generate embedding
      const embeddingRes = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${formData.hook} ${formData.transcript}`,
        }),
      });

      if (!embeddingRes.ok) {
        throw new Error('Failed to generate embedding');
      }

      const { embedding } = await embeddingRes.json();

      // Create video record
      const createRes = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramUrl: formData.instagramUrl,
          shortcode: formData.shortcode,
          postedDate: formData.postedDate,
          title: formData.title,
          contentPillar: formData.contentPillar,
          transcript: formData.transcript,
          hook: formData.hook,
          onScreenCaption: formData.onScreenCaption,
          belowCaption: formData.belowCaption,
          embedding,
        }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create video');
      }

      const { id } = await createRes.json();
      router.push(`/video/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Add Video</h1>

        {error && (
          <div
            className="p-4 rounded border mb-6"
            style={{ backgroundColor: '#141414', borderColor: '#ef4444', color: '#ef4444' }}
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 rounded border"
          style={{ backgroundColor: '#141414', borderColor: '#222' }}
        >
          {/* Instagram URL */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Instagram Reel URL</label>
            <input
              type="text"
              placeholder="https://instagram.com/reel/..."
              value={formData.instagramUrl}
              onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
              onBlur={handleUrlBlur}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: transcriptError ? '#ef4444' : '#333' }}
            />
            {transcriptError && (
              <p className="text-xs text-red-400 mt-1">{transcriptError}</p>
            )}
            {formData.shortcode && !transcriptError && (
              <p className="text-xs text-gray-500 mt-1">Shortcode: {formData.shortcode}</p>
            )}
          </div>

          {/* Posted Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Posted Date</label>
            <input
              type="date"
              value={formData.postedDate}
              onChange={(e) => handleInputChange('postedDate', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Internal Title / Label
            </label>
            <input
              type="text"
              placeholder="e.g., Morning Routine Ep 5"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Content Pillar */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content Pillar</label>
            <select
              value={formData.contentPillar}
              onChange={(e) => handleInputChange('contentPillar', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            >
              {PILLARS.map((pillar) => (
                <option key={pillar} value={pillar}>
                  {pillar}
                </option>
              ))}
            </select>
          </div>

          {/* Transcript */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">Transcript</label>
              {formData.instagramUrl && (
                <button
                  type="button"
                  onClick={() => fetchTranscript(formData.instagramUrl)}
                  disabled={transcriptLoading}
                  className="text-xs px-2 py-1 rounded text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#3b82f6' }}
                >
                  {transcriptLoading ? 'Fetching...' : 'Re-fetch'}
                </button>
              )}
            </div>
            {transcriptLoading && (
              <p className="text-xs text-gray-400 mb-2">Fetching transcript...</p>
            )}
            <textarea
              placeholder="Full video transcript..."
              value={formData.transcript}
              onChange={(e) => handleTranscriptChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
              disabled={transcriptLoading}
            />
          </div>

          {/* Hook */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Hook (First 3 seconds)
            </label>
            <input
              type="text"
              placeholder="Auto-populated from first line of transcript if left blank"
              value={formData.hook}
              onChange={(e) => handleInputChange('hook', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* On-Screen Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">On-Screen Caption</label>
            <input
              type="text"
              placeholder="Text overlaid on video..."
              value={formData.onScreenCaption}
              onChange={(e) => handleInputChange('onScreenCaption', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Below-Video Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Below-Video Caption
            </label>
            <textarea
              placeholder="Caption text below the video..."
              value={formData.belowCaption}
              onChange={(e) => handleInputChange('belowCaption', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {loading ? 'Adding video...' : 'Add Video'}
          </button>
        </form>
      </div>
    </main>
  );
}
