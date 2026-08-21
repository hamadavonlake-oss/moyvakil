'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Scale, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type Locale, locales, localeNames } from '@/lib/i18n';
import { type Dictionary } from '@/lib/get-dictionary';
import { useAuth } from '@/components/providers/auth-provider';

interface HeaderProps {
  dict: Dictionary;
  locale: Locale;
}

export function Header({ dict, locale }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { href: `/${locale}/laws`, label: dict.nav.laws },
    { href: `/${locale}/lawyers`, label: dict.nav.lawyers },
    { href: `/${locale}/qa`, label: dict.nav.qa },
    { href: `/${locale}/guides`, label: dict.nav.guides },
    { href: `/${locale}/ask-ai`, label: dict.nav.askAi },
  ];

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    return segments.join('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-secondary" />
          <span className="text-xl font-bold text-primary">MoyVakil</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-text-muted hover:text-primary transition-colors rounded-md hover:bg-surface-dim"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Locale Switcher */}
          <div className="flex items-center gap-1 rounded-md border border-border px-2 py-1">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                  loc === locale
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-primary'
                }`}
              >
                {localeNames[loc]}
              </Link>
            ))}
          </div>

          {isAuthenticated ? (
            <>
              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/${locale}/admin`}>{dict.nav.admin}</Link>
                </Button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-dim border border-border">
                <User className="h-4 w-4 text-text-muted" />
                <span className="text-sm font-medium text-text">{user?.name}</span>
                {user?.role === 'LAWYER' && (
                  <Badge variant="secondary" className="text-[10px]">{dict.auth.roleLawyer}</Badge>
                )}
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Badge variant="outline" className="text-[10px]">{dict.auth.roleAdmin}</Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-1" />
                {dict.auth.logout}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/auth`}>{dict.nav.login}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/${locale}/auth`}>{dict.nav.register}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm font-medium text-text-muted hover:text-primary rounded-md hover:bg-surface-dim"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-sm">
                  <User className="h-4 w-4 text-text-muted" />
                  <span className="font-medium">{user?.name}</span>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link
                    href={`/${locale}/admin`}
                    className="block px-3 py-2 text-sm font-medium text-text-muted hover:text-primary rounded-md hover:bg-surface-dim"
                    onClick={() => setMobileOpen(false)}
                  >
                    {dict.nav.admin}
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-muted hover:text-primary rounded-md hover:bg-surface-dim w-full"
                >
                  <LogOut className="h-4 w-4" />
                  {dict.auth.logout}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild className="flex-1">
                  <Link href={`/${locale}/auth`} onClick={() => setMobileOpen(false)}>{dict.nav.login}</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/${locale}/auth`} onClick={() => setMobileOpen(false)}>{dict.nav.register}</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="pt-2 flex gap-1">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`px-3 py-1.5 text-xs font-medium rounded border ${
                  loc === locale
                    ? 'bg-primary text-white border-primary'
                    : 'text-text-muted border-border hover:text-primary'
                }`}
              >
                {localeNames[loc]}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
