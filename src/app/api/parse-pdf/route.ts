import { PDFParse } from "pdf-parse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "El archivo está vacío." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "El archivo es demasiado grande (máx. 10 MB)." }, { status: 400 });
    }

    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    const result = await parser.getText();
    const text = result.text;

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "El texto extraído del PDF es demasiado corto (mín. 50 caracteres)." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "No se pudo extraer el texto del PDF. Asegúrate de que sea un archivo PDF válido." },
      { status: 422 }
    );
  }
}
