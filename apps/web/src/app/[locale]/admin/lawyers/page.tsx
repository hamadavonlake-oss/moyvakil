'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Shield, MapPin, Star, Loader2, Check } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

interface Lawyer {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  city: string;
  isVerified: boolean;
  licenseVerified: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

export default function AdminLawyersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('moyvakil_token');
    if (!t) { router.push('/ru/auth'); return; }
    setToken(t);
  }, [router]);

  const fetchLawyers = () => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/admin/lawyers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setLawyers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLawyers(); }, [token]);

  const handleVerify = async (id: string, verified: boolean) => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/lawyers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isVerified: verified, licenseVerified: verified }),
    });
    fetchLawyers();
  };

  if (!token) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Lawyer Verification</h1>
          <p className="text-text-muted mt-1">{lawyers.length} lawyers registered</p>
        </div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" /></div>
        ) : (
          <div className="space-y-3">
            {lawyers.map((lawyer) => (
              <Card key={lawyer.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {lawyer.firstName[0]}{lawyer.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text">{lawyer.firstName} {lawyer.lastName}</h3>
                        {lawyer.isVerified && (
                          <Badge variant="success"><Shield className="h-3 w-3 mr-0.5" /> Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {lawyer.city}</span>
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {lawyer.avgRating}</span>
                        <span>{lawyer.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lawyer.isVerified ? (
                      <Button variant="outline" size="sm" onClick={() => handleVerify(lawyer.id, false)}>
                        Revoke
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleVerify(lawyer.id, true)}>
                        <Check className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                    )}
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
