import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const COUNTRY_SELECT = {
  id: true,
  code: true,
  nameUz: true,
  nameRu: true,
  nameEn: true,
} satisfies Prisma.CountrySelect;

const JURISDICTION_SELECT = {
  id: true,
  code: true,
  name: true,
  level: true,
  parentId: true,
  parent: { select: { id: true, code: true, name: true, level: true } },
} satisfies Prisma.JurisdictionSelect;

@Injectable()
export class JurisdictionsService {
  constructor(private prisma: PrismaService) {}

  async listCountries() {
    return this.prisma.country.findMany({
      where: { isActive: true },
      select: COUNTRY_SELECT,
      orderBy: { nameEn: 'asc' },
    });
  }

  async getCountryByCode(code: string) {
    const country = await this.prisma.country.findUnique({
      where: { code },
      select: COUNTRY_SELECT,
    });
    if (!country) throw new NotFoundException(`Country "${code}" not found`);
    return country;
  }

  async listJurisdictions(countryId: string) {
    const country = await this.prisma.country.findUnique({
      where: { id: countryId },
      select: { id: true },
    });
    if (!country) throw new NotFoundException(`Country "${countryId}" not found`);

    return this.prisma.jurisdiction.findMany({
      where: { countryId, isActive: true },
      select: JURISDICTION_SELECT,
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
    });
  }

  async listLanguages() {
    return this.prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
