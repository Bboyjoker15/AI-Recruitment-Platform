"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type AIAnalysisResult = {
  summary: string;
  classification: string;
  suggestions: string[];
  risk_level: "low" | "medium" | "high";
  score: number;
  suggested_next_step: string;
};

function parseAIScore(raw: string): AIAnalysisResult {
  const cleaned = raw
    .replace(/```(?:json)?\s*/gi, "")
    .replace(/\s*```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("La IA devolvió un JSON inválido.");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error("La IA devolvió un formato inesperado (no es un objeto).");
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.summary !== "string" || obj.summary.trim().length === 0) {
    throw new Error("El campo 'summary' es obligatorio y debe ser un texto no vacío.");
  }
  if (typeof obj.classification !== "string" || obj.classification.trim().length === 0) {
    throw new Error("El campo 'classification' es obligatorio.");
  }
  if (!Array.isArray(obj.suggestions) || !obj.suggestions.every((s) => typeof s === "string")) {
    throw new Error("El campo 'suggestions' debe ser un arreglo de strings.");
  }
  if (!["low", "medium", "high"].includes(obj.risk_level as string)) {
    throw new Error("El campo 'risk_level' debe ser 'low', 'medium' o 'high'.");
  }
  if (typeof obj.score !== "number" || obj.score < 0 || obj.score > 100) {
    throw new Error("El campo 'score' debe ser un número entre 0 y 100.");
  }
  if (typeof obj.suggested_next_step !== "string" || obj.suggested_next_step.trim().length === 0) {
    throw new Error("El campo 'suggested_next_step' es obligatorio.");
  }

  return obj as AIAnalysisResult;
}

