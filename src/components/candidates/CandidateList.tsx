"use client";

import Link from "next/link";
import type { Database } from "@/types/database";

type Candidate = Database["public"]["Tables"]["candidates"]["Row"];
type Score = Database["public"]["Tables"]["scores"]["Row"];

export type CandidateWithScore = Candidate & {
  score: Pick<Score, "score" | "classification" | "risk_level"> | null;
};

const riskConfig: Record<string, { label: string; ring: string; bg: string }> = {
  low: { label: "Bajo", ring: "stroke-green-500", bg: "bg-green-50 text-green-700" },
  medium: { label: "Medio", ring: "stroke-yellow-500", bg: "bg-yellow-50 text-yellow-700" },
  high: { label: "Alto", ring: "stroke-red-500", bg: "bg-red-50 text-red-700" },
};

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const strokeColor = score >= 75 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ${strokeColor}`}
        />
      </svg>
      <span className="absolute text-xs font-bold text-gray-900">{score}</span>
    </div>
  );
}

export function CandidateList({
  candidates,
}: {
  candidates: CandidateWithScore[];
}) {
  if (candidates.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No hay candidatos postulados a esta vacante.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {candidates.map((candidate) => {
        const risk = candidate.score ? riskConfig[candidate.score.risk_level] : null;

        return (
          <Link
            key={candidate.id}
            href={`/candidates/${candidate.id}`}
            className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:px-5"
          >
            <div className="flex items-center gap-4">
              {/* Score ring */}
              <div className="hidden shrink-0 sm:block">
                {candidate.score ? (
                  <ScoreRing score={candidate.score.score} />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">
                    —
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {candidate.name}
                  </h3>
                  {/* Classification badge */}
                  {candidate.score?.classification && (
                    <span className="hidden shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 sm:inline">
                      {candidate.score.classification}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-gray-500">{candidate.email}</p>
              </div>

              {/* Risk + Score mobile + date */}
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {/* Score ring mobile */}
                <div className="sm:hidden">
                  {candidate.score ? (
                    <ScoreRing score={candidate.score.score} size={32} />
                  ) : null}
                </div>

                {risk && (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${risk.bg}`}>
                    {risk.label}
                  </span>
                )}

                <span className="text-xs text-gray-400">
                  {new Date(candidate.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
