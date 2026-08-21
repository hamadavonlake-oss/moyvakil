'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, AlertTriangle, Scale, ExternalLink, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{ type: string; id: string; title: string; slug: string }>;
}

export default function AskAiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<'uz' | 'ru' | 'en'>('ru');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = {
    uz: { title: 'AI yurist', subtitle: "Sun'iy intellekt yordamida huquqiy maslahatlar oling", placeholder: 'Huquqiy savolingizni yozing...', send: 'Yuborish', thinking: "O'ylayapman...", disclaimer: 'Bu avtomatik javob. Professional advokat bilan maslahatlashing.', sources: 'Manbalar', empty: 'Huquqiy savolingizni yozing', error: 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.' },
    ru: { title: 'AI юрист', subtitle: 'Получите ответы на ваши правовые вопросы с помощью искусственного интеллекта', placeholder: 'Напишите ваш правовой вопрос...', send: 'Отправить', thinking: 'Думаю...', disclaimer: 'Это автоматический ответ. Проконсультируйтесь с профессиональным адвокатом.', sources: 'Источники', empty: 'Напишите ваш правовой вопрос', error: 'Произошла ошибка. Попробуйте снова.' },
    en: { title: 'AI Lawyer', subtitle: 'Get answers to your legal questions with the help of artificial intelligence', placeholder: 'Type your legal question...', send: 'Send', thinking: 'Thinking...', disclaimer: 'This is an automated response. Consult a professional lawyer.', sources: 'Sources', empty: 'Type your legal question', error: 'An error occurred. Please try again.' },
  } as const;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    const userMessage: Message = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: locale }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t[locale].error },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getCitationLink = (citation: { type: string; slug: string }) => {
    if (citation.type === 'law') return `/ru/laws/${citation.slug}`;
    if (citation.type === 'guide') return `/ru/guides/${citation.slug}`;
    return '#';
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <Bot className="h-12 w-12 text-secondary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-text mb-2">{t[locale].title}</h1>
        <p className="text-text-muted mb-4">{t[locale].subtitle}</p>

        {/* Language Selector */}
        <div className="flex items-center justify-center gap-2">
          {(['uz', 'ru', 'en'] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                locale === loc ? 'bg-primary text-white' : 'bg-surface-dim text-text-muted hover:text-primary'
              }`}
            >
              {loc === 'uz' ? "O'zbekcha" : loc === 'ru' ? 'Русский' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="space-y-4 min-h-[300px] max-h-[500px] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center text-text-muted py-12">
                <Scale className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{t[locale].empty}</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-surface-dim text-text'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-black/10">
                      <p className="text-xs font-semibold mb-1 opacity-70">{t[locale].sources}:</p>
                      <div className="space-y-1">
                        {msg.citations.map((c, j) => (
                          <a
                            key={j}
                            href={getCitationLink(c)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="uppercase text-[10px] font-bold">{c.type}</span>
                            {c.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-dim rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t[locale].thinking}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t[locale].placeholder}
          className="flex-1 px-4 py-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 text-xs text-text-muted bg-warning/5 border border-warning/20 rounded-lg p-3">
        <AlertTriangle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
        <p>{t[locale].disclaimer}</p>
      </div>
    </div>
  );
}
