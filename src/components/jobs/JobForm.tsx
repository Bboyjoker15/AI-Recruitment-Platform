"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateJob } from "@/app/(dashboard)/jobs/actions";

type JobData = {
  id: string;
  title: string;
  description: string | null;
  status: string;
};

export function JobForm({ initialData }: { initialData?: JobData }) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [status, setStatus] = useState(initialData?.status ?? "draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isEditing) {
      const result = await updateJob(initialData.id, {
        title,
        description: description || null,
        status,
      });
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push(`/jobs/${initialData.id}`);
      router.refresh();
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Debes iniciar sesión para crear una vacante.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("jobs").insert({
      title,
      description: description || null,
      status: "draft",
      recruiter_id: user.id,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/jobs");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Título de la vacante <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Senior Frontend Developer"
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el rol, responsabilidades, requisitos y lo que ofreces..."
              rows={6}
              className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-gray-400">
              Describe el puesto en detalle para que la IA pueda evaluar mejor a los candidatos.
            </p>
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicada</option>
                <option value="closed">Cerrada</option>
              </select>
            </div>
          )}

          {!isEditing && (
            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>
                  La vacante se creará en estado <strong>Borrador</strong>. Podrás publicarla después desde la edición.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-danger">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(isEditing ? `/jobs/${initialData.id}` : "/jobs")}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isEditing ? "Guardando..." : "Creando..."}
            </>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
          {isEditing ? "Guardar cambios" : "Crear vacante"}
        </button>
      </div>
    </form>
  );
}
