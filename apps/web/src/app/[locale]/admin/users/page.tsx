'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Calendar, Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-danger/10 text-danger',
  ADMIN: 'bg-warning/10 text-warning-dark',
  LAWYER: 'bg-secondary/10 text-secondary-dark',
  USER: 'bg-primary/10 text-primary',
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('moyvakil_token');
    if (!t) { router.push('/ru/auth'); return; }
    setToken(t);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Users</h1>
          <p className="text-text-muted mt-1">{users.length} registered users</p>
        </div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" /></div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-surface-dim flex items-center justify-center text-text-muted font-bold text-sm">
                      {user.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text">{user.name}</h3>
                        <Badge className={roleColors[user.role] || ''}>{user.role}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
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
