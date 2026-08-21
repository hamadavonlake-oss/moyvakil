import { notFound } from 'next/navigation';
import Link from 'next/link';
import { type Locale, isValidLocale } from '@/lib/i18n';
import { getDictionary } from '@/lib/get-dictionary';
import { getQuestionById, type QuestionDetail } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, ThumbsUp, CheckCircle, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { AnswerForm } from '@/components/answer-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const q = await getQuestionById(id);
    return { title: `${q.title} — MoyVakil`, description: q.body.substring(0, 160) };
  } catch {
    return { title: 'Question — MoyVakil' };
  }
}

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isValidLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  let question: QuestionDetail;
  try {
    question = await getQuestionById(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href={`/${locale}/qa`} className="inline-flex items-center text-sm text-text-muted hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        {dict.qa.title}
      </Link>

      {/* Question */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold text-text">{question.title}</h1>
            {question.isResolved && (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />
                {locale === 'uz' ? 'Hal qilindi' : locale === 'ru' ? 'Решено' : 'Resolved'}
              </Badge>
            )}
          </div>

          <p className="text-text-muted leading-relaxed mb-6 whitespace-pre-wrap">
            {question.body}
          </p>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {question.viewCount} {dict.qa.views}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {question.answerCount} {dict.qa.answers}
            </div>
            <Badge variant="outline" className="text-[10px]">{question.category}</Badge>
            <span>{question.authorName}</span>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <h2 className="text-xl font-semibold text-text mb-4">
        {question.answers.length} {dict.qa.answers}
      </h2>

      {question.answers.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <MessageCircle className="h-12 w-12 text-text-light mx-auto mb-3" />
            <p className="text-text-muted mb-4">
              {locale === 'uz' ? "Hali javoblar yo'q" : locale === 'ru' ? 'Пока нет ответов' : 'No answers yet'}
            </p>
            <Button asChild>
              <Link href={`/${locale}/auth`}>{dict.qa.writeAnswer}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {question.answers.map((answer) => (
            <Card key={answer.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {answer.lawyer && (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {answer.lawyer.firstName[0]}{answer.lawyer.lastName[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {answer.lawyer ? (
                        <Link href={`/${locale}/lawyers/${answer.lawyer.slug}`} className="font-semibold text-text hover:text-secondary">
                          {answer.lawyer.firstName} {answer.lawyer.lastName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-text">
                          {locale === 'uz' ? 'Foydalanuvchi' : locale === 'ru' ? 'Пользователь' : 'User'}
                        </span>
                      )}
                      {answer.lawyer?.isVerified && (
                        <Badge variant="success" className="text-[10px]">
                          {dict.lawyers.verified}
                        </Badge>
                      )}
                      {answer.isHelpful && (
                        <Badge variant="secondary" className="text-[10px]">
                          {dict.qa.helpful}
                        </Badge>
                      )}
                    </div>
                    <p className="text-text-muted leading-relaxed whitespace-pre-wrap">{answer.body}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {answer.upvotes}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Answer Form */}
      <AnswerForm questionId={id} dict={dict} locale={locale} />
    </div>
  );
}
