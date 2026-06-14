import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditCandidateForm } from "@/components/candidates/EditCandidateForm";
import { BackButton } from "@/components/shared/ui/BackButton";

export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: candidate } = await supabase.from("candidates").select("*").eq("id", id).single();

  if (!candidate) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href={`/candidates/${id}`} label="Volver al candidato" />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar candidato</h1>
      <EditCandidateForm
        candidateId={candidate.id}
        initialName={candidate.name}
        initialEmail={candidate.email}
        initialStatus={candidate.status}
      />
    </div>
  );
}
