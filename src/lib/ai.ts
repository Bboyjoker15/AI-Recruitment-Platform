export type AIAnalysisResult = {
  summary: string;
  classification: string;
  suggestions: string[];
  risk_level: "low" | "medium" | "high";
  score: number;
  suggested_next_step: string;
};

export function parseAIScore(raw: string): AIAnalysisResult {
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

export async function callAIApi(cvText: string, jobDescription: string): Promise<{
  content: string;
  rawResponse: string;
  latencyMs: number | null;
  tokensUsed: number | null;
  promptTokens: number | null;
  completionTokens: number | null;
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
      promptTokens: data.usage?.prompt_tokens ?? null,
      completionTokens: data.usage?.completion_tokens ?? null,
      prompt,
    };
  }

  const simulated: AIAnalysisResult = {
    summary: "El candidato presenta experiencia relevante aunque con algunas áreas de mejora para ajustarse completamente al perfil solicitado.",
    classification: "Backend Developer",
    suggestions: [
      "Destacar logros cuantificables en el CV",
      "Incluir proyectos personales o open-source relevantes",
      "Especificar tecnologías con nivel de experiencia",
    ],
    risk_level: "medium",
    score: 62,
    suggested_next_step: "screening",
  };
  return {
    content: JSON.stringify(simulated),
    rawResponse: JSON.stringify(simulated),
    latencyMs: null,
    tokensUsed: null,
    promptTokens: null,
    completionTokens: null,
    prompt,
  };
}
