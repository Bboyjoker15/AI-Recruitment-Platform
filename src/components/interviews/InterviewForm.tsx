"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { scheduleInterview, type ScheduleInterviewState } from "@/app/(dashboard)/interviews/actions";

interface CandidateOption {
  id: string;
  name: string;
}

interface InterviewFormProps {
  candidateId?: string;
  candidates?: CandidateOption[];
}

export function InterviewForm({ candidateId, candidates = [] }: InterviewFormProps) {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState(candidateId ?? "");
  const [interviewDate, setInterviewDate] = useState("");
  const [status, setStatus] = useState("scheduled");
  const [notes, setNotes] = useState("");

  const initialState: ScheduleInterviewState = {};
  const [state, formAction, isPending] = useActionState(scheduleInterview, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/interviews");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="candidate_id" value={selectedCandidate} />
      <input type="hidden" name="interview_date" value={interviewDate.includes("T") ? `${interviewDate}:00` : interviewDate} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="notes" value={notes} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          {!candidateId && candidates.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="candidate" className="text-sm font-medium text-gray-700">
                Candidato <span className="text-red-500">*</span>
              </label>
              <select
                id="candidate"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                required
                className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Seleccionar candidato</option>
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Estado
            </label>
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
            <label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notas / Objetivos de la entrevista
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Preguntas clave, aspectos a evaluar, objetivos de la entrevista..."
              className="resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{state.error}</span>
        </div>
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
          disabled={isPending || !selectedCandidate || !interviewDate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50 cursor-pointer"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Agendando...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Agendar entrevista
            </>
          )}
        </button>
      </div>
    </form>
  );
}
