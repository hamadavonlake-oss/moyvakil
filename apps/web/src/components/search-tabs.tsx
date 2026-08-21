'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n';

interface SearchTabsProps {
  dict: Dictionary;
  locale: Locale;
}

export function SearchTabs({ dict, locale }: SearchTabsProps) {
  const [activeTab, setActiveTab] = useState<'lawyers' | 'laws' | 'guides'>('lawyers');
  const [query, setQuery] = useState('');
  const router = useRouter();

  const tabs = [
    { key: 'lawyers' as const, label: dict.hero.searchLawyers },
    { key: 'laws' as const, label: dict.hero.searchLaws },
    { key: 'guides' as const, label: dict.hero.searchGuides },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.trim();
    if (activeTab === 'lawyers') {
      router.push(`/${locale}/lawyers?q=${encodeURIComponent(q)}`);
    } else if (activeTab === 'laws') {
      router.push(`/${locale}/laws?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/${locale}/guides?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <div className="max-w-xl">
      {/* Tabs */}
      <div className="flex gap-0 mb-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex items-center bg-white/10 backdrop-blur rounded-b-lg rounded-tr-lg p-2 border border-white/20 border-t-0">
        <Search className="h-5 w-5 text-white/60 ml-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.hero.searchPlaceholder}
          className="flex-1 bg-transparent text-white placeholder:text-white/50 px-3 py-2 outline-none text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-secondary-light rounded-md transition-colors"
        >
          {dict.common.search}
        </button>
      </form>
    </div>
  );
}
