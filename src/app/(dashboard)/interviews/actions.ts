"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ScheduleInterviewState = {
  error?: string;
  success?: boolean;
};

export async function scheduleInterview(
  _prevState: ScheduleInterviewState,
  formData: FormData
): Promise<ScheduleInterviewState> {
  try {
    const candidateId = formData.get("candidate_id") as string;
    const interviewDate = formData.get("interview_date") as string;
    const status = formData.get("status") as string;
    const notes = formData.get("notes") as string;

    if (!candidateId || !interviewDate) {
      return { error: "El candidato y la fecha son obligatorios." };
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return { error: "No hay sesión activa. Inicia sesión nuevamente." };
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const response = await fetch(`${baseUrl}/rest/v1/rpc/schedule_interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        p_candidate_id: candidateId,
        p_interview_date: interviewDate,
        p_status: status || "scheduled",
        p_notes: notes || null,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Error del servidor (${response.status})`;
      try {
        const errorBody = await response.json();
        if (errorBody.message) {
          errorMessage = errorBody.message;
        }
        console.error("RPC error:", errorBody);
      } catch {
        const text = await response.text();
        console.error("RPC raw error:", text);
        errorMessage = text || errorMessage;
      }
      return { error: errorMessage };
    }

    revalidatePath("/interviews");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error inesperado al agendar la entrevista.";
    console.error("scheduleInterview error:", err);
    return { error: message };
  }
}

export async function updateInterview(
  id: string,
  data: { interview_date?: string; status?: string; notes?: string | null }
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("interviews").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/interviews");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al actualizar la entrevista" };
  }
}

export async function deleteInterview(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("interviews").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/interviews");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar la entrevista" };
  }
}
