'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clapperboard, Sparkles, MessageSquareText } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/library', label: 'Library', icon: Clapperboard },
  { href: '/grade', label: 'Grade', icon: Sparkles },
  { href: '/chat', label: 'Chat', icon: MessageSquareText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [videoCount, setVideoCount] = useState<number | null>(null);

  useEffect(() => {
    async function getVideoCount() {
      try {
        const res = await fetch('/api/videos/count');
        if (res.ok) {
          const data = await res.json();
          setVideoCount(data.count);
        }
      } catch {
        // silently fail — count is non-critical
      }
    }
    getVideoCount();
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col shrink-0 border-r"
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Logo lockup */}
        <div
          className="flex items-center gap-3 px-4 py-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-md text-sm font-bold shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
          >
            C
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--text-strong)' }}
          >
            Content OS
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--accent-tint)' : 'transparent',
                  color: active ? 'var(--accent-text)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    e.currentTarget.style.color = 'var(--text-body)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold shrink-0"
            style={{ backgroundColor: 'var(--surface-sunken)', color: 'var(--text-body)' }}
          >
            TC
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-body)' }}>
              @teocreates
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              {videoCount !== null
                ? `${videoCount} video${videoCount !== 1 ? 's' : ''}`
                : '—'}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{
          backgroundColor: 'var(--surface-card)',
          borderColor: 'var(--border-subtle)',
          height: '56px',
        }}
      >
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs font-medium transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
