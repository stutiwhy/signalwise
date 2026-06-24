/*
  Warnings:

  - You are about to drop the column `stage` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `ycId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `externalJobId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CompanySource_source_externalId_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "description" TEXT,
    "oneLiner" TEXT,
    "location" TEXT,
    "country" TEXT,
    "industry" TEXT,
    "ycBatch" TEXT,
    "teamSize" INTEGER,
    "isHiring" BOOLEAN NOT NULL DEFAULT false,
    "intentScore" REAL,
    "intentReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Company" ("country", "createdAt", "description", "id", "industry", "intentReason", "intentScore", "isHiring", "location", "logoUrl", "name", "oneLiner", "teamSize", "updatedAt", "website", "ycBatch") SELECT "country", "createdAt", "description", "id", "industry", "intentReason", "intentScore", "isHiring", "location", "logoUrl", "name", "oneLiner", "teamSize", "updatedAt", "website", "ycBatch" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE UNIQUE INDEX "Company_website_key" ON "Company"("website");
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("companyId", "createdAt", "description", "id", "remote", "role", "salaryMax", "salaryMin", "source", "title") SELECT "companyId", "createdAt", "description", "id", "remote", "role", "salaryMax", "salaryMin", "source", "title" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
