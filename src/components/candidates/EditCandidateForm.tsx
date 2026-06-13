"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCandidate } from "@/app/(dashboard)/jobs/[id]/candidates/actions";

const STAGES = [
  { value: "new", label: "Nuevo" },
  { value: "screening", label: "En revisión" },
  { value: "interview", label: "Entrevista" },
  { value: "technical_test", label: "Prueba técnica" },
  { value: "offer", label: "Oferta" },
  { value: "hired", label: "Contratado" },
  { value: "rejected", label: "Rechazado" },
];

export function EditCandidateForm({
  candidateId,
  initialName,
  initialEmail,
  initialStatus,
}: {
  candidateId: string;
  initialName: string;
  initialEmail: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setLoading(false);
      return;
    }
    if (!email.includes("@")) {
      setError("El email no es válido.");
      setLoading(false);
      return;
    }

    const result = await updateCandidate(candidateId, { name: name.trim(), email: email.trim(), status });
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push(`/candidates/${candidateId}`);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">Etapa</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {STAGES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-danger">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push(`/candidates/${candidateId}`)}
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
