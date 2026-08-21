'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Star, Loader2, Check, X } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

interface Review {
  id: string;
  authorName: string;
  rating: number;
  title?: string;
  content: string;
  status: string;
  createdAt: string;
  lawyer: { id: string; firstName: string; lastName: string; slug: string };
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');

  useEffect(() => {
    const t = localStorage.getItem('moyvakil_token');
    if (!t) { router.push('/ru/auth'); return; }
    setToken(t);
  }, [router]);

  const fetchReviews = () => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/admin/reviews?status=${filter}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, [token, filter]);

  const handleModerate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/reviews/${id}/moderate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchReviews();
  };

  if (!token) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Review Moderation</h1>
            <p className="text-text-muted mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
              <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-12 w-12 text-text-light mx-auto mb-3" />
            <p className="text-text-muted">No {filter.toLowerCase()} reviews</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-accent fill-accent' : 'text-text-light'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-text">{review.authorName}</span>
                        <span className="text-xs text-text-muted">→ {review.lawyer.firstName} {review.lawyer.lastName}</span>
                        <Badge variant={review.status === 'APPROVED' ? 'success' : review.status === 'REJECTED' ? 'danger' : 'warning'}>
                          {review.status}
                        </Badge>
                      </div>
                      {review.title && <h4 className="font-semibold text-text mb-1">{review.title}</h4>}
                      <p className="text-sm text-text-muted">{review.content}</p>
                    </div>
                    {review.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleModerate(review.id, 'APPROVED')}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleModerate(review.id, 'REJECTED')}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
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
