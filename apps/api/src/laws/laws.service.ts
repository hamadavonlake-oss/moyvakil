import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLawDto, UpdateLawDto, LawQueryDto } from './dto/law.dto';

@Injectable()
export class LawsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: LawQueryDto) {
    const { q, category, type, status, countryId, page = 1, limit = 20 } = query;

    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;

    if (q) {
      where.OR = [
        { titleUz: { contains: q, mode: 'insensitive' } },
        { titleRu: { contains: q, mode: 'insensitive' } },
        { titleEn: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.law.findMany({
        where,
        select: {
          id: true,
          slug: true,
          titleUz: true,
          titleRu: true,
          titleEn: true,
          type: true,
          category: true,
          status: true,
          adoptionDate: true,
          sourceUrl: true,
          lastUpdated: true,
          country: { select: { code: true, nameUz: true, nameRu: true } },
        },
        orderBy: { lastUpdated: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.law.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findBySlug(slug: string) {
    const law = await this.prisma.law.findUnique({
      where: { slug },
      include: {
        articles: { orderBy: { number: 'asc' } },
        amendments: { orderBy: { date: 'desc' } },
        country: { select: { code: true, nameUz: true, nameRu: true, nameEn: true } },
      },
    });
    if (!law) throw new NotFoundException(`Law "${slug}" not found`);
    return law;
  }

  async findById(id: string) {
    const law = await this.prisma.law.findUnique({
      where: { id },
      include: {
        articles: { orderBy: { number: 'asc' } },
        amendments: { orderBy: { date: 'desc' } },
        country: { select: { code: true, nameUz: true, nameRu: true } },
      },
    });
    if (!law) throw new NotFoundException(`Law "${id}" not found`);
    return law;
  }

  async create(dto: CreateLawDto) {
    return this.prisma.law.create({
      data: {
        ...dto,
        type: dto.type as any,
        status: (dto.status as any) || 'IN_FORCE',
        adoptionDate: dto.adoptionDate ? new Date(dto.adoptionDate) : undefined,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
      },
    });
  }

  async update(id: string, dto: UpdateLawDto) {
    await this.findById(id);
    const { adoptionDate, status, ...rest } = dto;
    return this.prisma.law.update({
      where: { id },
      data: {
        ...rest,
        status: status as any,
        adoptionDate: adoptionDate ? new Date(adoptionDate) : undefined,
        lastUpdated: new Date(),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.law.delete({ where: { id } });
  }
}
