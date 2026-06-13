"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

type AIAnalysisResult = {
  summary: string;
  classification: string;
  suggestions: string[];
  risk_level: "low" | "medium" | "high";
  score: number;
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

  return obj as AIAnalysisResult;
}

async function callAIApi(cvText: string, jobDescription: string): Promise<string> {
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
  "score": 85
}

Reglas:
- risk_level debe ser 'low' (bajo riesgo de contratación), 'medium' o 'high'.
- score debe ser un número entero entre 0 y 100.
- suggestions debe tener entre 1 y 5 sugerencias accionables.
- NO incluyas texto adicional fuera del JSON.`;

  const apiKey = process.env.GROQ_API_KEY;

  if (apiKey) {
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
    return data.choices[0].message.content;
  }

  // ── Fallback simulado para desarrollo ──
  const names = ["Silvia Méndez", "Carlos Ruiz"];
  const found = names.find((n) => cvText.includes(n));
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
  };
  return JSON.stringify(simulated);
}

export async function analyzeCandidate(
  _prevState: { error?: string; success?: boolean },
  formData: FormData
) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const cvPdf = formData.get("cv_pdf") as File | null;
    const jobId = formData.get("job_id") as string;

    if (!name || !email || !cvPdf || !jobId) {
      return { error: "Todos los campos son obligatorios." };
    }

    if (!email.includes("@")) {
      return { error: "El email no tiene un formato válido." };
    }

    if (cvPdf.size === 0) {
      return { error: "El archivo PDF está vacío." };
    }

    if (cvPdf.size > 10 * 1024 * 1024) {
      return { error: "El archivo PDF es demasiado grande (máx. 10 MB)." };
    }

    let cvText: string;
    try {
      const host = (await headers()).get("host") ?? "localhost:3000";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      const pdfFormData = new FormData();
      pdfFormData.set("file", cvPdf);
      const parseRes = await fetch(`${protocol}://${host}/api/parse-pdf`, {
        method: "POST",
        body: pdfFormData,
      });
      const parseResult = await parseRes.json();
      if (!parseRes.ok) {
        return { error: parseResult.error ?? "Error al procesar el PDF." };
      }
      cvText = parseResult.text;
    } catch {
      return { error: "No se pudo extraer el texto del PDF. Asegúrate de que sea un archivo PDF válido." };
    }

    const supabase = await createClient();

    // ── Obtener descripción del puesto ──
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("description")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return { error: "La vacante no existe." };
    }

    // ── 1. Llamar a la IA ──
    const raw = await callAIApi(cvText, job.description ?? "");
    const analysis = parseAIScore(raw);

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
    });

    if (scoreError) {
      return { error: `Error al guardar el score: ${scoreError.message}` };
    }

    revalidatePath(`/jobs/${jobId}`);
    return { success: true, candidateId: candidate.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al procesar el candidato.";
    return { error: message };
  }
}
