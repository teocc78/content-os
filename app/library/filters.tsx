'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FiltersProps {
  pillars: string[];
}

type SortOption = 'newest' | 'views' | 'watch_time' | 'saves';
type RetentionFilter = 'all' | 'flat_hold' | 'early_drop' | 'rewatch_bump' | 'cliff';

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
    <div
      className="flex flex-col md:flex-row gap-4 p-6 rounded border mb-6"
      style={{ backgroundColor: '#141414', borderColor: '#222' }}
    >
      {/* Content Pillar Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Content Pillar</label>
        <select
          value={pillar}
          onChange={(e) => {
            setPillar(e.target.value);
            handleFilterChange('pillar', e.target.value);
          }}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
          style={{ borderColor: '#333' }}
        >
          <option value="">All Pillars</option>
          {pillars.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Retention Shape Filter */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Retention Shape</label>
        <select
          value={retention}
          onChange={(e) => {
            const val = e.target.value as RetentionFilter;
            setRetention(val);
            handleFilterChange('retention', val === 'all' ? '' : val);
          }}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
          style={{ borderColor: '#333' }}
        >
          <option value="all">All Shapes</option>
          <option value="flat_hold">Flat Hold</option>
          <option value="early_drop">Early Drop</option>
          <option value="rewatch_bump">Rewatch Bump</option>
          <option value="cliff">Cliff</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
        <select
          value={sort}
          onChange={(e) => {
            const val = e.target.value as SortOption;
            setSort(val);
            handleFilterChange('sort', val === 'newest' ? '' : val);
          }}
          className="w-full px-3 py-2 rounded bg-gray-900 text-white border"
          style={{ borderColor: '#333' }}
        >
          <option value="newest">Newest</option>
          <option value="views">Most Views</option>
          <option value="watch_time">Highest Watch Time</option>
          <option value="saves">Highest Saves</option>
        </select>
      </div>
    </div>
  );
}
