"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInterview } from "@/app/(dashboard)/interviews/actions";

export function EditInterviewForm({
  interviewId,
  initialDate,
  initialStatus,
  initialNotes,
}: {
  interviewId: string;
  initialDate: string;
  initialStatus: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [interviewDate, setInterviewDate] = useState(
    initialDate.slice(0, 16)
  );
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewDate) {
      setError("La fecha es obligatoria.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await updateInterview(interviewId, {
      interview_date: `${interviewDate}:00`,
      status,
      notes: notes || null,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/interviews");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="interview_date" className="text-sm font-medium text-gray-700">
              Fecha y hora <span className="text-red-500">*</span>
            </label>
            <input
              id="interview_date"
              type="datetime-local"
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="scheduled">Programada</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/interviews")}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50 cursor-pointer"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
