import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getLawyerBySlug, type LawyerDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Shield, Clock, Globe, ArrowLeft, Mail, Phone, Globe as WebsiteIcon, GraduationCap, Award } from 'lucide-react';
import type { Metadata } from 'next';
import { ReviewForm } from '@/components/review-form';

const practiceAreaLabels: Record<string, Record<string, string>> = {
  uz: { labor: 'Mehnat huquqi', family: 'Oila huquqi', criminal: 'Jinoyat huquqi', commercial: 'Tadbirkorlik huquqi', civil: 'Fuqarolik huquqi', tax: 'Soliq huquqi', ip: 'Mualliflik huquqi' },
  ru: { labor: 'Трудовое право', family: 'Семейное право', criminal: 'Уголовное право', commercial: 'Предпринимательское право', civil: 'Гражданское право', tax: 'Налоговое право', ip: 'Авторское право' },
  en: { labor: 'Labor', family: 'Family', criminal: 'Criminal', commercial: 'Commercial', civil: 'Civil', tax: 'Tax', ip: 'IP' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const lawyer = await getLawyerBySlug(slug);
    return {
      title: `${lawyer.firstName} ${lawyer.lastName} — MoyVakil`,
      description: `${lawyer.firstName} ${lawyer.lastName}, ${lawyer.city}`,
    };
  } catch {
    return { title: 'Lawyer — MoyVakil' };
  }
}

export default async function LawyerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  let lawyer: LawyerDetail;
  try {
    lawyer = await getLawyerBySlug(slug);
  } catch {
    notFound();
  }

  const bio = locale === 'uz' ? lawyer.bioUz : locale === 'ru' ? lawyer.bioRu : lawyer.bioEn || lawyer.bioRu;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href={`/${locale}/lawyers`} className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {dict.lawyers.title}
      </Link>

      {/* Profile Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
              {lawyer.firstName[0]}{lawyer.lastName[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text">
                  {lawyer.firstName} {lawyer.lastName}
                </h1>
                {lawyer.isVerified && (
                  <Badge variant="success">
                    <Shield className="h-3 w-3 mr-1" />
                    {dict.lawyers.verified}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {lawyer.city}{lawyer.region ? `, ${lawyer.region}` : ''}
                </div>
                {lawyer.yearsOfPractice && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {lawyer.yearsOfPractice} {dict.lawyers.yearsExp}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent fill-accent" />
                  <span className="font-semibold">{lawyer.avgRating}</span>
                  <span>({lawyer.reviewCount} {dict.lawyers.reviews})</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {lawyer.practiceAreas.map((pa) => (
                  <Badge key={pa.area} variant="secondary">
                    {practiceAreaLabels[locale]?.[pa.area] || pa.area}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-text-muted">
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {lawyer.languages.map((l) => l.language.toUpperCase()).join(', ')}
                </div>
                {lawyer.licenseNumber && (
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    #{lawyer.licenseNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        {lawyer.email && (
          <Button variant="outline" asChild>
            <a href={`mailto:${lawyer.email}`}>
              <Mail className="h-4 w-4 mr-2" />
              {lawyer.email}
            </a>
          </Button>
        )}
        {lawyer.phone && (
          <Button variant="outline" asChild>
            <a href={`tel:${lawyer.phone}`}>
              <Phone className="h-4 w-4 mr-2" />
              {lawyer.phone}
            </a>
          </Button>
        )}
        {lawyer.website && (
          <Button variant="outline" asChild>
            <a href={lawyer.website} target="_blank" rel="noopener noreferrer">
              <WebsiteIcon className="h-4 w-4 mr-2" />
              Website
            </a>
          </Button>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'uz' ? "Haqida" : locale === 'ru' ? 'О себе' : 'About'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {lawyer.education && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              {locale === 'uz' ? "Ta'lim" : locale === 'ru' ? 'Образование' : 'Education'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-text-muted">{lawyer.education}</p>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">
            {dict.lawyers.reviews} ({lawyer.reviewCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lawyer.reviews && lawyer.reviews.length > 0 && (
            <div className="space-y-4 mb-6">
              {lawyer.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? 'text-accent fill-accent' : 'text-text-light'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-text">{review.authorName}</span>
                  </div>
                  {review.title && <h4 className="text-sm font-semibold mb-1">{review.title}</h4>}
                  <p className="text-sm text-text-muted">{review.content}</p>
                </div>
              ))}
            </div>
          )}
          <ReviewForm lawyerId={lawyer.id} dict={dict} locale={locale} />
        </CardContent>
      </Card>

      {/* Services */}
      {lawyer.services && lawyer.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {locale === 'uz' ? "Xizmatlar" : locale === 'ru' ? 'Услуги' : 'Services'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lawyer.services.map((service) => (
                <div key={service.id} className="border border-border rounded-lg p-4">
                  <h4 className="font-semibold text-text mb-1">
                    {locale === 'uz' ? service.titleUz : locale === 'ru' ? service.titleRu : service.titleEn || service.titleRu}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
                    {service.price} {service.currency}
                    <span className="text-text-muted font-normal text-xs">
                      / {service.deliveryDays} {locale === 'uz' ? 'kun' : locale === 'ru' ? 'дней' : 'days'}
                    </span>
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
