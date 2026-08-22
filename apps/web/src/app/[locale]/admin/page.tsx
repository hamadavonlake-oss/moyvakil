'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, FileText, Database, Users, Loader2 } from 'lucide-react';

interface Stats {
  documents: number;
  sources: number;
  users: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const t = localStorage.getItem('vakilim_token');
      const u = localStorage.getItem('vakilim_user');
      if (!t) {
        router.push('/ru/auth');
        return;
      }
      if (u) {
        const user = JSON.parse(u);
        setUserName(user.name);
        if (user.role !== 'admin' && user.role !== 'super_admin') {
          router.push('/ru');
          return;
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {})
        .finally(() => setLoading(false));
    } catch {
      setLoading(false);
    }
  }, [router]);

  const cards = [
    { icon: FileText, label: 'Documents', value: stats?.documents ?? '—', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Database, label: 'Sources', value: stats?.sources ?? '—', color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: Users, label: 'Users', value: stats?.users ?? '—', color: 'text-accent-dark', bg: 'bg-accent/10' },
  ];

  return (
    <div className="py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome{userName ? `, ${userName}` : ''}</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {cards.map((card) => (
              <Card key={card.label}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text">{card.value}</div>
                    <div className="text-sm text-text-muted">{card.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
