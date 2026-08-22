import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AskDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  async ask(dto: AskDto) {
    const { question, language = 'ru', countryCode } = dto;
    this.logger.log(`RAG query: "${question}" (${language}, ${countryCode || 'any'})`);

    let countryId: string | undefined;
    if (countryCode) {
      const country = await this.prisma.country.findUnique({ where: { code: countryCode } });
      if (country) countryId = country.id;
    }

    const sections = await this.searchSections(question, countryId);
    const context = this.buildContext(sections);

    if (process.env.OPENAI_API_KEY) {
      return this.generateWithOpenAI(question, context, language, countryCode, sections);
    }

    return this.generateFallback(question, context, language, countryCode, sections);
  }

  private async searchSections(query: string, countryId?: string) {
    const words = query.split(/\s+/).filter((w) => w.length > 2);

    const where: any = { status: 'current' };
    if (countryId) where.countryId = countryId;
    if (words.length > 0) {
      where.OR = words.flatMap((word: string) => [
        { textNormalized: { contains: word, mode: 'insensitive' } },
        { sectionLabel: { contains: word, mode: 'insensitive' } },
      ]);
    }

    const sections = await this.prisma.legalSection.findMany({
      where,
      take: 10,
      include: {
        document: {
          select: { id: true, title: true, documentType: true, status: true, effectiveFrom: true },
        },
        version: {
          select: { id: true, versionNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return sections;
  }

  private buildContext(sections: any[]) {
    if (sections.length === 0) return 'No relevant legal content found.';

    let context = '';
    for (const section of sections) {
      const title = section.document?.title || 'Unknown';
      const label = section.sectionLabel || section.sectionType || 'section';
      const text = section.textNormalized?.substring(0, 1500) || '';
      context += `\n[${title}] ${label}:\n${text}\n`;
    }
    return context.trim();
  }

  private async generateWithOpenAI(
    question: string,
    context: string,
    language: string,
    countryCode: string | undefined,
    sections: any[],
  ) {
    const langInstruction: Record<string, string> = {
      uz: "Javobni o'zbek tilida bering. Huquqiy atamalarni lotin alifbosida yozing.",
      ru: 'Отвечайте на русском языке. Юридические термины используйте на русском.',
      en: 'Answer in English.',
    };

    const systemPrompt = `You are Vakilim Legal Assistant for Uzbekistan.
Answer ONLY from the supplied legal sources. You are not a court or government authority.
Return your answer as JSON with this exact structure:
{
  "shortAnswer": "one paragraph answer",
  "answer": "full detailed answer with citations inline",
  "assumptions": ["list of assumptions made"],
  "missingFacts": ["list of facts needed but not provided"],
  "nextSteps": ["actionable next steps"],
  "riskLevel": "low|medium|high|critical",
  "needsHumanReview": false,
  "confidence": 0.85,
  "disclaimer": "standard legal disclaimer"
}

Rules:
- Do not invent law, article numbers, deadlines, or authorities
- If sources are insufficient, say so and lower confidence
- For high-risk matters, set needsHumanReview=true
- ${langInstruction[language] || langInstruction.ru}`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Question: ${question}\n\nLegal sources:\n${context}` },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

      const data = await response.json();
      const raw = data.choices[0].message.content;

      let parsed: any;
      try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        parsed = { answer: raw, shortAnswer: raw.substring(0, 200) };
      }

      const citations = sections.map((s) => ({
        sourceId: s.document?.id || null,
        sectionId: s.id,
        title: s.document?.title || 'Unknown',
        article: s.sectionLabel || s.sectionType,
        url: s.sourceUrl,
        effectiveDate: s.document?.effectiveFrom?.toISOString() || null,
        status: s.document?.status || s.status,
        quotedText: s.textOriginal?.substring(0, 500) || null,
      }));

      return {
        jurisdiction: countryCode || 'UZ',
        language,
        shortAnswer: parsed.shortAnswer || '',
        answer: parsed.answer || raw,
        assumptions: parsed.assumptions || [],
        missingFacts: parsed.missingFacts || [],
        citations,
        nextSteps: parsed.nextSteps || [],
        riskLevel: parsed.riskLevel || 'low',
        needsHumanReview: parsed.needsHumanReview || false,
        confidence: parsed.confidence || 0.5,
        disclaimer:
          parsed.disclaimer ||
          'This is automated legal information, not professional legal advice. Consult a qualified lawyer for specific matters.',
      };
    } catch (error) {
      this.logger.error(`OpenAI generation failed: ${error.message}`);
      return this.generateFallback(question, context, language, countryCode, sections);
    }
  }

  private generateFallback(
    question: string,
    context: string,
    language: string,
    countryCode: string | undefined,
    sections: any[],
  ) {
    const noResults: Record<string, string> = {
      uz: "Kechirasiz, sizning savolingiz bo'yicha bazamizda aniq huquqiy ma'lumot topilmadi.",
      ru: 'К сожалению, по вашему запросу не найдена конкретная правовая информация.',
      en: 'No specific legal information was found for your query.',
    };

    const prefixes: Record<string, string> = {
      uz: "Sizning savolingiz bo'yicha topilgan huquqiy ma'lumotlar:",
      ru: 'По вашему вопросу найдена следующая правовая информация:',
      en: 'Based on your question, here is the relevant legal information:',
    };

    const citations = sections.map((s) => ({
      sourceId: s.document?.id || null,
      sectionId: s.id,
      title: s.document?.title || 'Unknown',
      article: s.sectionLabel || s.sectionType,
      url: s.sourceUrl,
      effectiveDate: s.document?.effectiveFrom?.toISOString() || null,
      status: s.document?.status || s.status,
      quotedText: s.textOriginal?.substring(0, 500) || null,
    }));

    if (sections.length === 0) {
      return {
        jurisdiction: countryCode || 'UZ',
        language,
        shortAnswer: noResults[language] || noResults.ru,
        answer: noResults[language] || noResults.ru,
        assumptions: [],
        missingFacts: ['No legal sources matched this query'],
        citations: [],
        nextSteps: ['Rephrase your question', 'Consult a qualified lawyer'],
        riskLevel: 'low' as const,
        needsHumanReview: false,
        confidence: 0,
        disclaimer: 'No reliable sources found. This response is not legal advice.',
      };
    }

    return {
      jurisdiction: countryCode || 'UZ',
      language,
      shortAnswer: `${prefixes[language] || prefixes.ru} (${sections.length} sources found)`,
      answer: context,
      assumptions: [],
      missingFacts: [],
      citations,
      nextSteps: ['Review the cited sources', 'Consult a qualified lawyer for specific advice'],
      riskLevel: 'low' as const,
      needsHumanReview: false,
      confidence: 0.3,
      disclaimer: 'This is automated legal information, not professional legal advice.',
    };
  }
}
