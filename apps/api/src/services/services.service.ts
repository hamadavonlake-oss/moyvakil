import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findByLawyer(lawyerId: string) {
    return this.prisma.legalService.findMany({
      where: { lawyerId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLawyerSlug(slug: string) {
    const lawyer = await this.prisma.lawyer.findUnique({ where: { slug }, select: { id: true } });
    if (!lawyer) throw new NotFoundException(`Lawyer "${slug}" not found`);
    return this.findByLawyer(lawyer.id);
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.legalService.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.legalService.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Service "${id}" not found`);
    return this.prisma.legalService.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    const existing = await this.prisma.legalService.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Service "${id}" not found`);
    await this.prisma.legalService.delete({ where: { id } });
    return { deleted: true };
  }
}
