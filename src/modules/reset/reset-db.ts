// src\app\modules\reset\reset-db.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function resetDb() {
  try {
    await prisma.signal.deleteMany();
    await prisma.job.deleteMany();
    await prisma.companySource.deleteMany();
    await prisma.company.deleteMany();

    console.log("database cleared");
  } catch (error) {
    console.error(error);
  } finally {
    prisma.$disconnect();
  }
}
