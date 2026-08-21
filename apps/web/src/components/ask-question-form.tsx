'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n';

interface AskQuestionFormProps {
  dict: Dictionary;
  locale: Locale;
}

const categories = ['labor', 'family', 'criminal', 'commercial', 'civil', 'tax', 'immigration', 'administrative'];

export function AskQuestionForm({ dict, locale }: AskQuestionFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('civil');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('moyvakil_token');

  if (!isLoggedIn) {
    return (
      <Button asChild>
        <a href={`/${locale}/auth`}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {dict.qa.askQuestion}
        </a>
      </Button>
    );
  }

  if (submitted) {
    return (
      <div className="text-center p-4 bg-success/10 border border-success/30 rounded-lg">
        <p className="text-success font-medium">
          {locale === 'uz' ? 'Savol yuborildi!' : locale === 'ru' ? 'Вопрос отправлен!' : 'Question submitted!'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setOpen(false); }} className="mt-2">
          {dict.common.cancel}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircle className="h-4 w-4 mr-2" />
        {dict.qa.askQuestion}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text mb-4">{dict.qa.askTitle}</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                try {
                  const token = localStorage.getItem('moyvakil_token');
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/qa/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ title, body, category, language: locale, authorName: 'User' }),
                  });
                  if (res.ok) {
                    setSubmitted(true);
                    setTitle('');
                    setBody('');
                  }
                } catch {}
                setSubmitting(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">{dict.qa.askTitle}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={dict.qa.askPlaceholder}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">{dict.qa.askBodyPlaceholder}</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={dict.qa.askBodyPlaceholder}
                    required
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">{dict.qa.askCategory}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting || !title || !body}>
                    {submitting ? dict.common.loading : dict.qa.askSubmit}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    {dict.common.cancel}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
