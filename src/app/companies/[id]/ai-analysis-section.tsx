// src/app/companies/[id]/ai-analysis-section.tsx
"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

type Analysis = {
  intentLevel: string;
  confidence: number;
  priority: string;
  shouldPursue: boolean;
  recommendedService: string;
  summary: string;
  whyOutbound: string[];
  strongestEvidence: string[];
  outreachAngles: string[];
  idealPersona: string[];
  risks: string[];
};

export function AiAnalysisSection({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch(`/api/companies/${companyId}/analyze`, {
        method: "POST",
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text || "Server returned non-JSON response");
      }

      if (!res.ok) {
        throw new Error(data?.details || data?.error || "Analysis failed");
      }

      setAnalysis(data);
    } catch (error: any) {
      console.error("Analyze failed:", error);
      setError(error.message || "Analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const priorityColor =
    analysis?.priority === "A"
      ? "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-800"
      : analysis?.priority === "B"
        ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800"
        : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800";

  return (
    <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Analysis
          </h2>

          <p className="text-base text-muted-foreground font-sans">
            Generate intent level, outreach angles, recommended service, and risks.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={analyze}
          disabled={loading}
          className="h-11 rounded-xl px-5 text-base font-sans gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing
            </>
          ) : (
            "Run analysis"
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-base leading-7 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 font-sans">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-background p-5 space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-full bg-muted"
              style={{ width: `${90 - i * 10}%` }}
            />
          ))}
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6 font-sans">
          <div className="rounded-2xl border bg-background p-5 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium",
                  priorityColor,
                )}
              >
                Priority {analysis.priority}
              </span>

              <Badge
                variant="secondary"
                className="rounded-full px-3 py-1.5 text-sm font-normal"
              >
                {analysis.intentLevel} intent
              </Badge>

              <Badge
                variant="outline"
                className="rounded-full px-3 py-1.5 text-sm font-normal"
              >
                {analysis.recommendedService}
              </Badge>

              <span className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                {analysis.confidence}% confidence
              </span>

              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium",
                  analysis.shouldPursue
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
                )}
              >
                {analysis.shouldPursue ? "Worth pursuing" : "Skip"}
              </span>
            </div>

            <div className="text-base leading-8 text-foreground">
              <Markdown>{analysis.summary}</Markdown>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnalysisList title="Why outbound" items={analysis.whyOutbound} />
            <AnalysisList
              title="Strongest evidence"
              items={analysis.strongestEvidence}
            />
            <AnalysisList
              title="Outreach angles"
              items={analysis.outreachAngles}
            />
            <AnalysisList title="Ideal persona" items={analysis.idealPersona} />
          </div>

          {analysis.risks.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-300">
                Risks
              </p>

              <ul className="space-y-2 text-base leading-7 text-amber-900 dark:text-amber-200">
                {analysis.risks.map((risk, i) => (
                  <li key={i}>· {risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && !error && (
        <div className="rounded-2xl border border-dashed bg-background p-6">
          <p className="text-base leading-7 text-muted-foreground font-sans">
            Run the AI analysis to get intent level, outreach angles, and
            recommended service.
          </p>
        </div>
      )}
    </section>
  );
}

function AnalysisList({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;

  return (
    <div className="rounded-2xl border bg-background p-5 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>

      <ul className="space-y-2 text-base leading-7 text-foreground">
        {items.map((item, i) => (
          <li key={i}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}