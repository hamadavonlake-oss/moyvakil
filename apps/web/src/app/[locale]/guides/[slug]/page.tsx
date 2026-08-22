import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getGuideBySlug, type GuideDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

// No fallback seed data - show error page instead of serving fabricated content

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const guide = await getGuideBySlug(slug);
    const title = locale === 'uz' ? guide.titleUz : locale === 'ru' ? guide.titleRu : guide.titleEn || guide.titleRu;
    return { title: `${title} — MoyVakil`, description: title };
  } catch {
    return { title: 'Guide — MoyVakil' };
  }
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  let guide: GuideDetail;
  try {
    guide = await getGuideBySlug(slug);
  } catch {
    notFound();
  }

  const title = locale === 'uz' ? guide.titleUz : locale === 'ru' ? guide.titleRu : guide.titleEn || guide.titleRu;
  const body = locale === 'uz' ? guide.bodyUz : locale === 'ru' ? guide.bodyRu : guide.bodyEn || guide.bodyRu;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href={`/${locale}/guides`} className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {dict.guides.title}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-secondary" />
          <Badge variant="outline">{guide.category}</Badge>
          {guide.readingTime && (
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3 w-3" />
              {guide.readingTime} {dict.guides.readTime}
            </div>
          )}
        </div>
        <h1 className="text-3xl font-bold text-text">{title}</h1>
      </div>

      {/* Body */}
      <Card>
        <CardContent className="p-8">
          <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
            {body}
          </div>
        </CardContent>
      </Card>

      {/* Related Law */}
      {guide.law && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'uz' ? "Bog'langan qonun" : locale === 'ru' ? 'Связанный закон' : 'Related Law'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/laws/${guide.law.slug}`} className="text-secondary hover:underline font-medium">
              {locale === 'uz' ? guide.law.titleUz : guide.law.titleRu}
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
