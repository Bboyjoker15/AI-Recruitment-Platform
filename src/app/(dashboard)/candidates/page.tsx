import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/shared/ui/Card";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  new: "info",
  reviewing: "warning",
  interviewed: "default",
  accepted: "success",
  rejected: "danger",
};

export default async function CandidatesPage() {
  const supabase = await createClient();

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*, jobs(title)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Candidates</h1>

      <div className="grid gap-4">
        {candidates?.map((candidate) => (
          <Card key={candidate.id}>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{candidate.name}</CardTitle>
                <p className="text-sm text-gray-500">{candidate.email}</p>
                <p className="text-xs text-gray-400">
                  Job: {(candidate.jobs as { title: string })?.title ?? "—"}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {(!candidates || candidates.length === 0) && (
          <p className="text-center text-gray-400 py-12">No candidates yet.</p>
        )}
      </div>
    </div>
  );
}
