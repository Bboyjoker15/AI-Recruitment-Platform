import { JobForm } from "@/components/jobs/JobForm";
import { BackButton } from "@/components/shared/ui/BackButton";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <BackButton href="/jobs" label="Volver a vacantes" />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nueva Vacante</h1>

      <JobForm />
    </div>
  );
}
