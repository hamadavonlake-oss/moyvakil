'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n';

interface AnswerFormProps {
  questionId: string;
  dict: Dictionary;
  locale: Locale;
}

export function AnswerForm({ questionId, dict, locale }: AnswerFormProps) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('moyvakil_token');

  if (!isLoggedIn) {
    return (
      <div className="mt-8">
        <Button asChild>
          <a href={`/${locale}/auth`}>{dict.qa.loginToAnswer}</a>
        </Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 p-4 bg-success/10 border border-success/30 rounded-lg text-center">
        <p className="text-success font-medium">
          {locale === 'uz' ? 'Javob yuborildi!' : locale === 'ru' ? 'Ответ отправлен!' : 'Answer submitted!'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-text mb-3">{dict.qa.answerTitle}</h3>
      <form onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
          const token = localStorage.getItem('moyvakil_token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/qa/questions/${questionId}/answers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ body }),
          });
          if (res.ok) {
            setSubmitted(true);
            setBody('');
          }
        } catch {}
        setSubmitting(false);
      }} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={dict.qa.answerPlaceholder}
          required
          rows={4}
          className="w-full px-3 py-2.5 text-sm border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <Button type="submit" disabled={submitting || !body}>
          {submitting ? dict.common.loading : dict.qa.submitAnswer}
        </Button>
      </form>
    </div>
  );
}
