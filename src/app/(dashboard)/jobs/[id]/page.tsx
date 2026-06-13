import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CandidateList, type CandidateWithScore } from "@/components/candidates/CandidateList";
import { Badge } from "@/components/shared/ui/Badge";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  draft: "default",
  published: "success",
  closed: "danger",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  closed: "Cerrada",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [jobRes, candidatesRes, scoresRes] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", id).single(),
    supabase
      .from("candidates")
      .select("*")
      .eq("job_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("scores")
      .select("candidate_id, score, classification, risk_level")
      .in(
        "candidate_id",
        (
          await supabase
            .from("candidates")
            .select("id")
            .eq("job_id", id)
        ).data?.map((c) => c.id) ?? []
      ),
  ]);

  const job = jobRes.data;
  if (!job) notFound();

  const candidates = candidatesRes.data ?? [];
  const scoreMap = new Map(
    (scoresRes.data ?? []).map((s) => [s.candidate_id, s])
  );

  const candidatesWithScore: CandidateWithScore[] = candidates.map((c) => ({
    ...c,
    score: scoreMap.get(c.id) ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/jobs"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a mis vacantes
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
          <Badge variant={statusVariant[job.status]}>{statusLabels[job.status] ?? job.status}</Badge>
        </div>
        {job.description && (
          <p className="mt-2 text-gray-600">{job.description}</p>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Candidatos ({candidates.length})
        </h2>
        <Link
          href={`/jobs/${id}/candidates/new`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo candidato
        </Link>
      </div>

      <CandidateList candidates={candidatesWithScore} />
    </div>
  );
}
