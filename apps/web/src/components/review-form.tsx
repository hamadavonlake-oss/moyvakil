'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n';

interface ReviewFormProps {
  lawyerId: string;
  dict: Dictionary;
  locale: Locale;
}

export function ReviewForm({ lawyerId, dict, locale }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('moyvakil_token');

  if (!isLoggedIn) {
    return (
      <Button asChild variant="outline">
        <a href={`/${locale}/auth`}>{dict.reviews.loginRequired}</a>
      </Button>
    );
  }

  if (submitted) {
    return (
      <div className="p-4 bg-success/10 border border-success/30 rounded-lg text-center">
        <p className="text-success font-medium">
          {locale === 'uz' ? 'Sharh yuborildi! Tasdiqlanishini kuting.' : locale === 'ru' ? 'Отзыв отправлен! Ожидайте подтверждения.' : 'Review submitted! Awaiting moderation.'}
        </p>
        <Button variant="ghost" size="sm" onClick={() => { setSubmitted(false); setOpen(false); }} className="mt-2">
          {dict.common.cancel}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Star className="h-4 w-4 mr-2" />
        {dict.reviews.writeReview}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text mb-4">{dict.reviews.writeReview}</h2>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                try {
                  const token = localStorage.getItem('moyvakil_token');
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ lawyerId, rating, title, content, authorName }),
                  });
                  if (res.ok) {
                    setSubmitted(true);
                    setTitle('');
                    setContent('');
                    setAuthorName('');
                  }
                } catch {}
                setSubmitting(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">{dict.reviews.rating}</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5"
                      >
                        <Star className={`h-6 w-6 ${star <= rating ? 'text-accent fill-accent' : 'text-text-light'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">{dict.reviews.title}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={dict.reviews.titlePlaceholderReview}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    {locale === 'uz' ? 'Ismingiz' : locale === 'ru' ? 'Ваше имя' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={locale === 'uz' ? 'Ismingiz' : locale === 'ru' ? 'Ваше имя' : 'Your Name'}
                    required
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">{dict.reviews.content}</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={dict.reviews.contentPlaceholder}
                    required
                    rows={3}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting || !content || !authorName}>
                    {submitting ? dict.common.loading : dict.reviews.submit}
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
