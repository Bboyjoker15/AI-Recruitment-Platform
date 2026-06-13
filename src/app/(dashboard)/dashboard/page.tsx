import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const stageLabels: Record<string, string> = {
  new: "Nuevo",
  screening: "En revisión",
  interview: "Entrevista",
  technical_test: "Prueba técnica",
  offer: "Oferta",
  hired: "Contratado",
  rejected: "Rechazado",
};

const stageColors: Record<string, string> = {
  new: "bg-blue-500",
  screening: "bg-blue-400",
  interview: "bg-yellow-500",
  technical_test: "bg-purple-500",
  offer: "bg-orange-500",
  hired: "bg-green-500",
  rejected: "bg-red-500",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const recruiterId = user?.id;

  if (!recruiterId) {
    return <div className="text-center py-12 text-gray-500">Inicia sesión para ver el dashboard.</div>;
  }

  const [jobsRes, candidatesRes, scoresRes] = await Promise.all([
    supabase.from("jobs").select("id, title, status").eq("recruiter_id", recruiterId),
    supabase
      .from("candidates")
      .select("id, name, email, status, job_id, created_at, jobs!inner(id, title, recruiter_id)")
      .eq("jobs.recruiter_id", recruiterId)
      .order("created_at", { ascending: false }),
    supabase
      .from("scores")
      .select("score, candidate_id"),
  ]);

  const jobs = jobsRes.data ?? [];
  const candidates = candidatesRes.data ?? [];
  const scores = scoresRes.data ?? [];

  const publishedJobs = jobs.filter((j) => j.status === "published").length;
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + (s.score as number), 0) / scores.length)
    : 0;

  const stageCount: Record<string, number> = {};
  for (const c of candidates) {
    const s = c.status;
    stageCount[s] = (stageCount[s] ?? 0) + 1;
  }
  const totalCandidates = candidates.length;

  const scoreByCandidate = new Map(scores.map((s) => [s.candidate_id, s.score]));

  const stageOrder = ["new", "screening", "interview", "technical_test", "offer", "hired", "rejected"];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Vacantes activas</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{publishedJobs}</p>
          <p className="mt-0.5 text-xs text-gray-400">{jobs.length} totales</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Candidatos</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalCandidates}</p>
          <p className="mt-0.5 text-xs text-gray-400">en todas las vacantes</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Score promedio</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{avgScore}</p>
          <p className="mt-0.5 text-xs text-gray-400">de 100</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Contratados</p>
          <p className="mt-1 text-3xl font-bold text-green-600">{stageCount.hired ?? 0}</p>
          <p className="mt-0.5 text-xs text-gray-400">{stageCount.rejected ?? 0} rechazados</p>
        </div>
      </div>

      {/* Candidates by stage */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">Candidatos por etapa</h2>
        {totalCandidates === 0 ? (
          <p className="text-sm text-gray-400">No hay candidatos aún.</p>
        ) : (
          <div className="space-y-3">
            {stageOrder.map((stage) => {
              const count = stageCount[stage] ?? 0;
              const pct = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-xs font-medium text-gray-600">
                    {stageLabels[stage] ?? stage}
                  </span>
                  <div className="flex h-4 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full transition-all ${stageColors[stage] ?? "bg-gray-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold text-gray-700">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent candidates */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Últimos candidatos</h2>
          <Link href="/candidates" className="text-xs font-medium text-primary hover:underline">
            Ver todos
          </Link>
        </div>
        {candidates.length === 0 ? (
          <p className="text-sm text-gray-400">No hay candidatos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Vacante</th>
                  <th className="pb-2 pr-4">Etapa</th>
                  <th className="pb-2 pr-4">Score</th>
                  <th className="pb-2 pr-4">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 8).map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 pr-4">
                      <Link href={`/candidates/${c.id}`} className="font-medium text-gray-900 hover:text-primary">
                        {c.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-gray-500">
                      {(c.jobs as unknown as { title: string })?.title ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.status === "hired"
                          ? "bg-green-50 text-green-700"
                          : c.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                      }`}>
                        {stageLabels[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-gray-700">
                      {scoreByCandidate.has(c.id) ? scoreByCandidate.get(c.id) : "—"}
                    </td>
                    <td className="py-2.5 text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
