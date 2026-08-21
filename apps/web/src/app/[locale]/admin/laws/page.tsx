'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scale, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

interface Law {
  id: string;
  slug: string;
  titleUz: string;
  titleRu: string;
  type: string;
  category: string;
  status: string;
  lastUpdated: string;
}

const typeColors: Record<string, string> = {
  CONSTITUTION: 'bg-accent/20 text-accent-dark',
  CODE: 'bg-secondary/10 text-secondary-dark',
  LAW: 'bg-primary/10 text-primary',
};

export default function AdminLawsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [laws, setLaws] = useState<Law[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titleUz: '', titleRu: '', slug: '', type: 'LAW', category: '', fullTextUz: '', fullTextRu: '', countryId: '' });

  useEffect(() => {
    const t = localStorage.getItem('moyvakil_token');
    if (!t) { router.push('/ru/auth'); return; }
    setToken(t);
  }, [router]);

  const fetchLaws = () => {
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    fetch(`${apiUrl}/api/admin/laws`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setLaws)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLaws(); }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // First, get or create the UZ country
    const res = await fetch(`${apiUrl}/api/laws`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowCreate(false);
      setForm({ titleUz: '', titleRu: '', slug: '', type: 'LAW', category: '', fullTextUz: '', fullTextRu: '', countryId: '' });
      fetchLaws();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this law?') || !token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    await fetch(`${apiUrl}/api/laws/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLaws();
  };

  if (!token) return null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Laws Management</h1>
            <p className="text-text-muted mt-1">{laws.length} laws in database</p>
          </div>
          <Button onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Law
          </Button>
        </div>

        {/* Create Form */}
        {showCreate && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Create New Law</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-1">Title (Uzbek)</label>
                    <Input value={form.titleUz} onChange={(e) => setForm({ ...form, titleUz: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text block mb-1">Title (Russian)</label>
                    <Input value={form.titleRu} onChange={(e) => setForm({ ...form, titleRu: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text block mb-1">Slug</label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text block mb-1">Type</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md text-sm">
                      <option value="CONSTITUTION">Constitution</option>
                      <option value="CODE">Code</option>
                      <option value="LAW">Law</option>
                      <option value="DECREE">Decree</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text block mb-1">Category</label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required placeholder="labor, family, etc." />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text block mb-1">Full Text (Russian)</label>
                  <textarea value={form.fullTextRu} onChange={(e) => setForm({ ...form, fullTextRu: e.target.value })} className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-[100px]" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Laws List */}
        {loading ? (
          <div className="text-center py-16"><Loader2 className="h-8 w-8 animate-spin text-secondary mx-auto" /></div>
        ) : (
          <div className="space-y-3">
            {laws.map((law) => (
              <Card key={law.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Scale className="h-5 w-5 text-secondary" />
                    <div>
                      <h3 className="font-semibold text-text">{law.titleRu}</h3>
                      <p className="text-xs text-text-muted">{law.titleUz}</p>
                    </div>
                    <Badge className={typeColors[law.type] || ''}>{law.type}</Badge>
                    <Badge variant="outline">{law.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/ru/laws/${law.slug}`} target="_blank" className="p-2 text-text-muted hover:text-primary">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button onClick={() => handleDelete(law.id)} className="p-2 text-text-muted hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
