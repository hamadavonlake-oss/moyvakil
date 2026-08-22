-- Cleanup script: removes all data from non-essential tables
-- Safe to run multiple times
-- Does NOT delete: User, Country, Language, PromptVersion

DELETE FROM "EvaluationRun";
DELETE FROM "EvaluationCase";
DELETE FROM "AuditEvent";
DELETE FROM "Consent";
DELETE FROM "ReviewRequest";
DELETE FROM "Feedback";
DELETE FROM "Citation";
DELETE FROM "Answer";
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "Embedding";
DELETE FROM "LegalRelationship";
DELETE FROM "LegalSection";
DELETE FROM "LegalVersion";
DELETE FROM "LegalDocument";
DELETE FROM "LegalSource";
DELETE FROM "Jurisdiction";
