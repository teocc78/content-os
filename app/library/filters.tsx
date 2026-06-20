'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FiltersProps {
  pillars: string[];
}

type SortOption = 'newest' | 'views' | 'watch_time' | 'saves';
type RetentionFilter = 'all' | 'flat_hold' | 'early_drop' | 'rewatch_bump' | 'cliff';

const selectStyle: React.CSSProperties = {
  height: '32px',
  paddingLeft: '10px',
  paddingRight: '28px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-default)',
  backgroundColor: 'var(--surface-card)',
  color: 'var(--text-body)',
  fontSize: '13px',
  outline: 'none',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239aa6b6' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 8px center',
};

export function LibraryFilters({ pillars }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pillar, setPillar] = useState(searchParams.get('pillar') || '');
  const [retention, setRetention] = useState<RetentionFilter>(
    (searchParams.get('retention') as RetentionFilter) || 'all'
  );
  const [sort, setSort] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/library?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <select
        value={pillar}
        onChange={(e) => {
          setPillar(e.target.value);
          handleFilterChange('pillar', e.target.value);
        }}
        style={selectStyle}
      >
        <option value="">All Pillars</option>
        {pillars.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      <select
        value={retention}
        onChange={(e) => {
          const val = e.target.value as RetentionFilter;
          setRetention(val);
          handleFilterChange('retention', val === 'all' ? '' : val);
        }}
        style={selectStyle}
      >
        <option value="all">All Shapes</option>
        <option value="flat_hold">Flat Hold</option>
        <option value="early_drop">Early Drop</option>
        <option value="rewatch_bump">Rewatch Bump</option>
        <option value="cliff">Cliff</option>
      </select>

      <select
        value={sort}
        onChange={(e) => {
          const val = e.target.value as SortOption;
          setSort(val);
          handleFilterChange('sort', val === 'newest' ? '' : val);
        }}
        style={selectStyle}
      >
        <option value="newest">Newest</option>
        <option value="views">Most Views</option>
        <option value="watch_time">Highest Watch Time</option>
        <option value="saves">Highest Saves</option>
      </select>
    </div>
  );
}
