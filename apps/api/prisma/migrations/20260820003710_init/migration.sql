-- CreateEnum
CREATE TYPE "LawType" AS ENUM ('CONSTITUTION', 'CODE', 'LAW', 'DECREE', 'REGULATION');

-- CreateEnum
CREATE TYPE "LawStatus" AS ENUM ('IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'LAWYER', 'ADMIN', 'SUPER_ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "lawyerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nameUz" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Law" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT,
    "slug" TEXT NOT NULL,
    "fullTextUz" TEXT NOT NULL,
    "fullTextRu" TEXT NOT NULL,
    "fullTextEn" TEXT,
    "summaryUz" TEXT,
    "summaryRu" TEXT,
    "summaryEn" TEXT,
    "type" "LawType" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "LawStatus" NOT NULL DEFAULT 'IN_FORCE',
    "adoptionDate" TIMESTAMP(3),
    "effectiveDate" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Law_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawArticle" (
    "id" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "titleUz" TEXT,
    "titleRu" TEXT,
    "titleEn" TEXT,
    "contentUz" TEXT NOT NULL,
    "contentRu" TEXT NOT NULL,
    "contentEn" TEXT,

    CONSTRAINT "LawArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawAmendment" (
    "id" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT,

    CONSTRAINT "LawAmendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "photoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "licenseNumber" TEXT,
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "yearsOfPractice" INTEGER,
    "education" TEXT,
    "bioUz" TEXT,
    "bioRu" TEXT,
    "bioEn" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeArea" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "PracticeArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerLanguage" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "LawyerLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LawyerEndorsement" (
    "id" TEXT NOT NULL,
    "endorserId" TEXT NOT NULL,
    "endorseeId" TEXT NOT NULL,
    "area" TEXT NOT NULL,

    CONSTRAINT "LawyerEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT,
    "language" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "answerCount" INTEGER NOT NULL DEFAULT 0,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QaAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "lawyerId" TEXT,
    "body" TEXT NOT NULL,
    "isHelpful" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QaAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "lawId" TEXT,
    "titleUz" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT,
    "slug" TEXT NOT NULL,
    "bodyUz" TEXT NOT NULL,
    "bodyRu" TEXT NOT NULL,
    "bodyEn" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "readingTime" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalService" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "titleUz" TEXT NOT NULL,
    "titleRu" TEXT NOT NULL,
    "titleEn" TEXT,
    "descriptionUz" TEXT NOT NULL,
    "descriptionRu" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "deliveryDays" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalEmbedding" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "chunk" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_lawyerId_key" ON "User"("lawyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Law_slug_key" ON "Law"("slug");

-- CreateIndex
CREATE INDEX "Law_countryId_type_idx" ON "Law"("countryId", "type");

-- CreateIndex
CREATE INDEX "Law_countryId_category_idx" ON "Law"("countryId", "category");

-- CreateIndex
CREATE INDEX "Law_status_idx" ON "Law"("status");

-- CreateIndex
CREATE INDEX "LawArticle_lawId_idx" ON "LawArticle"("lawId");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_slug_key" ON "Lawyer"("slug");

-- CreateIndex
CREATE INDEX "Lawyer_countryId_city_idx" ON "Lawyer"("countryId", "city");

-- CreateIndex
CREATE INDEX "Lawyer_avgRating_idx" ON "Lawyer"("avgRating" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeArea_lawyerId_area_key" ON "PracticeArea"("lawyerId", "area");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerLanguage_lawyerId_language_key" ON "LawyerLanguage"("lawyerId", "language");

-- CreateIndex
CREATE INDEX "Review_lawyerId_status_idx" ON "Review"("lawyerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LawyerEndorsement_endorserId_endorseeId_area_key" ON "LawyerEndorsement"("endorserId", "endorseeId", "area");

-- CreateIndex
CREATE INDEX "Question_countryId_category_idx" ON "Question"("countryId", "category");

-- CreateIndex
CREATE INDEX "QaAnswer_questionId_idx" ON "QaAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_slug_key" ON "Guide"("slug");

-- CreateIndex
CREATE INDEX "Guide_countryId_category_idx" ON "Guide"("countryId", "category");

-- CreateIndex
CREATE INDEX "LegalService_category_isActive_idx" ON "LegalService"("category", "isActive");

-- CreateIndex
CREATE INDEX "LegalEmbedding_contentType_idx" ON "LegalEmbedding"("contentType");

-- AddForeignKey
ALTER TABLE "Law" ADD CONSTRAINT "Law_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawArticle" ADD CONSTRAINT "LawArticle_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawAmendment" ADD CONSTRAINT "LawAmendment_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lawyer" ADD CONSTRAINT "Lawyer_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeArea" ADD CONSTRAINT "PracticeArea_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerLanguage" ADD CONSTRAINT "LawyerLanguage_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerEndorsement" ADD CONSTRAINT "LawyerEndorsement_endorserId_fkey" FOREIGN KEY ("endorserId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LawyerEndorsement" ADD CONSTRAINT "LawyerEndorsement_endorseeId_fkey" FOREIGN KEY ("endorseeId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaAnswer" ADD CONSTRAINT "QaAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QaAnswer" ADD CONSTRAINT "QaAnswer_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Guide" ADD CONSTRAINT "Guide_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalService" ADD CONSTRAINT "LegalService_lawyerId_fkey" FOREIGN KEY ("lawyerId") REFERENCES "Lawyer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
