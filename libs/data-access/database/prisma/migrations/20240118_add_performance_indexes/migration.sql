-- Add composite indexes for search performance
CREATE INDEX IF NOT EXISTS "idx_papers_search" ON "ResearchPaper" ("systemType", "publicationDate" DESC);
CREATE INDEX IF NOT EXISTS "idx_papers_quality" ON "ResearchPaper" ("aiConfidence" DESC, "createdAt" DESC);

-- Add indexes for common filter queries
CREATE INDEX IF NOT EXISTS "idx_papers_power_output" ON "ResearchPaper" ("powerOutput" DESC) WHERE "powerOutput" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_papers_efficiency" ON "ResearchPaper" ("efficiency" DESC) WHERE "efficiency" IS NOT NULL;

-- Add index for text search on journal
CREATE INDEX IF NOT EXISTS "idx_papers_journal" ON "ResearchPaper" ("journal") WHERE "journal" IS NOT NULL;