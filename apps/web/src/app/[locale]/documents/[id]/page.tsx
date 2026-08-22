import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, ArrowLeft, ExternalLink } from 'lucide-react';

interface Section {
  id: string;
  sectionType: string;
  sectionLabel?: string;
  ordinal: number;
  status: string;
  effectiveFrom?: string;
  textNormalized?: string;
}

interface DocumentDetail {
  id: string;
  title: string;
  documentType: string;
  status: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  languageCode: string;
  contentHash: string;
  lastIndexedAt?: string;
  country: { id: string; code: string; nameUz: string; nameRu: string; nameEn: string };
  source: { id: string; authorityName: string; officialUrl: string; documentType: string };
  versions: { id: string; versionNumber: number; effectiveFrom?: string; effectiveTo?: string; status: string }[];
  sections: Section[];
}

async function getDocument(id: string): Promise<DocumentDetail | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/laws/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const doc = await getDocument(id);
  if (!doc) notFound();

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}/documents`} className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {dict.nav.documents}
        </Link>

        <div className="mb-8">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">{doc.title}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-text-muted">
                <Badge variant={doc.status === 'active' ? 'default' : 'secondary'}>
                  {doc.status}
                </Badge>
                <span>{doc.source.authorityName}</span>
                {doc.effectiveFrom && <span>Effective: {new Date(doc.effectiveFrom).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>

          {doc.source.officialUrl && (
            <a
              href={doc.source.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-sm text-secondary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {locale === 'uz' ? "Rasmiy manba" : locale === 'ru' ? 'Официальный источник' : 'Official source'}
            </a>
          )}
        </div>

        {/* Versions */}
        {doc.versions.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-text mb-4">
                {locale === 'uz' ? "Versiyalar" : locale === 'ru' ? 'Версии' : 'Versions'}
              </h2>
              <div className="space-y-2">
                {doc.versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">v{v.versionNumber}</Badge>
                      <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>{v.status}</Badge>
                    </div>
                    <span className="text-sm text-text-muted">
                      {v.effectiveFrom ? new Date(v.effectiveFrom).toLocaleDateString() : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sections */}
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">
            {locale === 'uz' ? "Bo'limlar" : locale === 'ru' ? 'Разделы' : 'Sections'} ({doc.sections.length})
          </h2>
          {doc.sections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-text-muted">
                {locale === 'uz'
                  ? "Bo'limlar hali indekslanmagan"
                  : locale === 'ru'
                  ? 'Разделы ещё не проиндексированы'
                  : 'Sections not yet indexed'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {doc.sections.map((section) => (
                <Link key={section.id} href={`/${locale}/documents/${id}?section=${section.id}`}>
                  <div className="p-4 rounded-lg border border-border hover:border-secondary/50 hover:shadow-sm transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-text-muted">{section.ordinal}.</span>
                      <span className="text-sm font-medium text-text">
                        {section.sectionLabel || section.sectionType}
                      </span>
                      <Badge variant="outline" className="text-xs">{section.sectionType}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
