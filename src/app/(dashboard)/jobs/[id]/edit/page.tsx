import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "@/components/jobs/JobForm";
import { BackButton } from "@/components/shared/ui/BackButton";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("*").eq("id", id).single();

  if (!job) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <BackButton href={`/jobs/${id}`} label="Volver a la vacante" />
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Editar vacante</h1>
      <JobForm
        initialData={{
          id: job.id,
          title: job.title,
          description: job.description,
          status: job.status,
        }}
      />
    </div>
  );
}
