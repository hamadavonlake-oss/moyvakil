import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getLawBySlug, type LawDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Calendar, ExternalLink, ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

const typeLabels: Record<string, Record<string, string>> = {
  uz: { CONSTITUTION: 'Konstitusiya', CODE: 'Kodeks', LAW: "Qonun", DECREE: "Farmon", REGULATION: "Nizom" },
  ru: { CONSTITUTION: 'Конституция', CODE: 'Кодекс', LAW: 'Закон', DECREE: 'Указ', REGULATION: 'Регламент' },
  en: { CONSTITUTION: 'Constitution', CODE: 'Code', LAW: 'Law', DECREE: 'Decree', REGULATION: 'Regulation' },
};

const statusLabels: Record<string, Record<string, string>> = {
  uz: { IN_FORCE: 'Kuchda', AMENDED: "O'zgartirilgan", REPEALED: 'Bekor qilingan', DRAFT: 'Loyiha' },
  ru: { IN_FORCE: 'В силе', AMENDED: 'Изменён', REPEALED: 'Отменён', DRAFT: 'Проект' },
  en: { IN_FORCE: 'In Force', AMENDED: 'Amended', REPEALED: 'Repealed', DRAFT: 'Draft' },
};

const statusVariant: Record<string, string> = {
  IN_FORCE: 'success',
  AMENDED: 'warning',
  REPEALED: 'danger',
  DRAFT: 'outline',
};

// Fallback seed data
const seedLaws: Record<string, LawDetail> = {
  'constitution-uz': {
    id: '1', slug: 'constitution-uz', titleUz: "O'zbekiston Respublikasining Konstitusiyasi", titleRu: 'Конституция Республики Узбекистан', titleEn: 'Constitution of the Republic of Uzbekistan',
    type: 'CONSTITUTION', category: 'constitutional', status: 'IN_FORCE', adoptionDate: '1992-12-08', sourceUrl: 'https://lex.uz/docs/9531', lastUpdated: '2024-01-01T00:00:00Z',
    fullTextUz: "O'zbekiston Respublikasi Konstitusiyasi — respublikaning asosiy qonuni hisoblanadi. Konstitusiya fuqarolar huquqlari va erkinliklarini kafolatlaydi, davlat hokimiyati tizimini belgilaydi.", 
    fullTextRu: 'Конституция Республики Узбекистан является основным законом республики. Конституция гарантирует права и свободы граждан, определяет систему государственной власти.',
    fullTextEn: 'The Constitution of the Republic of Uzbekistan is the fundamental law of the republic. It guarantees citizens\' rights and freedoms, defines the system of state power.',
    summaryUz: "Asosiy qonun", summaryRu: 'Основной закон', summaryEn: 'Fundamental law',
    articles: [], amendments: [],
    country: { code: 'UZ', nameUz: "O'zbekiston", nameRu: 'Узбекистан' },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const law = await getLawBySlug(slug);
    const title = locale === 'uz' ? law.titleUz : locale === 'ru' ? law.titleRu : law.titleEn || law.titleRu;
    return { title: `${title} — MoyVakil`, description: law.summaryUz || law.summaryRu || title };
  } catch {
    return { title: 'Law — MoyVakil' };
  }
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  let law: LawDetail;
  try {
    law = await getLawBySlug(slug);
  } catch {
    law = seedLaws[slug];
    if (!law) notFound();
  }

  const title = locale === 'uz' ? law.titleUz : locale === 'ru' ? law.titleRu : law.titleEn || law.titleRu;
  const fullText = locale === 'uz' ? law.fullTextUz : locale === 'ru' ? law.fullTextRu : law.fullTextEn || law.fullTextRu;
  const summary = locale === 'uz' ? law.summaryUz : locale === 'ru' ? law.summaryRu : law.summaryEn || law.summaryRu;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href={`/${locale}/laws`} className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {dict.laws.title}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="h-8 w-8 text-secondary" />
          <Badge className={typeLabels[locale]?.[law.type] ? '' : ''} variant={(statusVariant[law.status] as any) || 'outline'}>
            {typeLabels[locale]?.[law.type] || law.type}
          </Badge>
          <Badge variant={(statusVariant[law.status] as any) || 'outline'}>
            {statusLabels[locale]?.[law.status] || law.status}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-text mb-4">{title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted">
          {law.adoptionDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {dict.laws.lastUpdated}: {law.adoptionDate}
            </div>
          )}
          {law.sourceUrl && (
            <a href={law.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-secondary hover:underline">
              <ExternalLink className="h-4 w-4" />
              lex.uz
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'uz' ? "Qisqacha" : locale === 'ru' ? 'Краткое описание' : 'Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted leading-relaxed">{summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Full Text */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-secondary" />
            {locale === 'uz' ? "To'liq matn" : locale === 'ru' ? 'Полный текст' : 'Full Text'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none text-text leading-relaxed whitespace-pre-wrap">
            {fullText}
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      {law.articles && law.articles.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'uz' ? "Maqolalar" : locale === 'ru' ? 'Статьи' : 'Articles'} ({law.articles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {law.articles.map((article) => (
                <div key={article.id} className="border-l-2 border-secondary/30 pl-4">
                  <h4 className="font-semibold text-text mb-1">
                    {article.number}
                    {(locale === 'uz' ? article.titleUz : locale === 'ru' ? article.titleRu : article.titleEn) && (
                      <>: {locale === 'uz' ? article.titleUz : locale === 'ru' ? article.titleRu : article.titleEn}</>
                    )}
                  </h4>
                  <p className="text-sm text-text-muted">
                    {locale === 'uz' ? article.contentUz : locale === 'ru' ? article.contentRu : article.contentEn || article.contentRu}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amendments */}
      {law.amendments && law.amendments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-secondary" />
              {locale === 'uz' ? "O'zgartirishlar" : locale === 'ru' ? 'Изменения' : 'Amendments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {law.amendments.map((amendment) => (
                <div key={amendment.id} className="flex items-start gap-3">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-secondary" />
                  <div>
                    <p className="text-sm text-text">{amendment.description}</p>
                    <p className="text-xs text-text-muted mt-1">{amendment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
