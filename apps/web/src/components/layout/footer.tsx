import Link from 'next/link';
import { Scale } from 'lucide-react';
import { type Locale } from '@/lib/i18n';
import { type Dictionary } from '@/lib/get-dictionary';

interface FooterProps {
  dict: Dictionary;
  locale: Locale;
}

export function Footer({ dict, locale }: FooterProps) {
  return (
    <footer className="border-t border-border bg-surface-dim">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <Scale className="h-6 w-6 text-secondary" />
              <span className="text-lg font-bold text-primary">Vakilim</span>
            </Link>
            <p className="text-sm text-text-muted max-w-md">
              {dict.footer.aboutText}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">{dict.footer.quickLinks}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/documents`} className="text-sm text-text-muted hover:text-primary">
                  {dict.nav.documents}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/chat`} className="text-sm text-text-muted hover:text-primary">
                  {dict.nav.chat}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/search`} className="text-sm text-text-muted hover:text-primary">
                  {dict.nav.search}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">{dict.footer.legal}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}/documents`} className="text-sm text-text-muted hover:text-primary">
                  {dict.nav.documents}
                </Link>
              </li>
              <li>
                <span className="text-sm text-text-muted">{dict.footer.contact}: [TBD]</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-xs text-text-light">
            &copy; {new Date().getFullYear()} Vakilim. {dict.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
