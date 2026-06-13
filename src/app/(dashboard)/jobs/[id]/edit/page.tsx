import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "@/components/jobs/JobForm";

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
      <Link
        href={`/jobs/${id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Volver a la vacante
      </Link>
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
