'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  initialQuery?: string;
  actionPath?: string;
  placeholder?: string;
  extraParams?: Record<string, string | undefined>;
}

export default function SearchBar({
  initialQuery = '',
  actionPath = '/archive',
  placeholder = 'SEARCH BY LOCATION, TITLE, NARRATIVE, OR TAG',
  extraParams,
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    const params = new URLSearchParams();
    if (trimmed) params.set('q', trimmed);
    if (extraParams) {
      Object.entries(extraParams).forEach(([key, value]) => {
        if (!value || key === 'q') return;
        params.set(key, value);
      });
    }

    const queryString = params.toString();
    router.push(queryString ? `${actionPath}?${queryString}` : actionPath);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <MagnifyingGlassIcon className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full bg-transparent border-none focus:ring-0 pl-7 text-sm font-bold tracking-[0.2em] uppercase text-black placeholder:text-gray-300"
      />
    </form>
  );
}
