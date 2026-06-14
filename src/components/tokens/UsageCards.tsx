"use client";

const cards = [
  {
    key: "tokens",
    label: "Tokens Totales",
    format: (v: number) => v.toLocaleString("es-ES"),
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "cost",
    label: "Costo Estimado",
    format: (v: number) =>
      v < 0.01
        ? `$${v.toFixed(6)} USD`
        : v < 1
          ? `$${v.toFixed(4)} USD`
          : `$${v.toFixed(2)} USD`,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    key: "calls",
    label: "Llamadas API",
    format: (v: number) => v.toLocaleString("es-ES"),
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    key: "latency",
    label: "Latencia Promedio",
    format: (v: number) => `${v.toLocaleString("es-ES")} ms`,
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

export function UsageCards({
  totalTokens,
  totalCost,
  totalCalls,
  avgLatencyMs,
}: {
  totalTokens: number;
  totalCost: number;
  totalCalls: number;
  avgLatencyMs: number;
}) {
  const values: Record<string, number> = {
    tokens: totalTokens,
    cost: totalCost,
    calls: totalCalls,
    latency: avgLatencyMs,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {card.label}
          </p>
          <p className={`mt-1 text-3xl font-bold ${card.color}`}>
            {card.format(values[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
