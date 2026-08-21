import Link from 'next/link';
import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, BookOpen, Users, MessageCircle, Search, ArrowRight, Shield, Globe } from 'lucide-react';
import { SearchTabs } from '@/components/search-tabs';

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
      title: dict.nav.laws,
      description: locale === 'uz'
        ? "O'zbekiston qonunlari va kodekslarini to'liq matnini o'qing"
        : locale === 'ru'
        ? 'Читайте полный текст законов и кодексов Узбекистана'
        : 'Read the full text of Uzbekistan laws and codes',
      href: `/${locale}/laws`,
    },
    {
      icon: Users,
      title: dict.nav.lawyers,
      description: locale === 'uz'
        ? "Professional advokatlarni toping va ularning reytinglarini ko'ring"
        : locale === 'ru'
        ? 'Найдите профессиональных адвокатов и посмотрите их рейтинги'
        : 'Find professional lawyers and view their ratings',
      href: `/${locale}/lawyers`,
    },
    {
      icon: MessageCircle,
      title: dict.nav.qa,
      description: locale === 'uz'
        ? "Huquqiy savollaringizni bering va javoblar oling"
        : locale === 'ru'
        ? 'Задавайте правовые вопросы и получайте ответы'
        : 'Ask legal questions and get answers',
      href: `/${locale}/qa`,
    },
    {
      icon: Scale,
      title: dict.nav.askAi,
      description: locale === 'uz'
        ? "Sun'iy intellekt yordamida huquqiy maslahatlar oling"
        : locale === 'ru'
        ? 'Получите юридические консультации с помощью ИИ'
        : 'Get legal consultations powered by AI',
      href: `/${locale}/ask-ai`,
    },
  ];

  const stats = [
    { value: '6+', label: locale === 'uz' ? "Asosiy qonunlar" : locale === 'ru' ? 'Основные законы' : 'Key Laws' },
    { value: '100+', label: locale === 'uz' ? "Advokatlar" : locale === 'ru' ? 'Адвокаты' : 'Lawyers' },
    { value: '3', label: locale === 'uz' ? "Tillar" : locale === 'ru' ? 'Языки' : 'Languages' },
    { value: '24/7', label: locale === 'uz' ? "AI yurist" : locale === 'ru' ? 'AI юрист' : 'AI Lawyer' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary-dark text-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {dict.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl">
              {dict.hero.subtitle}
            </p>

            {/* Search Bar */}
            <SearchTabs dict={dict} locale={locale} />
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Stats */}
      <section className="py-12 bg-surface-dim border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">
              {locale === 'uz' ? "Platforma imkoniyatlari" : locale === 'ru' ? 'Возможности платформы' : 'Platform Features'}
            </h2>
            <p className="text-text-muted max-w-2xl mx-auto">
              {locale === 'uz'
                ? "Bepul huquqiy ma'lumot, professional advokatlar va AI yurist — hammasi bir joyda"
                : locale === 'ru'
                ? 'Бесплатная правовая информация, профессиональные адвокаты и AI юрист — всё в одном месте'
                : 'Free legal information, professional lawyers, and AI lawyer — all in one place'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* CTA Section */}
      <section className="py-16 bg-surface-dim">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <Shield className="h-12 w-12 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-4">
              {locale === 'uz'
                ? "Ishonchli huquqiy manba"
                : locale === 'ru'
                ? 'Надёжный правовой источник'
                : 'Trusted Legal Source'}
            </h2>
            <p className="text-text-muted mb-8">
              {locale === 'uz'
                ? "Ma'lumotlar rasmiy manbalar asosida yangilanadi va professional advokatlar tomonidan tekshiriladi"
                : locale === 'ru'
                ? 'Информация обновляется на основе официальных источников и проверяется профессиональными адвокатами'
                : 'Information is updated from official sources and verified by professional lawyers'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href={`/${locale}/laws`}>{dict.nav.laws}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/lawyers`}>{dict.nav.lawyers}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
