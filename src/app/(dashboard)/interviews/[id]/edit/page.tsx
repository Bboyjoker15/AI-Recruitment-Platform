import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditInterviewForm } from "@/components/interviews/EditInterviewForm";
import { BackButton } from "@/components/shared/ui/BackButton";

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
      <BackButton href="/interviews" label="Volver a entrevistas" />
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
