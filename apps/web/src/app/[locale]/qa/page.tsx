import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getQuestions, type QuestionSummary, type PaginatedResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { MessageCircle, Eye, PlusCircle, CheckCircle } from 'lucide-react';
import { AskQuestionForm } from '@/components/ask-question-form';

export default async function QaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 15;

  let result: PaginatedResponse<QuestionSummary>;
  try {
    result = await getQuestions({ category: sp.category, q: sp.q, page, limit });
  } catch {
    result = { items: [], total: 0, page: 1, limit };
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text mb-2">{dict.qa.title}</h1>
          <p className="text-text-muted">{dict.qa.subtitle}</p>
        </div>
        <AskQuestionForm dict={dict} locale={locale} />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'labor', 'family', 'criminal', 'commercial', 'civil', 'tax', 'immigration'].map((cat) => (
          <Link
            key={cat}
            href={`/${locale}/qa${cat === 'all' ? '' : `?category=${cat}`}`}
          >
            <Badge variant={sp.category === cat || (!sp.category && cat === 'all') ? 'default' : 'outline'} className="cursor-pointer">
              {cat === 'all' ? dict.laws.filterAll : cat}
            </Badge>
          </Link>
        ))}
      </div>

      {result.items.length === 0 ? (
        /* Empty State */
        <Card className="py-16">
          <CardContent className="text-center">
            <MessageCircle className="h-16 w-16 text-text-light mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text mb-2">{dict.qa.noQuestions}</h2>
            <p className="text-text-muted mb-6">{dict.qa.beFirst}</p>
            <AskQuestionForm dict={dict} locale={locale} />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {result.items.map((q) => (
              <Link key={q.id} href={`/${locale}/qa/${q.id}`}>
                <Card className="hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 text-center">
                        <div className="text-lg font-bold text-primary">{q.answerCount}</div>
                        <div className="text-[10px] text-text-muted">{dict.qa.answers}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-text truncate">{q.title}</h3>
                          {q.isResolved && (
                            <CheckCircle className="h-4 w-4 text-success shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-text-muted mb-3 line-clamp-2">{q.body}</p>
                        <div className="flex items-center gap-4 text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {q.viewCount} {dict.qa.views}
                          </div>
                          <Badge variant="outline" className="text-[10px]">{q.category}</Badge>
                          <span>{q.authorName}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/${locale}/qa`}
            searchParams={{
              ...(sp.category ? { category: sp.category } : {}),
              ...(sp.q ? { q: sp.q } : {}),
            }}
            locale={locale}
            dict={{ prev: dict.pagination.prev, next: dict.pagination.next, page: dict.pagination.page, of: dict.pagination.of }}
          />
        </>
      )}
    </div>
  );
}
