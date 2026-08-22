import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async seedDatabase() {
    const results: string[] = [];

    const uz = await this.prisma.country.upsert({
      where: { code: 'UZ' },
      update: {},
      create: {
        code: 'UZ',
        nameUz: "O'zbekiston Respublikasi",
        nameRu: 'Республика Узбекистан',
        nameEn: 'Republic of Uzbekistan',
      },
    });
    results.push(`Country: ${uz.code}`);

    const languages = [
      { code: 'uz', name: "O'zbek tili", direction: 'ltr', isDefault: true },
      { code: 'ru', name: 'Русский язык', direction: 'ltr', isDefault: false },
      { code: 'en', name: 'English', direction: 'ltr', isDefault: false },
    ];
    for (const lang of languages) {
      await this.prisma.language.upsert({
        where: { code: lang.code },
        update: {},
        create: lang,
      });
      results.push(`Language: ${lang.code}`);
    }

    await this.prisma.jurisdiction.upsert({
      where: { countryId_code: { countryId: uz.id, code: 'UZ-REP' } },
      update: {},
      create: { countryId: uz.id, code: 'UZ-REP', name: 'Republic of Uzbekistan', level: 'national' },
    });
    results.push('Jurisdiction: UZ-REP');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vakilim.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-strong-password';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await this.prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, password: hashedPassword, name: 'Super Admin', role: 'super_admin' },
    });
    results.push(`Admin: ${adminEmail}`);

    const lexUz = await this.prisma.legalSource.upsert({
      where: { id: 'seed-lex-uz' },
      update: {},
      create: {
        id: 'seed-lex-uz',
        authorityName: 'Lex.uz',
        authorityType: 'national_legislation',
        countryCode: 'UZ',
        officialUrl: 'https://lex.uz',
        title: 'Lex.uz - National Legislation Database of Uzbekistan',
        documentType: 'legislation',
        status: 'active',
      },
    });
    results.push(`Source: ${lexUz.authorityName}`);

    const documents = [
      { title: 'Constitution of the Republic of Uzbekistan', documentType: 'constitution', effectiveFrom: new Date('1992-12-08'), sourceUrl: 'https://lex.uz/docs/9531' },
      { title: 'Labor Code of Uzbekistan', documentType: 'code', effectiveFrom: new Date('2023-01-01'), sourceUrl: 'https://lex.uz/docs/6257291' },
      { title: 'Civil Code of Uzbekistan', documentType: 'code', effectiveFrom: new Date('1997-01-01'), sourceUrl: 'https://lex.uz/docs/9527' },
      { title: 'Criminal Code of Uzbekistan', documentType: 'code', effectiveFrom: new Date('1994-09-22'), sourceUrl: 'https://lex.uz/docs/9577' },
      { title: 'Economic Procedure Code of Uzbekistan', documentType: 'code', effectiveFrom: new Date('2018-01-01'), sourceUrl: 'https://lex.uz/docs/3281041' },
      { title: 'Law on Courts and Status of Judges', documentType: 'law', effectiveFrom: new Date('2017-05-22'), sourceUrl: 'https://lex.uz/docs/3136138' },
    ];

    for (const doc of documents) {
      const existing = await this.prisma.legalDocument.findFirst({ where: { title: doc.title } });
      if (!existing) {
        const created = await this.prisma.legalDocument.create({
          data: {
            sourceId: lexUz.id,
            countryId: uz.id,
            title: doc.title,
            documentType: doc.documentType,
            effectiveFrom: doc.effectiveFrom,
            languageCode: 'uz',
            contentHash: '[TBD - REQUIRES LICENSED ATTORNEY REVIEW]',
          },
        });
        await this.prisma.legalVersion.create({
          data: {
            documentId: created.id,
            versionNumber: 1,
            effectiveFrom: doc.effectiveFrom,
            status: 'current',
            contentHash: '[TBD - REQUIRES LICENSED ATTORNEY REVIEW]',
            sourceUrl: doc.sourceUrl,
          },
        });
        results.push(`Document: ${doc.title}`);
      }
    }

    return { ok: true, seeded: results };
  }

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
