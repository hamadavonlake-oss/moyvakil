'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scale, Users, MessageCircle, BookOpen, Shield, BarChart3, ArrowLeft } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/laws', label: 'Laws', icon: BookOpen },
  { href: '/admin/lawyers', label: 'Lawyers', icon: Users },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageCircle },
  { href: '/admin/users', label: 'Users', icon: Shield },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'uz';

  return (
    <aside className="w-64 bg-surface-dim border-r border-border min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 text-sm text-text-muted hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">Admin</h2>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === `/${locale}${item.href}`;
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:bg-surface hover:text-primary'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
