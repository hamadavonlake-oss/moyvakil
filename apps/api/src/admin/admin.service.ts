import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [documentCount, sourceCount, userCount] = await Promise.all([
      this.prisma.legalDocument.count(),
      this.prisma.legalSource.count(),
      this.prisma.user.count(),
    ]);

    return {
      documents: documentCount,
      sources: sourceCount,
      users: userCount,
    };
  }

  async getAllDocuments() {
    return this.prisma.legalDocument.findMany({
      select: {
        id: true,
        title: true,
        documentType: true,
        status: true,
        effectiveFrom: true,
        effectiveTo: true,
        createdAt: true,
        source: {
          select: { authorityName: true, officialUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSources() {
    return this.prisma.legalSource.findMany({
      select: {
        id: true,
        authorityName: true,
        authorityType: true,
        countryCode: true,
        officialUrl: true,
        status: true,
        documentType: true,
        retrievedAt: true,
      },
      orderBy: { retrievedAt: 'desc' },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAuditEvents(limit = 50) {
    return this.prisma.auditEvent.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
      },
    });
  }
}
