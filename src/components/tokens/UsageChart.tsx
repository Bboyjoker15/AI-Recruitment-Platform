"use client";

const BAR_WIDTH = 32;
const CHART_HEIGHT = 200;

export function UsageChart({
  dayBuckets,
}: {
  dayBuckets: { date: string; label: string; total_tokens: number; count: number }[];
}) {
  const maxTokens = Math.max(...dayBuckets.map((b) => b.total_tokens), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">Tokens por d&iacute;a (7 d&iacute;as)</h2>
      {dayBuckets.every((b) => b.total_tokens === 0) ? (
        <p className="py-8 text-center text-sm text-gray-400">No hay datos de tokens en los &uacute;ltimos 7 d&iacute;as.</p>
      ) : (
        <div className="flex items-end justify-center gap-3" style={{ height: CHART_HEIGHT }}>
          {dayBuckets.map((bucket) => {
            const pct = bucket.total_tokens / maxTokens;
            const barHeight = Math.max(pct * (CHART_HEIGHT - 30), bucket.total_tokens > 0 ? 4 : 0);
            return (
              <div key={bucket.date} className="flex flex-col items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">
                  {bucket.total_tokens.toLocaleString("es-ES")}
                </span>
                <svg width={BAR_WIDTH} height={CHART_HEIGHT - 30} className="overflow-visible">
                  <rect
                    x={0}
                    y={(CHART_HEIGHT - 30) - barHeight}
                    width={BAR_WIDTH}
                    height={barHeight}
                    rx={4}
                    className="fill-blue-500 transition-all duration-300"
                  />
                  {bucket.count > 0 && (
                    <text
                      x={BAR_WIDTH + 4}
                      y={(CHART_HEIGHT - 30) - barHeight + 4}
                      fontSize={9}
                      className="fill-gray-400"
                    >
                      {bucket.count}
                    </text>
                  )}
                </svg>
                <span className="text-xs text-gray-400">{bucket.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
