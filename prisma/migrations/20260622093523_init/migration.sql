/*
  Warnings:

  - A unique constraint covering the columns `[ycId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[source,externalId]` on the table `CompanySource` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Company_website_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN "stage" TEXT;
ALTER TABLE "Company" ADD COLUMN "ycId" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalJobId" TEXT,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "description" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("companyId", "createdAt", "description", "id", "remote", "role", "salaryMax", "salaryMin", "source", "title") SELECT "companyId", "createdAt", "description", "id", "remote", "role", "salaryMax", "salaryMin", "source", "title" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
CREATE UNIQUE INDEX "Job_source_externalJobId_key" ON "Job"("source", "externalJobId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Company_ycId_key" ON "Company"("ycId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySource_source_externalId_key" ON "CompanySource"("source", "externalId");
