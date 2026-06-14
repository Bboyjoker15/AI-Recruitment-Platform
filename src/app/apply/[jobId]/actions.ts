"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { callAIApi, parseAIScore } from "@/lib/ai";
import { revalidatePath } from "next/cache";

async function notifyN8N(path: string, payload: Record<string, unknown>) {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  if (!baseUrl) return;
  try {
    await fetch(`${baseUrl}/webhook/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // fire-and-forget
  }
}

export type ApplyState = {
  error?: string;
  success?: boolean;
  score?: number;
  classification?: string;
};

export async function applyToJob(
  _prevState: ApplyState,
  formData: FormData
): Promise<ApplyState> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const cvText = formData.get("cv_text") as string;
    const jobId = formData.get("job_id") as string;

    if (!name || !email || !cvText || !jobId) {
      return { error: "Todos los campos son obligatorios." };
    }

    if (!email.includes("@")) {
      return { error: "El email no tiene un formato válido." };
    }

    if (cvText.trim().length < 50) {
      return { error: "El texto extraído del PDF es demasiado corto (mín. 50 caracteres)." };
    }

    const admin = createAdminClient();

    const { data: job } = await admin
      .from("jobs")
      .select("title, description, recruiter_id")
      .eq("id", jobId)
      .single();

    if (!job) {
      return { error: "La vacante no existe." };
    }

    const aiResult = await callAIApi(cvText, job.description ?? "");
    const analysis = parseAIScore(aiResult.content);

    const { data: candidate } = await admin
      .from("candidates")
      .insert({
        job_id: jobId,
        name,
        email,
        raw_cv_data: { text: cvText },
        status: "new",
      })
      .select("id")
      .single();

    if (!candidate) {
      return { error: "Error al guardar la postulación." };
    }

    const { error: scoreError } = await admin.from("scores").insert({
      candidate_id: candidate.id,
      summary: analysis.summary,
      classification: analysis.classification,
      suggestions: analysis.suggestions,
      risk_level: analysis.risk_level,
      score: analysis.score,
      suggested_next_step: analysis.suggested_next_step,
    });

    if (scoreError) {
      return { error: `Error al guardar el score: ${scoreError.message}` };
    }

    const { error: aiError } = await admin.rpc("insert_ai_log", {
      p_event_type: "cv_analysis",
      p_prompt: aiResult.prompt,
      p_response: aiResult.rawResponse,
      p_model_version: "llama-3.3-70b-versatile",
      p_tokens_used: aiResult.tokensUsed,
      p_prompt_tokens: aiResult.promptTokens,
      p_completion_tokens: aiResult.completionTokens,
      p_latency_ms: aiResult.latencyMs,
    });
    if (aiError) {
      console.error("ai_logs insert error:", aiError);
    }

    notifyN8N("candidate-created", {
      candidate_id: candidate.id,
      candidate_name: name,
      candidate_email: email,
      job_title: job.title,
      score: analysis.score,
      classification: analysis.classification,
      risk_level: analysis.risk_level,
      event: "candidate_created",
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/apply/${jobId}`);
    return {
      success: true,
      score: analysis.score,
      classification: analysis.classification,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al procesar la postulación.";
    return { error: message };
  }
}
