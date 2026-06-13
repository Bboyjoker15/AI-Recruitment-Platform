import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditInterviewForm } from "@/components/interviews/EditInterviewForm";

export default async function EditInterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: interview } = await supabase
    .from("interviews")
    .select("*")
    .eq("id", id)
    .single();

  if (!interview) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/interviews"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a entrevistas
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar entrevista</h1>
      <EditInterviewForm
        interviewId={interview.id}
        initialDate={interview.interview_date}
        initialStatus={interview.status}
        initialNotes={interview.notes}
      />
    </div>
  );
}
