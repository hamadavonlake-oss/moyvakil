import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [lawCount, lawyerCount, questionCount, reviewPendingCount, guideCount] = await Promise.all([
      this.prisma.law.count(),
      this.prisma.lawyer.count(),
      this.prisma.question.count(),
      this.prisma.review.count({ where: { status: 'PENDING' } }),
      this.prisma.guide.count(),
    ]);

    return {
      laws: lawCount,
      lawyers: lawyerCount,
      questions: questionCount,
      pendingReviews: reviewPendingCount,
      guides: guideCount,
    };
  }

  async getAllLaws() {
    return this.prisma.law.findMany({
      select: {
        id: true,
        slug: true,
        titleUz: true,
        titleRu: true,
        type: true,
        category: true,
        status: true,
        lastUpdated: true,
      },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  async getAllLawyers() {
    return this.prisma.lawyer.findMany({
      select: {
        id: true,
        slug: true,
        firstName: true,
        lastName: true,
        city: true,
        isVerified: true,
        licenseVerified: true,
        avgRating: true,
        reviewCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReviews(status?: string) {
    const where = status ? { status: status as any } : {};
    return this.prisma.review.findMany({
      where,
      include: { lawyer: { select: { id: true, firstName: true, lastName: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
