import { createClient } from "@/lib/supabase/server";
import { CandidatesBrowser } from "@/components/candidates/CandidatesBrowser";

export default async function CandidatesPage() {
  const supabase = await createClient();

  const [candidatesRes, scoresRes, jobsRes] = await Promise.all([
    supabase
      .from("candidates")
      .select("*, jobs(title, id)")
      .order("created_at", { ascending: false }),
    supabase
      .from("scores")
      .select("candidate_id, score, classification, risk_level"),
    supabase.from("jobs").select("id, title").order("title"),
  ]);

  const candidates = candidatesRes.data ?? [];
  const scores = scoresRes.data ?? [];
  const jobs = jobsRes.data ?? [];

  const scoreMap = new Map(scores.map((s) => [s.candidate_id, s]));
  const candidatesWithScore = candidates.map((c) => ({
    ...c,
    score: scoreMap.get(c.id) ?? null,
  }));

  return <CandidatesBrowser candidates={candidatesWithScore} jobs={jobs} />;
}
