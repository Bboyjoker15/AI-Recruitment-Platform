import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InterviewCard } from "@/components/interviews/InterviewCard";

export default async function InterviewsPage() {
  const supabase = await createClient();

  const { data: interviews } = await supabase
    .from("interviews")
    .select("*, candidates(name, id)")
    .order("interview_date", { ascending: true });

  const hasInterviews = interviews && interviews.length > 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario de Entrevistas
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasInterviews
              ? `${interviews.length} entrevista${interviews.length !== 1 ? "s" : ""} agendada${interviews.length !== 1 ? "s" : ""}`
              : "Agenda tu primera entrevista"}
          </p>
        </div>
        <Link
          href="/interviews/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark hover:shadow-sm"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agendar nueva entrevista
        </Link>
      </div>

      {hasInterviews ? (
        <div className="space-y-3">
          {interviews.map((interview) => (
            <InterviewCard
              key={interview.id}
              id={interview.id}
              candidate_name={
                (interview.candidates as { name: string })?.name ?? "—"
              }
              candidate_id={
                (interview.candidates as { id: string })?.id ?? ""
              }
              interview_date={interview.interview_date}
              status={interview.status}
              notes={interview.notes}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-900">
            No hay entrevistas agendadas
          </h3>
          <p className="mb-6 max-w-sm text-sm text-gray-500">
            Programa entrevistas con los candidatos para evaluar sus habilidades y definir el siguiente paso del proceso de selección.
          </p>
          <Link
            href="/interviews/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agendar primera entrevista
          </Link>
        </div>
      )}
    </div>
  );
}
