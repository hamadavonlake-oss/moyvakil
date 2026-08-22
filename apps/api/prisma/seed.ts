import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vakilim database...\n');

  // === 1. Create Countries ===
  const uz = await prisma.country.upsert({
    where: { code: 'UZ' },
    update: {},
    create: {
      code: 'UZ',
      nameUz: "O'zbekiston Respublikasi",
      nameRu: 'Республика Узбекистан',
      nameEn: 'Republic of Uzbekistan',
    },
  });
  console.log(`Country: ${uz.nameRu} (${uz.code})`);

  // === 2. Create Languages ===
  const languages = [
    { code: 'uz', name: "O'zbek tili", direction: 'ltr', isDefault: true },
    { code: 'ru', name: 'Русский язык', direction: 'ltr', isDefault: false },
    { code: 'en', name: 'English', direction: 'ltr', isDefault: false },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
    console.log(`Language: ${lang.name} (${lang.code})`);
  }

  // === 3. Create Jurisdiction ===
  await prisma.jurisdiction.upsert({
    where: { countryId_code: { countryId: uz.id, code: 'UZ-REP' } },
    update: {},
    create: {
      countryId: uz.id,
      code: 'UZ-REP',
      name: 'Republic of Uzbekistan',
      level: 'national',
    },
  });
  console.log('Jurisdiction: UZ-REP (national)');

  // === 4. Create Super Admin ===
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vakilim.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-strong-password';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin',
    },
  });
  console.log(`Admin: ${adminEmail}`);

  // === 5. Create Legal Source (Lex.uz placeholder) ===
  const lexUz = await prisma.legalSource.upsert({
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
  console.log(`Source: ${lexUz.authorityName}`);

  // === 6. Create placeholder documents ===
  // PLACEHOLDER: real law text must be sourced from lex.uz and verified by a licensed attorney.
  const documents = [
    {
      title: "Constitution of the Republic of Uzbekistan",
      documentType: 'constitution',
      effectiveFrom: new Date('1992-12-08'),
      sourceUrl: 'https://lex.uz/docs/9531',
    },
    {
      title: 'Labor Code of Uzbekistan',
      documentType: 'code',
      effectiveFrom: new Date('2023-01-01'),
      sourceUrl: 'https://lex.uz/docs/6257291',
    },
    {
      title: 'Civil Code of Uzbekistan',
      documentType: 'code',
      effectiveFrom: new Date('1997-01-01'),
      sourceUrl: 'https://lex.uz/docs/9527',
    },
    {
      title: 'Criminal Code of Uzbekistan',
      documentType: 'code',
      effectiveFrom: new Date('1994-09-22'),
      sourceUrl: 'https://lex.uz/docs/9577',
    },
    {
      title: 'Economic Procedure Code of Uzbekistan',
      documentType: 'code',
      effectiveFrom: new Date('2018-01-01'),
      sourceUrl: 'https://lex.uz/docs/3281041',
    },
    {
      title: 'Law on Courts and Status of Judges',
      documentType: 'law',
      effectiveFrom: new Date('2017-05-22'),
      sourceUrl: 'https://lex.uz/docs/3136138',
    },
  ];

  for (const doc of documents) {
    const existing = await prisma.legalDocument.findFirst({
      where: { title: doc.title },
    });
    if (!existing) {
      const created = await prisma.legalDocument.create({
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

      // Create version 1
      await prisma.legalVersion.create({
        data: {
          documentId: created.id,
          versionNumber: 1,
          effectiveFrom: doc.effectiveFrom,
          status: 'current',
          contentHash: '[TBD - REQUIRES LICENSED ATTORNEY REVIEW]',
          sourceUrl: doc.sourceUrl,
        },
      });
      console.log(`Document: ${doc.title}`);
    }
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
