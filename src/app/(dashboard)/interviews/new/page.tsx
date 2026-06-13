import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InterviewForm } from "@/components/interviews/InterviewForm";

export default async function NewInterviewPage() {
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from("candidates")
    .select("id, name")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a entrevistas
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Agendar Nueva Entrevista
      </h1>

      <InterviewForm candidates={candidates ?? []} />
    </div>
  );
}
