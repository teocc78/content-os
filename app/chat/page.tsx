'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_CHIPS = [
  'Which of my hooks had the best watch time?',
  'What content pillar performs best for saves?',
  'What do my flat_hold retention videos have in common?',
  'Compare my health vs wealth content performance',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string = input) => {
    if (!text.trim()) return;

    setError(null);
    const userMessage = text.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the user message if the API call failed
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: '#222' }}>
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Content Intelligence</h1>
          <Link href="/" style={{ color: '#3b82f6' }} className="hover:underline">
            ← Back
          </Link>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-96 text-center">
              <h2 className="text-2xl font-semibold text-white mb-4">Ask about your content</h2>
              <p className="text-gray-400 mb-8">Get insights on what performs best and patterns in your library</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {STARTER_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendMessage(chip)}
                    className="p-4 rounded border text-left transition hover:border-blue-500"
                    style={{ backgroundColor: '#141414', borderColor: '#222' }}
                  >
                    <p className="text-sm text-gray-300">{chip}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="p-4 rounded max-w-2xl"
                    style={{
                      backgroundColor: msg.role === 'user' ? '#3b82f6' : '#141414',
                      borderColor: msg.role === 'user' ? '#3b82f6' : '#222',
                      color: msg.role === 'user' ? '#fff' : '#e5e7eb',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none text-sm">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                            code: ({ node, inline: inlineCode, ...props }: any) =>
                              inlineCode ? (
                                <code className="bg-gray-800 px-1 py-0.5 rounded text-xs" {...props} />
                              ) : (
                                <code className="block bg-gray-800 p-2 rounded text-xs overflow-x-auto" {...props} />
                              ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="p-4 rounded"
                    style={{ backgroundColor: '#141414', borderColor: '#222' }}
                  >
                    <p className="text-sm text-gray-400">Searching your content library...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div
                    className="p-4 rounded text-sm"
                    style={{ backgroundColor: '#141414', borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    Error: {error}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t p-6" style={{ borderColor: '#222' }}>
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your content..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded bg-gray-900 text-white border placeholder-gray-500"
              style={{ borderColor: '#333' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 rounded font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#3b82f6' }}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
