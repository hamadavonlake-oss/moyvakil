import { PrismaClient, UserRole, LawType, LawStatus, ReviewStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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
      summaryUz: "O'zbekiston Respublikasining asosiy qonuni. Fuqarolar huquqlari va erkinliklari, davlat tuzilishi, prezident vakolatlari, parlament va hukumat faoliyati tartibga solinadi.",
      summaryRu: 'Основной закон Республики Узбекистан. Определяет права и свободы граждан, структуру государства, полномочия президента, деятельность парламента и правительства.',
      summaryEn: 'The fundamental law of Uzbekistan. Defines citizens\' rights and freedoms, state structure, presidential powers, parliament and government operations.',
      fullTextUz: "O'zbekiston Respublikasi Konstitusiyasi — respublikaning asosiy qonuni hisoblanadi. Konstitusiya fuqarolar huquqlari va erkinliklarini kafolatlaydi, davlat hokimiyati tizimini belgilaydi va jamiyat hayotining asosiy yo'nalishlarini belgilab beradi.",
      fullTextRu: 'Конституция Республики Узбекистан является основным законом республики. Конституция гарантирует права и свободы граждан, определяет систему государственной власти и устанавливает основные направления жизни общества.',
      fullTextEn: 'The Constitution of the Republic of Uzbekistan is the fundamental law of the republic. It guarantees citizens\' rights and freedoms, defines the system of state power, and establishes the main directions of public life.',
    },
    {
      slug: 'labor-code-uz',
      titleUz: "Mehnat kodeksi",
      titleRu: 'Трудовой кодекс',
      titleEn: 'Labor Code',
      type: LawType.CODE,
      category: 'labor',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('2023-06-30'),
      sourceUrl: 'https://lex.uz/docs/6740381',
      summaryUz: "Mehnat munosabatlarini tartibga soluvchi asosiy qonun. Ishchi va xodim huquqlari, mehnat shartnomasi, ish vaqti, ta'til, mehnat haqi, xavfsizlik va mehnat munosabatlarining boshqa jihatlari.",
      summaryRu: 'Основной закон, регулирующий трудовые отношения. Права работников, трудовые договоры, рабочее время, отпуск, заработная плата, безопасность и другие аспекты трудовых отношений.',
      summaryEn: 'The primary law governing labor relations. Worker rights, employment contracts, working hours, leave, wages, safety and other aspects of employment.',
      fullTextUz: "Mehnat kodeksi O'zbekiston Respublikasida mehnat munosabatlarini tartibga soladi. Har bir ishchi mehnat huquqlariga ega, shu jumladan xavfsiz ish sharoitlari, o'z vaqtida mehnat haqi olish va dam olish huquqiga.",
      fullTextRu: 'Трудовой кодекс регулирует трудовые отношения в Республике Узбекистан. Каждый работник имеет трудовые права, включая безопасные условия труда, своевременную выплату заработной платы и право на отдых.',
      fullTextEn: 'The Labor Code regulates employment relations in the Republic of Uzbekistan. Every worker has labor rights, including safe working conditions, timely payment of wages, and the right to rest.',
    },
    {
      slug: 'civil-code-uz',
      titleUz: "Fuqarolik kodeksi",
      titleRu: 'Гражданский кодекс',
      titleEn: 'Civil Code',
      type: LawType.CODE,
      category: 'civil',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('1997-01-01'),
      sourceUrl: 'https://lex.uz/docs/9527',
      summaryUz: "Fuqarolik huquqiy munosabatlarini tartibga soluvchi asosiy qonun. Shartnomalar, mulk huquqi, majburiyatlar, meros huquqi va boshqa fuqarolik huquqiy masalalari.",
      summaryRu: 'Основной закон, регулирующий гражданские правоотношения. Договоры, права собственности, обязательства, наследственное право и другие гражданские правовые вопросы.',
      summaryEn: 'The primary law governing civil legal relations. Contracts, property rights, obligations, inheritance law, and other civil legal matters.',
      fullTextUz: "Fuqarolik kodeksi fuqarolar va yuridik shaxslarning huquqiy munosabatlarini tartibga soladi. U shartnomalar tuzish, mulk huquqi, majburiyatlar va boshqa fuqarolik huquqiy masalalarni o'z ichiga oladi.",
      fullTextRu: 'Гражданский кодекс регулирует правоотношения граждан и юридических лиц. Он включает заключение договоров, права собственности, обязательства и другие гражданские правовые вопросы.',
      fullTextEn: 'The Civil Code regulates the legal relations of citizens and legal entities. It covers contract formation, property rights, obligations, and other civil legal matters.',
    },
    {
      slug: 'criminal-code-uz',
      titleUz: "Jinoyat kodeksi",
      titleRu: 'Уголовный кодекс',
      titleEn: 'Criminal Code',
      type: LawType.CODE,
      category: 'criminal',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('1994-09-22'),
      sourceUrl: 'https://lex.uz/docs/9577',
      summaryUz: "Jinoyat javobgarligini belgilovchi qonun. Jinoyat turlari, jazo turlari, tergov va sud jarayoni, hamda fuqarolar huquqlarining jinoyat oldini olish masalalari.",
      summaryRu: 'Закон, определяющий уголовную ответственность. Виды преступлений, виды наказаний, расследование и судебный процесс, а вопросы защиты прав граждан от преступлений.',
      summaryEn: 'The law defining criminal liability. Types of crimes, penalties, investigation and trial procedures, and issues of protecting citizens\' rights from crimes.',
      fullTextUz: "Jinoyat kodeksi jinoyatga qarshi kurashish va fuqarolar huquqlarini himoya qilish maqsadida qabul qilingan. U jinoyat turlarini aniqlaydi, jazo choralarini belgilaydi va tergov jarayonini tartibga soladi.",
      fullTextRu: 'Уголовный кодекс принят в целях борьбы с преступностью и защиты прав граждан. Он определяет виды преступлений, устанавливает меры наказания и регулирует процедуру расследования.',
      fullTextEn: 'The Criminal Code was adopted for the purpose of combating crime and protecting citizens\' rights. It defines types of crimes, establishes penalties, and regulates investigation procedures.',
    },
    {
      slug: 'economic-procedure-code-uz',
      titleUz: "Iqtisodiy protsessual kodeksi",
      titleRu: 'Экономический процессуальный кодекс',
      titleEn: 'Economic Procedure Code',
      type: LawType.CODE,
      category: 'commercial',
      status: LawStatus.IN_FORCE,
      adoptionDate: new Date('2018-01-01'),
      sourceUrl: 'https://lex.uz/docs/3281041',
      summaryUz: "Tadbirkorlik faoliyatiga oid munosabatlar bo'yicha sud tartibini belgilovchi qonun. Iqtisodiy nizolar, arbitraj va xo'jalik sudlari faoliyati.",
      summaryRu: 'Закон, определяющий судебный порядок по вопросам предпринимательской деятельности. Экономические споры, арбитраж и деятельность хозяйственных судов.',
      summaryEn: 'The law establishing court procedures for business activities. Economic disputes, arbitration, and commercial court operations.',
      fullTextUz: "Iqtisodiy protsessual kodeksi tadbirkorlik sohasidagi nizolarni hal qilish tartibini belgilaydi.",
      fullTextRu: 'Экономический процессуальный кодекс определяет порядок разрешения споров в сфере предпринимательства.',
      fullTextEn: 'The Economic Procedure Code establishes the procedure for resolving disputes in the business sphere.',
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
      summaryUz: "Sud tizimini va sudya maqomini belgilovchi qonun. Konstitutsiyaviy sud, Oliy sud, iqtisodiy sudlar, jinoyat ishlari bo'yicha sudlar va boshqa sudlar tuzilishi.",
      summaryRu: 'Закон, определяющий судебную систему и статус судей. Структура Конституционного суда, Верховного суда, экономических судов, уголовных судов и других судов.',
      summaryEn: 'The law defining the judicial system and status of judges. Structure of the Constitutional Court, Supreme Court, economic courts, criminal courts, and other courts.',
      fullTextUz: "Sudlar va sudya maqomi to'g'risidagi qonun O'zbekiston Respublikasining sud tizimini belgilaydi.",
      fullTextRu: 'Закон о судах и статусе судей определяет судебную систему Республики Узбекистан.',
      fullTextEn: 'The Law on Courts and Status of Judges defines the judicial system of the Republic of Uzbekistan.',
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

  // === 4. Seed Court System Guide ===
  await prisma.guide.upsert({
    where: { slug: 'uzbekistan-court-system' },
    update: {},
    create: {
      countryId: uz.id,
      slug: 'uzbekistan-court-system',
      titleUz: "O'zbekiston sud tizimi",
      titleRu: 'Судебная система Узбекистана',
      titleEn: 'Court System of Uzbekistan',
      bodyUz: "O'zbekiston Respublikasining sud tizimi quyidagi tarkibiy qismlardan iborat:\n\n1. **Konstitutsiyaviy sud** — Konstitutsiyaning yuqori kuchiga ega ekanligini ta'minlaydi.\n2. **Oliy sud** — fuqarolik, jinoyat va boshqa ishlarni ko'rib chiqadi.\n3. **Iqtisodiy sudlar** — tadbirkorlik va iqtisodiy nizolarni hal qiladi.\n4. **Jinoyat ishlari bo'yicha sudlar** — jinoyat ishlarini ko'rib chiqadi.\n5. **Fuqarolik ishlari bo'yicha sudlar** — oila, mehnat, uy-joy va boshqa fuqarolik ishlarini ko'rib chiqadi.\n6. **Xalq sudlari** — mahalliy darajadagi oddiy ishlarni ko'rib chiqadi.",
      bodyRu: 'Судебная система Республики Узбекистан состоит из следующих структурных элементов:\n\n1. **Конституционный суд** — обеспечивает верховенство Конституции.\n2. **Верховный суд** — рассматривает гражданские, уголовные и другие дела.\n3. **Экономические суды** — разрешают предпринимательские и экономические споры.\n4. **Суды по уголовным делам** — рассматривают уголовные дела.\n5. **Суды по гражданским делам** — рассматривают семейные, трудовые, жилищные и другие гражданские дела.\n6. **Народные суды** — рассматривают простые дела на местном уровне.',
      bodyEn: 'The court system of the Republic of Uzbekistan consists of the following structural elements:\n\n1. **Constitutional Court** — ensures the supremacy of the Constitution.\n2. **Supreme Court** — considers civil, criminal and other cases.\n3. **Economic Courts** — resolve business and economic disputes.\n4. **Criminal Courts** — consider criminal cases.\n5. **Civil Courts** — consider family, labor, housing and other civil cases.\n6. **People\'s Courts** — consider simple cases at the local level.',
      category: 'judicial',
      tags: ['courts', 'judiciary', 'court-system'],
      readingTime: 5,
      published: true,
    },
  });
  console.log('Guide: Судебная система Узбекистана');

  // === 5. Seed Lawyers ===
  const lawyersData = [
    {
      firstName: 'Akbar', lastName: 'Tashmatov', city: 'Tashkent', region: 'Yunusobod',
      email: 'akbar.tashmatov@moyvakil.uz', phone: '+998901234567',
      licenseNumber: 'UZ-ADV-2014-0312', yearsOfPractice: 12,
      isVerified: true, licenseVerified: true, avgRating: 4.8, reviewCount: 5,
      bioUz: "12 yillik tajribaga ega professional advokat. Mehnat va tadbirkorlik huquqi bo'yicha ixtisoslashgan. O'zbekiston Advokatlar Palatasi a'zosi. Fuqarolar va tashkilotlarning huquqiy manfaatlarini himoya qilishda katta tajribaga ega.",
      bioRu: 'Профессиональный адвокат с 12-летним стажем. Специализируется на трудовом и предпринимательском праве. Член Адвокатской палаты Узбекистана. Имеет большой опыт защиты правовых интересов граждан и организаций.',
      bioEn: 'Professional lawyer with 12 years of experience. Specializes in labor and business law. Member of the Bar Association of Uzbekistan. Extensive experience in protecting legal interests of individuals and organizations.',
      education: "Toshkent davlat yuridik universiteti, 2012. Magistratura — huquqshunoslik.",
      practiceAreas: ['labor', 'commercial'],
      languages: ['uz', 'ru', 'en'],
    },
    {
      firstName: 'Nilufar', lastName: 'Karimova', city: 'Samarkand', region: 'Registon',
      email: 'nilufar.karimova@moyvakil.uz', phone: '+998902345678',
      licenseNumber: 'UZ-ADV-2016-0543', yearsOfPractice: 8,
      isVerified: true, licenseVerified: true, avgRating: 4.6, reviewCount: 4,
      bioUz: "Oila va fuqarolik huquqi bo'yicha tajribali advokat. Oilaviy nizolar, ajralish, aliment va bolalar huquqlari masalalari bo'yicha yordam beradi.",
      bioRu: 'Опытный адвокат по семейному и гражданскому праву. Помогает в семейных спорах, разводах, алиментах и вопросах прав детей.',
      bioEn: 'Experienced family and civil law lawyer. Helps with family disputes, divorce, alimony, and children\'s rights issues.',
      education: "Samarqand davlat universiteti, 2016.",
      practiceAreas: ['family', 'civil'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Sardor', lastName: 'Rahimov', city: 'Bukhara', region: 'Markaz',
      email: 'sardor.rahimov@moyvakil.uz', phone: '+998903456789',
      licenseNumber: 'UZ-ADV-2019-0876', yearsOfPractice: 5,
      isVerified: true, licenseVerified: true, avgRating: 4.3, reviewCount: 3,
      bioUz: "Jinoyat huquqi bo'yicha ixtisoslashgan advokat. Tergov va sud jarayonlarida fuqarolarning huquqlarini himoya qilish.",
      bioRu: 'Адвокат, специализирующийся на уголовном праве. Защита прав граждан в ходе расследования и судебного процесса.',
      bioEn: 'Criminal law specialist. Protecting citizens\' rights during investigation and trial.',
      education: "Buxoro davlat universiteti, 2019.",
      practiceAreas: ['criminal'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Dilshod', lastName: 'Nazarov', city: 'Tashkent', region: 'Chilonzor',
      email: 'dilshod.nazarov@moyvakil.uz', phone: '+998904567890',
      licenseNumber: 'UZ-ADV-2015-0198', yearsOfPractice: 10,
      isVerified: true, licenseVerified: true, avgRating: 4.9, reviewCount: 6,
      bioUz: "Ko'chmas mulk va qurilish huquqi bo'yicha yetuk mutaxassis. Tadbirkorlarga va fuqarolarga mulk huquqi, ijaraga berish, qurilish ruxsatnomalari masalalarida yordam beradi.",
      bioRu: 'Опытный специалист по недвижимости и строительному праву. Помогает предпринимателям и гражданам по вопросам права собственности, аренды и строительных разрешений.',
      bioEn: 'Senior real estate and construction law specialist. Assists businesses and individuals with property rights, leasing, and construction permits.',
      education: "Toshkent universiteti, 2014. Magistratura — fuqarolik huquqi.",
      practiceAreas: ['civil', 'commercial'],
      languages: ['uz', 'ru', 'en'],
    },
    {
      firstName: 'Gulnora', lastName: 'Rakhimova', city: 'Tashkent', region: 'Mirobod',
      email: 'gulnora.rakhimova@moyvakil.uz', phone: '+998905678901',
      licenseNumber: 'UZ-ADV-2017-0432', yearsOfPractice: 7,
      isVerified: true, licenseVerified: true, avgRating: 4.5, reviewCount: 3,
      bioUz: "Mehnat huquqi va mehnat nizolari bo'yicha tajribali advokat. Ishchilarning huquqlarini himoya qilish, mehnat shartnomalari, ishdan bo'shatish va kompensatsiya masalalari.",
      bioRu: 'Опытный адвокат по трудовому праву и трудовым спорам. Защита прав работников, трудовые договоры, увольнение и вопросы компенсации.',
      bioEn: 'Experienced labor law attorney. Worker rights protection, employment contracts, termination and compensation matters.',
      education: "Toshkent davlat yuridik universiteti, 2017.",
      practiceAreas: ['labor', 'administrative'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Jasur', lastName: 'Karimov', city: 'Namangan', region: 'Chorsu',
      email: 'jasur.karimov@moyvakil.uz', phone: '+998906789012',
      licenseNumber: 'UZ-ADV-2018-0654', yearsOfPractice: 6,
      isVerified: true, licenseVerified: true, avgRating: 4.4, reviewCount: 2,
      bioUz: "Tadbirkorlik va soliq huquqi bo'yicha advokat. Biznesni ro'yxatdan o'tkazish, soliq maslahatlari, tijorat nizolari va shartnomalar tuzish.",
      bioRu: 'Адвокат по предпринимательскому и налоговому праву. Регистрация бизнеса, налоговые консультации, коммерческие споры и договоры.',
      bioEn: 'Business and tax law attorney. Business registration, tax consulting, commercial disputes and contract drafting.',
      education: "Namangan davlat universiteti, 2018.",
      practiceAreas: ['commercial', 'tax'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Malika', lastName: 'Yuldasheva', city: 'Fergana', region: 'Fargona',
      email: 'malika.yuldasheva@moyvakil.uz', phone: '+998907890123',
      licenseNumber: 'UZ-ADV-2020-0987', yearsOfPractice: 4,
      isVerified: false, licenseVerified: false, avgRating: 4.2, reviewCount: 2,
      bioUz: "Fuqarolik va oilaviy huquq bo'yicha yangi avlod advokat. Shartnomalar, mulk munosabatlari, oilaviy nizolar va meros masalalari.",
      bioRu: 'Адвокат нового поколения по гражданскому и семейному праву. Договоры, имущественные отношения, семейные споры и наследственные вопросы.',
      bioEn: 'New generation civil and family law attorney. Contracts, property relations, family disputes and inheritance matters.',
      education: "Fargona davlat universiteti, 2020.",
      practiceAreas: ['civil', 'family'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Bobur', lastName: 'Ismoilov', city: 'Tashkent', region: 'Yashnobod',
      email: 'bobur.ismoilov@moyvakil.uz', phone: '+998908901234',
      licenseNumber: 'UZ-ADV-2013-0056', yearsOfPractice: 13,
      isVerified: true, licenseVerified: true, avgRating: 4.7, reviewCount: 4,
      bioUz: "Soliq va ma'muriy huquq bo'yicha yetuk ekspert. Davlat organlari bilan munosabatlar, soliq nizolari, litsenziyalash va ruxsat berish tartiblari.",
      bioRu: 'Опытный эксперт по налоговому и административному праву. Взаимодействие с государственными органами, налоговые споры, лицензирование и разрешительные процедуры.',
      bioEn: 'Senior tax and administrative law expert. Government relations, tax disputes, licensing and permitting procedures.',
      education: "Toshkent moliya instituti, 2011. Magistratura — soliq huquqi.",
      practiceAreas: ['tax', 'administrative'],
      languages: ['uz', 'ru', 'en'],
    },
    {
      firstName: 'Shoxrux', lastName: 'Hamroyev', city: 'Karshi', region: 'Qashqadaryo',
      email: 'shoxrux.hamroyev@moyvakil.uz', phone: '+998909012345',
      licenseNumber: 'UZ-ADV-2021-1123', yearsOfPractice: 3,
      isVerified: false, licenseVerified: false, avgRating: 4.0, reviewCount: 1,
      bioUz: "Jinoyat va jinoyat-protsessual huquq bo'yicha advokat. Tergov harakatlarida ishtirok, himoya strategiyasi, sud muhokamasi.",
      bioRu: 'Адвокат по уголовному и уголовно-процессуальному праву. Участие в следственных действиях, стратегия защиты, судебное разбирательство.',
      bioEn: 'Criminal and criminal procedure law attorney. Participation in investigative actions, defense strategy, court proceedings.',
      education: "Qashqadaryo davlat universiteti, 2021.",
      practiceAreas: ['criminal'],
      languages: ['uz', 'ru'],
    },
    {
      firstName: 'Dilorom', lastName: 'Saidova', city: 'Andijan', region: 'Andijon',
      email: 'dilorom.saidova@moyvakil.uz', phone: '+998910123456',
      licenseNumber: 'UZ-ADV-2019-0765', yearsOfPractice: 5,
      isVerified: true, licenseVerified: true, avgRating: 4.1, reviewCount: 2,
      bioUz: "Xalqaro huquq va immigatsiya bo'yicha mutaxassis. Viza masalalari, fuqarolik, chet elda ishlash huquqlari va xalqaro shartnomalar.",
      bioRu: 'Специалист по международному праву и иммиграции. Вопросы виз, гражданства, права на работу за рубежом и международные договоры.',
      bioEn: 'International law and immigration specialist. Visa issues, citizenship, overseas work rights and international treaties.',
      education: "Andijon davlat universiteti, 2019. Magistratura — xalqaro huquq.",
      practiceAreas: ['immigration', 'administrative'],
      languages: ['uz', 'ru', 'en'],
    },
  ];

  const createdLawyers: { id: string; firstName: string; lastName: string; slug: string }[] = [];

  for (const l of lawyersData) {
    const lawyerSlug = slug(`${l.firstName}-${l.lastName}`);
    const created = await prisma.lawyer.upsert({
      where: { slug: lawyerSlug },
      update: {},
      create: {
        countryId: uz.id,
        firstName: l.firstName,
        lastName: l.lastName,
        slug: lawyerSlug,
        email: l.email,
        phone: l.phone,
        licenseNumber: l.licenseNumber,
        yearsOfPractice: l.yearsOfPractice,
        isVerified: l.isVerified,
        licenseVerified: l.licenseVerified,
        avgRating: l.avgRating,
        reviewCount: l.reviewCount,
        bioUz: l.bioUz,
        bioRu: l.bioRu,
        bioEn: l.bioEn,
        education: l.education,
        city: l.city,
        region: l.region,
        practiceAreas: { create: l.practiceAreas.map((area) => ({ area })) },
        languages: { create: l.languages.map((language) => ({ language })) },
      },
    });
    createdLawyers.push({ id: created.id, firstName: l.firstName, lastName: l.lastName, slug: lawyerSlug });
    console.log(`Lawyer: ${l.firstName} ${l.lastName} (${l.city})`);
  }

  // === 6. Seed Legal Services for top lawyers ===
  const serviceData = [
    { lawyerSlug: 'akbar-tashmatov', services: [
      { titleUz: 'Huquqiy maslahat', titleRu: 'Юридическая консультация', descriptionUz: 'Birinchi uchrashuvda huquqiy maslahat beriladi.', descriptionRu: 'Юридическая консультация на первой встрече.', price: 200000, deliveryDays: 1, category: 'consultation' },
      { titleUz: 'Mehnat shartnomasi tuzish', titleRu: 'Составление трудового договора', descriptionUz: 'Mehnat shartnomasini tayyorlash va tekshirish.', descriptionRu: 'Подготовка и проверка трудового договора.', price: 500000, deliveryDays: 3, category: 'document' },
      { titleUz: 'Sud vakilligi', titleRu: 'Представительство в суде', descriptionUz: 'Sud jarayonida vakillik qilish.', descriptionRu: 'Представительство в судебном процессе.', price: 2000000, deliveryDays: 30, category: 'representation' },
    ]},
    { lawyerSlug: 'dilshod-nazarov', services: [
      { titleUz: 'Ko\'chmas mulk maslahati', titleRu: 'Консультация по недвижимости', descriptionUz: 'Mulk huquqi, ijaraga berish masalalari.', descriptionRu: 'Вопросы права собственности, аренды.', price: 300000, deliveryDays: 1, category: 'consultation' },
      { titleUz: 'Shartnoma tuzish', titleRu: 'Составление договора', descriptionUz: 'Turli xil shartnomalarni tayyorlash.', descriptionRu: 'Подготовка различных договоров.', price: 800000, deliveryDays: 5, category: 'document' },
    ]},
    { lawyerSlug: 'bobur-ismoilov', services: [
      { titleUz: 'Soliq maslahati', titleRu: 'Налоговая консультация', descriptionUz: 'Soliq obligatsiyalari va imtiyozlar bo\'yicha maslahat.', descriptionRu: 'Консультация по налоговым обязательствам и льготам.', price: 250000, deliveryDays: 1, category: 'consultation' },
      { titleUz: 'Soliq muhokamasi', titleRu: 'Налоговое разбирательство', descriptionUz: 'Soliq organlari bilan munosabatlar.', descriptionRu: 'Взаимодействие с налоговыми органами.', price: 1500000, deliveryDays: 14, category: 'representation' },
    ]},
  ];

  for (const sd of serviceData) {
    const lawyer = createdLawyers.find((l) => l.slug === sd.lawyerSlug);
    if (!lawyer) continue;
    for (const s of sd.services) {
      await prisma.legalService.create({
        data: {
          lawyerId: lawyer.id,
          titleUz: s.titleUz,
          titleRu: s.titleRu,
          descriptionUz: s.descriptionUz,
          descriptionRu: s.descriptionRu,
          price: s.price,
          currency: 'UZS',
          deliveryDays: s.deliveryDays,
          category: s.category,
        },
      });
    }
    console.log(`Services for: ${sd.lawyerSlug}`);
  }

  // === 7. Seed Q&A Questions ===
  const questionsData = [
    { title: 'Ishdan bo\'stirilganda qanday huquqlarim bor?', body: 'Mening ishimda 3 yil ishladim. Bossim meni sababsiz ishdan bo\'stirmoqda. Qanday huquqlarim bor? Kompaniya menga kompensatsiya to\'lashi kerakmi?', category: 'labor', authorName: 'Akrom S.', viewCount: 245, isResolved: true },
    { title: 'Ajralish paytida bolalar kimniki qoladi?', body: 'Erkak bilan ajralishmoqdamiz. 2 ta bola bor — 5 va 8 yosh. Bolalar kimniki qoladi? Aliment qancha bo\'ladi?', category: 'family', authorName: 'Nodira K.', viewCount: 189, isResolved: true },
    { title: 'Kredit qarzini to\'lamasam nima bo\'ladi?', body: 'Bankdan olgan kreditimni to\'lay olmayapman. 3 oydan beri kechiktiraman. Bank meni sudga berishi mumkinmi? Menga nima bo\'ladi?', category: 'commercial', authorName: 'Jasurbek M.', viewCount: 312, isResolved: false },
    { title: 'Uy-joy ijarasida shartnoma tuzish kerakmi?', body: 'Uyni ijaraga bermoqchiman. Ijara shartnomasini rasmiylashtirish kerakmi? Qonuniy jihatdan bu qanchalik muhim?', category: 'civil', authorName: 'Gulchehra T.', viewCount: 156, isResolved: true },
    { title: 'Menga tu\'ilganlik haqida guvohnoma kerak, lekin u yo\'qolgan', body: 'Tu\'ilganlik haqida guvohnomam yo\'qolgan. Qayta olish uchun qayerga murojaat qilishim kerak? Qancha vaqt oladi?', category: 'administrative', authorName: 'Sardor A.', viewCount: 98, isResolved: false },
    { title: 'Jinoyat ishi qo\'zg\'atilgan — advokat kerak', body: 'Menga qarshi jinoyat ishi qo\'zg\'atilgan (firibgarlik aybi bilan). Advokat bilan maslahatlashmoqchiman. Nima qilishim kerak?', category: 'criminal', authorName: 'Davron R.', viewCount: 267, isResolved: false },
    { title: 'Xususiy biznesni qanday ro\'yxatdan o\'tkazaman?', body: 'O\'z biznesimni ochmoqchiman (kichik do\'kon). Qanday tartibda ro\'yxatdan o\'tkazish kerak? Qancha mablag\' kerak?', category: 'commercial', authorName: 'Shoxjahon P.', viewCount: 203, isResolved: true },
    { title: 'Ish beruvchi mehnat haqini kechiktirsa nima qilish kerak?', body: 'Ish beruvchi 2 oydan beri mehnat haqini to\'lamayapti. Nima qilishim kerak? Qaysi organlarga murojaat qilishim mumkin?', category: 'labor', authorName: 'Otabek S.', viewCount: 178, isResolved: true },
    { title: 'Vasiylik huquqi bo\'yicha maslahat kerak', body: 'Opamning bolasi yetim qoldi. Men uni o\'z himoyamga olmoqchiman. Vasiylikni qanday rasmiylashtirish kerak?', category: 'family', authorName: 'Zulfiya N.', viewCount: 134, isResolved: false },
    { title: 'Kompaniya hisobini tugatish tartibi', body: 'Mening MCHJ kompaniyam bor, lekin ishlamayapti. Tugatish uchun qanday tartib bor? Soliqlar, hisob-kitoblar?', category: 'commercial', authorName: 'Farrux B.', viewCount: 167, isResolved: false },
    { title: 'Yer uchastkasi olish huquqi', body: 'Men dala xo\'jaligida ishlayman. Qo\'shnim bilan yerning chegarasi bo\'yicha kelishmovchilik bor. Bu masalani qanday hal qilish kerak?', category: 'civil', authorName: 'Abdulloh H.', viewCount: 145, isResolved: false },
    { title: 'Mashina xarid qilganda e\'tibor berish kerak narsalar', body: 'Ikkinchi qo\'l mashina sotib olmoqchiman. Huquqiy jihatdan qanday hujjatlar tekshirish kerak? Qanday xatolardan saqlanish kerak?', category: 'civil', authorName: 'Timur K.', viewCount: 212, isResolved: true },
    { title: 'Soliqdan qanday qonuniy qochish mumkin?', body: 'Soliq yuki juda og\'ir. Qonuniy yo\'l bilan soliqni kamaytirishning imkoni bormi? Imtiyozlar bormi?', category: 'tax', authorName: 'Rustam E.', viewCount: 289, isResolved: false },
    { title: 'Migatsiya huquqi bo\'yicha savol', body: 'Rossiyada ishlash uchun vizani qanday olish kerak? Qanday hujjatlar kerak? Qancha vaqt oladi?', category: 'immigration', authorName: 'Dilshod T.', viewCount: 356, isResolved: false },
    { title: 'Oilaviy mol-mulkni qanday bo\'lishish kerak?', body: 'Erkak bilan ajralishmoqdamiz. Uy, mashina va boshqa mulklar bor. Mulklarni qanday bo\'lishish kerak? Qonun nima deydi?', category: 'family', authorName: 'Malika J.', viewCount: 198, isResolved: true },
  ];

  const createdQuestions: { id: string; title: string }[] = [];

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const created = await prisma.question.create({
      data: {
        countryId: uz.id,
        title: q.title,
        body: q.body,
        category: q.category,
        language: 'uz',
        authorName: q.authorName,
        viewCount: q.viewCount,
        isResolved: q.isResolved,
      },
    });
    createdQuestions.push({ id: created.id, title: q.title });
    console.log(`Question: ${q.title.substring(0, 50)}...`);
  }

  // === 8. Seed Answers ===
  const answersData = [
    { qIdx: 0, lIdx: 0, body: "Mehnat kodeksiga ko'ra, ish beruvchi ishchini sababsiz ishdan bo'shatishga haqqi yo'q. Agar ish beruvchi mehnat shartnomasini buzgan bo'lsa, siz sudga murojaat qilishingiz mumkin. Kompensatsiya — mehnat haqining o'rtacha miqdorida kamida 3 oylik to'lov. Advokat bilan maslahatlashing, hujjatlarni tayyorlang.", isHelpful: true, upvotes: 12 },
    { qIdx: 0, lIdx: 4, body: "Ishdan bo'shatilganingizdan keyin 1 oy ichida mehnat munosabatlari bo'yicha sudga murojaat qilishingiz kerak. Ish beruvchidan yozma buyruq talab qiling. Agar og'zaki bo'lsa — guvohlar toping.", isHelpful: false, upvotes: 5 },
    { qIdx: 1, lIdx: 1, body: "Oila kodeksiga ko'ra, bolalar manfaati birinchi o'rinda turadi. 5 va 8 yoshdagi bolalar ona bilan qolishga haqli, lekin otaning huquqlari ham himoyalangan. Aliment — ota-onaning daromadiga qarab belgilanadi, odatda 25-30%. Advokat bilan maslahatlashing.", isHelpful: true, upvotes: 8 },
    { qIdx: 2, lIdx: 7, body: "Bank kredit qarzini to'lamaganlik uchun sudga murojaat qilishi mumkin. Biroq, sud birinchi navbatda murosaga kelishni tavsiya qiladi. Bank bilan qayta moliyalashtirish (restrukturizatsiya) haqida gaplashing. Agar sud qarori chiqsa, mol-mulkingiz musodara qilinishi mumkin.", isHelpful: false, upvotes: 7 },
    { qIdx: 3, lIdx: 3, body: "Ha, ijara shartnomasini rasmiylashtirish shart. Bu ijarachining va ijara beruvchining huquqlarini himoya qiladi. Shartnomaning notarial tasdiqlanishi tavsiya etiladi. Shartnomada ijara muddati, to'lov miqdori, ta'mirlash masalalari ko'rsatilishi kerak.", isHelpful: true, upvotes: 6 },
    { qIdx: 5, lIdx: 2, body: "Firibgarlik aybi bilan jinoyat ishi ochilgan bo'lsa, sizga tajribali jinoyat advokati kerak. Birinchi qadam — tergov organida quyidagi huquqlaringiz bor: jim qolish huquqi, advokat bilan maslahat huquqi. Advokat sizning ishingizni o'rganib, himoya strategiyasini tuzadi.", isHelpful: true, upvotes: 15 },
    { qIdx: 6, lIdx: 5, body: "MCHJ ro'yxatdan o'tkazish uchun: 1) Ta'sischilar ro'yxatini tayyorlang, 2) Ustav tuzing, 3) Hisob raqamini oching, 4) Soliq organida ro'yxatdan o'ting. Taxminan 10-15 ish kuni. Minimal ustav kapitali — 1 000 000 so'm.", isHelpful: true, upvotes: 9 },
    { qIdx: 7, lIdx: 0, body: "Mehnat haqini kechiktirish — Mehnat kodeksining buzilishi. Siz quyidagi qadamlarni qo'ying: 1) Yozma shikoyat yozing, 2) Mehnat inspeksiyasiga murojaat qiling, 3) Agar natija bo'lmasa — sudga. Mehnat inspeksiyasi 10 ish kuni ichida tekshiradi.", isHelpful: true, upvotes: 11 },
    { qIdx: 11, lIdx: 3, body: "Ikkinchi qo'l mashina xarid qilganda: 1) Texpassport tekshiring, 2) VIN raqamini avtomashinada va hujjatda solishtiring, 3) Jarimalar va limiting borligini tekshiring, 4) Sug'urta polisini rasmiylashtiring, 5) Yo'l harakati qoidalariga muvofiq texnik ko'rikdan o'tkazing.", isHelpful: false, upvotes: 4 },
    { qIdx: 12, lIdx: 7, body: "Qonuniy ravishda soliq yukini kamaytirish uchun: 1) Soliq imtiyozlaridan foydalaning (kichik biznes uchun oddiylashtirilgan soliq), 2) Amortizatsiya xarajatlarini hisobga oling, 3) Xayriya amallarini hisobga oling. Soliq maslahatchisi bilan gaplashing.", isHelpful: false, upvotes: 6 },
    { qIdx: 14, lIdx: 1, body: "Oila kodeksiga ko'ra, umumiy mol-mulk nikoh davrida orttirilgan bo'lsa, teng bo'linadi. Biroq, sud manfaatlar muvozanatini hisobga oladi. Agar bola onada qolsa, ona ko'proq ulush olishi mumkin. Barcha hujjatlarni (sotib olish, to'lov) tayyorlang.", isHelpful: true, upvotes: 10 },
  ];

  for (const a of answersData) {
    const question = createdQuestions[a.qIdx];
    const lawyer = createdLawyers[a.lIdx];
    if (!question || !lawyer) continue;
    await prisma.qaAnswer.create({
      data: {
        questionId: question.id,
        lawyerId: lawyer.id,
        body: a.body,
        isHelpful: a.isHelpful,
        upvotes: a.upvotes,
      },
    });
  }
  console.log(`Answers: ${answersData.length}`);

  // Update answer counts
  for (const q of createdQuestions) {
    const count = await prisma.qaAnswer.count({ where: { questionId: q.id } });
    await prisma.question.update({ where: { id: q.id }, data: { answerCount: count } });
  }

  // === 9. Seed Reviews ===
  const reviewsData = [
    // Akbar Tashmatov
    { lIdx: 0, authorName: 'Jamshid U.', rating: 5, title: 'Juda professional!', content: 'Mehnat ishim bo\'yicha juda professional yordam berdi. natija juda yaxshi bo\'ldi. Tavsiya qilaman!', status: ReviewStatus.APPROVED },
    { lIdx: 0, authorName: 'Gulnora M.', rating: 5, title: 'Ishonchli advokat', content: 'Biznes shartnomamni tekshirib berdi. Juda batafsil va tushunarli tushuntirdi.', status: ReviewStatus.APPROVED },
    { lIdx: 0, authorName: 'Sardor K.', rating: 4, title: 'Yaxshi natija', content: 'Mehnat nizomimni hal qildi. Faqat biroz ko\'proq vaqt oldi, lekin natija yaxshi bo\'ldi.', status: ReviewStatus.APPROVED },
    { lIdx: 0, authorName: 'Dilnoza R.', rating: 5, title: 'Tavsiya qilaman', content: 'Juda tajribali va mas\'uliyatli advokat. Har doim aloqada.', status: ReviewStatus.APPROVED },
    { lIdx: 0, authorName: 'Bobur T.', rating: 5, title: 'Eng yaxshi advokat', content: 'Kompaniya uchun yuridik maslahat oldim. Juda professional yondashuv.', status: ReviewStatus.APPROVED },
    // Nilufar Karimova
    { lIdx: 1, authorName: 'Nodira S.', rating: 5, title: 'Oilaviy ishda yordam berdi', content: 'Ajralish ishimda juda hamdardlik va professional yordam ko\'rsatdi.', status: ReviewStatus.APPROVED },
    { lIdx: 1, authorName: 'Zulfiya A.', rating: 4, title: 'Yaxshi maslahatchi', content: 'Aliment masalasida yordam berdi. Natija kutilgandan yaxshi bo\'ldi.', status: ReviewStatus.APPROVED },
    { lIdx: 1, authorName: 'Malika H.', rating: 5, title: 'Juda hamdard', content: 'Bolalar huquqlari bo\'yicha juda hamdard va tajribali advokat.', status: ReviewStatus.APPROVED },
    // Sardor Rahimov
    { lIdx: 2, authorName: 'Davron N.', rating: 4, title: 'Yaxshi himoya qildi', content: 'Jinoyat ishimda menga yordam berdi. Juda ehtiyotkor va mas\'uliyatli.', status: ReviewStatus.APPROVED },
    { lIdx: 2, authorName: 'Farrux S.', rating: 5, title: 'Tavsiya qilaman', content: 'Juda tajribali jinoyat advokati. Ishonch bilan ishlash mumkin.', status: ReviewStatus.APPROVED },
    // Dilshod Nazarov
    { lIdx: 3, authorName: 'Otabek M.', rating: 5, title: 'Ko\'chmas mulk bo\'yicha ekspert', content: 'Uy sotib olishda juda katta yordam berdi. Barcha hujjatlarni tekshirib berdi.', status: ReviewStatus.APPROVED },
    { lIdx: 3, authorName: 'Shoxjahon R.', rating: 5, title: 'Professional yondashuv', content: 'Ijara shartnomamni tayyorlab berdi. Juda sifatli ish.', status: ReviewStatus.APPROVED },
    { lIdx: 3, authorName: 'Abdulloh K.', rating: 5, title: 'Eng yaxshi ko\'chmas mulk advokati', content: 'Toshkentda ko\'chmas mulk masalasida eng yaxshi advokat. Tavsiya qilaman.', status: ReviewStatus.APPROVED },
    // Gulnora Rakhimova
    { lIdx: 4, authorName: 'Svetlana P.', rating: 5, title: 'Mehnat huquqini himoya qildi', content: 'Ish beruvchim bilan bo\'lgan nizoda juda professional yordam berdi.', status: ReviewStatus.APPROVED },
    { lIdx: 4, authorName: 'Nargiza T.', rating: 4, title: 'Yaxshi advokat', content: 'Mehnat shartnomasi masalasida yordam berdi. Juda tushunarli.', status: ReviewStatus.APPROVED },
    // Jasur Karimov
    { lIdx: 5, authorName: 'Akbar D.', rating: 5, title: 'Biznes uchun ajoyib', content: 'MCHJ ro\'yxatdan o\'tkazishda hammasini o\'zi qildi. Juda qulay va tez.', status: ReviewStatus.APPROVED },
    { lIdx: 5, authorName: 'Dilshod S.', rating: 4, title: 'Soliq maslahati yaxshi', content: 'Soliq masalasida juda foydali maslahatlar berdi.', status: ReviewStatus.APPROVED },
    // Bobur Ismoilov
    { lIdx: 7, authorName: 'Mansur R.', rating: 5, title: 'Soliq eksperti', content: 'Soliq nizomimni hal qildi. Juda tajribali va professional.', status: ReviewStatus.APPROVED },
    { lIdx: 7, authorName: 'Suhrob J.', rating: 4, title: 'Yaxshi natija', content: 'Soliq maslahatida juda foydali bo\'ldi. Tavsiya qilaman.', status: ReviewStatus.APPROVED },
    // Dilorom Saidova
    { lIdx: 9, authorName: 'Anvar Q.', rating: 4, title: 'Viza masalasida yordam', content: 'Viza olish jarayonida juda foydali maslahatlar berdi.', status: ReviewStatus.APPROVED },
    { lIdx: 9, authorName: 'Nodir B.', rating: 5, title: 'Xalqaro huquq bo\'yicha ekspert', content: 'Chet elda ishlash huquqida juda tajribali advokat.', status: ReviewStatus.APPROVED },
    // Some pending reviews
    { lIdx: 0, authorName: 'Test User', rating: 3, title: 'O\'rta', content: 'Yaxshi advokat, lekin biroz qimmat.', status: ReviewStatus.PENDING },
    { lIdx: 3, authorName: 'Test User 2', rating: 4, title: 'Yaxshi', content: 'Professional yondashuv, tavsiya qilaman.', status: ReviewStatus.PENDING },
    { lIdx: 7, authorName: 'Test User 3', rating: 5, title: 'Ajoyib', content: 'Soliq masalasida juda yaxshi yordam berdi.', status: ReviewStatus.PENDING },
  ];

  for (const r of reviewsData) {
    const lawyer = createdLawyers[r.lIdx];
    if (!lawyer) continue;
    await prisma.review.create({
      data: {
        lawyerId: lawyer.id,
        authorName: r.authorName,
        rating: r.rating,
        title: r.title,
        content: r.content,
        status: r.status,
      },
    });
  }
  console.log(`Reviews: ${reviewsData.length}`);

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
