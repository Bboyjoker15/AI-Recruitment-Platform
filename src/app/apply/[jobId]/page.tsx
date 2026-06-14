"use client";

import { use, useActionState } from "react";
import { BackButton } from "@/components/shared/ui/BackButton";
import { ApplyForm } from "@/components/apply/ApplyForm";
import { ApplySuccess } from "@/components/apply/ApplySuccess";
import { applyToJob } from "./actions";
import type { ApplyState } from "./actions";

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const [state, formAction] = useActionState<ApplyState, FormData>(applyToJob, {});

  if (state.success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="mb-4">
          <BackButton href="/" label="Ver todas las vacantes" />
        </div>
        <ApplySuccess score={state.score ?? 0} classification={state.classification ?? ""} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-4">
        <BackButton href="/" label="Ver todas las vacantes" />
      </div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Postulación</h1>
        <p className="mt-1 text-gray-500">Completa el formulario para postularte a esta vacante</p>
      </div>
      <ApplyForm jobId={jobId} />
    </div>
  );
}
