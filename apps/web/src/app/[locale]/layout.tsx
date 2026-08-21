import { notFound } from 'next/navigation';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AuthProvider } from '@/components/providers/auth-provider';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [{ locale: 'uz' }, { locale: 'ru' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <html lang={locale} dir="ltr">
      <body>
        <AuthProvider>
          <Header dict={dict} locale={locale} />
          <main className="min-h-screen">{children}</main>
          <Footer dict={dict} locale={locale} />
        </AuthProvider>
      </body>
    </html>
  );
}
