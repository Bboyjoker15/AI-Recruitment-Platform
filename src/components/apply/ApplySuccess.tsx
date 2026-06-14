export function ApplySuccess({ score, classification }: { score: number; classification: string }) {
  const scoreColor =
    score >= 75
      ? "text-green-600"
      : score >= 50
        ? "text-yellow-600"
        : "text-red-600";

  const scoreBg =
    score >= 75
      ? "bg-green-50 border-green-200"
      : score >= 50
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="mx-auto max-w-lg text-center">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900">¡Postulación recibida!</h2>
        <p className="mt-2 text-gray-600">
          Hemos recibido tu postulación exitosamente. Nuestro equipo la revisará y te contactaremos pronto.
        </p>

        <div className={`mt-6 rounded-lg border p-4 ${scoreBg}`}>
          <div className={`text-3xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400 mt-0.5">Score de compatibilidad</div>
          <div className="mt-2 inline-block rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
            {classification}
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Recibirás un correo de confirmación en los próximos minutos.
        </p>
      </div>
    </div>
  );
}
