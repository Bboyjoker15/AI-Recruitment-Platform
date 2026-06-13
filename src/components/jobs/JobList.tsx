import Link from "next/link";
import type { Database } from "@/types/database";
import { Badge } from "@/components/shared/ui/Badge";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  draft: { label: "Borrador", variant: "default" },
  published: { label: "Publicada", variant: "success" },
  closed: { label: "Cerrada", variant: "warning" },
};

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => {
        const config = statusConfig[job.status] ?? statusConfig.draft;
        return (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
              <Badge variant={config.variant} className="shrink-0">
                {config.label}
              </Badge>
            </div>

            {job.description ? (
              <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">
                {job.description}
              </p>
            ) : (
              <p className="mb-4 text-sm italic text-gray-300">Sin descripción</p>
            )}

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(job.created_at)}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
