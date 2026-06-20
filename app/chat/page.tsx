'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, TrendingUp, PenLine, Clock, BarChart2, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_CHIPS = [
  { label: 'Best watch time hooks', icon: TrendingUp },
  { label: 'Top pillar for saves', icon: BarChart2 },
  { label: 'Flat hold patterns', icon: Clock },
  { label: 'Health vs wealth performance', icon: PenLine },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        body: JSON.stringify({ message: userMessage, history: messages }),
      });
      if (!res.ok) throw new Error('Failed to get response');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--surface-app)' }}>
      {/* Header band */}
      <div
        className="border-b px-6 py-4"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ backgroundColor: 'var(--accent-tint)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h1 className="text-sm font-semibold" style={{ color: 'var(--text-strong)' }}>
              Content Intelligence
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Ask about your content library
            </p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-80 text-center">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--accent-tint)' }}
              >
                <Sparkles size={22} style={{ color: 'var(--accent)' }} />
              </div>
              <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-strong)' }}>
                Ask about your content
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Discover patterns, compare pillars, and find what drives performance.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {STARTER_CHIPS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSendMessage(label)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition hover:opacity-80"
                    style={{
                      backgroundColor: 'var(--surface-card)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-body)',
                    }}
                  >
                    <Icon size={13} style={{ color: 'var(--accent)' }} />
                    {label}
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
                    className="px-4 py-3 rounded-2xl max-w-xl text-sm"
                    style={
                      msg.role === 'user'
                        ? { backgroundColor: 'var(--accent)', color: '#ffffff' }
                        : { backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose max-w-none text-sm">
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" style={{ color: 'var(--text-body)' }} {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: 'var(--text-strong)' }} {...props} />,
                            code: ({ node, inline: inlineCode, ...props }: any) =>
                              inlineCode ? (
                                <code className="px-1 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--text-body)' }} {...props} />
                              ) : (
                                <code className="block p-2 rounded text-xs overflow-x-auto" style={{ backgroundColor: 'var(--surface-sunken)' }} {...props} />
                              ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                  >
                    Searching your content library…
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <div
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'var(--critical-tint)', color: 'var(--critical)' }}
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

      {/* Input area */}
      <div
        className="border-t px-6 py-4"
        style={{ backgroundColor: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
      >
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your content…"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
              style={{
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--surface-sunken)',
                color: 'var(--text-body)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = 'var(--shadow-focus)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-full transition hover:opacity-90 disabled:opacity-40 shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Send size={16} color="#ffffff" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
