// src\app\page.tsx
import { prisma } from "@/lib/prisma";
import { CompanyTable } from "@/components/company-table";

export default async function HomePage() {
  const companies = await prisma.company.findMany({
    orderBy: { intentScore: "desc" },
    include: { jobs: true },
  });

  const industries = [...new Set(companies.map((c) => c.industry).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Lead Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          {companies.length} companies scored by outbound intent
        </p>
      </div>
      <CompanyTable companies={companies} industries={industries} />
    </div>
  );
}