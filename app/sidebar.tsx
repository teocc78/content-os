'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [videoCount, setVideoCount] = useState<number | null>(null);

  useEffect(() => {
    // Fetch video count
    async function getVideoCount() {
      try {
        const res = await fetch('/api/videos/count');
        if (res.ok) {
          const data = await res.json();
          setVideoCount(data.count);
        }
      } catch (err) {
        console.error('Failed to fetch video count:', err);
      }
    }
    getVideoCount();
  }, []);

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/library', label: 'Library', icon: '📹' },
    { href: '/grade', label: 'Grade', icon: '⭐' },
    { href: '/chat', label: 'Chat', icon: '💬' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 border-r"
        style={{ backgroundColor: '#0a0a0a', borderColor: '#222' }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: '#222' }}>
          <h1 className="text-2xl font-bold text-white">Content OS</h1>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded transition"
              style={{
                backgroundColor: isActive(link.href) ? '#3b82f6' : 'transparent',
                color: isActive(link.href) ? '#fff' : '#9ca3af',
              }}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Video Count */}
        <div className="p-4 border-t" style={{ borderColor: '#222' }}>
          <p className="text-xs text-gray-500">
            {videoCount !== null ? `${videoCount} video${videoCount !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
      </aside>

      {/* Mobile Tab Bar */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 border-t flex justify-around items-center"
        style={{ backgroundColor: '#141414', borderColor: '#222', height: '60px' }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center flex-1 h-full transition"
            style={{
              borderTopColor: isActive(link.href) ? '#3b82f6' : 'transparent',
              borderTopWidth: isActive(link.href) ? '3px' : '0px',
              color: isActive(link.href) ? '#3b82f6' : '#6b7280',
            }}
          >
            <span className="text-xl">{link.icon}</span>
          </Link>
        ))}
      </div>

      {/* Mobile Padding */}
      <div className="md:hidden h-16" />
    </>
  );
}
