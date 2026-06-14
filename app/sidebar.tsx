'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/library', label: 'Library', icon: '📹' },
  { href: '/grade', label: 'Grade', icon: '⭐' },
  { href: '/chat', label: 'Chat', icon: '💬' },
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
        className="hidden md:flex flex-col w-56 shrink-0 border-r"
        style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: '#2a2a2a' }}>
          <span className="text-xl font-bold text-white tracking-tight">Content OS</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive(link.href) ? '#3b82f6' : 'transparent',
                color: isActive(link.href) ? '#ffffff' : '#c9cdd4',
              }}
              onMouseEnter={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.backgroundColor = '#1e1e1e';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(link.href)) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#c9cdd4';
                }
              }}
            >
              <span className="text-base leading-none">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Video count */}
        <div className="px-6 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
          <p className="text-xs" style={{ color: '#6b7280' }}>
            {videoCount !== null
              ? `${videoCount} video${videoCount !== 1 ? 's' : ''} logged`
              : '—'}
          </p>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{ backgroundColor: '#111111', borderColor: '#2a2a2a', height: '56px' }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 text-xs font-medium transition-colors"
            style={{ color: isActive(link.href) ? '#3b82f6' : '#8b9299' }}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
