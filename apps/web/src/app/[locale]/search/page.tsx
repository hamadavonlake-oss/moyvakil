'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Scale, ArrowRight, Filter, X } from 'lucide-react';

interface SearchResult {
  id: string;
  sectionType: string;
  sectionLabel?: string;
  ordinal: number;
  textNormalized: string;
  sourceUrl: string;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  document: {
    id: string;
    title: string;
    documentType: string;
    status: string;
    source?: { authorityName: string; officialUrl: string };
  };
}

export default function SearchPage() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'ru';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    countryCode: '',
    documentType: '',
    sectionType: '',
  });

  const translations = {
    uz: { search: 'Qidiruv', placeholder: "Qonunlar va moddalar bo'yicha qidiruv...", results: 'natija', noResults: 'Hech narsa topilmadi', filter: 'Filtrlash', all: 'Barchasi', close: 'Yopish' },
    ru: { search: 'Поиск', placeholder: 'Поиск по законам и статьям...', results: 'результатов', noResults: 'Ничего не найдено', filter: 'Фильтры', all: 'Все', close: 'Закрыть' },
    en: { search: 'Search', placeholder: 'Search laws and provisions...', results: 'results', noResults: 'No results found', filter: 'Filters', all: 'All', close: 'Close' },
  } as const;
  const t = translations[locale as keyof typeof translations] || translations.en;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const body: Record<string, string | number> = { q: query.trim() };
      if (filters.countryCode) body.countryCode = filters.countryCode;
      if (filters.documentType) body.documentType = filters.documentType;
      if (filters.sectionType) body.sectionType = filters.sectionType;

      const res = await fetch(`${apiUrl}/api/search/legal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.items || []);
        setTotal(data.total || 0);
      }
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    law: 'Qonun', code: 'Kodeks', regulation: "Nizom",
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">{t.search}</h1>
        </div>

        <form onSubmit={handleSearch} className="mb-6 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.placeholder}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading || !query.trim()}>
              {t.search}
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.documentType}
              onChange={(e) => setFilters({ ...filters, documentType: e.target.value })}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-text"
            >
              <option value="">{t.all} ({locale === 'uz' ? 'hujjat turi' : locale === 'ru' ? 'тип документа' : 'document type'})</option>
              <option value="law">{typeLabels.law}</option>
              <option value="code">{typeLabels.code}</option>
              <option value="regulation">{typeLabels.regulation}</option>
            </select>

            <select
              value={filters.sectionType}
              onChange={(e) => setFilters({ ...filters, sectionType: e.target.value })}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-surface text-text"
            >
              <option value="">{t.all} ({locale === 'uz' ? 'modda turi' : locale === 'ru' ? 'тип статьи' : 'section type'})</option>
              <option value="article">Article</option>
              <option value="chapter">Chapter</option>
              <option value="section">Section</option>
              <option value="part">Part</option>
            </select>
          </div>
        </form>

        {searched && (
          <div className="mb-4 text-sm text-text-muted">
            {total} {t.results}
          </div>
        )}

        <div className="space-y-3">
          {results.map((r) => (
            <Link key={r.id} href={`/${locale}/documents/${r.document.id}?section=${r.id}`}>
              <Card className="hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-text group-hover:text-secondary transition-colors truncate">
                          {r.document.title}
                        </h3>
                        <Badge variant="outline" className="text-xs flex-shrink-0">{r.sectionType}</Badge>
                      </div>
                      <p className="text-sm text-text-muted line-clamp-2">{r.textNormalized}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-light">
                        {r.document.source && <span>{r.document.source.authorityName}</span>}
                        {r.effectiveFrom && <span>Effective: {new Date(r.effectiveFrom).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-text-light group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {searched && results.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-text-light mx-auto mb-4" />
              <p className="text-text-muted">{t.noResults}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
