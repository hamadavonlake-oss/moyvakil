'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Users, MessageCircle, BookOpen, Clock, Shield, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

interface Stats {
  laws: number;
  lawyers: number;
  questions: number;
  pendingReviews: number;
  guides: number;
}

function useAdminAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('moyvakil_token');
    const u = localStorage.getItem('moyvakil_user');
    if (!t) {
      router.push('/ru/auth');
      return;
    }
    setToken(t);
    if (u) setUser(JSON.parse(u));
  }, [router]);

  return { token, user };
}

export default function AdminDashboardPage() {
  const { token, user } = useAdminAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    fetch(`${apiUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  const cards = [
    { icon: Scale, label: 'Laws', value: stats?.laws ?? '—', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Users, label: 'Lawyers', value: stats?.lawyers ?? '—', color: 'text-secondary', bg: 'bg-secondary/10' },
    { icon: MessageCircle, label: 'Questions', value: stats?.questions ?? '—', color: 'text-accent-dark', bg: 'bg-accent/10' },
    { icon: BookOpen, label: 'Guides', value: stats?.guides ?? '—', color: 'text-success', bg: 'bg-success/10' },
    { icon: Clock, label: 'Pending Reviews', value: stats?.pendingReviews ?? '—', color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-text-muted mt-1">Welcome{user ? `, ${user.name}` : ''}</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
