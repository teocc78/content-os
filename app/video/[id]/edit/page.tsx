'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const PILLARS = ['health', 'wealth', 'AI', 'mindset', 'other'];

interface VideoData {
  id: string;
  hook: string;
  transcript: string;
  captions: string;
  content_pillar: string;
  posted_at: string;
}

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const videoId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<VideoData>({
    id: '',
    hook: '',
    transcript: '',
    captions: '',
    content_pillar: 'health',
    posted_at: '',
  });

  useEffect(() => {
    async function loadVideo() {
      try {
        setLoading(true);
        // Fetch video data via API
        const res = await fetch(`/api/videos/${videoId}`);
        if (!res.ok) throw new Error('Failed to load video');
        const video = await res.json();
        setFormData(video);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      loadVideo();
    }
  }, [videoId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hook: formData.hook,
          transcript: formData.transcript,
          captions: formData.captions,
          content_pillar: formData.content_pillar,
          posted_at: formData.posted_at,
        }),
      });

      if (!res.ok) throw new Error('Failed to update video');

      router.push(`/video/${videoId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl mx-auto text-white">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="p-4 rounded border"
            style={{ backgroundColor: '#141414', borderColor: '#ef4444', color: '#ef4444' }}
          >
            {error}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Video</h1>
          <Link href={`/video/${videoId}`} style={{ color: '#3b82f6' }} className="hover:underline">
            ← Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 rounded border"
          style={{ backgroundColor: '#141414', borderColor: '#222' }}
        >
          {/* Hook */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Hook</label>
            <input
              type="text"
              value={formData.hook}
              onChange={(e) => handleInputChange('hook', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Content Pillar */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Content Pillar</label>
            <select
              value={formData.content_pillar}
              onChange={(e) => handleInputChange('content_pillar', e.target.value)}
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

          {/* Posted Date */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Posted Date</label>
            <input
              type="date"
              value={formData.posted_at.split('T')[0]}
              onChange={(e) => handleInputChange('posted_at', new Date(e.target.value).toISOString())}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Transcript */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Transcript</label>
            <textarea
              value={formData.transcript}
              onChange={(e) => handleInputChange('transcript', e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* On-Screen Caption */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">On-Screen Caption</label>
            <input
              type="text"
              value={formData.captions}
              onChange={(e) => handleInputChange('captions', e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
              style={{ borderColor: '#333' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}
