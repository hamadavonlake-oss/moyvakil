-- Cleanup script: removes all previously-seeded fabricated data
-- Safe to run multiple times
-- Does NOT delete: User, Country, Law (those are managed by seed upserts)

DELETE FROM "Review";
DELETE FROM "QaAnswer";
DELETE FROM "Question";
DELETE FROM "LegalService";
DELETE FROM "PracticeArea";
DELETE FROM "LawyerLanguage";
DELETE FROM "Lawyer";
DELETE FROM "Guide";
