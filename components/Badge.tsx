import React from 'react';

export type Tone = 'positive' | 'caution' | 'critical' | 'accent' | 'neutral';

export const RETENTION_MAP: Record<string, Tone> = {
  flat_hold: 'positive',
  rewatch_bump: 'accent',
  early_drop: 'caution',
  cliff: 'critical',
  unknown: 'neutral',
};

const TONE_STYLES: Record<Tone, { background: string; color: string }> = {
  positive: { background: 'var(--positive-tint)', color: 'var(--positive)' },
  caution:  { background: 'var(--caution-tint)',  color: 'var(--caution)' },
  critical: { background: 'var(--critical-tint)', color: 'var(--critical)' },
  accent:   { background: 'var(--accent-tint)',   color: 'var(--accent-text)' },
  neutral:  { background: 'var(--surface-sunken)', color: 'var(--text-secondary)' },
};

interface BadgeProps {
  label: string;
  tone?: Tone;
  className?: string;
}

export function Badge({ label, tone = 'neutral', className = '' }: BadgeProps) {
  const style = TONE_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: style.background, color: style.color }}
    >
      {label}
    </span>
  );
}
