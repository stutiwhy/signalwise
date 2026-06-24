"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/score-badge";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "./refresh-button";

type Company = {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  industry: string | null;
  teamSize: number | null;
  intentScore: number | null;
  intentReason: string | null;
  isHiring: boolean;
  jobs: { id: string }[];
};

const ITEMS_PER_PAGE = 15;

export function CompanyTable({
  companies,
  industries,
}: {
  companies: Company[];
  industries: string[];
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [filterIndustry, setFilterIndustry] = useState("all");
  const [filterIntent, setFilterIntent] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = [...companies];

    if (search.trim()) {
      list = list.filter((company) =>
        company.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filterIndustry !== "all") {
      list = list.filter((company) => company.industry === filterIndustry);
    }

    if (filterIntent === "high") {
      list = list.filter((company) => (company.intentScore ?? 0) >= 70);
    } else if (filterIntent === "medium") {
      list = list.filter(
        (company) =>
          (company.intentScore ?? 0) >= 40 &&
          (company.intentScore ?? 0) < 70,
      );
    } else if (filterIntent === "low") {
      list = list.filter((company) => (company.intentScore ?? 0) < 40);
    }

    if (sortBy === "score") {
      list.sort((a, b) => (b.intentScore ?? 0) - (a.intentScore ?? 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "team") {
      list.sort((a, b) => (b.teamSize ?? 0) - (a.teamSize ?? 0));
    } else if (sortBy === "jobs") {
      list.sort((a, b) => b.jobs.length - a.jobs.length);
    }

    return list;
  }, [companies, search, sortBy, filterIndustry, filterIntent]);

  useEffect(() => {
    setPage(1);
  }, [search, filterIndustry, filterIntent, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-2xl border bg-card p-5 md:p-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Companies
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Browse scored companies and filter by intent, industry, or hiring signals.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {totalPages > 1 && ` · page ${page} of ${totalPages}`}

          </p>
          <RefreshButton/>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_160px_190px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-9 text-base"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11 rounded-xl text-base">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="team">Team size</SelectItem>
              <SelectItem value="jobs">Open jobs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterIndustry} onValueChange={setFilterIndustry}>
            <SelectTrigger className="h-11 rounded-xl text-base">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterIntent} onValueChange={setFilterIntent}>
            <SelectTrigger className="h-11 rounded-xl text-base">
              <SelectValue placeholder="Intent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All intent</SelectItem>
              <SelectItem value="high">High intent</SelectItem>
              <SelectItem value="medium">Medium intent</SelectItem>
              <SelectItem value="low">Low intent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <table className="w-full text-base font-sans">
          <thead>
            <tr className="border-b bg-muted/60 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Company</th>
              <th className="hidden px-6 py-4 font-semibold md:table-cell">
                Industry
              </th>
              <th className="hidden px-6 py-4 font-semibold sm:table-cell">
                Team
              </th>
              <th className="hidden px-6 py-4 font-semibold sm:table-cell">
                Jobs
              </th>
              <th className="px-6 py-4 font-semibold">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {paginated.map((company) => (
              <tr
                key={company.id}
                className="transition-colors hover:bg-muted/40"
              >
                <td className="px-6 py-5">
                  <Link
                    href={`/companies/${company.id}`}
                    className="group flex items-center gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                      {company.logoUrl ? (
                        <Image
                          src={company.logoUrl}
                          alt={company.name}
                          width={44}
                          height={44}
                          className="object-contain p-1"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-foreground transition-colors group-hover:text-primary">
                        {company.name}
                      </div>

                      {company.website && (
                        <div className="mt-1 max-w-[220px] truncate text-sm text-muted-foreground">
                          {company.website.replace(/^https?:\/\//, "")}
                        </div>
                      )}
                    </div>
                  </Link>
                </td>

                <td className="hidden px-6 py-5 md:table-cell">
                  {company.industry ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-sm font-normal"
                    >
                      {company.industry}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="hidden px-6 py-5 text-muted-foreground sm:table-cell">
                  {company.teamSize ?? "—"}
                </td>

                <td className="hidden px-6 py-5 text-muted-foreground sm:table-cell">
                  {company.jobs.length}
                </td>

                <td className="px-6 py-5">
                  <ScoreBadge score={company.intentScore} size="sm" />
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-muted-foreground"
                >
                  No companies match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="icon"
                className="h-10 w-10 rounded-xl text-sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ),
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}