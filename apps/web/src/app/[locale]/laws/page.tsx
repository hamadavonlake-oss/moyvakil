import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getLaws, type LawSummary, type PaginatedResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Scale, Calendar, ExternalLink, Search } from 'lucide-react';

const typeLabels: Record<string, Record<string, string>> = {
  uz: { CONSTITUTION: 'Konstitusiya', CODE: 'Kodeks', LAW: "Qonun", DECREE: "Farmon", REGULATION: "Nizom" },
  ru: { CONSTITUTION: 'Конституция', CODE: 'Кодекс', LAW: 'Закон', DECREE: 'Указ', REGULATION: 'Регламент' },
  en: { CONSTITUTION: 'Constitution', CODE: 'Code', LAW: 'Law', DECREE: 'Decree', REGULATION: 'Regulation' },
};

export default async function LawsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; category?: string; page?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 12;

  let result: PaginatedResponse<LawSummary>;
  try {
    result = await getLaws({ q: sp.q, type: sp.type, category: sp.category, page, limit });
  } catch {
    result = { items: [], total: 0, page: 1, limit };
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">{dict.laws.title}</h1>
        <p className="text-text-muted">{dict.laws.subtitle}</p>
      </div>

      {/* Search + Filters */}
      <form className="flex flex-wrap gap-3 mb-8" method="get">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder={dict.hero.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select name="type" defaultValue={sp.type} className="px-3 py-2.5 text-sm border border-border rounded-lg bg-surface">
          <option value="">{dict.laws.filterAll}</option>
          <option value="CONSTITUTION">{dict.laws.filterConstitution}</option>
          <option value="CODE">{dict.laws.filterCode}</option>
          <option value="LAW">{dict.laws.filterLaw}</option>
        </select>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors">
          {dict.common.search}
        </button>
      </form>

      {/* Laws Grid */}
      {result.items.length === 0 ? (
        <div className="text-center py-16">
          <Scale className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-text-muted text-lg">{dict.laws.noResults}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((law) => (
              <Link key={law.slug} href={`/${locale}/laws/${law.slug}`}>
                <Card className="h-full hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Scale className="h-5 w-5 text-secondary" />
                      <Badge variant="outline">
                        {typeLabels[locale]?.[law.type] || law.type}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                      {locale === 'uz' ? law.titleUz : locale === 'ru' ? law.titleRu : law.titleEn || law.titleRu}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      {law.adoptionDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {law.adoptionDate}
                        </div>
                      )}
                      <Badge variant="success" className="text-[10px]">
                        {dict.laws.statusInForce}
                      </Badge>
                    </div>
                    {law.sourceUrl && (
                      <div className="mt-3 flex items-center text-xs text-text-muted">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        lex.uz
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/${locale}/laws`}
            searchParams={{
              ...(sp.q ? { q: sp.q } : {}),
              ...(sp.type ? { type: sp.type } : {}),
            }}
            locale={locale}
            dict={{ prev: dict.pagination.prev, next: dict.pagination.next, page: dict.pagination.page, of: dict.pagination.of }}
          />
        </>
      )}
    </div>
  );
}
