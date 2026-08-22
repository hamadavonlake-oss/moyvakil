import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  DocumentStatus,
  SectionType,
} from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLegalDocumentDto,
  UpdateLegalDocumentDto,
  LegalDocumentQueryDto,
  SectionQueryDto,
} from './dto/law.dto';

const DOCUMENT_LIST_SELECT = {
  id: true,
  title: true,
  documentType: true,
  status: true,
  effectiveFrom: true,
  effectiveTo: true,
  languageCode: true,
  createdAt: true,
  updatedAt: true,
  country: { select: { id: true, code: true, nameUz: true, nameRu: true, nameEn: true } },
  jurisdiction: { select: { id: true, code: true, name: true } },
  source: { select: { id: true, authorityName: true, title: true, documentType: true, officialUrl: true } },
  _count: { select: { versions: true, sections: true } },
} satisfies Prisma.LegalDocumentSelect;

@Injectable()
export class LawsService {
  constructor(private prisma: PrismaService) {}

  private hashPayload(payload: unknown): string {
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  async findAll(query: LegalDocumentQueryDto) {
    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = Math.min(query.limit ? Number(query.limit) : 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.LegalDocumentWhereInput = {};
    if (query.countryId) where.countryId = query.countryId;
    if (query.documentType) where.documentType = query.documentType;
    if (query.status) where.status = query.status as DocumentStatus;
    if (query.language) where.languageCode = query.language;

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' as Prisma.QueryMode } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.legalDocument.findMany({
        where,
        select: DOCUMENT_LIST_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.legalDocument.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async findById(id: string) {
    const document = await this.prisma.legalDocument.findUnique({
      where: { id },
      include: {
        source: {
          select: {
            id: true,
            authorityName: true,
            authorityType: true,
            countryCode: true,
            officialUrl: true,
            title: true,
            documentType: true,
            documentNumber: true,
            status: true,
          },
        },
        country: { select: { id: true, code: true, nameUz: true, nameRu: true, nameEn: true } },
        jurisdiction: { select: { id: true, code: true, name: true, level: true } },
        versions: { orderBy: { versionNumber: 'desc' } },
        sections: {
          orderBy: [{ ordinal: 'asc' }, { sectionLabel: 'asc' }],
          select: {
            id: true,
            parentSectionId: true,
            versionId: true,
            sectionType: true,
            sectionLabel: true,
            ordinal: true,
            languageCode: true,
            status: true,
            effectiveFrom: true,
            effectiveTo: true,
          },
        },
      },
    });
    if (!document) throw new NotFoundException(`Legal document "${id}" not found`);
    return document;
  }

  async getSections(documentId: string, query: SectionQueryDto) {
    const document = await this.prisma.legalDocument.findUnique({
      where: { id: documentId },
      select: { id: true },
    });
    if (!document) throw new NotFoundException(`Legal document "${documentId}" not found`);

    const page = query.page && query.page > 0 ? Number(query.page) : 1;
    const limit = Math.min(query.limit ? Number(query.limit) : 50, 200);
    const skip = (page - 1) * limit;

    const where: Prisma.LegalSectionWhereInput = { documentId };
    if (query.sectionType) where.sectionType = query.sectionType as SectionType;
    if (query.versionId) where.versionId = query.versionId;
    if (query.language) where.languageCode = query.language;

    const [items, total] = await Promise.all([
      this.prisma.legalSection.findMany({
        where,
        orderBy: [{ ordinal: 'asc' }, { sectionLabel: 'asc' }],
        skip,
        take: limit,
        select: {
          id: true,
          documentId: true,
          versionId: true,
          parentSectionId: true,
          sectionType: true,
          sectionLabel: true,
          ordinal: true,
          languageCode: true,
          countryCode: true,
          jurisdictionId: true,
          status: true,
          effectiveFrom: true,
          effectiveTo: true,
          sourceUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.legalSection.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getSectionById(id: string) {
    const section = await this.prisma.legalSection.findUnique({
      where: { id },
      include: {
        childSections: {
          orderBy: { ordinal: 'asc' },
          select: {
            id: true,
            sectionType: true,
            sectionLabel: true,
            ordinal: true,
          },
        },
      },
    });
    if (!section) throw new NotFoundException(`Section "${id}" not found`);
    return section;
  }

  async create(dto: CreateLegalDocumentDto) {
    const data: Prisma.LegalDocumentCreateInput = {
      title: dto.title,
      documentType: dto.documentType,
      status: (dto.status as DocumentStatus) ?? DocumentStatus.current,
      effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : null,
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      languageCode: dto.languageCode ?? 'uz',
      contentHash: this.hashPayload(dto),
      source: { connect: { id: dto.sourceId } },
      country: { connect: { id: dto.countryId } },
      ...(dto.jurisdictionId
        ? { jurisdiction: { connect: { id: dto.jurisdictionId } } }
        : {}),
    };

    return this.prisma.legalDocument.create({ data });
  }

  async update(id: string, dto: UpdateLegalDocumentDto) {
    await this.findById(id);

    const data: Prisma.LegalDocumentUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.documentType !== undefined) data.documentType = dto.documentType;
    if (dto.status !== undefined) data.status = dto.status as DocumentStatus;
    if (dto.effectiveFrom !== undefined)
      data.effectiveFrom = dto.effectiveFrom ? new Date(dto.effectiveFrom) : null;
    if (dto.effectiveTo !== undefined)
      data.effectiveTo = dto.effectiveTo ? new Date(dto.effectiveTo) : null;
    if (dto.languageCode !== undefined) data.languageCode = dto.languageCode;
    if (dto.sourceId !== undefined) data.source = { connect: { id: dto.sourceId } };
    if (dto.countryId !== undefined) data.country = { connect: { id: dto.countryId } };
    if (dto.jurisdictionId !== undefined)
      data.jurisdiction = dto.jurisdictionId
        ? { connect: { id: dto.jurisdictionId } }
        : { disconnect: true };

    data.contentHash = this.hashPayload(data);

    return this.prisma.legalDocument.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.legalDocument.delete({ where: { id } });
  }
}
