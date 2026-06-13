# AI Recruitment Platform

ATS (Applicant Tracking System) con análisis de CVs potenciado por IA, automatización de procesos de reclutamiento y gestión de entrevistas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 |
| UI | Tailwind CSS 4 |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| Base de datos | PostgreSQL 17 (en Supabase) |
| IA | Groq API (llama-3.3-70b-versatile) |
| Automatización | n8n (local) |
| Deploy | Vercel |
| Repositorio | GitHub |

## Arquitectura

```
App (Next.js) ──Server Actions──> Supabase (PostgreSQL + RLS)
                                      │
                                      │ (via pg_net)
                                      ▼
                               Cloudflare Tunnel
                                      │
                                      ▼
                               n8n (local)
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                         Groq API          Email (Resend)
                              │
                              ▼
                         ai_logs (Supabase)
```

## Estructura del proyecto

```
src/
├── app/
│   ├── (auth)/login/         # Login / Registro
│   └── (dashboard)/
│       ├── jobs/             # Vacantes (list, new, [id])
│       │   └── [id]/candidates/  # Crear candidato + análisis IA
│       ├── candidates/       # Candidatos (list, [id])
│       └── interviews/       # Entrevistas (list, new, actions)
├── components/
│   ├── jobs/                 # JobList, JobForm
│   ├── candidates/           # CandidateList, CVAnalysis
│   ├── interviews/           # InterviewForm, InterviewCard
│   └── shared/
│       ├── ui/               # Button, Input, Card, Badge, Select
│       ├── hooks/            # useUser
│       └── utils/            # cn
├── lib/supabase/             # client, server, middleware
└── types/database.ts         # Tipos de BD

supabase/migrations/          # 001_initial_schema.sql, 002_rename

n8n/
└── My workflow.json          # Workflow de automatización
```

## Base de datos

| Tabla | Descripción |
|-------|-------------|
| `recruiters` | Perfiles de reclutadores (se crean automáticamente al registrarse) |
| `jobs` | Vacantes con título, descripción, estado |
| `candidates` | Candidatos por vacante, con CV en raw_cv_data |
| `scores` | Análisis IA: score, summary, classification, suggestions, risk_level |
| `interviews` | Entrevistas agendadas con fecha, estado y notas |
| `ai_logs` | Logs de auditoría de invocaciones a IA |

## Funcionalidades

- **Auth**: Login/registro con email, sesión persistente, RLS policies
- **Vacantes**: CRUD, estados (Borrador/Publicada/Cerrada)
- **Candidatos**: Creación con análisis automático vía Groq API (score, seniority, resumen, sugerencias)
- **Ranking**: Score gauge visual con colores por rango (verde/amarillo/rojo)
- **Entrevistas**: Agendamiento con fecha, estado y notas
- **Webhook n8n**: Al agendar entrevista, n8n recibe el evento, consulta datos del candidato, llama a Groq para generar guía de entrevista, guarda log en ai_logs y envía email al recruiter

## Setup local

```bash
# 1. Clonar
git clone https://github.com/Bboyjoker15/AI-Recruitment-Platform.git
cd AI-Recruitment-Platform

# 2. Instalar dependencias
npm install

# 3. Variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://wkdvxhuisknigwcrvbqu.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
GROQ_API_KEY=gsk_...

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir http://localhost:3000
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Iniciar servidor de producción |
| `npm run lint` | Linting |

## Deploy

El proyecto está deployado en Vercel. Los deploys se disparan automáticamente al hacer push a `main`.

**Variables de entorno requeridas en Vercel:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

## n8n (automatización local)

El workflow de n8n se activa cuando se agenda una entrevista:

1. **Webhook** recibe payload de Supabase (vía pg_net + Cloudflare Tunnel)
2. **Get a row** consulta datos del candidato
3. **HTTP Request** llama a Groq API con el CV para generar guía de entrevista
4. **Create a row** guarda el log en `ai_logs`
5. **Send a new email** envía el reporte al recruiter vía Resend

Para iniciar el túnel:

```powershell
cloudflared tunnel --url http://localhost:5678
```

Luego actualizar la URL en la función `schedule_interview` de Supabase.
