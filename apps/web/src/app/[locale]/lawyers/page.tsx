import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getLawyers, type LawyerSummary, type PaginatedResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { MapPin, Star, Shield, Clock, Globe, Users } from 'lucide-react';

const practiceAreaLabels: Record<string, Record<string, string>> = {
  uz: { labor: 'Mehnat huquqi', family: 'Oila huquqi', criminal: 'Jinoyat huquqi', commercial: 'Tadbirkorlik huquqi', civil: 'Fuqarolik huquqi', tax: 'Soliq huquqi', ip: 'Mualliflik huquqi', administrative: 'Ma\'muriy huquqi', 'real-estate': 'Ko\'chmas mulk', immigration: 'Immigratsiya' },
  ru: { labor: 'Трудовое право', family: 'Семейное право', criminal: 'Уголовное право', commercial: 'Предпринимательское право', civil: 'Гражданское право', tax: 'Налоговое право', ip: 'Авторское право', administrative: 'Административное право', 'real-estate': 'Недвижимость', immigration: 'Иммиграция' },
  en: { labor: 'Labor', family: 'Family', criminal: 'Criminal', commercial: 'Commercial', civil: 'Civil', tax: 'Tax', ip: 'IP', administrative: 'Administrative', 'real-estate': 'Real Estate', immigration: 'Immigration' },
};

const citiesUz = ['Tashkent', 'Samarkand', 'Bukhara', 'Namangan', 'Andijan', 'Fergana', 'Nukus', 'Karshi', 'Termez', 'Navoi'];

export default async function LawyersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; practiceArea?: string; verified?: string; page?: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10));
  const limit = 12;

  let result: PaginatedResponse<LawyerSummary>;
  try {
    result = await getLawyers({
      city: sp.city,
      practiceArea: sp.practiceArea,
      verified: sp.verified === 'true' ? true : undefined,
      page,
      limit,
    });
  } catch {
    result = { items: [], total: 0, page: 1, limit };
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">{dict.lawyers.title}</h1>
        <p className="text-text-muted">{dict.lawyers.subtitle}</p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-8 p-4 bg-surface-dim rounded-lg border border-border" method="get">
        <select name="city" defaultValue={sp.city} className="px-3 py-2.5 text-sm border border-border rounded-lg bg-surface">
          <option value="">{dict.lawyers.allCities}</option>
          {citiesUz.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        <select name="practiceArea" defaultValue={sp.practiceArea} className="px-3 py-2.5 text-sm border border-border rounded-lg bg-surface">
          <option value="">{dict.lawyers.allAreas}</option>
          {Object.entries(practiceAreaLabels[locale] || practiceAreaLabels.en).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" name="verified" value="true" defaultChecked={sp.verified === 'true'} className="rounded" />
          {dict.lawyers.filterVerified}
        </label>
        <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-light transition-colors">
          {dict.common.filter}
        </button>
      </form>

      {/* Lawyers Grid */}
      {result.items.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-16 w-16 text-text-light mx-auto mb-4" />
          <p className="text-text-muted text-lg">{dict.lawyers.noResults}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((lawyer) => (
              <Link key={lawyer.slug} href={`/${locale}/lawyers/${lawyer.slug}`}>
                <Card className="h-full hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {lawyer.firstName[0]}{lawyer.lastName[0]}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-accent fill-accent" />
                        <span className="text-sm font-semibold text-text">{lawyer.avgRating}</span>
                        <span className="text-xs text-text-muted">({lawyer.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-text mb-1 group-hover:text-secondary transition-colors">
                      {lawyer.firstName} {lawyer.lastName}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-text-muted mb-3">
                      <MapPin className="h-3 w-3" />
                      {lawyer.city}
                      {lawyer.isVerified && (
                        <Badge variant="success" className="ml-2 text-[10px]">
                          <Shield className="h-3 w-3 mr-0.5" />
                          {dict.lawyers.verified}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {lawyer.practiceAreas.map((pa) => (
                        <Badge key={pa.area} variant="secondary" className="text-[10px]">
                          {practiceAreaLabels[locale]?.[pa.area] || pa.area}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      {lawyer.yearsOfPractice && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lawyer.yearsOfPractice} {dict.lawyers.yearsExp}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {lawyer.languages.map((l) => l.language.toUpperCase()).join(', ')}
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
            baseUrl={`/${locale}/lawyers`}
            searchParams={{
              ...(sp.city ? { city: sp.city } : {}),
              ...(sp.practiceArea ? { practiceArea: sp.practiceArea } : {}),
              ...(sp.verified ? { verified: sp.verified } : {}),
            }}
            locale={locale}
            dict={{ prev: dict.pagination.prev, next: dict.pagination.next, page: dict.pagination.page, of: dict.pagination.of }}
          />
        </>
      )}
    </div>
  );
}
