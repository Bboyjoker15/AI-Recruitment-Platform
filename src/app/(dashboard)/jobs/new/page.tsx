import Link from "next/link";
import { JobForm } from "@/components/jobs/JobForm";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a vacantes
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nueva Vacante</h1>

      <JobForm />
    </div>
  );
}
