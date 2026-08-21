import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuideDto, UpdateGuideDto, GuideQueryDto } from './dto/guide.dto';

@Injectable()
export class GuidesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GuideQueryDto) {
    const { category, q, countryId, page = 1, limit = 20 } = query;

    const where: any = { published: true };
    if (countryId) where.countryId = countryId;
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { titleUz: { contains: q, mode: 'insensitive' } },
        { titleRu: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        select: {
          id: true,
          slug: true,
          titleUz: true,
          titleRu: true,
          titleEn: true,
          category: true,
          tags: true,
          readingTime: true,
          createdAt: true,
          country: { select: { code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.guide.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findBySlug(slug: string) {
    const guide = await this.prisma.guide.findUnique({
      where: { slug },
      include: {
        law: { select: { id: true, slug: true, titleUz: true, titleRu: true } },
        country: { select: { code: true, nameUz: true, nameRu: true } },
      },
    });
    if (!guide) throw new NotFoundException(`Guide "${slug}" not found`);
    return guide;
  }

  async create(dto: CreateGuideDto) {
    const { tags, ...data } = dto;
    return this.prisma.guide.create({
      data: { ...data, tags: tags || [] },
    });
  }

  async update(id: string, dto: UpdateGuideDto) {
    await this.prisma.guide.findUniqueOrThrow({ where: { id } });
    return this.prisma.guide.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.prisma.guide.findUniqueOrThrow({ where: { id } });
    return this.prisma.guide.delete({ where: { id } });
  }
}
