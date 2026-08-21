import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AskDto } from './dto/ai.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {}

  async ask(dto: AskDto) {
    const { question, language = 'ru', countryId } = dto;
    this.logger.log(`RAG query: "${question}" (${language})`);

    // Step 1: Try vector search first (pgvector), fallback to keyword search
    let chunks: Array<{ contentId: string; contentType: string; chunk: string; similarity: number; metadata: any }>;

    if (process.env.OPENAI_API_KEY) {
      chunks = await this.vectorSearch(question, countryId);
    } else {
      chunks = await this.keywordSearch(question, countryId);
    }

    // Step 2: Enrich chunks with full metadata (titles, slugs)
    const enrichedChunks = await this.enrichChunks(chunks);

    // Step 3: Build context
    const context = this.buildContextFromChunks(enrichedChunks);

    // Step 4: Generate answer
    if (process.env.OPENAI_API_KEY) {
      return this.generateWithOpenAI(question, context, language, enrichedChunks);
    }

    return this.generateFallback(question, context, language, enrichedChunks);
  }

  // === VECTOR SEARCH (pgvector) ===

  private async vectorSearch(query: string, countryId?: string) {
    try {
      const embedding = await this.getEmbedding(query);

      // Use raw SQL for pgvector similarity search
      const results = await this.prisma.$queryRaw`
        SELECT
          content_id as "contentId",
          content_type as "contentType",
          chunk,
          metadata,
          1 - (embedding <=> ${embedding}::vector) as similarity
        FROM legal_embeddings
        WHERE 1 - (embedding <=> ${embedding}::vector) > 0.3
        ${countryId ? this.prisma.$queryRaw`AND metadata->>'countryId' = ${countryId}` : this.prisma.$queryRaw``}
        ORDER BY embedding <=> ${embedding}::vector
        LIMIT 10
      `;

      return results as any[];
    } catch (error) {
      this.logger.warn(`Vector search failed, falling back to keyword: ${error.message}`);
      return this.keywordSearch(query, countryId);
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000),
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI embedding failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  // === KEYWORD SEARCH (fallback) ===

  private async keywordSearch(query: string, countryId?: string) {
    const words = query.split(/\s+/).filter((w) => w.length > 2);

    const lawWhere: any = {};
    if (countryId) lawWhere.countryId = countryId;
    if (words.length > 0) {
      lawWhere.OR = words.flatMap((word) => [
        { titleUz: { contains: word, mode: 'insensitive' } },
        { titleRu: { contains: word, mode: 'insensitive' } },
        { summaryUz: { contains: word, mode: 'insensitive' } },
        { summaryRu: { contains: word, mode: 'insensitive' } },
        { fullTextUz: { contains: word, mode: 'insensitive' } },
        { fullTextRu: { contains: word, mode: 'insensitive' } },
      ]);
    } else {
      lawWhere.OR = [
        { titleUz: { contains: query, mode: 'insensitive' } },
        { titleRu: { contains: query, mode: 'insensitive' } },
      ];
    }

    const guideWhere: any = { published: true };
    if (countryId) guideWhere.countryId = countryId;
    if (words.length > 0) {
      guideWhere.OR = words.flatMap((word) => [
        { titleUz: { contains: word, mode: 'insensitive' } },
        { titleRu: { contains: word, mode: 'insensitive' } },
        { bodyUz: { contains: word, mode: 'insensitive' } },
        { bodyRu: { contains: word, mode: 'insensitive' } },
      ]);
    } else {
      guideWhere.OR = [
        { titleUz: { contains: query, mode: 'insensitive' } },
        { titleRu: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [laws, guides] = await Promise.all([
      this.prisma.law.findMany({ where: lawWhere, take: 5, select: { id: true, slug: true, titleUz: true, titleRu: true, summaryUz: true, summaryRu: true, fullTextUz: true, fullTextRu: true, category: true } }),
      this.prisma.guide.findMany({ where: guideWhere, take: 5, select: { id: true, slug: true, titleUz: true, titleRu: true, bodyUz: true, bodyRu: true, category: true } }),
    ]);

    const chunks: any[] = [];
    for (const law of laws) {
      if (law.summaryUz) {
        chunks.push({ contentId: law.id, contentType: 'law', chunk: law.summaryUz, similarity: 0.8, metadata: { titleUz: law.titleUz, titleRu: law.titleRu, slug: law.slug, category: law.category } });
      }
      if (law.summaryRu) {
        chunks.push({ contentId: law.id, contentType: 'law', chunk: law.summaryRu, similarity: 0.8, metadata: { titleUz: law.titleUz, titleRu: law.titleRu, slug: law.slug, category: law.category } });
      }
      if (law.fullTextUz) {
        chunks.push({ contentId: law.id, contentType: 'law', chunk: law.fullTextUz.substring(0, 1500), similarity: 0.7, metadata: { titleUz: law.titleUz, titleRu: law.titleRu, slug: law.slug, category: law.category } });
      }
    }
    for (const guide of guides) {
      if (guide.bodyUz) {
        chunks.push({ contentId: guide.id, contentType: 'guide', chunk: guide.bodyUz.substring(0, 1500), similarity: 0.75, metadata: { titleUz: guide.titleUz, titleRu: guide.titleRu, slug: guide.slug, category: guide.category } });
      }
    }

    return chunks;
  }

  // === ENRICHMENT ===

  private async enrichChunks(chunks: any[]) {
    // Metadata already included from keyword search or vector search
    return chunks.map((c) => ({
      ...c,
      metadata: c.metadata || {},
    }));
  }

  // === CONTEXT BUILDING ===

  private buildContextFromChunks(chunks: any[]) {
    if (chunks.length === 0) return 'No relevant legal content found.';

    let context = '';
    const seen = new Set<string>();

    for (const chunk of chunks) {
      const title = chunk.metadata?.titleRu || chunk.metadata?.titleUz || chunk.contentId;
      const key = `${chunk.contentType}:${chunk.contentId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const typeLabel = chunk.contentType === 'law' ? 'Закон' : 'Руководство';
      context += `\n[${typeLabel}] ${title}\n${chunk.chunk}\n`;
    }

    return context.trim();
  }

  // === GENERATION ===

  private async generateWithOpenAI(question: string, context: string, language: string, chunks: any[]) {
    const langInstruction = {
      uz: "Javobni o'zbek tilida bering. Huquqiy atamalarni lotin alifbosida yozing.",
      ru: 'Отвечайте на русском языке. Юридические термины используйте на русском.',
      en: 'Answer in English.',
    }[language] || 'Отвечайте на русском языке.';

    const systemPrompt = `Вы — AI-юридический консультант для платформы MoyVakil. Отвечайте на основе предоставленного контекста из законодательства Узбекистана.

Правила:
1. Отвечайте ТОЛЬКО на основе предоставленного контекста
2. Если в контексте нет информации — скажите об этом
3. Всегда указывайте ссылки на источники (закон или руководство)
4. Используйте простой язык, понятный обычным людям
5. ${langInstruction}

Контекст из базы данных:${context}`;

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
            { role: 'user', content: question },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content;

      const citations = this.extractCitations(chunks);

      return {
        answer,
        citations,
        model: 'gpt-4o-mini',
        sources: chunks.length,
      };
    } catch (error) {
      this.logger.error(`OpenAI generation failed: ${error.message}`);
      return this.generateFallback(question, context, language, chunks);
    }
  }

  private generateFallback(question: string, context: string, language: string, chunks: any[]) {
    const noResults: Record<string, string> = {
      uz: "Kechirasiz, sizning savolingiz bo'yicha bazamizda aniq huquqiy ma'lumot topilmadi. Iltimos, savolni boshqacha tarzda yozing yoki professional yurist bilan bog'laning.",
      ru: 'К сожалению, по вашему запросу в нашей базе не найдена конкретная правовая информация. Пожалуйста, перефразируйте вопрос или обратитесь к профессиональному юристу.',
      en: 'Unfortunately, no specific legal information was found in our database for your query. Please rephrase your question or consult with a professional lawyer.',
    };

    const prefixes: Record<string, string> = {
      uz: "Sizning savolingiz bo'yicha topilgan huquqiy ma'lumotlar:",
      ru: 'По вашему вопросу найдена следующая правовая информация:',
      en: 'Based on your question, here is the relevant legal information:',
    };

    const citations = this.extractCitations(chunks);

    if (chunks.length === 0) {
      return {
        answer: noResults[language] || noResults.ru,
        citations,
        model: 'keyword-search-fallback',
        sources: 0,
      };
    }

    return {
      answer: `${prefixes[language] || prefixes.ru}\n\n${context}`,
      citations,
      model: 'keyword-search-fallback',
      sources: chunks.length,
    };
  }

  private extractCitations(chunks: any[]) {
    const seen = new Set<string>();
    const citations: Array<{ type: string; id: string; title: string; slug: string }> = [];

    for (const chunk of chunks) {
      const key = `${chunk.contentType}:${chunk.contentId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      citations.push({
        type: chunk.contentType,
        id: chunk.contentId,
        title: chunk.metadata?.titleRu || chunk.metadata?.titleUz || 'Unknown',
        slug: chunk.metadata?.slug || '',
      });
    }

    return citations;
  }
}
