"use client";

import { useActionState, useState } from "react";
import { applyToJob, type ApplyState } from "@/app/apply/[jobId]/actions";
import { Button } from "@/components/shared/ui/Button";

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(applyToJob, {});
  const [fileName, setFileName] = useState<string>("");
  const [extracting, setExtracting] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    setFileName(file.name);

    if (file.type !== "application/pdf") {
      alert("Solo se aceptan archivos PDF.");
      return;
    }

    setExtracting(true);
    try {
      const PDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379";
      const pdfjsLib: {
        GlobalWorkerOptions: { workerSrc: string };
        getDocument: (params: { data: ArrayBuffer }) => {
          promise: Promise<{
            numPages: number;
            getPage: (n: number) => Promise<{
              getTextContent: () => Promise<{ items: { str: string }[] }>;
            }>;
          }>;
        };
      } = await import(/* webpackIgnore: true */ `${PDF_CDN}/pdf.min.mjs`);
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDF_CDN}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: { str: string }) => item.str).join(" ") + "\n";
      }

      const hiddenInput = document.querySelector<HTMLInputElement>("#cv_text");
      if (hiddenInput) {
        hiddenInput.value = text;
      }
    } catch (e) {
      alert("Error al leer el PDF. Intenta con otro archivo.");
      console.error(e);
    } finally {
      setExtracting(false);
    }
  }

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-5">
      <input type="hidden" name="job_id" value={jobId} />
      <input type="hidden" id="cv_text" name="cv_text" />

      {state.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">
          Currículum (PDF)
        </label>
        <input
          id="cv"
          name="cv"
          type="file"
          accept=".pdf"
          required
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
        />
        {extracting && <p className="mt-1 text-xs text-blue-600">Extrayendo texto del PDF...</p>}
        {fileName && !extracting && <p className="mt-1 text-xs text-gray-500">✓ {fileName}</p>}
      </div>

      <Button type="submit" disabled={pending || extracting} className="w-full justify-center">
        {pending ? "Procesando..." : "Enviar postulación"}
      </Button>
    </form>
  );
}
