import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private prisma: PrismaService) {}

  async indexAllSections(countryId?: string) {
    this.logger.log('Starting section indexing...');

    const where: any = {};
    if (countryId) where.countryId = countryId;

    const sections = await this.prisma.legalSection.findMany({
      where,
      include: {
        document: { select: { id: true, title: true, documentType: true, languageCode: true } },
      },
      take: 500,
    });

    let indexed = 0;
    for (const section of sections) {
      try {
        await this.indexSection(section);
        indexed++;
      } catch (error) {
        this.logger.error(`Failed to index section ${section.id}: ${error.message}`);
      }
    }

    this.logger.log(`Indexed ${indexed}/${sections.length} sections`);
    return { indexed, total: sections.length };
  }

  async indexSection(section: any) {
    await this.prisma.embedding.deleteMany({ where: { sectionId: section.id } });

    const text = section.textNormalized || section.textOriginal || '';
    const chunks = this.chunkText(text, 1000);

    for (const chunk of chunks) {
      const embedding = await this.getEmbedding(chunk);
      if (!embedding) continue;

      const embeddingStr = `[${embedding.join(',')}]`;
      await this.prisma.$executeRaw`
        INSERT INTO "Embedding" (id, "sectionId", embedding, "modelName", dimensions, "createdAt")
        VALUES (gen_random_uuid()::text, ${section.id}, ${embeddingStr}::vector, 'text-embedding-3-small', 1536, NOW())
      `;
    }

    this.logger.log(`Indexed section: ${section.id} (${chunks.length} chunks)`);
  }

  async getStats() {
    const result = await this.prisma.embedding.groupBy({
      by: ['modelName'],
      _count: true,
    });

    const total = result.reduce((sum, r) => sum + r._count, 0);
    return { total, byModel: result };
  }

  async clearAll() {
    const result = await this.prisma.embedding.deleteMany();
    return { deleted: result.count };
  }

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

      if (!response.ok) throw new Error(`Embedding API error: ${response.status}`);
      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      this.logger.error(`Embedding failed: ${error.message}`);
      return null;
    }
  }
}
