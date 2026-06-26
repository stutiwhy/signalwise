// src/modules/scoring/score-companies.ts
import { prisma } from "@/lib/prisma";

const SALES_KEYWORDS = [
  "sales",
  "sdr",
  "bdr",
  "account executive",
  "ae",
  "business development",
  "appointment setter",
  "outbound",
  "cold email",
  "lead generation",
  "prospecting",
  "revenue",
  "gtm",
  "go-to-market",
  "growth",
  "partnerships",
];

const LEADERSHIP_SALES_KEYWORDS = [
  "head of sales",
  "vp sales",
  "sales manager",
  "revenue leader",
  "head of growth",
  "gtm lead",
];

const HIGH_INTENT_INDUSTRIES = [
  "b2b",
  "software",
  "saas",
  "fintech",
  "financial technology",
  "developer tools",
  "cybersecurity",
  "sales",
  "marketing",
  "hr tech",
  "healthcare",
  "enterprise",
];

const GROWTH_KEYWORDS = [
  "growing",
  "scaling",
  "expand",
  "expanding",
  "customers",
  "revenue",
  "arr",
  "funding",
  "raised",
  "backed by",
  "series a",
  "seed",
  "growth",
  "go-to-market",
];

const AI_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "automation",
  "agent",
  "agents",
  "voice",
  "llm",
  "machine learning",
];

function containsAny(text: string, keywords: string[]) {
  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function getCompanyText(company: {
  name: string;
  description: string | null;
  oneLiner: string | null;
  industry: string | null;
  hiringDescription?: string | null;
  techDescription?: string | null;
}) {
  return [
    company.name,
    company.description,
    company.oneLiner,
    company.industry,
    company.hiringDescription,
    company.techDescription,
  ]
    .filter(Boolean)
    .join(" ");
}

function getJobText(job: {
  title: string;
  role: string | null;
  description: string | null;
}) {
  return [job.title, job.role, job.description].filter(Boolean).join(" ");
}

function getTeamSizeScore(teamSize: number | null | undefined) {
  if (!teamSize) {
    return { points: 0, reason: null };
  }

  if (teamSize < 5) {
    return {
      points: 0,
      reason: "very small team; may be too early for outbound support",
    };
  }

  if (teamSize >= 5 && teamSize < 20) {
    return {
      points: 8,
      reason: "early team with possible growth needs",
    };
  }

  if (teamSize >= 20 && teamSize <= 100) {
    return {
      points: 15,
      reason: "ideal team size for outsourced outbound support",
    };
  }

  if (teamSize > 100 && teamSize <= 300) {
    return {
      points: 8,
      reason: "larger company with possible internal sales capacity",
    };
  }

  return {
    points: 3,
    reason: "large company; likely has internal sales infrastructure",
  };
}

export async function scoreCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      jobs: true,
      signals: true,
    },
  });

  for (const company of companies) {
    let score = 0;
    const reasons: string[] = [];

    const companyText = getCompanyText(company);

    const salesJobs = company.jobs.filter((job) =>
      containsAny(getJobText(job), SALES_KEYWORDS)
    );

    const leadershipSalesJobs = company.jobs.filter((job) =>
      containsAny(getJobText(job), LEADERSHIP_SALES_KEYWORDS)
    );

    const remoteSalesJobs = salesJobs.filter((job) => job.remote);

    if (salesJobs.length > 0) {
      const points = Math.min(salesJobs.length * 18, 45);
      score += points;
      reasons.push(`${salesJobs.length} sales-related role(s) open`);
    }

    if (leadershipSalesJobs.length > 0) {
      score += 15;
      reasons.push("sales/growth leadership hiring detected");
    }

    if (company.isHiring || company.jobs.length > 0) {
      score += 8;
      reasons.push("actively hiring");
    }

    if (company.jobs.length >= 5) {
      score += 10;
      reasons.push(`${company.jobs.length} total open role(s), indicating hiring momentum`);
    }

    const teamSizeResult = getTeamSizeScore(company.teamSize);
    score += teamSizeResult.points;

    if (teamSizeResult.reason) {
      reasons.push(teamSizeResult.reason);
    }

    if (containsAny(company.industry ?? "", HIGH_INTENT_INDUSTRIES)) {
      score += 12;
      reasons.push("matches high-intent B2B/tech industry");
    }

    if (containsAny(companyText, GROWTH_KEYWORDS)) {
      score += 10;
      reasons.push("growth-oriented language found in company profile");
    }

    if (containsAny(companyText, AI_KEYWORDS)) {
      score += 6;
      reasons.push("AI/automation positioning");
    }

    if (remoteSalesJobs.length > 0) {
      score += 5;
      reasons.push("remote sales hiring");
    }

    const fundingSignals = company.signals.filter(
      (signal) => signal.type === "FUNDING"
    );

    if (fundingSignals.length > 0) {
      score += 20;
      reasons.push("funding signal detected");
    }

    const expansionSignals = company.signals.filter(
      (signal) => signal.type === "EXPANSION"
    );

    if (expansionSignals.length > 0) {
      score += 10;
      reasons.push("expansion signal detected");
    }

    const finalScore = Math.min(Math.round(score), 100);

    await prisma.company.update({
      where: {
        id: company.id,
      },
      data: {
        intentScore: finalScore,
        intentReason:
          reasons.length > 0
            ? reasons.join("; ")
            : "No strong outbound-buying signals found",
      },
    });
  }
}