"use client";

import { useState } from "react";
import { updateCandidateStage } from "@/app/(dashboard)/jobs/[id]/candidates/actions";

const stages = [
  { value: "new", label: "Nuevo", color: "bg-gray-100 text-gray-700" },
  { value: "screening", label: "En revisión", color: "bg-blue-50 text-blue-700" },
  { value: "interview", label: "Entrevista", color: "bg-yellow-50 text-yellow-700" },
  { value: "technical_test", label: "Prueba técnica", color: "bg-purple-50 text-purple-700" },
  { value: "offer", label: "Oferta", color: "bg-orange-50 text-orange-700" },
  { value: "hired", label: "Contratado", color: "bg-green-50 text-green-700" },
  { value: "rejected", label: "Rechazado", color: "bg-red-50 text-red-700" },
];

const stageLabels: Record<string, string> = Object.fromEntries(
  stages.map((s) => [s.value, s.label])
);

export function StageControls({
  candidateId,
  currentStage,
  suggestedNextStep,
}: {
  candidateId: string;
  currentStage: string;
  suggestedNextStep: string | null;
}) {
  const [stage, setStage] = useState(currentStage);
  const [error, setError] = useState("");
  const [moving, setMoving] = useState(false);

  const handleChange = async (newStatus: string) => {
    if (newStatus === stage) return;
    setMoving(true);
    setError("");

    const result = await updateCandidateStage(candidateId, newStatus);
    if (result.success) {
      setStage(newStatus);
    } else {
      setError(result.error ?? "Error al cambiar etapa");
    }
    setMoving(false);
  };

  const suggestedStages = ["screening", "interview", "technical_test", "offer", "reject"];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Etapa del proceso</h3>

      {/* Current stage badge */}
      <div className="flex flex-wrap items-center gap-2">
        {stages.map((s) => {
          const isSuggested = suggestedNextStep === s.value;
          return (
            <button
              key={s.value}
              type="button"
              disabled={moving || s.value === "new" || s.value === stage}
              onClick={() => handleChange(s.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                stage === s.value
                  ? `${s.color} border-current ring-2 ring-offset-1`
                  : isSuggested
                    ? "border-primary/50 text-primary bg-primary/5 hover:bg-primary/10"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.label}
              {isSuggested && stage !== s.value && (
                <span className="ml-1 rounded bg-primary/10 px-1 text-[10px] text-primary">IA</span>
              )}
            </button>
          );
        })}
      </div>

      {suggestedNextStep && suggestedNextStep !== stage && (
        <p className="mt-2 text-xs text-gray-400">
          IA sugiere: <span className="font-medium text-primary">{stageLabels[suggestedNextStep] ?? suggestedNextStep}</span>
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
