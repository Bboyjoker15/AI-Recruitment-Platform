import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import { UsageCards } from "@/components/tokens/UsageCards";
import { UsageChart } from "@/components/tokens/UsageChart";
import { UsageTable } from "@/components/tokens/UsageTable";

type AiLog = Database["public"]["Tables"]["ai_logs"]["Row"];

type DayBucket = {
  date: string;
  label: string;
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  count: number;
};

function buildDayBuckets(logs: AiLog[]): DayBucket[] {
  const last7 = new Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      label: d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      count: 0,
    };
  });

  for (const log of logs) {
    const key = log.created_at.slice(0, 10);
    const bucket = last7.find((b) => b.date === key);
    if (!bucket) continue;
    bucket.total_tokens += log.tokens_used ?? 0;
    bucket.prompt_tokens += log.prompt_tokens ?? Math.round((log.tokens_used ?? 0) * 0.7);
    bucket.completion_tokens += log.completion_tokens ?? Math.round((log.tokens_used ?? 0) * 0.3);
    bucket.count += 1;
  }

  return last7;
}

const PROMPT_RATE = 0.59 / 1_000_000;
const COMPLETION_RATE = 0.79 / 1_000_000;

function calcCost(logs: AiLog[]): number {
  let cost = 0;
  for (const log of logs) {
    const promptTokens = log.prompt_tokens ?? Math.round((log.tokens_used ?? 0) * 0.7);
    const completionTokens = log.completion_tokens ?? Math.round((log.tokens_used ?? 0) * 0.3);
    cost += promptTokens * PROMPT_RATE + completionTokens * COMPLETION_RATE;
  }
  return cost;
}

export default async function TokensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const recruiterId = user?.id;

  if (!recruiterId) {
    return <div className="py-12 text-center text-gray-500">Inicia sesi&oacute;n para ver el uso de tokens.</div>;
  }

  const { data: logs } = await supabase
    .from("ai_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const allLogs = logs ?? [];

  const totalTokens = allLogs.reduce((s, l) => s + (l.tokens_used ?? 0), 0);
  const totalCalls = allLogs.length;
  const avgLatencyMs =
    totalCalls > 0
      ? Math.round(allLogs.reduce((s, l) => s + (l.latency_ms ?? 0), 0) / totalCalls)
      : 0;
  const totalCost = calcCost(allLogs);
  const dayBuckets = buildDayBuckets(allLogs);
  const recentLogs = allLogs.slice(0, 20);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Token Usage</h1>
      <UsageCards
        totalTokens={totalTokens}
        totalCost={totalCost}
        totalCalls={totalCalls}
        avgLatencyMs={avgLatencyMs}
      />
      <UsageChart dayBuckets={dayBuckets} />
      <UsageTable logs={recentLogs} />
    </div>
  );
}
