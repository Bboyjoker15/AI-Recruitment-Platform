"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { analyzeCandidate } from "../actions";
import { BackButton } from "@/components/shared/ui/BackButton";

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379";

let pdfjsPromise: Promise<{
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (params: { data: Uint8Array }) => {
    promise: Promise<{
      numPages: number;
      getPage: (n: number) => Promise<{
        getTextContent: () => Promise<{ items: { str?: string }[] }>;
      }>;
      destroy: () => void;
    }>;
  };
}> | null = null;

async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(
      /* webpackIgnore: true */
      `${PDFJS_CDN}/pdf.min.mjs`
    ).then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`;
      return mod;
    });
  }
  return pdfjsPromise;
}

export default function NewCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState<{ error?: string; success?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [cvText, setCvText] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      setState({ error: "El archivo PDF está vacío." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState({ error: "El archivo PDF es demasiado grande (máx. 10 MB)." });
      return;
    }

    setExtracting(true);
    setState({});

    try {
      const buffer = await file.arrayBuffer();
      const pdfjs = await loadPdfjs();
      const uint8 = new Uint8Array(buffer);

      const doc = await pdfjs.getDocument({ data: uint8 }).promise;
      const pages: string[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        pages.push(
          content.items
            .filter((item) => "str" in item)
            .map((item) => (item as { str: string }).str)
            .join(" ")
        );
      }

      doc.destroy();
      const text = pages.join("\n\n");

      if (text.trim().length < 50) {
        setState({
          error: "El texto extraído del PDF es demasiado corto (mín. 50 caracteres). Asegúrate de que el PDF contenga texto seleccionable.",
        });
        setCvText("");
      } else {
        setCvText(text);
      }
    } catch (err) {
      console.error("Error extrayendo PDF:", err);
      setState({
        error: "No se pudo extraer el texto del PDF. Asegúrate de que sea un archivo PDF válido.",
      });
      setCvText("");
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cvText) {
      setState({ error: "Debes seleccionar un PDF válido y esperar a que se extraiga el texto." });
      return;
    }

    setLoading(true);
    setState({});

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("job_id", id);
    formData.set("cv_text", cvText);

    const result = await analyzeCandidate(state, formData);
    setState(result);

    if (result.success) {
      router.push(`/jobs/${id}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <BackButton href={`/jobs/${id}`} label="Volver a la vacante" />
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo Candidato</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Nombre completo <span className="text-danger">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Ej: Ana García López"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email <span className="text-danger">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="ana.garcia@example.com"
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cv_pdf" className="text-sm font-medium text-gray-700">
                Currículum (PDF) <span className="text-danger">*</span>
              </label>
              <input
                id="cv_pdf"
                type="file"
                accept=".pdf"
                required
                disabled={extracting}
                onChange={handleFileChange}
                className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              />
              <p className="text-xs text-gray-400">
                {extracting
                  ? "Extrayendo texto del PDF..."
                  : cvText
                    ? `✓ Texto extraído (${cvText.length} caracteres)`
                    : "Sube el CV en formato PDF. El texto se extraerá en tu navegador."}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <span>
                  El candidato se registrará y la IA generará automáticamente un análisis con puntuación, clasificación y sugerencias.
                </span>
              </div>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-danger">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/jobs/${id}`)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || extracting || !cvText}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizando con IA...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
                Analizar con IA
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
