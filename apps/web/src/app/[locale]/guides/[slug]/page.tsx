import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getGuideBySlug, type GuideDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';

const seedGuides: Record<string, GuideDetail> = {
  'uzbekistan-court-system': {
    id: '1', slug: 'uzbekistan-court-system', titleUz: "O'zbekiston sud tizimi", titleRu: 'Судебная система Узбекистана', titleEn: 'Court System of Uzbekistan',
    category: 'judicial', tags: ['courts', 'judiciary'], readingTime: 5, published: true, createdAt: '2024-01-01T00:00:00Z',
    bodyUz: "O'zbekiston Respublikasining sud tizimi quyidagi tarkibiy qismlardan iborat:\n\n1. Konstitutsiyaviy sud — Konstitutsiyaning yuqori kuchiga ega ekanligini ta'minlaydi.\n2. Oliy sud — fuqarolik, jinoyat va boshqa ishlarni ko'rib chiqadi.\n3. Iqtisodiy sudlar — tadbirkorlik va iqtisodiy nizolarni hal qiladi.\n4. Jinoyat ishlari bo'yicha sudlar — jinoyat ishlarini ko'rib chiqadi.\n5. Fuqarolik ishlari bo'yicha sudlar — oila, mehnat, uy-joy va boshqa fuqarolik ishlarini ko'rib chiqadi.\n6. Xalq sudlari — mahalliy darajadagi oddiy ishlarni ko'rib chiqadi.",
    bodyRu: 'Судебная система Республики Узбекистан состоит из следующих структурных элементов:\n\n1. Конституционный суд — обеспечивает верховенство Конституции.\n2. Верховный суд — рассматривает гражданские, уголовные и другие дела.\n3. Экономические суды — разрешают предпринимательские и экономические споры.\n4. Суды по уголовным делам — рассматривают уголовные дела.\n5. Суды по гражданским делам — рассматривают семейные, трудовые, жилищные и другие гражданские дела.\n6. Народные суды — рассматривают простые дела на местном уровне.',
    bodyEn: 'The court system of the Republic of Uzbekistan consists of the following structural elements:\n\n1. Constitutional Court — ensures the supremacy of the Constitution.\n2. Supreme Court — considers civil, criminal and other cases.\n3. Economic Courts — resolve business and economic disputes.\n4. Criminal Courts — consider criminal cases.\n5. Civil Courts — consider family, labor, housing and other civil cases.\n6. People\'s Courts — consider simple cases at the local level.',
    law: null,
    country: { code: 'UZ', nameUz: "O'zbekiston", nameRu: 'Узбекистан', nameEn: 'Uzbekistan' },
  },
};

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
    guide = seedGuides[slug];
    if (!guide) notFound();
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
