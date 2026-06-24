// src/app/companies/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Globe,
  Users,
  Briefcase,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { AiAnalysisSection } from "./ai-analysis-section";
import { Markdown } from "@/components/markdown";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      jobs: true,
      signals: true,
    },
  });

  if (!company) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground font-sans"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  width={64}
                  height={64}
                  className="object-contain p-1.5"
                />
              ) : (
                <Building2 className="h-7 w-7 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  {company.name}
                </h1>

                <ScoreBadge score={company.intentScore} />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-base text-muted-foreground font-sans">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                  >
                    <Globe className="h-4 w-4" />
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                )}

                {company.teamSize && (
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {company.teamSize} people
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {company.industry && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-sm font-normal"
                  >
                    {company.industry}
                  </Badge>
                )}

                {company.ycBatch && (
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-sm font-normal"
                  >
                    {company.ycBatch}
                  </Badge>
                )}

                {company.isHiring && (
                  <Badge className="rounded-full px-3 py-1 text-sm font-normal">
                    Hiring
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {company.oneLiner && (
          <p className="mt-6 max-w-3xl text-xl leading-8 text-muted-foreground italic">
            {company.oneLiner}
          </p>
        )}

        {company.description && (
          <div className="mt-6 max-w-3xl rounded-2xl bg-muted/40 p-5">
            <Markdown>{company.description}</Markdown>
          </div>
        )}

        {company.intentReason && (
          <div className="mt-6 rounded-2xl border bg-background p-5 font-sans">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Scoring signals
            </p>

            <p className="text-base leading-7 text-foreground">
              {company.intentReason}
            </p>
          </div>
        )}
      </section>

      <AiAnalysisSection companyId={company.id} />

      <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Briefcase className="h-5 w-5 text-primary" />
            Open roles
          </h2>

          <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground font-sans">
            {company.jobs.length} found
          </span>
        </div>

        {company.jobs.length === 0 ? (
          <p className="text-base text-muted-foreground font-sans">
            No open roles found.
          </p>
        ) : (
          <div className="space-y-4">
            {company.jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-2xl border bg-background p-5 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {job.title}
                    </h3>

                    {job.role && (
                      <p className="text-sm text-muted-foreground font-sans">
                        {job.role}
                      </p>
                    )}
                  </div>

                  {job.remote && (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-sm font-normal"
                    >
                      Remote
                    </Badge>
                  )}
                </div>

                {job.description && (
                  <div className="mt-4 border-t pt-4 text-muted-foreground">
                    <Markdown>{job.description}</Markdown>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {company.signals.length > 0 && (
        <section className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">Signals</h2>

          <div className="grid gap-4">
            {company.signals.map((signal) => (
              <article
                key={signal.id}
                className="rounded-2xl border bg-background p-5 font-sans"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 text-sm font-normal"
                  >
                    {signal.type}
                  </Badge>

                  {signal.confidence && (
                    <span className="text-sm text-muted-foreground">
                      {Math.round(signal.confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                {signal.evidence && (
                  <p className="text-base leading-7 text-muted-foreground">
                    {signal.evidence}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}