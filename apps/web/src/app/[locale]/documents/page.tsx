import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, ArrowRight } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  documentType: string;
  status: string;
  effectiveFrom?: string;
  languageCode: string;
  source?: { authorityName: string; officialUrl: string };
  _count?: { sections: number };
}

async function getDocuments(): Promise<Document[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/laws?limit=50`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

const typeLabels: Record<string, Record<string, string>> = {
  uz: { law: 'Qonun', code: 'Kodeks', regulation: "Nizom", decree: "Farmon" },
  ru: { law: 'Закон', code: 'Кодекс', regulation: 'Положение', decree: 'Указ' },
  en: { law: 'Law', code: 'Code', regulation: 'Regulation', decree: 'Decree' },
};

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();
  const dict = await getDictionary(locale);
  const documents = await getDocuments();

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">{dict.nav.documents}</h1>
          <p className="text-text-muted mt-1">
            {locale === 'uz'
              ? "O'zbekiston huquqiy hujjatlari ro'yxati"
              : locale === 'ru'
              ? 'Список правовых документов Узбекистана'
              : 'List of Uzbekistan legal documents'}
          </p>
        </div>

        {documents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-text-light mx-auto mb-4" />
              <p className="text-text-muted">
                {locale === 'uz'
                  ? "Hujjatlar hali yuklanmagan"
                  : locale === 'ru'
                  ? 'Документы ещё не загружены'
                  : 'Documents not yet loaded'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Link key={doc.id} href={`/${locale}/documents/${doc.id}`}>
                <Card className="hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Scale className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-text truncate group-hover:text-secondary transition-colors">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
                        <span>{typeLabels[locale]?.[doc.documentType] || doc.documentType}</span>
                        {doc.source && <span>{doc.source.authorityName}</span>}
                        {doc._count && <span>{doc._count.sections} sections</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-text-light group-hover:text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
