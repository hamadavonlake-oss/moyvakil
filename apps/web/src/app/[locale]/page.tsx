import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, BookOpen, MessageCircle, Search, ArrowRight, Shield } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  const features = [
    {
      icon: BookOpen,
      title: dict.nav.documents,
      description: locale === 'uz'
        ? "O'zbekiston qonunlari va kodekslarini rasmiy manbalar asosida o'qing"
        : locale === 'ru'
        ? 'Читайте законы и кодексы Узбекистана на основе официальных источников'
        : 'Read Uzbekistan laws and codes based on official sources',
      href: `/${locale}/documents`,
    },
    {
      icon: MessageCircle,
      title: dict.nav.chat,
      description: locale === 'uz'
        ? "Huquqiy savolingizni bering va manbalar bilan javob oling"
        : locale === 'ru'
        ? 'Задайте правовой вопрос и получите ответ со ссылками на источники'
        : 'Ask a legal question and get cited answers',
      href: `/${locale}/chat`,
    },
    {
      icon: Search,
      title: dict.nav.search,
      description: locale === 'uz'
        ? "Qonunlar va moddalar bo'yicha to'liq qidiruv"
        : locale === 'ru'
        ? 'Полноценный поиск по законам и статьям'
        : 'Full-text search across laws and provisions',
      href: `/${locale}/search`,
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {dict.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl">
              {dict.hero.subtitle}
            </p>
            <Button size="lg" asChild>
              <Link href={`/${locale}/chat`}>{dict.hero.cta}</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {locale === 'uz' ? "Platforma imkoniyatlari" : locale === 'ru' ? 'Возможности платформы' : 'Platform Features'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full hover:shadow-md hover:border-secondary/50 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <feature.icon className="h-10 w-10 text-secondary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold text-text mb-2">{feature.title}</h3>
                    <p className="text-sm text-text-muted mb-4">{feature.description}</p>
                    <div className="flex items-center text-sm text-secondary font-medium">
                      {dict.common.view}
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-surface-dim">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-4">
              {dict.footer.about}
            </h2>
            <p className="text-text-muted mb-8">{dict.footer.aboutText}</p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={`/${locale}/documents`}>{dict.nav.documents}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/chat`}>{dict.nav.chat}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
