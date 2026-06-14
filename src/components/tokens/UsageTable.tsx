"use client";

import type { Database } from "@/types/database";

type AiLog = Database["public"]["Tables"]["ai_logs"]["Row"];

export function UsageTable({ logs }: { logs: AiLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">&Uacute;ltimos an&aacute;lisis</h2>
        <p className="py-6 text-center text-sm text-gray-400">No hay registros de an&aacute;lisis de IA.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">&Uacute;ltimos an&aacute;lisis</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              <th className="pb-2 pr-4">Evento</th>
              <th className="pb-2 pr-4">Modelo</th>
              <th className="pb-2 pr-4 text-right">Prompt</th>
              <th className="pb-2 pr-4 text-right">Completion</th>
              <th className="pb-2 pr-4 text-right">Total</th>
              <th className="pb-2 pr-4 text-right">Costo</th>
              <th className="pb-2 pr-4 text-right">Latencia</th>
              <th className="pb-2 pr-4">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const promptTokens = log.prompt_tokens ?? Math.round((log.tokens_used ?? 0) * 0.7);
              const completionTokens = log.completion_tokens ?? Math.round((log.tokens_used ?? 0) * 0.3);
              const cost =
                promptTokens * (0.59 / 1_000_000) + completionTokens * (0.79 / 1_000_000);

              return (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {log.event_type}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-600">
                    {log.model_version}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-gray-700">
                    {promptTokens.toLocaleString("es-ES")}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-gray-700">
                    {completionTokens.toLocaleString("es-ES")}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-semibold text-gray-900">
                    {(log.tokens_used ?? 0).toLocaleString("es-ES")}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-gray-600">
                    ${cost < 0.001 ? cost.toFixed(6) : cost.toFixed(4)}
                  </td>
                  <td className="py-2.5 pr-4 text-right font-mono text-gray-600">
                    {log.latency_ms != null ? `${log.latency_ms.toLocaleString("es-ES")}ms` : "—"}
                  </td>
                  <td className="py-2.5 whitespace-nowrap text-gray-400">
                    {new Date(log.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
