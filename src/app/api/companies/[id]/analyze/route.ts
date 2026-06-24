// src\app\api\companies\[id]\analyze\route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";

function extractJson(text: string) {
  const cleaned = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      intentLevel: "Unknown",
      confidence: 0,
      summary: "Gemini returned an invalid JSON response.",
      whyOutbound: [],
      strongestEvidence: [],
      outreachAngles: [],
      risks: [],
      idealPersona: [],
      rawResponse: text,
    };
  }
}

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

function isRetryableGeminiError(error: any) {
  return (
    error?.status === 429 ||
    error?.status === 503 ||
    error?.message?.includes("RESOURCE_EXHAUSTED") ||
    error?.message?.includes("quota") ||
    error?.message?.includes("high demand")
  );
}

async function generateWithFallback(prompt: string) {
  let lastError: any;

  for (const model of MODELS) {
    try {
      const result = await gemini.models.generateContent({
        model,
        contents: prompt,
      });

      return {
        result,
        model,
      };
    } catch (error: any) {
      lastError = error;

      if (!isRetryableGeminiError(error)) {
        throw error;
      }

      console.warn(
        `Gemini model failed, trying cheaper fallback: ${model}`,
        error?.message,
      );
    }
  }

  throw lastError;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: true,
      signals: true,
    },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const scoringContext = `
Rule-based intent score context:
- Sales-related jobs increase score heavily.
- Sales/growth leadership hiring is a strong buying signal.
- Active hiring increases score.
- 5+ total open roles indicates hiring momentum.
- Team size 20-100 is ideal for outsourced outbound.
- Team size 100-300 may still need help but may have internal sales capacity.
- B2B/SaaS/Fintech/Devtools/Cybersecurity/Enterprise industries are high-intent.
- Growth language such as scaling, revenue, customers, funding, ARR, GTM increases score.
- AI/automation positioning gives a small boost.
- Remote sales hiring suggests scalable outbound motion.
- Funding and expansion signals are strong boosts when available.

The numeric intentScore is rule-based. Use it as evidence, but correct it if the company/job details suggest a different conclusion.
`;

  const prompt = `
You are analyzing whether this company is likely to buy outbound sales, lead generation, cold email, or appointment-setting services.

${scoringContext}

Return ONLY valid JSON. Do not wrap it in markdown.

Use this exact shape:

{
  "intentLevel": "High | Medium | Low",
  "confidence": 0,
  "summary": "",
  "whyOutbound": [],
  "strongestEvidence": [],
  "outreachAngles": [],
  "risks": [],
  "idealPersona": [],
  "recommendedService": "",
  "priority": "A | B | C",
  "shouldPursue": true
}

Field rules:
- confidence must be a number from 0 to 100.
- whyOutbound should contain 2-4 concise reasons.
- strongestEvidence should quote or reference concrete company/job evidence.
- outreachAngles should contain 2-3 practical sales angles.
- risks should mention reasons this may not be a good lead.
- idealPersona should list likely buyers by job title.
- recommendedService should be one of: "Appointment Setting", "Cold Email", "Lead Generation", "Outbound Strategy", "Low Fit".
- priority should be A for strong leads, B for moderate leads, C for weak leads.
- shouldPursue should be true only if outreach is worth attempting.

Company data:
${JSON.stringify(
  {
    name: company.name,
    website: company.website,
    description: company.description,
    industry: company.industry,
    teamSize: company.teamSize,
    intentScore: company.intentScore,
    intentReason: company.intentReason,
    jobs: company.jobs.map((job) => ({
      title: job.title,
      role: job.role,
      remote: job.remote,
      description: job.description?.slice(0, 700),
    })),
    signals: company.signals.map((signal) => ({
      type: signal.type,
      value: signal.value,
      evidence: signal.evidence,
      confidence: signal.confidence,
    })),
  },
  null,
  2,
)}
`;

  try {
    const { result, model } = await generateWithFallback(prompt);

    const analysis = extractJson(result.text ?? "");

    return NextResponse.json({
      ...analysis,
      modelUsed: model,
    });
  } catch (error: any) {
    console.error("Analyze route error:", error);

    const score = company.intentScore ?? 0;

    return NextResponse.json({
      intentLevel: score >= 70 ? "High" : score >= 40 ? "Medium" : "Low",
      confidence: 50,
      priority: score >= 70 ? "A" : score >= 40 ? "B" : "C",
      shouldPursue: score >= 40,
      recommendedService:
        score >= 70
          ? "Appointment Setting"
          : score >= 40
            ? "Lead Generation"
            : "Low Fit",

      summary:
        "Fallback analysis generated from rule-based scoring because AI analysis is unavailable.",

      whyOutbound: [
        company.isHiring && "Active hiring suggests growth.",
        (company.jobs?.length ?? 0) >= 5 &&
          "Multiple open roles indicate hiring momentum.",
        company.teamSize &&
          company.teamSize >= 20 &&
          company.teamSize <= 100 &&
          "Team size is suitable for outsourced outbound.",
      ].filter(Boolean),

      strongestEvidence: [
        `Intent score: ${score}`,
        `${company.jobs.length} open roles`,
        company.industry ?? "",
      ].filter(Boolean),

      outreachAngles: [
        "Offer appointment setting support.",
        "Reduce the need for internal SDR hiring.",
        "Help accelerate pipeline generation.",
      ],

      idealPersona: ["Head of Growth", "VP Sales", "Founder", "CEO"],

      risks: [
        "AI analysis unavailable.",
        score < 40 && "Low intent score.",
      ].filter(Boolean),
    });
  }
}
