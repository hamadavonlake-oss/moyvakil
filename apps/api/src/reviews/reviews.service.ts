import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, ModerateReviewDto } from './dto/review.dto';
import { LawyersService } from '../lawyers/lawyers.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private lawyersService: LawyersService,
  ) {}

  async findByLawyer(lawyerId: string) {
    return this.prisma.review.findMany({
      where: { lawyerId, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending() {
    return this.prisma.review.findMany({
      where: { status: 'PENDING' },
      include: { lawyer: { select: { id: true, firstName: true, lastName: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: { ...dto, status: 'PENDING' },
    });
    return review;
  }

  async moderate(id: string, dto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review "${id}" not found`);

    const updated = await this.prisma.review.update({
      where: { id },
      data: { status: dto.status as any },
    });

    if (dto.status === 'APPROVED') {
      await this.lawyersService.updateRating(review.lawyerId);
    }

    return updated;
  }

  async delete(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException(`Review "${id}" not found`);
    await this.prisma.review.delete({ where: { id } });
    await this.lawyersService.updateRating(review.lawyerId);
    return { deleted: true };
  }
}