async function callAIApi(cvText: string, jobDescription: string): Promise<{
  content: string;
  rawResponse: string;
  latencyMs: number | null;
  tokensUsed: number | null;
  prompt: string;
}> {
  const prompt = `Eres un reclutador senior experto en análisis de currículums.

A continuación recibirás el CV de un candidato y la descripción del puesto al que aplica.

CV del candidato:
"""
${cvText}
"""

Descripción del puesto:
"""
${jobDescription}
"""

Analiza el CV en base a los requisitos del puesto y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin bloques de código) con la siguiente estructura exacta:
{
  "summary": "Resumen de 2-3 oraciones sobre la adecuación del candidato al puesto.",
  "classification": "Categoría del perfil (ej: 'Senior Frontend', 'Junior Backend', 'Data Analyst', etc).",
  "suggestions": ["Sugerencia 1 para mejorar la postulación", "Sugerencia 2", "Sugerencia 3"],
  "risk_level": "low" | "medium" | "high",
  "score": 85,
  "suggested_next_step": "screening" | "interview" | "technical_test" | "offer" | "reject"
}

Reglas:
- risk_level debe ser 'low' (bajo riesgo de contratación), 'medium' o 'high'.
- score debe ser un número entero entre 0 y 100.
- suggestions debe tener entre 1 y 5 sugerencias accionables.
- suggested_next_step debe ser una de las siguientes etapas: 'screening' (revisión inicial), 'interview' (entrevista), 'technical_test' (prueba técnica), 'offer' (oferta), 'reject' (descartar). NO incluyas 'new' ni 'hired'.
- NO incluyas texto adicional fuera del JSON.`;

  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
    const start = Date.now();
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Error en Groq API (${response.status}): ${body}`);
    }

    const data = await response.json();
    const latencyMs = Date.now() - start;
    return {
      content: data.choices[0].message.content,
      rawResponse: JSON.stringify(data),
      latencyMs,
      tokensUsed: data.usage?.total_tokens ?? null,
      prompt,
    };
  }

  // ── Fallback simulado para desarrollo ──
  const names = ["Silvia Méndez", "Carlos Ruiz"];
  const found = names.find((n) => cvText.includes(n));
  if (!found) {
    // Simulamos un "Carlos Ruiz" para tener datos consistentes
  }
  const simulated: AIAnalysisResult = {
    summary: found
      ? `El candidato ${found} muestra una sólida trayectoria alineada con los requisitos del puesto. Su experiencia en liderazgo técnico y gestión de equipos lo posiciona como un perfil adecuado.`
      : "El candidato presenta experiencia relevante aunque con algunas áreas de mejora para ajustarse completamente al perfil solicitado.",
    classification: found === "Silvia Méndez" ? "Tech Lead / Senior Fullstack" : "Backend Developer",
    suggestions: [
      "Destacar logros cuantificables en el CV",
      "Incluir proyectos personales o open-source relevantes",
      "Especificar tecnologías con nivel de experiencia",
    ],
    risk_level: found ? "low" : "medium",
    score: found ? 87 : 62,
    suggested_next_step: found ? "interview" : "screening",
  };
  return {
    content: JSON.stringify(simulated),
    rawResponse: JSON.stringify(simulated),
    latencyMs: null,
    tokensUsed: null,
    prompt,
  };
}

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
    // Fire-and-forget — no bloquear al usuario si n8n falla
  }
}

const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo",
  screening: "En revisión",
  interview: "Entrevista",
  technical_test: "Prueba técnica",
  offer: "Oferta",
  hired: "Contratado",
  rejected: "Rechazado",
};

export async function analyzeCandidate(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
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

    const supabase = await createClient();

    // ── Obtener descripción del puesto ──
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("title, description")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return { error: "La vacante no existe." };
    }

    // ── 1. Llamar a la IA ──
    const aiResult = await callAIApi(cvText, job.description ?? "");
    const analysis = parseAIScore(aiResult.content);

    const jobTitle = job.title ?? "Vacante";

    // ── 2. INSERT candidate ──
    const { data: candidate, error: candError } = await supabase
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

    if (candError || !candidate) {
      return { error: `Error al guardar el candidato: ${candError?.message ?? "unknown"}` };
    }

    // ── 3. INSERT score ──
    const { error: scoreError } = await supabase.from("scores").insert({
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

    // ── 4. INSERT ai_log ──
    await supabase.from("ai_logs").insert({
      event_type: "cv_analysis",
      prompt: aiResult.prompt,
      response: aiResult.rawResponse,
      model_version: "llama-3.3-70b-versatile",
      tokens_used: aiResult.tokensUsed,
      latency_ms: aiResult.latencyMs,
    });

    notifyN8N("candidate-created", {
      candidate_id: candidate.id,
      candidate_name: name,
      candidate_email: email,
      job_title: jobTitle,
      score: analysis.score,
      classification: analysis.classification,
      risk_level: analysis.risk_level,
      event: "candidate_created",
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, candidateId: candidate.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al procesar el candidato.";
    return { error: message };
  }
}

export async function updateCandidateStage(
  candidateId: string,
  newStatus: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { error: "No hay sesión activa." };
    }

    // Obtener datos del candidato antes de actualizar
    const { data: candidate } = await supabase
      .from("candidates")
      .select("name, email, jobs(title)")
      .eq("id", candidateId)
      .single();

    const { error: updateError } = await supabase
      .from("candidates")
      .update({ status: newStatus })
      .eq("id", candidateId);

    if (updateError) {
      return { error: updateError.message };
    }

    // Notificar a n8n (desde Server Action, no desde RPC)
    notifyN8N("candidate-stage", {
      candidate_id: candidateId,
      candidate_name: candidate?.name ?? "",
      candidate_email: candidate?.email ?? "",
      job_title: ((candidate?.jobs as unknown as { title: string } | null)?.title) ?? "",
      new_status: newStatus,
      new_status_label: STATUS_LABELS[newStatus] ?? newStatus,
      event: "stage_changed",
      timestamp: new Date().toISOString(),
    });

    revalidatePath(`/candidates/${candidateId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al actualizar la etapa.";
    return { error: message };
  }
}

export async function updateCandidate(
  id: string,
  data: { name?: string; email?: string; status?: string }
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("candidates").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/candidates/${id}`);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al actualizar el candidato" };
  }
}

export async function deleteCandidate(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/jobs");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar el candidato" };
  }
}
