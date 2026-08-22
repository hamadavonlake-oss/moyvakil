import { PrismaClient, UserRole, LawType, LawStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MoyVakil database...\n');

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

  // === 2. Create Super Admin ===
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@wakeely.ca';
  const adminPassword = process.env.ADMIN_PASSWORD || 'change-me-strong-password';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log(`Admin: ${adminEmail}`);

  // === 3. Seed Laws ===
  // PLACEHOLDER: real law text must be sourced from lex.uz and verified by a licensed attorney.
  // All fullText fields below are stubs and MUST be replaced with actual statutory text.
  const laws = [
    {
      slug: 'constitution-uz',
      titleUz: "O'zbekiston Respublikasining Konstitusiyasi",
      titleRu: 'Конституция Республики Узбекистан',
      titleEn: 'Constitution of the Republic of Uzbekistan',
      type: LawType.CONSTITUTION,
      category: 'constitutional',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('1992-12-08'),
      sourceUrl: 'https://lex.uz/docs/9531',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]\n\nKonstitusiya matni lex.uz dan olinishi va litsenziyalangan advokat tomonidan tasdiqlanishi kerak.',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]\n\nText Konstitutsii dolzhen byt vzyat iz lex.uz i proveren litsenzirovannym advokatom.',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]\n\nConstitution text must be sourced from lex.uz and verified by a licensed attorney.',
    },
    {
      slug: 'labor-code-uz',
      titleUz: 'Mehnat kodeksi',
      titleRu: 'Трудовой кодекс',
      titleEn: 'Labor Code',
      type: LawType.CODE,
      category: 'labor',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('2022-10-28'),
      sourceUrl: 'https://lex.uz/docs/6257291',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
    },
    {
      slug: 'civil-code-uz',
      titleUz: 'Fuqarolik kodeksi',
      titleRu: 'Гражданский кодекс',
      titleEn: 'Civil Code',
      type: LawType.CODE,
      category: 'civil',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('1996-08-26'),
      sourceUrl: 'https://lex.uz/docs/9527',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
    },
    {
      slug: 'criminal-code-uz',
      titleUz: 'Jinoyat kodeksi',
      titleRu: 'Уголовный кодекс',
      titleEn: 'Criminal Code',
      type: LawType.CODE,
      category: 'criminal',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('1994-09-22'),
      sourceUrl: 'https://lex.uz/docs/9577',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
    },
    {
      slug: 'economic-procedure-code-uz',
      titleUz: 'Iqtisodiy protsessual kodeksi',
      titleRu: 'Экономический процессуальный кодекс',
      titleEn: 'Economic Procedure Code',
      type: LawType.CODE,
      category: 'commercial',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('2018-01-01'),
      sourceUrl: 'https://lex.uz/docs/3281041',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
    },
    {
      slug: 'law-on-courts-uz',
      titleUz: "Sudlar va sudya maqomi to'g'risida",
      titleRu: 'О судах и статусе судей',
      titleEn: 'On Courts and Status of Judges',
      type: LawType.LAW,
      category: 'judicial',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('2017-05-22'),
      sourceUrl: 'https://lex.uz/docs/3136138',
      summaryUz: '[TBD - sourced from lex.uz]',
      summaryRu: '[TBD - sourced from lex.uz]',
      summaryEn: '[TBD - sourced from lex.uz]',
      fullTextUz: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextRu: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
      fullTextEn: '[DRAFT - REQUIRES LICENSED ATTORNEY REVIEW]',
    },
  ];

  for (const law of laws) {
    await prisma.law.upsert({
      where: { slug: law.slug },
      update: {},
      create: {
        ...law,
        countryId: uz.id,
      },
    });
    console.log(`Law: ${law.titleRu}`);
  }

  // === 4. Clean up previously-seeded fabricated data ===
  // Delete all rows from tables that previously contained invented content.
  // Real data must be added through the admin panel or verified API endpoints.
  await prisma.review.deleteMany();
  await prisma.qaAnswer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.legalService.deleteMany();
  await prisma.lawyerPracticeArea.deleteMany();
  await prisma.lawyerLanguage.deleteMany();
  await prisma.lawyer.deleteMany();
  await prisma.guide.deleteMany();
  console.log('Cleaned up previously-seeded fabricated data');

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
