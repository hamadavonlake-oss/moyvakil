import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private prisma: PrismaService) {}

  async indexAllLaws(countryId?: string) {
    this.logger.log('Starting law indexing...');

    const where: any = {};
    if (countryId) where.countryId = countryId;

    const laws = await this.prisma.law.findMany({
      where,
      include: { articles: true },
    });

    let indexed = 0;
    for (const law of laws) {
      try {
        await this.indexLaw(law);
        indexed++;
      } catch (error) {
        this.logger.error(`Failed to index law ${law.slug}: ${error.message}`);
      }
    }

    this.logger.log(`Indexed ${indexed}/${laws.length} laws`);
    return { indexed, total: laws.length };
  }

  async indexLaw(law: any) {
    // Remove existing embeddings for this law using raw SQL
    await this.prisma.$executeRaw`DELETE FROM legal_embeddings WHERE content_id = ${law.id} AND content_type = 'law'`;

    const chunks: string[] = [];

    if (law.summaryUz) chunks.push(`[${law.titleUz}] ${law.summaryUz}`);
    if (law.summaryRu) chunks.push(`[${law.titleRu}] ${law.summaryRu}`);
    if (law.summaryEn) chunks.push(`[${law.titleEn}] ${law.summaryEn}`);

    if (law.fullTextRu) {
      chunks.push(...this.chunkText(law.fullTextRu, 1000).map((t) => `[${law.titleRu}] ${t}`));
    }
    if (law.fullTextUz) {
      chunks.push(...this.chunkText(law.fullTextUz, 1000).map((t) => `[${law.titleUz}] ${t}`));
    }

    for (const article of law.articles || []) {
      const articleText = `[${law.titleRu}, ${article.number}] ${article.contentRu || article.contentUz || ''}`;
      chunks.push(articleText);
    }

    for (const chunk of chunks) {
      const embedding = await this.getEmbedding(chunk);
      if (!embedding) continue;

      const embeddingStr = `[${embedding.join(',')}]`;
      const metadata = JSON.stringify({
        titleUz: law.titleUz,
        titleRu: law.titleRu,
        titleEn: law.titleEn,
        slug: law.slug,
        category: law.category,
        type: law.type,
        countryId: law.countryId,
      });

      await this.prisma.$executeRaw`
        INSERT INTO legal_embeddings (id, content_id, content_type, chunk, embedding, metadata, created_at)
        VALUES (gen_random_uuid()::text, ${law.id}, 'law', ${chunk.substring(0, 5000)}::text, ${embeddingStr}::vector, ${metadata}::jsonb, NOW())
      `;
    }

    this.logger.log(`Indexed law: ${law.slug} (${chunks.length} chunks)`);
  }

  async indexAllGuides(countryId?: string) {
    this.logger.log('Starting guide indexing...');

    const where: any = { published: true };
    if (countryId) where.countryId = countryId;

    const guides = await this.prisma.guide.findMany({ where });
    let indexed = 0;

    for (const guide of guides) {
      try {
        await this.indexGuide(guide);
        indexed++;
      } catch (error) {
        this.logger.error(`Failed to index guide ${guide.slug}: ${error.message}`);
      }
    }

    this.logger.log(`Indexed ${indexed}/${guides.length} guides`);
    return { indexed, total: guides.length };
  }

  async indexGuide(guide: any) {
    await this.prisma.$executeRaw`DELETE FROM legal_embeddings WHERE content_id = ${guide.id} AND content_type = 'guide'`;

    const chunks: string[] = [];
    if (guide.bodyRu) chunks.push(...this.chunkText(guide.bodyRu, 1000).map((t) => `[${guide.titleRu}] ${t}`));
    if (guide.bodyUz) chunks.push(...this.chunkText(guide.bodyUz, 1000).map((t) => `[${guide.titleUz}] ${t}`));

    for (const chunk of chunks) {
      const embedding = await this.getEmbedding(chunk);
      if (!embedding) continue;

      const embeddingStr = `[${embedding.join(',')}]`;
      const metadata = JSON.stringify({
        titleUz: guide.titleUz,
        titleRu: guide.titleRu,
        titleEn: guide.titleEn,
        slug: guide.slug,
        category: guide.category,
        countryId: guide.countryId,
      });

      await this.prisma.$executeRaw`
        INSERT INTO legal_embeddings (id, content_id, content_type, chunk, embedding, metadata, created_at)
        VALUES (gen_random_uuid()::text, ${guide.id}, 'guide', ${chunk.substring(0, 5000)}::text, ${embeddingStr}::vector, ${metadata}::jsonb, NOW())
      `;
    }

    this.logger.log(`Indexed guide: ${guide.slug} (${chunks.length} chunks)`);
  }

  async getStats() {
    try {
      const result = await this.prisma.$queryRaw`
        SELECT content_type as "contentType", COUNT(*) as count
        FROM legal_embeddings
        GROUP BY content_type
      ` as any[];

      const total = result.reduce((sum: number, r: any) => sum + Number(r.count), 0);
      return { total, byType: result };
    } catch {
      return { total: 0, byType: [], note: 'Vector search not available (pgvector extension required)' };
    }
  }

  async clearAll() {
    try {
      const result = await this.prisma.$executeRaw`DELETE FROM legal_embeddings`;
      return { deleted: Number(result) };
    } catch {
      return { deleted: 0, note: 'Vector search not available (pgvector extension required)' };
    }
  }

  // === HELPERS ===

  private chunkText(text: string, maxChars: number): string[] {
    if (!text) return [];
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');

    let current = '';
    for (const para of paragraphs) {
      if (current.length + para.length > maxChars && current.length > 0) {
        chunks.push(current.trim());
        current = '';
      }
      current += para + '\n\n';
    }
    if (current.trim()) chunks.push(current.trim());

    return chunks;
  }

  private async getEmbedding(text: string): Promise<number[] | null> {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('OpenAI API key not set, skipping embedding generation');
      return null;
    }

    try {
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
        throw new Error(`Embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error.message}`);
      return null;
    }
  }
}
