import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CVAnalysis } from "@/components/candidates/CVAnalysis";
import { StageControls } from "@/components/candidates/StageControls";
import { CandidateActions } from "@/components/candidates/CandidateActions";

const statusBadge: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  screening: "bg-blue-50 text-blue-700 border-blue-200",
  interview: "bg-yellow-50 text-yellow-700 border-yellow-200",
  technical_test: "bg-purple-50 text-purple-700 border-purple-200",
  offer: "bg-orange-50 text-orange-700 border-orange-200",
  hired: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const statusLabels: Record<string, string> = {
  new: "Nuevo",
  screening: "En revisión",
  interview: "Entrevista",
  technical_test: "Prueba técnica",
  offer: "Oferta",
  hired: "Contratado",
  rejected: "Rechazado",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [candidateRes, scoreRes] = await Promise.all([
    supabase.from("candidates").select("*, jobs(title, id)").eq("id", id).single(),
    supabase
      .from("scores")
      .select("*")
      .eq("candidate_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  const candidate = candidateRes.data;
  if (!candidate) notFound();

  const score = scoreRes.data ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Back link */}
      <Link
        href={`/jobs/${(candidate.jobs as { id: string })?.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a la vacante
      </Link>

      {/* Candidate header */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {candidate.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[candidate.status] ?? statusBadge.new}`}
                >
                  {statusLabels[candidate.status] ?? candidate.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{candidate.email}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                Postuló a{" "}
                <span className="font-medium text-gray-600">
                  {(candidate.jobs as { title: string })?.title ?? "—"}
                </span>
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Link
                  href={`/candidates/${id}/edit`}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  Editar
                </Link>
                <CandidateActions candidateId={id} jobId={(candidate.jobs as { id: string })?.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Controls */}
      <StageControls
        candidateId={id}
        currentStage={candidate.status}
        suggestedNextStep={score?.suggested_next_step ?? null}
      />

      {/* AI Analysis */}
      {score ? (
        <CVAnalysis
          score={{
            score: score.score,
            summary: score.summary,
            classification: score.classification,
            suggestions: score.suggestions,
            risk_level: score.risk_level,
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Sin análisis aún</h3>
          <p className="mt-1 text-sm text-gray-500">
            Este candidato no ha sido evaluado por la IA.
          </p>
        </div>
      )}
    </div>
  );
}
