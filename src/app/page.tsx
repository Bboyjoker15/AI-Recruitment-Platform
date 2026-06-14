import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/shared/ui/Badge";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const admin = createAdminClient();
  const { data: jobs } = await admin
    .from("jobs")
    .select("id, title, description, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold text-gray-900">
            AI Recruitment
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login?tab=signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Encuentra el talento ideal con
              <span className="text-primary"> inteligencia artificial</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Analiza currículums con IA, gestiona candidatos, programa entrevistas y
              toma decisiones basadas en datos. Todo en una plataforma.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/login?tab=signup"
                className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md"
              >
                Comenzar gratis
              </Link>
              <Link
                href="#vacantes"
                className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                Ver vacantes
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Features ── */}
      <section className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            ¿Por qué AI Recruitment?
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Análisis con IA",
                desc: "Procesamiento automático de currículums con Groq AI. Obtén scores de compatibilidad, clasificación y sugerencias.",
              },
              {
                title: "Pipeline de reclutamiento",
                desc: "Gestiona candidatos en 7 etapas: desde nuevo hasta contratado. Arrastra y suelta entre estados.",
              },
              {
                title: "Notificaciones por email",
                desc: "Automatización con n8n + Resend. Envía correos de confirmación y actualizaciones a candidatos y reclutadores.",
              },
              {
                title: "Entrevistas integradas",
                desc: "Programa, completa y cancela entrevistas. Todo sincronizado con el perfil del candidato.",
              },
              {
                title: "Dashboard en tiempo real",
                desc: "KPIs, distribución por etapas, candidatos recientes y consumo de tokens todo en un vistazo.",
              },
              {
                title: "Postulación pública",
                desc: "Los candidatos pueden postularse desde un enlace público. El análisis se genera automáticamente.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vacantes ── */}
      <section id="vacantes" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Vacantes abiertas
          </h2>
          <p className="mt-2 text-center text-gray-500">
            Postúlate con un solo clic y recibe análisis instantáneo de tu CV.
          </p>

          {!jobs || jobs.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-gray-400">No hay vacantes abiertas en este momento.</p>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/apply/${job.id}`}
                  className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <Badge variant="success">Activa</Badge>
                  </div>
                  {job.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">
                      {job.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs text-gray-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(job.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-400 sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} AI Recruitment Platform. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
