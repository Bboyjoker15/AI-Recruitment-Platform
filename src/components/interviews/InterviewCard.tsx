"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateInterview, deleteInterview } from "@/app/(dashboard)/interviews/actions";
import { ConfirmDialog } from "@/components/shared/ui/ConfirmDialog";

interface InterviewCardProps {
  id: string;
  candidate_name: string;
  candidate_id: string;
  interview_date: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string | null;
}

const statusConfig: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  scheduled: {
    label: "Programada",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completada",
    badge: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelada",
    badge: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const time = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { date, time };
}

export function InterviewCard({
  id,
  candidate_name,
  candidate_id,
  interview_date,
  status,
  notes,
}: InterviewCardProps) {
  const router = useRouter();
  const config = statusConfig[status] ?? statusConfig.scheduled;
  const { date, time } = formatDateTime(interview_date);
  const [toggling, setToggling] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleStatus = async () => {
    setToggling(true);
    const nextStatus = status === "scheduled" ? "completed" : "scheduled";
    await updateInterview(id, { status: nextStatus });
    setToggling(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteInterview(id);
    setDeleting(false);
    router.refresh();
  };

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="truncate font-semibold text-gray-900">
              {candidate_name}
            </h3>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.badge}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time}
            </span>
          </div>

          {notes && (
            <p className="mt-3 text-sm leading-relaxed text-gray-600 line-clamp-2">
              {notes}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {status === "scheduled" && (
              <button
                type="button"
                onClick={toggleStatus}
                disabled={toggling}
                className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 cursor-pointer disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Marcar completada
              </button>
            )}
            {status === "scheduled" && (
              <button
                type="button"
                onClick={async () => {
                  setToggling(true);
                  await updateInterview(id, { status: "cancelled" });
                  setToggling(false);
                  router.refresh();
                }}
                disabled={toggling}
                className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            )}
            <Link
              href={`/interviews/${id}/edit`}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>

        <a
          href={`/candidates/${candidate_id}`}
          className="mt-1 inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          Ver perfil
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
      <ConfirmDialog
        open={showDelete}
        title="Eliminar entrevista"
        message="Esta acción eliminará la entrevista. No se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        loading={deleting}
      />
    </div>
  );
}
