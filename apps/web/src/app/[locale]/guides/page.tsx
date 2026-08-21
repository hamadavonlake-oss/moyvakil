import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getGuides, type GuideSummary, type PaginatedResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { BookOpen, Clock } from 'lucide-react';

export default async function GuidesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 12;

  let result: PaginatedResponse<GuideSummary>;
  try {
    result = await getGuides({ category: sp.category, page, limit });
  } catch {
    result = { items: [], total: 0, page: 1, limit };
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">{dict.guides.title}</h1>
        <p className="text-text-muted">{dict.guides.subtitle}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'labor', 'family', 'judicial', 'commercial'].map((cat) => (
          <Link key={cat} href={`/${locale}/guides${cat === 'all' ? '' : `?category=${cat}`}`}>
            <Badge variant={sp.category === cat || (!sp.category && cat === 'all') ? 'default' : 'outline'} className="cursor-pointer">
              {cat === 'all' ? dict.laws.filterAll : cat}
            </Badge>
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-text-muted text-lg">{dict.guides.noResults}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((guide) => (
              <Link key={guide.slug} href={`/${locale}/guides/${guide.slug}`}>
                <Card className="h-full hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <BookOpen className="h-8 w-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-text mb-2 group-hover:text-secondary transition-colors line-clamp-2">
                      {locale === 'uz' ? guide.titleUz : locale === 'ru' ? guide.titleRu : guide.titleEn || guide.titleRu}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <Badge variant="outline">{guide.category}</Badge>
                      {guide.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guide.readingTime} {dict.guides.readTime}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/${locale}/guides`}
            searchParams={{
              ...(sp.category ? { category: sp.category } : {}),
            }}
            locale={locale}
            dict={{ prev: dict.pagination.prev, next: dict.pagination.next, page: dict.pagination.page, of: dict.pagination.of }}
          />
        </>
      )}
    </div>
  );
}
