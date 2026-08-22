'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Scale, User, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface Citation {
  id: string;
  title: string;
  article?: string;
  url?: string;
  effectiveDate?: string;
  status?: string;
  quotedText?: string;
}

interface AiAnswer {
  id: string;
  jurisdiction: string;
  language: string;
  shortAnswer: string;
  answer: string;
  assumptions: string[];
  missingFacts: string[];
  nextSteps: string[];
  riskLevel: string;
  needsHumanReview: boolean;
  confidence: number;
  disclaimer: string;
  citations: Citation[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  answer?: AiAnswer;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async (question: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let cid = conversationId;
    if (!cid) {
      const convRes = await fetch(`${apiUrl}/api/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: 'UZ', language: 'ru' }),
      });
      if (convRes.ok) {
        const conv = await convRes.json();
        cid = conv.id;
        setConversationId(cid);
      }
    }

    if (!cid) return;

    const msgRes = await fetch(`${apiUrl}/api/chat/sessions/${cid}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: question }),
    });

    if (msgRes.ok) {
      const data = await msgRes.json();
      return data;
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const result = await startConversation(question);
      if (result) {
        setMessages((prev) => {
          const withoutTemp = prev.filter((m) => !m.id.startsWith('temp-'));
          return [...withoutTemp, result.userMessage, result.assistantMessage];
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant' as const,
          content: 'Произошла ошибка. Попробуйте ещё раз.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <Scale className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text mb-2">Юридический ассистент</h2>
              <p className="text-text-muted max-w-md mx-auto">
                Задайте вопрос по законодательству Узбекистана. Ответы со ссылками на нормативные акты.
              </p>
              <div className="mt-6 space-y-2 max-w-md mx-auto">
                {[
                  'Какие права имеет арендатор при выселении?',
                  'Порядок регистрации ИП в Узбекистане',
                  'Минимальная оплата труда в 2026 году',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="block w-full text-left p-3 rounded-lg border border-border hover:border-secondary/50 hover:bg-surface-dim transition-all text-sm text-text-muted hover:text-text"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface-dim border border-border rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                {/* Structured Answer */}
                {msg.answer && (
                  <div className="mt-3 ml-10 space-y-3">
                    {msg.answer.shortAnswer && (
                      <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                        <p className="text-sm font-medium text-text">{msg.answer.shortAnswer}</p>
                      </div>
                    )}

                    {msg.answer.riskLevel && msg.answer.riskLevel !== 'low' && (
                      <div className={`p-3 rounded-lg flex items-start gap-2 ${
                        msg.answer.riskLevel === 'critical'
                          ? 'bg-danger/5 border border-danger/20'
                          : 'bg-warning/5 border border-warning/20'
                      }`}>
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <span className="font-medium">
                            {msg.answer.riskLevel === 'critical' ? 'Критический риск' : 'Повышенный риск'}
                          </span>
                          {msg.answer.needsHumanReview && (
                            <span className="ml-2 text-text-muted">— Рекомендуется консультация юриста</span>
                          )}
                        </div>
                      </div>
                    )}

                    {msg.answer.citations.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-text-muted mb-2">Источники:</p>
                        <div className="space-y-1">
                          {msg.answer.citations.map((c) => (
                            <div key={c.id} className="flex items-start gap-2 text-sm">
                              <Scale className="h-3 w-3 mt-1 text-secondary flex-shrink-0" />
                              <div>
                                <span className="font-medium text-text">{c.title}</span>
                                {c.article && <span className="text-text-muted">, {c.article}</span>}
                                {c.url && (
                                  <a href={c.url} target="_blank" rel="noopener noreferrer" className="ml-1 text-secondary hover:underline text-xs">
                                    [ссылка]
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.answer.assumptions.length > 0 && (
                      <details className="group">
                        <summary className="text-xs text-text-muted cursor-pointer hover:text-text flex items-center gap-1">
                          <ChevronDown className="h-3 w-3 group-open:hidden" />
                          <ChevronUp className="h-3 w-3 hidden group-open:block" />
                          Предположения ({msg.answer.assumptions.length})
                        </summary>
                        <ul className="mt-1 space-y-1 ml-4">
                          {msg.answer.assumptions.map((a, i) => (
                            <li key={i} className="text-xs text-text-muted">• {a}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {msg.answer.missingFacts.length > 0 && (
                      <details className="group">
                        <summary className="text-xs text-text-muted cursor-pointer hover:text-text flex items-center gap-1">
                          <ChevronDown className="h-3 w-3 group-open:hidden" />
                          <ChevronUp className="h-3 w-3 hidden group-open:block" />
                          Нужна информация ({msg.answer.missingFacts.length})
                        </summary>
                        <ul className="mt-1 space-y-1 ml-4">
                          {msg.answer.missingFacts.map((m, i) => (
                            <li key={i} className="text-xs text-text-muted">• {m}</li>
                          ))}
                        </ul>
                      </details>
                    )}

                    {msg.answer.disclaimer && (
                      <div className="p-2 rounded bg-surface-dim border border-border">
                        <p className="text-[11px] text-text-light">{msg.answer.disclaimer}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2">
                <div className="h-8 w-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <Scale className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-surface-dim border border-border rounded-tl-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-secondary" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-surface p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="max-w-3xl mx-auto flex gap-3"
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задайте юридический вопрос..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
