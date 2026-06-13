"use client";

import type { Database } from "@/types/database";

type Score = Database["public"]["Tables"]["scores"]["Row"];

const riskConfig: Record<
  string,
  { label: string; color: string; badge: string }
> = {
  low: {
    label: "Bajo",
    color: "text-green-600",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  medium: {
    label: "Medio",
    color: "text-yellow-600",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  high: {
    label: "Alto",
    color: "text-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
};

function BigScoreCircle({ score }: { score: number }) {
  const size = 160;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 75
      ? "stroke-green-500"
      : score >= 50
        ? "stroke-yellow-500"
        : "stroke-red-500";
  const textColor =
    score >= 75
      ? "text-green-600"
      : score >= 50
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className={`transition-all duration-700 ${color}`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-bold ${textColor}`}>{score}</span>
        <span className="text-xs font-medium text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function SummaryCard({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        Resumen Profesional
      </h3>
      <p className="text-base leading-relaxed text-gray-600">{summary}</p>
    </div>
  );
}

function SuggestionsList({ suggestions }: { suggestions: string[] }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        Sugerencias e Insights
      </h3>
      <ul className="space-y-2.5">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100">
              <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CVAnalysis({ score }: { score: Pick<Score, "score" | "summary" | "classification" | "suggestions" | "risk_level"> }) {
  const risk = riskConfig[score.risk_level] ?? riskConfig.medium;

  return (
    <div className="space-y-6">
      {/* Score + Risk header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-gray-500">Match Score</span>
            <BigScoreCircle score={score.score} />
          </div>

          <div className="hidden h-20 w-px bg-gray-200 sm:block" />

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Riesgo Detectado</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold ${risk.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${risk.color.replace("text-", "bg-")}`} />
              {risk.label}
            </span>
            <span className="text-xs text-gray-400">{score.classification}</span>
          </div>

          <div className="hidden h-20 w-px bg-gray-200 sm:block" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-gray-500">Clasificación</span>
            <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
              {score.classification}
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <SummaryCard summary={score.summary} />

      {/* Suggestions */}
      <SuggestionsList suggestions={score.suggestions as string[]} />
    </div>
  );
}
