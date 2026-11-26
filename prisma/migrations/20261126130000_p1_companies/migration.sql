CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "cin" TEXT,
    "isin" TEXT,
    "symbol" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_normalizedName_key" ON "Company"("normalizedName");
CREATE UNIQUE INDEX "Company_cin_key" ON "Company"("cin");
CREATE UNIQUE INDEX "Company_isin_key" ON "Company"("isin");
CREATE UNIQUE INDEX "Company_symbol_key" ON "Company"("symbol");
CREATE INDEX "Company_createdAt_idx" ON "Company"("createdAt");
CREATE INDEX "Company_name_trgm_idx" ON "Company" USING GIN ("name" gin_trgm_ops);

ALTER TABLE "Company" ADD CONSTRAINT "Company_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;