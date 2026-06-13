"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateJob(
  id: string,
  data: { title: string; description?: string | null; status?: string }
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").update(data).eq("id", id);
    if (error) return { error: error.message };
    revalidatePath(`/jobs/${id}`);
    revalidatePath("/jobs");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al actualizar" };
  }
}

export async function deleteJob(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/jobs");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar" };
  }
}
