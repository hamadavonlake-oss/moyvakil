import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LegalSearchDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private prisma: PrismaService) {}

  async search(dto: LegalSearchDto) {
    const { q, countryCode, documentType, sectionType, language, status, page = 1, limit = 20 } = dto;
    const words = q.split(/\s+/).filter((w) => w.length > 2);

    const where: any = {};
    if (status) where.status = status;
    if (sectionType) where.sectionType = sectionType;
    if (countryCode) {
      const country = await this.prisma.country.findUnique({ where: { code: countryCode } });
      if (country) where.countryId = country.id;
    }
    if (language) where.languageCode = language;

    if (words.length > 0) {
      where.OR = words.flatMap((word: string) => [
        { textNormalized: { contains: word, mode: 'insensitive' } },
        { sectionLabel: { contains: word, mode: 'insensitive' } },
      ]);
    } else {
      where.OR = [
        { textNormalized: { contains: q, mode: 'insensitive' } },
        { sectionLabel: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (documentType) {
      where.document = { documentType };
    }

    const [items, total] = await Promise.all([
      this.prisma.legalSection.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: {
          id: true,
          sectionType: true,
          sectionLabel: true,
          ordinal: true,
          textNormalized: true,
          sourceUrl: true,
          status: true,
          effectiveFrom: true,
          effectiveTo: true,
          document: {
            select: {
              id: true,
              title: true,
              documentType: true,
              status: true,
              effectiveFrom: true,
              source: {
                select: { authorityName: true, officialUrl: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.legalSection.count({ where }),
    ]);

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      query: q,
    };
  }
}
