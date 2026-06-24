// src\modules\yc\importer.ts
import { prisma } from "../../../../lead-gen-bot/src/lib/prisma";

export async function importJobHit(hit: any) {
  const company = await prisma.company.upsert({
    where: {
      website: hit.company_website,
    },

    update: {
      name: hit.company_name,
      description: hit.company_description,
      industry: hit.company_parent_sector,
      teamSize: hit.company_team_size,
      isHiring: true,
    },

    create: {
      name: hit.company_name,
      website: hit.company_website,

      description: hit.company_description,

      industry: hit.company_parent_sector,

      teamSize: hit.company_team_size,

      isHiring: true,
    },
  });

  await prisma.job.create({
    data: {
      companyId: company.id,

      title: hit.title,

      role: hit.role,

      description: hit.description,

      remote: hit.remote === "yes",

      source: "YC",
    },
  });

  return company;
}