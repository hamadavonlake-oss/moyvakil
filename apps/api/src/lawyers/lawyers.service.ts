import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLawyerDto, UpdateLawyerDto, LawyerQueryDto } from './dto/lawyer.dto';

@Injectable()
export class LawyersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: LawyerQueryDto) {
    const { q, city, practiceArea, language, verified, countryId, minRating, page = 1, limit = 20 } = query;

    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (verified !== undefined) where.isVerified = verified;
    if (minRating) where.avgRating = { gte: Number(minRating) };
    if (practiceArea) where.practiceAreas = { some: { area: practiceArea } };
    if (language) where.languages = { some: { language } };
    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { bioUz: { contains: q, mode: 'insensitive' } },
        { bioRu: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.lawyer.findMany({
        where,
        select: {
          id: true,
          slug: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          city: true,
          region: true,
          yearsOfPractice: true,
          avgRating: true,
          reviewCount: true,
          isVerified: true,
          licenseVerified: true,
          practiceAreas: true,
          languages: true,
          country: { select: { code: true } },
        },
        orderBy: [{ isVerified: 'desc' }, { avgRating: 'desc' }],
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.lawyer.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findBySlug(slug: string) {
    const lawyer = await this.prisma.lawyer.findUnique({
      where: { slug },
      include: {
        practiceAreas: true,
        languages: true,
        reviews: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' }, take: 10 },
        services: { where: { isActive: true } },
        country: { select: { code: true, nameUz: true, nameRu: true } },
      },
    });
    if (!lawyer) throw new NotFoundException(`Lawyer "${slug}" not found`);
    return lawyer;
  }

  async create(dto: CreateLawyerDto) {
    const { practiceAreas, languages, ...data } = dto;
    return this.prisma.lawyer.create({
      data: {
        ...data,
        practiceAreas: practiceAreas?.length
          ? { create: practiceAreas.map((area) => ({ area })) }
          : undefined,
        languages: languages?.length
          ? { create: languages.map((language) => ({ language })) }
          : undefined,
      },
      include: { practiceAreas: true, languages: true },
    });
  }

  async update(id: string, dto: UpdateLawyerDto) {
    const { practiceAreas, languages, ...data } = dto;
    await this.prisma.lawyer.findUniqueOrThrow({ where: { id } });

    const updateData: any = { ...data };

    if (practiceAreas) {
      await this.prisma.practiceArea.deleteMany({ where: { lawyerId: id } });
      updateData.practiceAreas = { create: practiceAreas.map((area) => ({ area })) };
    }
    if (languages) {
      await this.prisma.lawyerLanguage.deleteMany({ where: { lawyerId: id } });
      updateData.languages = { create: languages.map((language) => ({ language })) };
    }

    return this.prisma.lawyer.update({
      where: { id },
      data: updateData,
      include: { practiceAreas: true, languages: true },
    });
  }

  async delete(id: string) {
    await this.prisma.lawyer.findUniqueOrThrow({ where: { id } });
    return this.prisma.lawyer.delete({ where: { id } });
  }

  async getReviewsBySlug(slug: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { slug }, select: { id: true } });
    if (!lawyer) throw new NotFoundException(`Lawyer "${slug}" not found`);
    return this.prisma.review.findMany({
      where: { lawyerId: lawyer.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getServicesBySlug(slug: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { slug }, select: { id: true } });
    if (!lawyer) throw new NotFoundException(`Lawyer "${slug}" not found`);
    return this.prisma.legalService.findMany({
      where: { lawyerId: lawyer.id, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRating(lawyerId: string) {
    const stats = await this.prisma.review.aggregate({
      where: { lawyerId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        avgRating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });
  }
}
