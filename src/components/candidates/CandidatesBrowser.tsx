"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type CandidateWithScore = {
  id: string;
  job_id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
  jobs: { title: string; id: string } | null;
  score: { score: number; classification: string; risk_level: string } | null;
};

type JobOption = { id: string; title: string };

const statusLabels: Record<string, string> = {
  new: "Nuevo",
  screening: "En revisión",
  interview: "Entrevista",
  technical_test: "Prueba técnica",
  offer: "Oferta",
  hired: "Contratado",
  rejected: "Rechazado",
};

const statusStyles: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  screening: "bg-blue-50 text-blue-700 border-blue-200",
  interview: "bg-yellow-50 text-yellow-700 border-yellow-200",
  technical_test: "bg-purple-50 text-purple-700 border-purple-200",
  offer: "bg-orange-50 text-orange-700 border-orange-200",
  hired: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const riskConfig: Record<string, { label: string; classes: string }> = {
  low: { label: "Bajo", classes: "bg-green-50 text-green-700" },
  medium: { label: "Medio", classes: "bg-yellow-50 text-yellow-700" },
  high: { label: "Alto", classes: "bg-red-50 text-red-700" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  return (
    <svg className="h-12 w-12 -rotate-90 shrink-0" viewBox="0 0 36 36">
      <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={100}
        strokeDashoffset={100 - score}
        strokeLinecap="round"
      />
      <text
        x="18"
        y="18"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-gray-900 text-[8px] font-bold"
        transform="rotate(90 18 18)"
      >
        {score}
      </text>
    </svg>
  );
}

export function CandidatesBrowser({
  candidates,
  jobs,
}: {
  candidates: CandidateWithScore[];
  jobs: JobOption[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  const sorted = useMemo(() => {
    const filtered = candidates.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q)
        ) return false;
      }
      if (statusFilter && c.status !== statusFilter) return false;
      if (jobFilter && c.job_id !== jobFilter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "score_desc": {
          if (!a.score && !b.score) return 0;
          if (!a.score) return 1;
          if (!b.score) return -1;
          return b.score.score - a.score.score;
        }
        case "score_asc": {
          if (!a.score && !b.score) return 0;
          if (!a.score) return 1;
          if (!b.score) return -1;
          return a.score.score - b.score.score;
        }
        case "name_az": return a.name.localeCompare(b.name);
        case "name_za": return b.name.localeCompare(a.name);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [candidates, search, statusFilter, jobFilter, sortOption]);

  const hasCandidates = candidates.length > 0;
  const hasResults = sorted.length > 0;
  const showStatusLabel = statusFilter && statusLabels[statusFilter];
  const showJobLabel = jobFilter && jobs.find((j) => j.id === jobFilter)?.title;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
        <p className="mt-1 text-sm text-gray-500">
          {hasCandidates
            ? `${sorted.length} de ${candidates.length} candidato${candidates.length !== 1 ? "s" : ""}`
            : "Aún no hay candidatos registrados"}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:text-gray-600 cursor-pointer"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Todas las vacantes</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="recent">Más recientes</option>
          <option value="score_desc">Mejor score</option>
          <option value="score_asc">Peor score</option>
          <option value="name_az">Nombre A-Z</option>
          <option value="name_za">Nombre Z-A</option>
        </select>

        {(search || statusFilter || jobFilter) && (
          <button
            type="button"
            onClick={() => { setSearch(""); setStatusFilter(""); setJobFilter(""); setSortOption("recent"); }}
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid */}
      {hasResults ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((candidate) => {
            const s = candidate.score;
            const jobTitle = candidate.jobs?.title ?? "—";
            const risk = s ? riskConfig[s.risk_level] : null;

            return (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(candidate.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Name + Status */}
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-900">
                        {candidate.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium leading-none ${statusStyles[candidate.status] ?? statusStyles.new}`}
                      >
                        {statusLabels[candidate.status] ?? candidate.status}
                      </span>
                    </div>

                    {/* Email */}
                    <p className="truncate text-sm text-gray-500">{candidate.email}</p>

                    {/* Job */}
                    <p className="mt-0.5 text-xs text-gray-400">
                      {jobTitle}
                    </p>

                    {/* Score row */}
                    {s && (
                      <div className="mt-3 flex items-center gap-3">
                        <ScoreRing score={s.score} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-800">
                            {s.classification}
                          </p>
                          {risk && (
                            <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${risk.classes}`}>
                              Riesgo {risk.label}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Date */}
                    <p className="mt-3 text-[11px] text-gray-400">
                      {new Date(candidate.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : hasCandidates ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Sin resultados</h3>
          <p className="mt-1 text-sm text-gray-500">
            {search && `No hay candidatos que coincidan con "${search}"`}
            {!search && (showStatusLabel || showJobLabel) && "Ningún candidato coincide con los filtros aplicados."}
            {!search && !statusFilter && !jobFilter && ""}
          </p>
          <button
            type="button"
            onClick={() => { setSearch(""); setStatusFilter(""); setJobFilter(""); }}
            className="mt-4 text-sm font-medium text-primary transition-colors hover:text-primary-dark cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">No hay candidatos</h3>
          <p className="mt-1 text-sm text-gray-500">
            Los candidatos aparecerán aquí cuando sean agregados a una vacante.
          </p>
        </div>
      )}
    </div>
  );
}
